"""
GreenLoop AI Service — FastAPI Application Entry Point
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers.chatbot_router import router

logger = logging.getLogger(__name__)




@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("GreenLoop AI Service starting up (env=%s)", settings.app_env)
    yield
    logger.info("GreenLoop AI Service shutting down.")




app = FastAPI(
    title="GreenLoop AI Service",
    description="AI-powered smart recycling & waste management backend for GreenLoop.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if not settings.is_production else ["https://greenloop.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.middleware("http")
async def add_request_timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
    logger.info("%s %s → %d (%.2fms)", request.method, request.url.path, response.status_code, duration_ms)
    return response




@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )



app.include_router(router)




@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "GreenLoop AI Service",
        "status":  "running",
        "env":     settings.app_env,
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status":  "healthy",
        "model":   settings.groq_model,
        "env":     settings.app_env,
    }