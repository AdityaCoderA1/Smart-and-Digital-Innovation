from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def _require(key: str) -> str:
    value = os.getenv(key, "").strip()
    if not value:
        raise EnvironmentError(
            f"Required environment variable '{key}' is not set. "
            f"Add it to your .env file or shell environment."
        )
    return value


def _optional(key: str, default: str = "") -> str:
    return os.getenv(key, default).strip() or default


def _optional_int(key: str, default: int) -> int:
    raw = os.getenv(key, "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        logger.warning("Config: '%s' must be an integer — using default %d.", key, default)
        return default


def _optional_bool(key: str, default: bool = False) -> bool:
    raw = os.getenv(key, "").strip().lower()
    if not raw:
        return default
    return raw in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Settings:
    groq_api_key:      str

    # Vision model — Groq Llama 4 Scout Vision (Stage 1 of the image pipeline)
    groq_vision_model: str   = "meta-llama/llama-4-scout-17b-16e-instruct"

    groq_model:        str   = "llama3-8b-8192"
    groq_temperature:  float = 0.7
    groq_max_tokens:   int   = 1024

    # HuggingFace key kept for future use (optional)
    hf_api_key:        str   = ""

    app_env:           str   = "development"
    debug:             bool  = False
    log_level:         str   = "INFO"
    cache_maxsize:     int   = 128

    is_production:    bool  = field(init=False)

    def __post_init__(self) -> None:
        object.__setattr__(self, "is_production", self.app_env == "production")

    def __repr__(self) -> str:
        groq_masked   = self.groq_api_key[:6] + "…" if self.groq_api_key else "(unset)"
        hf_masked     = self.hf_api_key[:6]   + "…" if self.hf_api_key   else "(not set)"
        return (
            f"Settings(env={self.app_env!r}, model={self.groq_model!r}, "
            f"vision_model={self.groq_vision_model!r}, "
            f"groq_api_key={groq_masked!r}, hf_api_key={hf_masked!r}, debug={self.debug})"
        )


def _load_settings() -> Settings:
    return Settings(
        groq_api_key      = _require("GROQ_API_KEY"),

        groq_vision_model = _optional(
            "GROQ_VISION_MODEL",
            "meta-llama/llama-4-scout-17b-16e-instruct",
        ),
        groq_model        = _optional("GROQ_MODEL",       "llama3-8b-8192"),
        groq_temperature  = float(_optional("GROQ_TEMPERATURE", "0.7")),
        groq_max_tokens   = _optional_int("GROQ_MAX_TOKENS", 1024),

        # HuggingFace — optional, kept for future use
        hf_api_key        = _optional("HF_API_KEY", ""),

        app_env           = _optional("APP_ENV",          "development"),
        debug             = _optional_bool("DEBUG",        False),
        log_level         = _optional("LOG_LEVEL",        "INFO"),
        cache_maxsize     = _optional_int("CACHE_MAXSIZE", 128),
    )


settings = _load_settings()

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)

logger.info("Configuration loaded: %s", settings)
