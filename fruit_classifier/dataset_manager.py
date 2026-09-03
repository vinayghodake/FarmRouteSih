"""Dataset Manager for Fruit Quality Classification in APMC backend."""

import io
import logging
import random
import zipfile
from pathlib import Path
from typing import Any, Dict, Optional

from PIL import Image, ImageDraw, ImageFilter
from .config import fruit_settings

logger = logging.getLogger("fruit.dataset")


class FruitDatasetManager:
    """Manages fruit images dataset for YOLO classification training."""

    def __init__(self, dataset_dir: Optional[Path] = None):
        self.dataset_dir = dataset_dir or fruit_settings.DATASET_DIR
        self.classes = fruit_settings.GRADE_CLASSES
        self.ensure_dataset_structure()

    def ensure_dataset_structure(self) -> None:
        """Create standard YOLO classification directory tree."""
        for split in ["train", "val", "test"]:
            for cls_name in self.classes:
                (self.dataset_dir / split / cls_name).mkdir(parents=True, exist_ok=True)

    def get_summary(self) -> Dict[str, Any]:
        """Return counts of images across all splits and classes."""
        summary: Dict[str, Any] = {
            "total_images": 0,
            "splits": {},
            "classes": self.classes,
        }

        total = 0
        for split in ["train", "val", "test"]:
            split_dict = {}
            split_total = 0
            for cls_name in self.classes:
                folder = self.dataset_dir / split / cls_name
                count = len(list(folder.glob("*.jpg")) + list(folder.glob("*.png")) + list(folder.glob("*.jpeg")))
                split_dict[cls_name] = count
                split_total += count
            split_dict["_total"] = split_total
            summary["splits"][split] = split_dict
            total += split_total

        summary["total_images"] = total
        summary["is_ready_for_training"] = summary["splits"]["train"]["_total"] >= 6
        return summary

    def add_image(self, image_bytes: bytes, grade_class: str, split: str = "train", filename: Optional[str] = None) -> Path:
        """Save an uploaded image into the dataset split."""
        if grade_class not in self.classes:
            raise ValueError(f"Invalid grade '{grade_class}'. Must be one of: {self.classes}")
        if split not in ["train", "val", "test"]:
            raise ValueError(f"Invalid split '{split}'. Must be train, val, or test.")

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        target_dir = self.dataset_dir / split / grade_class
        target_dir.mkdir(parents=True, exist_ok=True)

        if not filename:
            filename = f"img_{random.randint(100000, 999999)}.jpg"
        target_path = target_dir / filename

        img.save(target_path, format="JPEG", quality=95)
        logger.info(f"Added image to {target_path}")
        return target_path

    def extract_zip(self, zip_bytes: bytes) -> Dict[str, Any]:
        """Extract a zip dataset archive directly into dataset root."""
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
            z.extractall(self.dataset_dir)
        self.ensure_dataset_structure()
        return self.get_summary()

    def generate_sample_dataset(self, samples_per_class: int = 15) -> Dict[str, Any]:
        """Generate synthetic fruit images for immediate training."""
        logger.info(f"Generating synthetic fruit dataset ({samples_per_class} per class)...")
        fruit_palettes = [
            {"name": "Apple_Red", "base": (210, 30, 30), "highlight": (255, 100, 100)},
            {"name": "Tomato_Orange", "base": (230, 70, 20), "highlight": (255, 140, 50)},
            {"name": "Apple_Green", "base": (90, 180, 40), "highlight": (150, 230, 80)},
        ]

        for cls_name in self.classes:
            for i in range(samples_per_class):
                split = "train" if i < int(samples_per_class * 0.8) else "val"
                target_folder = self.dataset_dir / split / cls_name

                fruit = fruit_palettes[i % len(fruit_palettes)]
                img = self._create_synthetic_fruit_image(cls_name, fruit)
                img_path = target_folder / f"synth_{fruit['name']}_{i:03d}.jpg"
                img.save(img_path, format="JPEG", quality=92)

        logger.info("Sample dataset generated successfully.")
        return self.get_summary()

    def _create_synthetic_fruit_image(self, grade: str, fruit: Dict[str, Any]) -> Image.Image:
        """Create synthetic fruit image with grade-specific visual attributes."""
        size = (256, 256)
        img = Image.new("RGB", size, (245, 245, 245))
        draw = ImageDraw.Draw(img)

        center = (128, 138)
        radius = 80
        bbox = (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius)
        draw.ellipse(bbox, fill=fruit["base"])

        highlight_bbox = (center[0] - 50, center[1] - 60, center[0] - 10, center[1] - 20)
        draw.ellipse(highlight_bbox, fill=fruit["highlight"])

        draw.rectangle((125, 45, 131, 65), fill=(90, 55, 30))
        if grade in ["Grade_A_Fresh", "Grade_B_Minor_Flaws"]:
            draw.ellipse((131, 48, 155, 60), fill=(40, 140, 40))

        if grade == "Grade_B_Minor_Flaws":
            for _ in range(3):
                spot_x = random.randint(center[0] - 40, center[0] + 40)
                spot_y = random.randint(center[1] - 40, center[1] + 40)
                draw.ellipse((spot_x, spot_y, spot_x + 8, spot_y + 8), fill=(100, 40, 20))
        elif grade == "Grade_C_Rotten_Reject":
            decay_center = (center[0] + 20, center[1] + 20)
            draw.ellipse((decay_center[0] - 35, decay_center[1] - 35, decay_center[0] + 35, decay_center[1] + 35), fill=(40, 20, 15))
            draw.ellipse((decay_center[0] - 15, decay_center[1] - 15, decay_center[0] + 15, decay_center[1] + 15), fill=(110, 120, 100))

        img = img.filter(ImageFilter.GaussianBlur(0.8))
        return img


dataset_manager = FruitDatasetManager()
