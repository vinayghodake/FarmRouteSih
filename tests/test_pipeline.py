"""Unit and Integration Test Suite for APMC Price Prediction System."""

import os
from pathlib import Path
import numpy as np
import pandas as pd
import pytest
from starlette.testclient import TestClient

from client import APMCClient
from cleaner import APMCDataCleaner
from forecaster import APMCPriceForecaster
from visualizer import APMCTrendVisualizer
from pipeline import APMCPipeline
from main import app
from config import settings


@pytest.fixture
def sample_dirty_data() -> pd.DataFrame:
    """Create dirty mock APMC data with typical real-world anomalies."""
    data = [
        {"arrival_date": "01/08/2026", "modal_price": "2,400", "min_price": "2100", "max_price": "2600", "commodity": "Tomato", "market": "Pune"},
        {"arrival_date": "01/08/2026", "modal_price": "2500", "min_price": "2200", "max_price": "2700", "commodity": "Tomato", "market": "Pune"}, # Duplicate date
        {"arrival_date": "02/08/2026", "modal_price": "₹2,450", "min_price": "2150", "max_price": "2650", "commodity": "Tomato", "market": "Pune"},
        {"arrival_date": "03/08/2026", "modal_price": "-100", "min_price": "0", "max_price": "0", "commodity": "Tomato", "market": "Pune"}, # Invalid negative
        {"arrival_date": "04/08/2026", "modal_price": "999999", "min_price": "2000", "max_price": "999999", "commodity": "Tomato", "market": "Pune"}, # Extreme outlier
        {"arrival_date": "corrupted_date", "modal_price": "2500", "min_price": "2000", "max_price": "3000", "commodity": "Tomato", "market": "Pune"}, # Bad date
    ]
    # Add 25 regular days to ensure sufficient data for modeling
    for i in range(5, 31):
        d_str = f"{i:02d}/08/2026"
        p = 2400 + (i % 7) * 20
        data.append({
            "arrival_date": d_str,
            "modal_price": str(p),
            "min_price": str(p - 200),
            "max_price": str(p + 200),
            "commodity": "Tomato",
            "market": "Pune",
        })
    return pd.DataFrame(data)


def test_client_fallback_and_limit():
    """Verify APMC client returns within requested row bounds (100 to 500)."""
    client = APMCClient()
    df, meta = client.fetch_data(limit=150)
    assert not df.empty
    assert len(df) == 150
    assert "arrival_date" in df.columns
    assert "modal_price" in df.columns
    assert meta["source"] in ["synthetic_fallback", "data.gov.in_api"]


def test_data_cleaner_resilience(sample_dirty_data):
    """Verify data cleaner removes corrupted dates, filters outliers, and fills date gaps."""
    cleaner = APMCDataCleaner()
    cleaned_df, report = cleaner.clean(sample_dirty_data, commodity="Tomato", market="Pune")

    assert not cleaned_df.empty
    assert "date" in cleaned_df.columns
    assert "modal_price" in cleaned_df.columns
    # Ensure outlier 999999 was handled
    assert cleaned_df["modal_price"].max() < 50000
    # Ensure dropped invalid rows recorded
    assert report["dropped_invalid_rows"] > 0
    # Continuous daily indexing check
    diffs = (cleaned_df["date"].diff().dropna()).dt.days
    assert (diffs == 1).all()


def test_forecaster_7_days():
    """Verify forecaster produces exactly 7 upcoming day predictions with bounds."""
    # Generate 40 days of synthetic price data
    dates = pd.date_range(start="2026-07-01", periods=40, freq="D")
    prices = 2500 + 100 * np.sin(np.linspace(0, 3 * np.pi, 40)) + np.random.normal(0, 20, 40)
    df = pd.DataFrame({"date": dates, "modal_price": prices})

    forecaster = APMCPriceForecaster(horizon_days=7)
    res = forecaster.train_and_predict(df, commodity="Tomato", market="Pune")

    assert res["status"] == "success"
    forecast_list = res["forecast"]
    assert len(forecast_list) == 7

    for item in forecast_list:
        assert "date" in item
        assert "day_of_week" in item
        assert "predicted_price" in item
        assert "lower_bound" in item
        assert "upper_bound" in item
        assert item["lower_bound"] <= item["predicted_price"] <= item["upper_bound"]


def test_trend_visualizer():
    """Verify visualizer creates valid image and file on disk."""
    dates = pd.date_range(start="2026-07-01", periods=30, freq="D")
    prices = 2200 + 50 * np.sin(np.linspace(0, 2 * np.pi, 30))
    hist_df = pd.DataFrame({"date": dates, "modal_price": prices})

    forecaster = APMCPriceForecaster(horizon_days=7)
    f_res = forecaster.train_and_predict(hist_df, commodity="Tomato", market="Pune")

    visualizer = APMCTrendVisualizer()
    chart_path, img_bytes = visualizer.render_trend_chart(hist_df, f_res)

    assert Path(chart_path).exists()
    assert len(img_bytes) > 1000
    # Check PNG magic bytes header
    assert img_bytes[:8] == b"\x89PNG\r\n\x1a\n"


def test_pipeline_end_to_end():
    """Verify complete pipeline executes smoothly end-to-end."""
    pipeline = APMCPipeline()
    result = pipeline.run(limit=120, commodity="Tomato", market="Pune")

    assert result["status"] == "success"
    assert "ingestion" in result
    assert "cleaning" in result
    assert "forecasting" in result
    assert "visualization" in result
    assert len(result["forecasting"]["forecast"]) == 7


def test_fastapi_endpoints():
    """Verify REST API endpoints and response structure."""
    with TestClient(app) as client:
        # Health check
        resp_root = client.get("/")
        assert resp_root.status_code == 200
        assert resp_root.json()["status"] == "online"

        # Trigger pipeline
        resp_run = client.post("/api/pipeline/run", json={"limit": 100, "commodity": "Tomato"})
        assert resp_run.status_code == 200
        run_data = resp_run.json()
        assert run_data["status"] == "success"

        # Latest forecast
        resp_forecast = client.get("/api/forecast/latest")
        assert resp_forecast.status_code == 200
        assert len(resp_forecast.json()["forecast"]) == 7

        # Trend image endpoint
        resp_img = client.get("/api/forecast/trend.png")
        assert resp_img.status_code == 200
        assert resp_img.headers["content-type"] == "image/png"
        assert len(resp_img.content) > 1000

        # Scheduler status
        resp_sched = client.get("/api/scheduler/status")
        assert resp_sched.status_code == 200
        assert "scheduler_running" in resp_sched.json()
