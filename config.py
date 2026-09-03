"""Configuration management for APMC Price Prediction backend."""

import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
OUTPUTS_DIR = BASE_DIR / "outputs"

# Ensure runtime directories exist
DATA_DIR.mkdir(exist_ok=True, parents=True)
MODELS_DIR.mkdir(exist_ok=True, parents=True)
OUTPUTS_DIR.mkdir(exist_ok=True, parents=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # data.gov.in configuration
    DATA_GOV_API_KEY: Optional[str] = ""
    DATA_GOV_RESOURCE_ID: str = "9ef84268-d588-465a-a308-a864a43d0070"
    DATA_GOV_BASE_URL: str = "https://api.data.gov.in/resource"

    # Default query parameters
    DEFAULT_COMMODITY: str = "Tomato"
    DEFAULT_MARKET: str = "Pune"
    DEFAULT_STATE: str = "Maharashtra"
    DATA_FETCH_LIMIT: int = 500

    # Scheduling settings (weekly run)
    SCHEDULE_DAY_OF_WEEK: str = "sun"
    SCHEDULE_HOUR: int = 2
    SCHEDULE_MINUTE: int = 0

    # Forecasting horizon in days (e.g. 7 days)
    FORECAST_HORIZON_DAYS: int = 7

    # App server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # File paths
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    MODELS_DIR: Path = MODELS_DIR
    OUTPUTS_DIR: Path = OUTPUTS_DIR
    RAW_DATA_FILE: Path = DATA_DIR / "apmc_raw.csv"
    CLEANED_DATA_FILE: Path = DATA_DIR / "apmc_cleaned.csv"
    FORECAST_JSON_FILE: Path = OUTPUTS_DIR / "forecast_latest.json"
    TREND_GRAPH_FILE: Path = OUTPUTS_DIR / "trend_forecast.png"


settings = Settings()
