from fastapi import FastAPI
from app.routers.chatbot_router import router

app = FastAPI(title="EcoGuardian AI Service")

app.include_router(router)

