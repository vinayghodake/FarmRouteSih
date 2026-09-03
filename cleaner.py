"""Data Cleaning and Preprocessing Engine for APMC Mandi Data.

Standardizes schema, handles inconsistent date formatting, coerces numeric fields,
removes invalid entries, handles outliers via IQR clipping, aggregates intra-day records,
and reindexes the time series with intelligent gap interpolation for machine learning.
"""

import logging
from typing import Any, Dict, Optional, Tuple
import numpy as np
import pandas as pd

from config import settings

logger = logging.getLogger("apmc.cleaner")


class APMCDataCleaner:
    """Cleans and prepares APMC records for time-series modeling."""

    REQUIRED_COLS = ["arrival_date", "modal_price"]

    def clean(
        self, df: pd.DataFrame, commodity: Optional[str] = None, market: Optional[str] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Clean raw APMC dataframe.
        
        Returns:
            Tuple of (cleaned_daily_df, cleaning_report_dict)
        """
        if df is None or df.empty:
            raise ValueError("Input APMC dataframe is empty or None.")

        initial_rows = len(df)
        report: Dict[str, Any] = {
            "initial_rows": initial_rows,
            "dropped_invalid_rows": 0,
            "outliers_adjusted": 0,
            "interpolated_gaps": 0,
            "final_rows": 0,
            "date_range": {},
            "price_stats": {},
        }

        # 1. Standardize column names (lowercase, strip whitespace, replace spaces with underscores)
        df_clean = df.copy()
        df_clean.columns = [c.strip().lower().replace(" ", "_") for c in df_clean.columns]

        # Check for essential columns
        for req_col in self.REQUIRED_COLS:
            if req_col not in df_clean.columns:
                # Try finding fuzzy match
                matched = [c for c in df_clean.columns if req_col in c]
                if matched:
                    df_clean.rename(columns={matched[0]: req_col}, inplace=True)
                else:
                    raise KeyError(f"Required column '{req_col}' not found in data columns: {list(df_clean.columns)}")

        # 2. Filter by commodity and market if present
        if commodity and "commodity" in df_clean.columns:
            commodity_mask = df_clean["commodity"].astype(str).str.strip().str.lower() == commodity.strip().lower()
            if commodity_mask.any():
                df_clean = df_clean[commodity_mask]

        if market and "market" in df_clean.columns:
            market_mask = df_clean["market"].astype(str).str.strip().str.lower() == market.strip().lower()
            if market_mask.any():
                df_clean = df_clean[market_mask]

        # 3. Robust Date Parsing
        df_clean["arrival_date"] = pd.to_datetime(
            df_clean["arrival_date"],
            dayfirst=True,  # Standard in India (DD/MM/YYYY)
            errors="coerce",
        )
        # Drop invalid dates
        df_clean = df_clean.dropna(subset=["arrival_date"])

        # 4. Numeric price conversion
        for price_col in ["modal_price", "min_price", "max_price"]:
            if price_col in df_clean.columns:
                df_clean[price_col] = (
                    df_clean[price_col]
                    .astype(str)
                    .str.replace(r"[^\d.]", "", regex=True)
                )
                df_clean[price_col] = pd.to_numeric(df_clean[price_col], errors="coerce")

        # Remove null or non-positive modal prices
        valid_price_mask = (df_clean["modal_price"].notna()) & (df_clean["modal_price"] > 0)
        dropped_count = initial_rows - valid_price_mask.sum()
        report["dropped_invalid_rows"] = int(dropped_count)
        df_clean = df_clean[valid_price_mask]

        if df_clean.empty:
            raise ValueError("No valid price records remaining after removing invalid rows.")

        # 5. Outlier Detection and IQR Winsorizing / Clipping
        q1 = df_clean["modal_price"].quantile(0.25)
        q3 = df_clean["modal_price"].quantile(0.75)
        iqr = q3 - q1
        lower_bound = max(1.0, q1 - 2.5 * iqr)
        upper_bound = q3 + 2.5 * iqr

        outlier_mask = (df_clean["modal_price"] < lower_bound) | (df_clean["modal_price"] > upper_bound)
        report["outliers_adjusted"] = int(outlier_mask.sum())
        df_clean["modal_price"] = df_clean["modal_price"].clip(lower=lower_bound, upper=upper_bound)

        # 6. Aggregate intra-day arrivals (same date multiple lots)
        agg_dict = {"modal_price": "median"}
        if "min_price" in df_clean.columns:
            agg_dict["min_price"] = "min"
        if "max_price" in df_clean.columns:
            agg_dict["max_price"] = "max"

        daily_df = df_clean.groupby("arrival_date").agg(agg_dict).reset_index()
        daily_df.sort_values("arrival_date", inplace=True)
        daily_df.set_index("arrival_date", inplace=True)

        # 7. Resample to continuous daily frequency & interpolate mandi trading holidays
        full_idx = pd.date_range(start=daily_df.index.min(), end=daily_df.index.max(), freq="D")
        gaps_count = len(full_idx) - len(daily_df)
        report["interpolated_gaps"] = int(gaps_count)

        daily_df = daily_df.reindex(full_idx)
        # Linear interpolation for continuous price curves with forward-fill edge handling
        daily_df["modal_price"] = daily_df["modal_price"].interpolate(method="time").ffill().bfill()
        if "min_price" in daily_df.columns:
            daily_df["min_price"] = daily_df["min_price"].interpolate(method="time").ffill().bfill()
        if "max_price" in daily_df.columns:
            daily_df["max_price"] = daily_df["max_price"].interpolate(method="time").ffill().bfill()

        daily_df.index.name = "date"
        daily_df.reset_index(inplace=True)

        report["final_rows"] = len(daily_df)
        report["date_range"] = {
            "start": daily_df["date"].min().strftime("%Y-%m-%d"),
            "end": daily_df["date"].max().strftime("%Y-%m-%d"),
            "total_days": len(daily_df),
        }
        report["price_stats"] = {
            "mean": round(float(daily_df["modal_price"].mean()), 2),
            "median": round(float(daily_df["modal_price"].median()), 2),
            "min": round(float(daily_df["modal_price"].min()), 2),
            "max": round(float(daily_df["modal_price"].max()), 2),
            "std": round(float(daily_df["modal_price"].std()), 2),
        }

        self._save_cleaned_data(daily_df)
        logger.info(
            f"Data cleaned successfully: {initial_rows} raw rows -> {len(daily_df)} daily points. Gaps filled: {gaps_count}"
        )
        return daily_df, report

    def _save_cleaned_data(self, df: pd.DataFrame) -> None:
        """Save cleaned dataset to CSV."""
        try:
            df.to_csv(settings.CLEANED_DATA_FILE, index=False)
            logger.debug(f"Saved cleaned APMC data to {settings.CLEANED_DATA_FILE}")
        except Exception as e:
            logger.error(f"Error saving cleaned data: {e}")
