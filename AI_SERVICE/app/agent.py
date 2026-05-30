"""
agent.py — GreenLoop AI Agent Pipeline

Orchestrates:
  1. detect_item()    — keyword + confidence scoring
  2. recycling_tool() — cached DB lookup (12 categories)
  3. ask_groq()       — structured JSON from Groq LLM
  4. ChatbotResponse  — full structured response
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from functools import lru_cache
from typing import Optional

from app.models.chatbot_model import ChatbotResponse
from app.services.groq_service import ask_groq
from app.tools.recycling_tool import recycling_tool

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Keyword map — all 12 RECYCLING_DATABASE categories
# Multi-word phrases are checked first (higher specificity / confidence).
# ---------------------------------------------------------------------------
ITEM_KEYWORD_MAP: dict[str, list[str]] = {
    "plastic bottle": [
        "plastic bottle", "pet bottle", "water bottle", "soda bottle",
        "pop bottle", "juice bottle", "sports bottle",
    ],
    "plastic": [
        "plastic", "polystyrene", "styrofoam", "nylon", "pvc",
        "polypropylene", "polyethylene", "cling wrap", "plastic bag",
    ],
    "glass bottle": [
        "glass bottle", "wine bottle", "beer bottle", "sauce bottle",
        "condiment bottle", "liquor bottle",
    ],
    "glass": [
        "glass", "mirror", "window pane", "broken glass",
        "glassware", "jar", "drinking glass",
    ],
    "battery": [
        "battery", "batteries", "lithium", "alkaline",
        "aa ", "aaa ", "9v ", "rechargeable", "button cell",
        "lithium-ion", "li-ion", "lead acid",
    ],
    "e-waste": [
        "electronic", "e-waste", "ewaste", "computer", "laptop", "desktop",
        "phone", "smartphone", "mobile", "tablet", "ipad", "charger",
        "cable", "printer", "monitor", "keyboard", "mouse", "tv",
        "television", "microwave", "circuit board", "hard drive",
    ],
    "paper": [
        "paper", "cardboard", "newspaper", "magazine", "carton",
        "notebook", "book", "envelope", "tissue box", "cereal box",
        "pizza box", "wrapping paper",
    ],
    "metal": [
        "metal", "aluminum", "aluminium", "tin", "steel", "copper",
        "can", "iron", "brass", "scrap metal", "foil", "aluminium foil",
        "food can", "drinks can", "aerosol",
    ],
    "food waste": [
        "food", "organic", "compost", "leftovers", "fruit", "vegetable",
        "meat", "fish", "bread", "banana peel", "egg shell",
        "coffee grounds", "food scraps", "rotten",
    ],
    "clothing": [
        "clothing", "clothes", "shirt", "pants", "fabric", "textile",
        "jeans", "jacket", "dress", "shoes", "socks", "underwear",
        "towel", "bedsheet", "curtain", "rag",
    ],
    "hazardous": [
        "paint", "chemical", "solvent", "pesticide", "bleach", "acid",
        "motor oil", "antifreeze", "weed killer", "herbicide",
        "insecticide", "fertilizer", "cleaning product", "polish",
        "varnish", "thinner", "glue", "adhesive", "disinfectant",
    ],
}

UNKNOWN_ITEM = "unknown"


# ---------------------------------------------------------------------------
# Detection
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class DetectionResult:
    item: str
    confidence: float
    matched_keyword: str = ""


def detect_item(user_query: str) -> DetectionResult:
    """
    Keyword-based item detection with confidence scoring.

    Multi-word phrases → confidence 0.95 (high specificity)
    Single-word tokens  → confidence 0.75
    No match            → unknown, confidence 0.0
    """
    query = user_query.lower().strip()

    # Pass 1 — multi-word phrases (higher specificity)
    for item, keywords in ITEM_KEYWORD_MAP.items():
        for kw in keywords:
            if len(kw.split()) > 1 and kw in query:
                return DetectionResult(item=item, confidence=0.95, matched_keyword=kw)

    # Pass 2 — single-word tokens
    for item, keywords in ITEM_KEYWORD_MAP.items():
        for kw in keywords:
            token = kw.strip()
            if len(token.split()) == 1 and token in query:
                return DetectionResult(item=item, confidence=0.75, matched_keyword=token)

    return DetectionResult(item=UNKNOWN_ITEM, confidence=0.0)


# ---------------------------------------------------------------------------
# Tool lookup (cached)
# ---------------------------------------------------------------------------

@lru_cache(maxsize=128)
def _cached_recycling_tool(item: str) -> dict:
    return recycling_tool(item)


def get_tool_result(item: str) -> Optional[dict]:
    try:
        result = _cached_recycling_tool(item)
        _validate_tool_result(result)
        return result
    except Exception as exc:
        logger.warning("recycling_tool failed for item=%r: %s", item, exc)
        return None


def _validate_tool_result(result: dict) -> None:
    required_keys = {"category", "recyclable", "disposal_method", "environmental_impact"}
    missing = required_keys - result.keys()
    if missing:
        raise ValueError(f"Tool result missing keys: {missing}")


_FALLBACK_TOOL_DATA = {
    "category": "Unclassified Waste",
    "recyclable": False,
    "disposal_method": "Please consult your local waste management authority.",
    "environmental_impact": "Unknown — proper disposal always matters.",
}


# ---------------------------------------------------------------------------
# Main agent entry point
# ---------------------------------------------------------------------------

def environmental_agent(user_query: str) -> ChatbotResponse:
    """
    Full agent pipeline: detect → lookup → ask Groq → return ChatbotResponse.

    Args:
        user_query: Plain-text user message OR a canonical item label
                    forwarded from the vision pipeline.

    Returns:
        ChatbotResponse — fully populated structured response.
    """
    if not user_query or not user_query.strip():
        raise ValueError("user_query must not be empty.")

    detection = detect_item(user_query)

    logger.info(
        "Agent: detected item=%r (confidence=%.2f, keyword=%r)",
        detection.item,
        detection.confidence,
        detection.matched_keyword,
    )

    tool_result = get_tool_result(detection.item) or _FALLBACK_TOOL_DATA

    # Ask Groq for enriched guidance
    points_awarded: int = 5
    urgency: str = "low"
    eco_tip: str = ""
    ai_response: str = tool_result["disposal_method"]

    try:
        groq_result = ask_groq(user_query=user_query, tool_data=tool_result)
        ai_response    = groq_result.get("answer",         tool_result["disposal_method"])
        eco_tip        = groq_result.get("eco_tip",        "")
        points_awarded = groq_result.get("points_awarded", 5)
        urgency        = groq_result.get("urgency",        "low")
    except Exception as exc:
        logger.error("ask_groq failed: %s", exc)

    return ChatbotResponse(
        user_query=user_query,
        detected_item=detection.item,
        category=tool_result["category"],
        recyclable=tool_result["recyclable"],
        disposal_method=tool_result["disposal_method"],
        environmental_impact=tool_result["environmental_impact"],
        ai_response=ai_response,
        points_awarded=points_awarded,
        urgency=urgency,
        eco_tip=eco_tip if eco_tip else None,
    )
