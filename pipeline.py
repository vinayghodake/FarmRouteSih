"""End-to-End APMC Pipeline Orchestrator.

Coordinates:
1. Fetching raw data from data.gov.in (100 - 500 rows)
2. Cleansing and normalizing records
3. Training ML models and predicting 6-7 days ahead
4. Generating trend graph visualization
"""

import logging
import time
from datetime import datetime
from typing import Any, Dict, Optional

from client import APMCClient
from cleaner import APMCDataCleaner
from forecaster import APMCPriceForecaster
from visualizer import APMCTrendVisualizer
from config import settings

logger = logging.getLogger("apmc.pipeline")


class APMCPipeline:
    """Orchestrates ingestion, cleaning, ML modeling, and visualization."""

    def __init__(self):
        self.client = APMCClient()
        self.cleaner = APMCDataCleaner()
        self.forecaster = APMCPriceForecaster(horizon_days=settings.FORECAST_HORIZON_DAYS)
        self.visualizer = APMCTrendVisualizer()

    def run(
        self,
        limit: Optional[int] = None,
        commodity: Optional[str] = None,
        market: Optional[str] = None,
        state: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Execute complete pipeline run."""
        start_time = time.time()
        run_id = f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        commodity = commodity or settings.DEFAULT_COMMODITY
        market = market or settings.DEFAULT_MARKET
        state = state or settings.DEFAULT_STATE
        limit = limit or settings.DATA_FETCH_LIMIT

        logger.info(f"[{run_id}] Starting APMC pipeline for {commodity} ({market}, {state}), limit={limit}...")

        try:
            # Step 1: Data Ingestion
            logger.info(f"[{run_id}] Phase 1/4: Ingesting data...")
            raw_df, ingest_meta = self.client.fetch_data(
                limit=limit, commodity=commodity, market=market, state=state
            )

            # Step 2: Data Cleaning & Gap Imputation
            logger.info(f"[{run_id}] Phase 2/4: Cleaning and validating records...")
            clean_df, clean_report = self.cleaner.clean(
                raw_df, commodity=commodity, market=market
            )

            # Step 3: Machine Learning Model Training & 7-Day Forecasting
            logger.info(f"[{run_id}] Phase 3/4: Training ML models and generating forecast...")
            forecast_result = self.forecaster.train_and_predict(
                clean_df, commodity=commodity, market=market
            )

            # Step 4: Trend Graph Visualization
            logger.info(f"[{run_id}] Phase 4/4: Generating trend visualization chart...")
            chart_path, _ = self.visualizer.render_trend_chart(
                historical_df=clean_df,
                forecast_result=forecast_result,
            )

            elapsed = round(time.time() - start_time, 2)
            logger.info(f"[{run_id}] Pipeline completed successfully in {elapsed}s.")

            return {
                "status": "success",
                "run_id": run_id,
                "execution_time_seconds": elapsed,
                "timestamp": datetime.now().isoformat(),
                "ingestion": ingest_meta,
                "cleaning": clean_report,
                "forecasting": forecast_result,
                "visualization": {
                    "chart_file": chart_path,
                    "status": "generated",
                },
            }

        except Exception as exc:
            elapsed = round(time.time() - start_time, 2)
            logger.error(f"[{run_id}] Pipeline failed after {elapsed}s: {exc}", exc_info=True)
            return {
                "status": "error",
                "run_id": run_id,
                "execution_time_seconds": elapsed,
                "timestamp": datetime.now().isoformat(),
                "error_message": str(exc),
                "error_type": type(exc).__name__,
            }


# Singleton pipeline instance
pipeline = APMCPipeline()
