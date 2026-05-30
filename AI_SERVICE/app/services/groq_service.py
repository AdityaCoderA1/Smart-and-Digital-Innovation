"""
Groq Service
Handles all communication with the Groq LLM API.
Produces structured JSON responses for consistent parsing in agent.py.
"""

from __future__ import annotations

import json
import logging
from typing import Optional

from openai import OpenAI, OpenAIError

from app.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Client — initialized lazily so a missing key doesn't crash the whole app
# ---------------------------------------------------------------------------

_client: Optional[OpenAI] = None


def _get_client() -> OpenAI:
    """Return a cached OpenAI/Groq client, creating it on first call."""
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        logger.info("Groq client initialized (model=%s)", settings.groq_model)
    return _client


# ---------------------------------------------------------------------------
# System prompt builder
# ---------------------------------------------------------------------------

_BASE_SYSTEM_PROMPT = """
You are GreenLoop, an expert environmental AI assistant specializing in
waste management and recycling guidance.

Always respond in this exact JSON format (no markdown, no extra text):
{
  "answer": "<clear, friendly disposal instructions>",
  "eco_tip": "<one actionable sustainability tip>",
  "points_awarded": <integer 5-50 based on recyclability>,
  "urgency": "<low | medium | high>"
}

Rules:
- points_awarded: 40-50 for fully recyclable, 20-39 for partially, 5-19 for non-recyclable
- urgency: high for hazardous/e-waste, medium for mixed, low for clean recyclables
- Keep answer under 80 words, friendly and encouraging
""".strip()


def _build_system_prompt(tool_data: Optional[dict]) -> str:
    if not tool_data:
        return _BASE_SYSTEM_PROMPT

    tool_section = (
        "\n\nRECYCLING DATA FOR THIS ITEM:\n"
        f"{json.dumps(tool_data, indent=2)}\n"
        "Base your answer strictly on this data."
    )
    return _BASE_SYSTEM_PROMPT + tool_section


# ---------------------------------------------------------------------------
# Response parser
# ---------------------------------------------------------------------------

_FALLBACK_RESPONSE = {
    "answer": "Please check with your local waste management authority for disposal guidance.",
    "eco_tip": "When in doubt, keep recyclables clean and dry before disposal.",
    "points_awarded": 5,
    "urgency": "low",
}


def _parse_response(raw: str) -> dict:
    """
    Parse the JSON response from Groq.
    Falls back to a safe default if parsing fails.
    """
    try:
        # Strip accidental markdown fences
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(clean)

        # Validate required keys
        required = {"answer", "eco_tip", "points_awarded", "urgency"}
        if not required.issubset(parsed.keys()):
            raise ValueError(f"Missing keys: {required - parsed.keys()}")

        # Clamp points to valid range
        parsed["points_awarded"] = max(5, min(50, int(parsed["points_awarded"])))
        return parsed

    except (json.JSONDecodeError, ValueError, KeyError) as exc:
        logger.warning("groq_service: failed to parse response — %s | raw=%r", exc, raw[:200])
        return _FALLBACK_RESPONSE


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def ask_groq(user_query: str, tool_data: Optional[dict] = None) -> dict:
    """
    Send *user_query* + optional *tool_data* to Groq and return a structured dict.

    Args:
        user_query: The raw user message.
        tool_data:  Recycling info from recycling_tool (optional).

    Returns:
        dict with keys: answer, eco_tip, points_awarded, urgency.
    """
    if not user_query or not user_query.strip():
        raise ValueError("user_query must not be empty.")

    system_prompt = _build_system_prompt(tool_data)

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=settings.groq_model,
            temperature=settings.groq_temperature,
            max_tokens=settings.groq_max_tokens,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_query},
            ],
        )
        raw = response.choices[0].message.content or ""
        logger.info("groq_service: response received (%d chars)", len(raw))
        return _parse_response(raw)

    except OpenAIError as exc:
        logger.error("groq_service: Groq API error — %s", exc)
        return _FALLBACK_RESPONSE

    except Exception as exc:
        logger.error("groq_service: unexpected error — %s", exc)
        return _FALLBACK_RESPONSE
