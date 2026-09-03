"""Unit and Integration Test Suite for Fruit Quality Classifier in APMC backend."""

import io
from pathlib import Path
from PIL import Image, ImageDraw
import pytest
from starlette.testclient import TestClient

from fruit_classifier.config import fruit_settings
from fruit_classifier.dataset_manager import dataset_manager
from fruit_classifier.inference import classifier
from main import app


@pytest.fixture
def sample_grade_a_image() -> bytes:
    """Create clean synthetic Grade A fruit image in bytes."""
    img = Image.new("RGB", (200, 200), (250, 250, 250))
    draw = ImageDraw.Draw(img)
    draw.ellipse((40, 40, 160, 160), fill=(220, 30, 30))
    draw.rectangle((95, 20, 105, 45), fill=(80, 50, 20))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def sample_grade_c_image() -> bytes:
    """Create synthetic decayed Grade C fruit image in bytes."""
    img = Image.new("RGB", (200, 200), (250, 250, 250))
    draw = ImageDraw.Draw(img)
    draw.ellipse((40, 40, 160, 160), fill=(120, 60, 40))
    draw.ellipse((80, 80, 150, 150), fill=(20, 10, 10))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_dataset_manager_and_generation():
    """Verify dataset manager structure and sample generation."""
    summary = dataset_manager.generate_sample_dataset(samples_per_class=6)
    assert summary["total_images"] == 18
    assert summary["splits"]["train"]["_total"] > 0
    assert summary["splits"]["val"]["_total"] > 0
    assert summary["is_ready_for_training"] is True


def test_inference_fresh_fruit(sample_grade_a_image):
    """Verify inference engine evaluates fresh fruit correctly."""
    result = classifier.predict(sample_grade_a_image, include_annotated_image=True)
    assert result["status"] == "success"
    assert "prediction" in result
    assert result["prediction"]["confidence"] > 0.4
    assert result["prediction"]["grade"] in fruit_settings.GRADE_CLASSES
    assert result["visual_annotation"]["image_base64_jpeg"] is not None


def test_inference_decayed_fruit(sample_grade_c_image):
    """Verify inference engine detects flaws and provides recommendations."""
    result = classifier.predict(sample_grade_c_image, include_annotated_image=True)
    assert result["status"] == "success"
    assert "assessment" in result
    assert len(result["assessment"]["detected_attributes"]) > 0
    assert "market_recommendation" in result["assessment"]


def test_fruit_fastapi_endpoints(sample_grade_a_image):
    """Verify FastAPI endpoints under /api/fruit/."""
    with TestClient(app) as client:
        # Model info
        resp_model = client.get("/api/fruit/model/info")
        assert resp_model.status_code == 200
        assert "supported_classes" in resp_model.json()

        # Dataset summary
        resp_data = client.get("/api/fruit/dataset/summary")
        assert resp_data.status_code == 200
        assert "splits" in resp_data.json()

        # Classify image
        files = {"file": ("test_apple.jpg", sample_grade_a_image, "image/jpeg")}
        resp_classify = client.post("/api/fruit/classify", files=files)
        assert resp_classify.status_code == 200
        data = resp_classify.json()
        assert data["status"] == "success"
        assert "prediction" in data

        # Classify image stream
        files_stream = {"file": ("test_apple.jpg", sample_grade_a_image, "image/jpeg")}
        resp_img = client.post("/api/fruit/image-only", files=files_stream)
        assert resp_img.status_code == 200
        assert resp_img.headers["content-type"] == "image/jpeg"
