"""Configuration settings for Fruit Quality Classification sub-module."""

from pathlib import Path
from typing import Dict, List
from pydantic_settings import BaseSettings, SettingsConfigDict

MODULE_DIR = Path(__file__).resolve().parent
BASE_DIR = MODULE_DIR.parent
DATASET_DIR = BASE_DIR / "dataset_fruits"
MODELS_DIR = BASE_DIR / "models"
OUTPUTS_DIR = BASE_DIR / "outputs"

DATASET_DIR.mkdir(exist_ok=True, parents=True)
MODELS_DIR.mkdir(exist_ok=True, parents=True)
OUTPUTS_DIR.mkdir(exist_ok=True, parents=True)


class FruitSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    FRUIT_MODEL_BACKBONE: str = "yolov8n-cls.pt"
    FRUIT_WEIGHTS_FILE: Path = MODELS_DIR / "fruit_grading_best.pt"
    FRUIT_CONFIDENCE_THRESHOLD: float = 0.40

    FRUIT_DEFAULT_EPOCHS: int = 20
    FRUIT_DEFAULT_BATCH_SIZE: int = 16
    FRUIT_IMAGE_SIZE: int = 224
    FRUIT_DEVICE: str = "cpu"

    BASE_DIR: Path = BASE_DIR
    DATASET_DIR: Path = DATASET_DIR
    MODELS_DIR: Path = MODELS_DIR
    OUTPUTS_DIR: Path = OUTPUTS_DIR

    GRADE_CLASSES: List[str] = [
        "Grade_A_Fresh",
        "Grade_B_Minor_Flaws",
        "Grade_C_Rotten_Reject",
    ]

    GRADE_INFO: Dict[str, Dict[str, str]] = {
        "Grade_A_Fresh": {
            "display_name": "Grade A (Premium / Fresh)",
            "badge_color": "#16a34a",
            "description": "Flawless skin, vibrant coloration, fresh stem, no visible blemishes or bruising.",
            "market_recommendation": "Approved for Tier-1 Supermarket & Export Sale (Premium Pricing)",
        },
        "Grade_B_Minor_Flaws": {
            "display_name": "Grade B (Commercial / Minor Flaws)",
            "badge_color": "#d97706",
            "description": "Eatable quality with minor surface spots, slight discoloration, or minor shape irregularities.",
            "market_recommendation": "Suitable for Standard Retail, Discounted Sale, or Food Processing / Juicing",
        },
        "Grade_C_Rotten_Reject": {
            "display_name": "Grade C (Reject / Rotten / Damaged)",
            "badge_color": "#dc2626",
            "description": "Extensive bruising, fungal decay, deep cuts, or rotting detected. Unfit for direct consumption.",
            "market_recommendation": "Reject / Disposal or Agricultural Composting",
        },
    }


fruit_settings = FruitSettings()
