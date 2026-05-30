"""
vision_tool.py — GreenLoop Vision LLM Pipeline

Architecture: Groq Llama 4 Scout Vision → JSON → Category Mapper → VisionResult

Stage 1 of the two-stage pipeline:
  POST /api/chat/image
      → classify_waste_image_with_meta()   [this file]
      → VisionResult(canonical_label, confidence)
      → environmental_agent()              [agent.py]
      → ChatbotResponse                    [groq_service.py / Stage 2]

Why Groq Llama 4 Scout Vision?
  - Same API key and endpoint as the working Groq Llama 3.1 service
  - True open-vocabulary recognition (not limited to fixed classes)
  - Returns structured JSON natively — no label mapping heuristics needed
  - Handles novel/unusual waste items gracefully via natural language
"""

from __future__ import annotations

import base64
import json
import logging
from dataclasses import dataclass
from typing import Optional

from openai import OpenAI, OpenAIError

from app.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Vision model config
# ---------------------------------------------------------------------------

_VISION_MODEL = settings.groq_vision_model   # meta-llama/llama-4-scout-17b-16e-instruct
_VISION_API_BASE = "https://api.groq.com/openai/v1"


# ---------------------------------------------------------------------------
# Candidate categories — must match RECYCLING_DATABASE keys exactly
# ---------------------------------------------------------------------------

_CATEGORIES = [
    "plastic bottle",
    "plastic",
    "glass bottle",
    "glass",
    "battery",
    "e-waste",
    "paper",
    "metal",
    "food waste",
    "clothing",
    "hazardous",
]

_CATEGORY_LIST_STR = "\n".join(f"  - {c}" for c in _CATEGORIES)

# ---------------------------------------------------------------------------
# Vision prompt — instructs the LLM to return strict JSON
# ---------------------------------------------------------------------------

_VISION_SYSTEM_PROMPT = """\
You are an expert waste classification assistant for an environmental recycling app.
Analyse the image provided and identify the waste item shown.

You MUST respond with ONLY valid JSON — no markdown fences, no extra text, nothing else.

JSON schema:
{
  "item": "<specific descriptive name of the waste item, e.g. 'plastic water bottle', 'AA battery', 'torn cardboard box'>",
  "category": "<pick EXACTLY one from the allowed list below>",
  "recyclable": <true or false>,
  "confidence": <float between 0.0 and 1.0>,
  "notes": "<one-sentence observation about the item's condition or material>"
}

Allowed categories:
""" + _CATEGORY_LIST_STR + """

Rules:
- If you cannot identify the item clearly, set category to the most likely one and confidence below 0.4.
- Never invent categories outside the allowed list.
- recyclable must be a JSON boolean (true/false), not a string.
- confidence reflects how certain you are about the identification (0 = no idea, 1 = certain).
"""

_VISION_USER_PROMPT = (
    "Please identify the waste item in this image and return the JSON response."
)


# ---------------------------------------------------------------------------
# Category validator — ensures LLM response maps to a known DB key
# ---------------------------------------------------------------------------

_CATEGORY_ALIASES: dict[str, str] = {
    # Exact matches
    "plastic bottle":  "plastic bottle",
    "plastic":         "plastic",
    "glass bottle":    "glass bottle",
    "glass":           "glass",
    "battery":         "battery",
    "e-waste":         "e-waste",
    "paper":           "paper",
    "metal":           "metal",
    "food waste":      "food waste",
    "clothing":        "clothing",
    "hazardous":       "hazardous",
    # Common aliases the LLM might return
    "hazardous waste": "hazardous",
    "electronic waste":"e-waste",
    "electronics":     "e-waste",
    "electronic":      "e-waste",
    "ewaste":          "e-waste",
    "cardboard":       "paper",
    "newspaper":       "paper",
    "aluminium":       "metal",
    "aluminum":        "metal",
    "metal can":       "metal",
    "tin":             "metal",
    "can":             "metal",
    "food":            "food waste",
    "organic":         "food waste",
    "textile":         "clothing",
    "fabric":          "clothing",
    "clothes":         "clothing",
    "paint":           "hazardous",
    "chemical":        "hazardous",
    "plastic bag":     "plastic",
    "plastic container": "plastic bottle",
    "water bottle":    "plastic bottle",
    "glass jar":       "glass bottle",
}


def _map_category(raw: str) -> str:
    """
    Map the raw category string returned by the vision LLM to a canonical
    RECYCLING_DATABASE key. Falls back to substring scanning.
    """
    lowered = raw.lower().strip()

    # 1. Exact alias match
    if lowered in _CATEGORY_ALIASES:
        return _CATEGORY_ALIASES[lowered]

    # 2. Substring scan through aliases
    for alias, canonical in _CATEGORY_ALIASES.items():
        if alias in lowered:
            logger.debug("vision_tool: category '%s' fuzzy-matched via '%s' → '%s'",
                         raw, alias, canonical)
            return canonical

    # 3. Last resort — check if any canonical category appears in the string
    for cat in _CATEGORIES:
        if cat in lowered:
            return cat

    logger.warning("vision_tool: unrecognised category '%s' — defaulting to 'unknown'", raw)
    return "unknown"


