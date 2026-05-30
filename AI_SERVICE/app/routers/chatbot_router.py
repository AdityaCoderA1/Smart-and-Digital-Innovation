"""
chatbot_router.py — GreenLoop AI chat endpoints.

Text pipeline:   POST /api/chat
Image pipeline:  POST /api/chat/image
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, UploadFile, File, status

from app.agent import environmental_agent
from app.models.chatbot_model import ChatRequest, ChatbotResponse, ImageChatResponse
from app.tools.vision_tool import classify_waste_image_with_meta

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chatbot"])

# ---------------------------------------------------------------------------
# Allowed image MIME types
# ---------------------------------------------------------------------------
_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


# ---------------------------------------------------------------------------
# POST /api/chat  — text pipeline
# ---------------------------------------------------------------------------

@router.post(
    "/chat",
    response_model=ChatbotResponse,
    summary="Ask a recycling / waste disposal question",
    status_code=status.HTTP_200_OK,
)
async def chat(request: ChatRequest) -> ChatbotResponse:
    """
    Accepts a plain-text user query and returns full structured recycling guidance.

    Pipeline:
        1. detect_item()     — keyword + confidence scoring
        2. recycling_tool()  — cached DB lookup
        3. ask_groq()        — structured JSON from Groq LLM
        4. ChatbotResponse   — full structured response
    """
    logger.info("POST /api/chat — message=%r", request.message[:80])

    try:
        response = environmental_agent(request.message)
        return response
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except Exception as exc:
        logger.error("POST /api/chat failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Agent error")


# ---------------------------------------------------------------------------
# POST /api/chat/image  — image pipeline
# ---------------------------------------------------------------------------

@router.post(
    "/chat/image",
    response_model=ImageChatResponse,
    summary="Upload a waste image for AI classification + recycling guidance",
    status_code=status.HTTP_200_OK,
)
async def chat_image(file: UploadFile = File(...)) -> ImageChatResponse:
    """
    Accepts an uploaded image, classifies it with Groq Llama 4 Scout Vision,
    then feeds the canonical label into the same agent pipeline as the text endpoint.

    Pipeline:
        1. classify_waste_image_with_meta()  — Groq Vision LLM (Llama 4 Scout)
           → { item, category, recyclable, confidence, notes }
        2. Category Mapper                  — maps raw category → DB key
        3. canonical_label → environmental_agent()
           → recycling_tool() + ask_groq() (Llama 3.1 8B Instant)
        4. ImageChatResponse (vision metadata + full ChatbotResponse)
    """
    logger.info("POST /api/chat/image — filename=%r, content_type=%r", file.filename, file.content_type)

    # Validate content type
    if file.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WEBP, GIF.",
        )

    # Read and validate size
    image_bytes = await file.read()
    if len(image_bytes) > _MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds 10 MB limit.",
        )

    # Step 1 — Vision classification
    vision_result = classify_waste_image_with_meta(
        image_bytes=image_bytes,
        filename=file.filename or "upload",
    )

    # Step 2 — Feed canonical label into the text agent pipeline
    query = vision_result.canonical_label if vision_result.canonical_label != "unknown" \
        else "unidentified waste item"

    try:
        chatbot_response = environmental_agent(query)
    except Exception as exc:
        logger.error("POST /api/chat/image — agent failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Agent error")

    return ImageChatResponse(
        filename=file.filename or "upload",
        canonical_label=vision_result.canonical_label,
        raw_label=vision_result.raw_label,
        confidence=vision_result.confidence,
        recyclable=vision_result.recyclable,
        vision_notes=vision_result.notes or None,
        model_used=vision_result.model_used,
        chatbot=chatbot_response,
    )
