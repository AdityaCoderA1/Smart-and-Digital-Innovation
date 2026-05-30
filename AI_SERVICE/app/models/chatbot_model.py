"""
Pydantic models for the GreenLoop AI chatbot API.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming user message for the text pipeline."""
    message: str = Field(..., min_length=1, max_length=1000, description="User's waste/recycling query")


class ChatbotResponse(BaseModel):
    """Full structured response returned by the agent pipeline."""
    user_query: str = Field(..., description="Original user question")
    detected_item: str = Field(..., description="Waste item identified by the agent")
    category: str = Field(..., description="Waste category (e.g. Plastic Waste)")
    recyclable: bool = Field(..., description="Whether the item is recyclable")
    disposal_method: str = Field(..., description="How to dispose of the item properly")
    environmental_impact: str = Field(..., description="Environmental impact description")
    ai_response: str = Field(..., description="Friendly AI-generated guidance")
    points_awarded: Optional[int] = Field(None, ge=0, le=100, description="Gamification points")
    urgency: Optional[str] = Field(None, description="Urgency level: low | medium | high")
    eco_tip: Optional[str] = Field(None, description="Additional sustainability tip")


class ImageChatResponse(BaseModel):
    """Response for the image upload pipeline."""
    filename: str = Field(..., description="Original uploaded filename")
    canonical_label: str = Field(..., description="Vision-classified waste label")
    raw_label: str = Field(..., description="Raw item description from the Vision LLM (e.g. 'plastic water bottle')")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Vision model confidence score (0–1)")
    recyclable: bool = Field(..., description="Vision model recyclability judgement")
    vision_notes: Optional[str] = Field(None, description="Vision model observation about the item's condition or material")
    model_used: str = Field(..., description="Vision model identifier used for classification")
    chatbot: ChatbotResponse = Field(..., description="Full agent response for the classified item")