# ---------------------------------------------------------------------------
# Result dataclass
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class VisionResult:
    """Structured output from the vision classification stage."""
    canonical_label: str   # matched key in RECYCLING_DATABASE (or "unknown")
    raw_label: str         # original item description from the LLM
    confidence: float      # 0.0 – 1.0
    recyclable: bool       # LLM's recyclability judgement
    notes: str             # LLM's observation about the item
    model_used: str        # model that produced this result


# ---------------------------------------------------------------------------
# Groq Vision client (lazy singleton)
# ---------------------------------------------------------------------------

_vision_client: Optional[OpenAI] = None


def _get_vision_client() -> OpenAI:
    global _vision_client
    if _vision_client is None:
        _vision_client = OpenAI(
            api_key=settings.groq_api_key,
            base_url=_VISION_API_BASE,
        )
        logger.info("vision_tool: Groq Vision client initialised (model=%s)", _VISION_MODEL)
    return _vision_client


# ---------------------------------------------------------------------------
# Core vision call
# ---------------------------------------------------------------------------

def _call_groq_vision(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Send the image to Groq Llama 4 Scout Vision and parse the JSON response.

    Returns a dict with keys: item, category, recyclable, confidence, notes.
    Raises on unrecoverable API errors.
    """
    # Encode image as base64 data URL (OpenAI multimodal format)
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{b64}"

    logger.info(
        "vision_tool: sending image to Groq Vision — model=%s, size=%d bytes",
        _VISION_MODEL, len(image_bytes),
    )

    client = _get_vision_client()
    response = client.chat.completions.create(
        model=_VISION_MODEL,
        temperature=0.1,       # low temp for deterministic classification
        max_tokens=256,        # JSON response is short
        messages=[
            {
                "role": "system",
                "content": _VISION_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": data_url},
                    },
                    {
                        "type": "text",
                        "text": _VISION_USER_PROMPT,
                    },
                ],
            },
        ],
    )

    raw_text = response.choices[0].message.content or ""
    logger.info("vision_tool: Groq Vision raw response = %r", raw_text[:500])

    # Strip accidental markdown fences
    clean = (
        raw_text.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    try:
        parsed = json.loads(clean)
        logger.info("vision_tool: parsed JSON = %r", parsed)
        return parsed
    except json.JSONDecodeError as exc:
        logger.error(
            "vision_tool: JSON parse failed — %s | raw=%r", exc, raw_text[:300]
        )
        raise ValueError(f"Vision LLM returned non-JSON response: {raw_text[:100]}") from exc


# ---------------------------------------------------------------------------
# Fallback result
# ---------------------------------------------------------------------------

_UNKNOWN_RESULT = VisionResult(
    canonical_label="unknown",
    raw_label="unknown",
    confidence=0.0,
    recyclable=False,
    notes="Could not classify the image.",
    model_used=_VISION_MODEL,
)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def classify_waste_image_with_meta(
    image_bytes: bytes,
    filename: str = "upload",
) -> VisionResult:
    """
    Classify a waste image using Groq Llama 4 Scout Vision (Stage 1 pipeline).

    Args:
        image_bytes: Raw bytes of the uploaded image file.
        filename:    Original filename (used for logging only).

    Returns:
        VisionResult with canonical_label, raw_label, confidence, recyclable, notes.
    """
    logger.info(
        "vision_tool: ── START ── filename='%s', size=%d bytes, model=%s",
        filename, len(image_bytes), _VISION_MODEL,
    )

    # Infer MIME type from filename extension
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpeg"
    mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg",
                "png": "image/png", "webp": "image/webp", "gif": "image/gif"}
    mime_type = mime_map.get(ext, "image/jpeg")

    # PIL sanity check — logs image dimensions & mode
    try:
        import io
        from PIL import Image as PILImage
        img = PILImage.open(io.BytesIO(image_bytes))
        logger.info(
            "vision_tool: PIL check — size=%s, mode=%s, format=%s",
            img.size, img.mode, img.format,
        )
    except Exception as pil_exc:
        logger.warning("vision_tool: PIL check failed — %s", pil_exc)

    try:
        vision_data = _call_groq_vision(image_bytes, mime_type=mime_type)

        # Extract fields with safe defaults
        raw_item    = str(vision_data.get("item",       "unknown item"))
        raw_cat     = str(vision_data.get("category",   "unknown"))
        recyclable  = bool(vision_data.get("recyclable", False))
        confidence  = float(vision_data.get("confidence", 0.0))
        notes       = str(vision_data.get("notes",      ""))

        # Clamp confidence to [0, 1]
        confidence = max(0.0, min(1.0, confidence))

        # Map category to canonical DB key
        canonical = _map_category(raw_cat)

        logger.info(
            "vision_tool: ── RESULT ── item=%r, category=%r → canonical=%r, "
            "confidence=%.2f, recyclable=%s",
            raw_item, raw_cat, canonical, confidence, recyclable,
        )

        return VisionResult(
            canonical_label=canonical,
            raw_label=raw_item,
            confidence=confidence,
            recyclable=recyclable,
            notes=notes,
            model_used=_VISION_MODEL,
        )

    except OpenAIError as exc:
        logger.error("vision_tool: Groq API error — %s", exc)
        return _UNKNOWN_RESULT

    except ValueError as exc:
        logger.error("vision_tool: Vision LLM parse error — %s", exc)
        return _UNKNOWN_RESULT

    except Exception as exc:
        logger.error("vision_tool: unexpected error — %s", exc, exc_info=True)
        return _UNKNOWN_RESULT
