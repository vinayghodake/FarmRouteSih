"""FastAPI Router for Fruit Quality & Grade Classification endpoints."""

import logging
from typing import Any, Dict
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse

from .config import fruit_settings
from .dataset_manager import dataset_manager
from .inference import classifier
from .trainer import trainer

logger = logging.getLogger("fruit.router")

fruit_router = APIRouter(prefix="/api/fruit", tags=["Fruit Quality & Grading"])


@fruit_router.post("/classify", summary="Classify Fruit Quality Grade")
async def classify_fruit(
    file: UploadFile = File(..., description="Fruit image file (JPEG/PNG)"),
    include_badge: bool = Query(default=True, description="Include base64 annotated image in response"),
) -> Dict[str, Any]:
    """Upload a fruit image to classify its quality grade (Grade A / B / C) and get flaw analysis."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image.",
        )

    try:
        image_bytes = await file.read()
        result = classifier.predict(image_bytes, include_annotated_image=include_badge)
        return result
    except Exception as exc:
        logger.error(f"Inference error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification failed: {str(exc)}",
        )


@fruit_router.post("/image-only", summary="Classify and Stream Annotated Fruit Image")
async def classify_and_stream_image(
    file: UploadFile = File(..., description="Fruit image file (JPEG/PNG)"),
):
    """Upload a fruit image and receive the annotated image with visual HUD grade overlay directly."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image.",
        )

    try:
        image_bytes = await file.read()
        result = classifier.predict(image_bytes, include_annotated_image=True)
        annotated_path = result.get("visual_annotation", {}).get("annotated_file")
        if not annotated_path:
            raise HTTPException(status_code=500, detail="Failed to render annotated image.")

        return FileResponse(annotated_path, media_type="image/jpeg", filename="graded_fruit.jpg")
    except Exception as exc:
        logger.error(f"Image overlay error: {exc}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(exc)}")


@fruit_router.post("/train/start", summary="Start YOLO Fine-Tuning in Background")
async def start_training(
    epochs: int = Query(default=20, ge=1, le=200, description="Number of training epochs"),
    batch_size: int = Query(default=16, ge=1, le=64, description="Training batch size"),
) -> Dict[str, Any]:
    """Trigger YOLO model fine-tuning on the fruit quality dataset."""
    res = trainer.start_training(epochs=epochs, batch_size=batch_size, background=True)
    return res


@fruit_router.get("/train/status", summary="Get Model Training Progress")
async def get_training_status() -> Dict[str, Any]:
    """Inspect background training progress, current epoch, and validation accuracy."""
    return trainer.get_status()


@fruit_router.get("/dataset/summary", summary="Inspect Dataset Distribution")
async def get_dataset_summary() -> Dict[str, Any]:
    """Inspect current dataset distribution across Grade A, Grade B, and Grade C."""
    return dataset_manager.get_summary()


@fruit_router.post("/dataset/generate-sample", summary="Generate Sample Synthetic Dataset")
async def generate_sample_dataset(
    samples_per_class: int = Query(default=15, ge=5, le=50, description="Synthetic samples per grade class")
) -> Dict[str, Any]:
    """Generate sample synthetic fruit images to test and train the model immediately."""
    summary = dataset_manager.generate_sample_dataset(samples_per_class=samples_per_class)
    return {
        "status": "success",
        "message": f"Generated {samples_per_class * len(fruit_settings.GRADE_CLASSES)} sample fruit images.",
        "dataset_summary": summary,
    }


@fruit_router.post("/dataset/upload-image", summary="Upload Labeled Image to Dataset")
async def upload_training_image(
    grade_class: str = Form(..., description="Target grade: Grade_A_Fresh, Grade_B_Minor_Flaws, Grade_C_Rotten_Reject"),
    split: str = Form(default="train", description="Dataset split: train, val, or test"),
    file: UploadFile = File(..., description="Fruit image to add to training dataset"),
) -> Dict[str, Any]:
    """Add a labeled fruit image to the dataset for future training."""
    if grade_class not in fruit_settings.GRADE_CLASSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid grade class '{grade_class}'. Must be one of: {fruit_settings.GRADE_CLASSES}",
        )

    try:
        content = await file.read()
        saved_path = dataset_manager.add_image(content, grade_class=grade_class, split=split, filename=file.filename)
        return {
            "status": "success",
            "message": f"Image added to {grade_class} ({split})",
            "path": str(saved_path),
            "dataset_summary": dataset_manager.get_summary(),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@fruit_router.get("/model/info", summary="Get Active Model Info")
async def get_model_info() -> Dict[str, Any]:
    """Retrieve metadata about the currently active YOLO grading model."""
    return {
        "active_weights": classifier.active_weights,
        "is_custom_trained": fruit_settings.FRUIT_WEIGHTS_FILE.exists(),
        "confidence_threshold": fruit_settings.FRUIT_CONFIDENCE_THRESHOLD,
        "supported_classes": fruit_settings.GRADE_CLASSES,
        "grade_definitions": fruit_settings.GRADE_INFO,
    }
