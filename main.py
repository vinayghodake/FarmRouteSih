"""FastAPI Backend Application for APMC Commodity Price Prediction.

Provides RESTful endpoints for:
- Executing the end-to-end weekly data pipeline on-demand
- Serving latest 6-7 day price predictions with prediction bounds
- Streaming publication-grade trend graph images
- Monitoring weekly scheduler status
- Accessing historical and cleaned dataset records
"""

import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd
from fastapi import BackgroundTasks, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from config import settings
from pipeline import pipeline
from scheduler import scheduler
from fruit_classifier.router import fruit_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("apmc.api")


# Lifespan event handler for background scheduler
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting APMC Forecasting & Fruit Grading Backend Service...")
    # Start the weekly background scheduler
    scheduler.start()
    yield
    logger.info("Shutting down APMC Forecasting & Fruit Grading Backend Service...")
    scheduler.shutdown()


app = FastAPI(
    title="APMC Mandi Price Forecasting & Fruit Quality API",
    description=(
        "Unified production-ready agricultural backend for: "
        "1) APMC daily mandi price forecasting & weekly ML retraining. "
        "2) Ultralytics YOLO fruit quality and freshness grading (Grade A / B / C)."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Middleware for integration with frontend dashboards / web apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Fruit Quality & Grading Router
app.include_router(fruit_router)



class PipelineRequest(BaseModel):
    limit: Optional[int] = Field(default=500, ge=100, le=500, description="Number of rows to fetch (100 to 500)")
    commodity: Optional[str] = Field(default=None, description="Target commodity (e.g. Tomato, Onion, Potato)")
    market: Optional[str] = Field(default=None, description="Target mandi market (e.g. Pune, Lasalgaon)")
    state: Optional[str] = Field(default=None, description="Target state (e.g. Maharashtra)")


@app.get("/", tags=["Health"])
async def root() -> Dict[str, Any]:
    """Root health check and service overview."""
    return {
        "service": "APMC Mandi Price Forecasting API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "trigger_pipeline": "POST /api/pipeline/run",
            "latest_forecast": "GET /api/forecast/latest",
            "trend_chart_image": "GET /api/forecast/trend.png",
            "cleaned_history": "GET /api/data/history",
            "scheduler_status": "GET /api/scheduler/status",
        },
    }


@app.post("/api/pipeline/run", tags=["Pipeline"])
async def trigger_pipeline(request: Optional[PipelineRequest] = None) -> Dict[str, Any]:
    """Execute the APMC data loading, cleaning, ML training, and forecasting pipeline on-demand.
    
    Accepts custom parameters (limit 100-500, commodity, market, state) or uses defaults.
    """
    req_limit = request.limit if request else settings.DATA_FETCH_LIMIT
    req_comm = request.commodity if request else settings.DEFAULT_COMMODITY
    req_mkt = request.market if request else settings.DEFAULT_MARKET
    req_st = request.state if request else settings.DEFAULT_STATE

    logger.info(f"API received pipeline run request: commodity={req_comm}, market={req_mkt}, rows={req_limit}")
    result = pipeline.run(
        limit=req_limit,
        commodity=req_comm,
        market=req_mkt,
        state=req_st,
    )

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result,
        )

    return result


@app.get("/api/forecast/latest", tags=["Forecast"])
async def get_latest_forecast() -> Dict[str, Any]:
    """Get the latest 6-7 day forward price predictions, model performance, and trend indicators."""
    forecast_file = settings.FORECAST_JSON_FILE

    if not forecast_file.exists():
        # If pipeline has not been executed yet, run it once now
        logger.info("No prior forecast found on disk. Initializing first-time pipeline run...")
        run_res = pipeline.run()
        if run_res.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not generate initial forecast: {run_res.get('error_message')}",
            )
        return run_res.get("forecasting", {})

    try:
        with open(forecast_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as exc:
        logger.error(f"Error reading forecast file: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading forecast data: {str(exc)}",
        )


@app.get("/api/forecast/trend.png", tags=["Visualization"])
async def get_trend_chart_image():
    """Stream the latest generated high-definition price trend and forecast graph (PNG)."""
    chart_file = settings.TREND_GRAPH_FILE

    if not chart_file.exists():
        # Trigger pipeline if graph does not yet exist
        logger.info("Trend chart does not exist yet. Executing pipeline...")
        run_res = pipeline.run()
        if run_res.get("status") == "error" or not chart_file.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate trend chart image.",
            )

    return FileResponse(
        path=chart_file,
        media_type="image/png",
        filename="trend_forecast.png",
    )


@app.get("/api/data/history", tags=["Data"])
async def get_cleaned_history(
    limit: int = Query(default=100, ge=10, le=500, description="Number of historical days to return")
) -> Dict[str, Any]:
    """Retrieve cleaned historical APMC daily prices."""
    cleaned_file = settings.CLEANED_DATA_FILE

    if not cleaned_file.exists():
        pipeline.run()

    try:
        df = pd.read_csv(cleaned_file)
        if len(df) > limit:
            df = df.iloc[-limit:]
        records = df.to_dict(orient="records")
        return {
            "total_records": len(records),
            "records": records,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading cleaned dataset: {str(exc)}",
        )


@app.get("/api/scheduler/status", tags=["Scheduler"])
async def get_scheduler_status() -> Dict[str, Any]:
    """Inspect background weekly cron scheduler health and upcoming run."""
    return scheduler.get_status()


# Global unhandled exception handler to guarantee backend never crashes
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.critical(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An internal server error occurred, but the backend server handled it safely without crashing.",
            "error_detail": str(exc),
            "error_type": type(exc).__name__,
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
