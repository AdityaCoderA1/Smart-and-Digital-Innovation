from fastapi import APIRouter
from app.agent import recycling_agent

router = APIRouter()

@router.get("/chat/{item}")
def chat(item: str):
    return recycling_agent(item)
