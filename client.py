"""APMC Data Ingestion Client for data.gov.in.

Fetches agricultural commodity market data from the Agmarknet API on data.gov.in.
Includes resilient retry logic and automatic graceful fallback to synthetic APMC
data if the API key is missing, network is unavailable, or the government server
is down or rate-limited.
"""

import logging
import random
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple

import numpy as np
import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from config import settings

logger = logging.getLogger("apmc.client")


class APMCClient:
    """Client for fetching APMC / Agmarknet mandi data."""

    def __init__(self):
        self.base_url = settings.DATA_GOV_BASE_URL
        self.resource_id = settings.DATA_GOV_RESOURCE_ID
        self.api_key = settings.DATA_GOV_API_KEY.strip() if settings.DATA_GOV_API_KEY else None
        self.session = self._create_resilient_session()

    def _create_resilient_session(self) -> requests.Session:
        """Create requests session with retry strategy."""
        session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=1.0,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
        )
        adapter = HTTPAdapter(max_retries=retries)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    def fetch_data(
        self,
        limit: Optional[int] = None,
        commodity: Optional[str] = None,
        market: Optional[str] = None,
        state: Optional[str] = None,
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Fetch APMC records.
        
        Falls back to high-fidelity synthetic APMC data if API is inaccessible or
        unconfigured.
        """
        limit = limit or settings.DATA_FETCH_LIMIT
        # Bound limit between 100 and 500 as requested
        limit = max(100, min(limit, 500))
        commodity = commodity or settings.DEFAULT_COMMODITY
        market = market or settings.DEFAULT_MARKET
        state = state or settings.DEFAULT_STATE

        # Check if API key is provided
        if not self.api_key:
            logger.warning(
                "DATA_GOV_API_KEY is not configured. Switching to resilient synthetic APMC data."
            )
            df = self._generate_synthetic_data(
                rows=limit, commodity=commodity, market=market, state=state
            )
            metadata = {
                "source": "synthetic_fallback",
                "reason": "API key not configured",
                "rows_fetched": len(df),
                "timestamp": datetime.now().isoformat(),
                "commodity": commodity,
                "market": market,
                "state": state,
            }
            self._save_raw_data(df)
            return df, metadata

        endpoint = f"{self.base_url}/{self.resource_id}"
        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": limit,
        }
        if commodity:
            params["filters[commodity]"] = commodity
        if market:
            params["filters[market]"] = market
        if state:
            params["filters[state]"] = state

        logger.info(
            f"Fetching {limit} rows from data.gov.in for commodity='{commodity}', market='{market}'..."
        )

        try:
            response = self.session.get(endpoint, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()

            records = data.get("records", [])
            if not records:
                logger.warning(
                    f"data.gov.in returned 0 records for filters. Falling back to synthetic data."
                )
                df = self._generate_synthetic_data(
                    rows=limit, commodity=commodity, market=market, state=state
                )
                metadata = {
                    "source": "synthetic_fallback",
                    "reason": "Empty records returned from API",
                    "rows_fetched": len(df),
                    "timestamp": datetime.now().isoformat(),
                    "commodity": commodity,
                    "market": market,
                    "state": state,
                }
            else:
                df = pd.DataFrame(records)
                logger.info(f"Successfully retrieved {len(df)} records from data.gov.in API.")
                metadata = {
                    "source": "data.gov.in_api",
                    "total_available": data.get("total", len(df)),
                    "rows_fetched": len(df),
                    "timestamp": datetime.now().isoformat(),
                    "commodity": commodity,
                    "market": market,
                    "state": state,
                }

        except Exception as exc:
            logger.error(
                f"Failed to fetch data from data.gov.in: {exc}. Gracefully falling back to synthetic APMC data."
            )
            df = self._generate_synthetic_data(
                rows=limit, commodity=commodity, market=market, state=state
            )
            metadata = {
                "source": "synthetic_fallback",
                "reason": f"API request error: {str(exc)}",
                "rows_fetched": len(df),
                "timestamp": datetime.now().isoformat(),
                "commodity": commodity,
                "market": market,
                "state": state,
            }

        self._save_raw_data(df)
        return df, metadata

    def _save_raw_data(self, df: pd.DataFrame) -> None:
        """Persist raw data to storage for audit and offline recovery."""
        try:
            df.to_csv(settings.RAW_DATA_FILE, index=False)
            logger.debug(f"Saved raw APMC data to {settings.RAW_DATA_FILE}")
        except Exception as e:
            logger.error(f"Error saving raw data: {e}")

    def _generate_synthetic_data(
        self, rows: int = 300, commodity: str = "Tomato", market: str = "Pune", state: str = "Maharashtra"
    ) -> pd.DataFrame:
        """Generate realistic APMC daily Mandi price series.
        
        Models realistic price dynamics: base commodity price, seasonal trend,
        stochastic daily shocks, realistic min/modal/max spread, and occasional
        mandi trading holidays.
        """
        random.seed(42)
        np.random.seed(42)

        # Realistic commodity price baselines (in INR per Quintal)
        commodity_baselines = {
            "Tomato": 2500,
            "Onion": 2200,
            "Potato": 1800,
            "Wheat": 2400,
            "Rice": 3200,
            "Green Chilli": 4500,
            "Soyabean": 4600,
        }
        base_price = commodity_baselines.get(commodity, 2500)

        end_date = datetime.now().date()
        # Generate enough historical dates
        dates = [end_date - timedelta(days=i) for i in range(rows * 2)]
        # Filter out some Sundays (closed mandis)
        trading_dates = [d for d in dates if d.weekday() != 6][:rows]
        trading_dates.sort()

        records = []
        current_price = float(base_price)

        for i, d in enumerate(trading_dates):
            # Stochastic random walk with mean-reverting seasonality
            seasonality = 150 * np.sin(2 * np.pi * (i % 60) / 60)
            shock = np.random.normal(0, base_price * 0.02)
            current_price = max(base_price * 0.4, current_price * 0.95 + (base_price + seasonality) * 0.05 + shock)
            modal_price = round(current_price, 2)
            min_price = round(modal_price * random.uniform(0.85, 0.95), 2)
            max_price = round(modal_price * random.uniform(1.05, 1.20), 2)

            records.append({
                "state": state,
                "district": market,
                "market": market,
                "commodity": commodity,
                "variety": "Local / Hybrid",
                "arrival_date": d.strftime("%d/%m/%Y"),  # Standard Agmarknet format
                "min_price": str(min_price),
                "max_price": str(max_price),
                "modal_price": str(modal_price),
            })

        return pd.DataFrame(records)
