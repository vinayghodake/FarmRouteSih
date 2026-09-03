"""Visualization Engine for APMC Mandi Price Trends and Forecasts.

Generates publication-quality charts depicting historical daily prices,
rolling trend indicators, 7-day forward predictions, and confidence intervals.
Thread-safe and headless-ready for backend web service execution.
"""

import io
import logging
from typing import Any, Dict, Optional, Tuple
import matplotlib
matplotlib.use("Agg")  # Non-interactive headless backend
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from config import settings

logger = logging.getLogger("apmc.visualizer")


class APMCTrendVisualizer:
    """Renders high-definition trend and forecast visual analytics."""

    def __init__(self):
        self.output_file = settings.TREND_GRAPH_FILE

    def render_trend_chart(
        self,
        historical_df: pd.DataFrame,
        forecast_result: Dict[str, Any],
        recent_days: int = 45,
    ) -> Tuple[str, bytes]:
        """Generate trend chart and return (file_path, image_bytes).
        
        Args:
            historical_df: Dataframe with ['date', 'modal_price'].
            forecast_result: Forecast dictionary produced by APMCPriceForecaster.
            recent_days: Number of past days to display for focus.
        """
        plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
        fig, ax = plt.subplots(figsize=(12, 6.5), dpi=150)

        # 1. Prepare historical data
        hist = historical_df.copy()
        hist["date"] = pd.to_datetime(hist["date"])
        hist = hist.sort_values("date").reset_index(drop=True)
        if len(hist) > recent_days:
            hist = hist.iloc[-recent_days:].copy()

        # Rolling 7-day average
        hist["rolling_7"] = hist["modal_price"].rolling(7, min_periods=1).mean()

        # 2. Prepare forecast data
        forecast_items = forecast_result.get("forecast", [])
        meta = forecast_result.get("metadata", {})
        f_dates = [pd.to_datetime(item["date"]) for item in forecast_items]
        f_preds = [item["predicted_price"] for item in forecast_items]
        f_lows = [item["lower_bound"] for item in forecast_items]
        f_ups = [item["upper_bound"] for item in forecast_items]

        # Seamless connection: anchor forecast curve from the last historical point
        last_hist_date = hist["date"].iloc[-1]
        last_hist_price = hist["modal_price"].iloc[-1]

        plot_f_dates = [last_hist_date] + f_dates
        plot_f_preds = [last_hist_price] + f_preds
        plot_f_lows = [last_hist_price] + f_lows
        plot_f_ups = [last_hist_price] + f_ups

        # 3. Plot Historical Data
        ax.plot(
            hist["date"],
            hist["modal_price"],
            label="Daily Modal Price",
            color="#2563eb",
            linewidth=1.8,
            alpha=0.85,
            marker="o",
            markersize=3.5,
        )
        ax.plot(
            hist["date"],
            hist["rolling_7"],
            label="7-Day Moving Avg",
            color="#d97706",
            linewidth=2.0,
            linestyle="-.",
            alpha=0.9,
        )

        # 4. Plot Forecast Curve and Prediction Bounds
        trend_dir = meta.get("trend_direction", "STABLE")
        forecast_color = "#16a34a" if trend_dir == "BULLISH" else ("#dc2626" if trend_dir == "BEARISH" else "#7c3aed")

        ax.plot(
            plot_f_dates,
            plot_f_preds,
            label=f"Predicted Next {len(forecast_items)} Days ({meta.get('model_used', 'ML')})",
            color=forecast_color,
            linewidth=2.4,
            linestyle="--",
            marker="s",
            markersize=5,
        )
        ax.fill_between(
            plot_f_dates,
            plot_f_lows,
            plot_f_ups,
            color=forecast_color,
            alpha=0.18,
            label="Forecast Confidence Interval (±1.96σ)",
        )

        # 5. Demarcate Forecast Boundary
        ax.axvline(
            x=last_hist_date,
            color="#64748b",
            linestyle=":",
            linewidth=1.5,
            label="Forecast Horizon Start",
        )

        # Annotate last known and target prices
        ax.annotate(
            f"Last: ₹{last_hist_price:.0f}",
            xy=(last_hist_date, last_hist_price),
            xytext=(-20, 15),
            textcoords="offset points",
            fontweight="bold",
            fontsize=9,
            color="#1e293b",
            bbox=dict(boxstyle="round,pad=0.3", fc="#f8fafc", ec="#94a3b8", lw=1),
            arrowprops=dict(arrowstyle="->", connectionstyle="arc3,rad=.2", color="#475569"),
        )
        if f_preds:
            target_date = f_dates[-1]
            target_price = f_preds[-1]
            ax.annotate(
                f"Day +{len(f_preds)}: ₹{target_price:.0f}\n({meta.get('trend_change_percent', 0.0):+0.1f}%)",
                xy=(target_date, target_price),
                xytext=(10, -25 if trend_dir == "BEARISH" else 15),
                textcoords="offset points",
                fontweight="bold",
                fontsize=9,
                color=forecast_color,
                bbox=dict(boxstyle="round,pad=0.3", fc="#f0fdf4" if trend_dir == "BULLISH" else "#fef2f2", ec=forecast_color, lw=1.2),
                arrowprops=dict(arrowstyle="->", connectionstyle="arc3,rad=-.2", color=forecast_color),
            )

        # 6. Titles & Labels
        commodity = meta.get("commodity", settings.DEFAULT_COMMODITY)
        market = meta.get("market", settings.DEFAULT_MARKET)
        mae = forecast_result.get("holdout_metrics", {}).get("mae", 0.0)

        title_text = f"APMC Price Trend & {len(forecast_items)}-Day Forecast: {commodity} ({market} Mandi)"
        ax.set_title(title_text, fontsize=14, fontweight="bold", pad=15, color="#0f172a")
        ax.set_xlabel("Date", fontsize=11, fontweight="bold", labelpad=10, color="#334155")
        ax.set_ylabel("Modal Price (₹ per Quintal)", fontsize=11, fontweight="bold", labelpad=10, color="#334155")

        # Formatting X-Axis Dates
        ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%d %b"))
        plt.setp(ax.get_xticklabels(), rotation=30, ha="right", fontsize=9)

        # Legend and Grid
        ax.legend(loc="upper left", frameon=True, facecolor="white", edgecolor="#cbd5e1", fontsize=9)
        ax.grid(True, linestyle="--", alpha=0.5)

        # Metrics subtitle watermark / note
        subtitle = f"Generated: {meta.get('generated_at', '')[:16]} | Model: {meta.get('model_used')} | Holdout MAE: ₹{mae:.1f} | Trend: {trend_dir}"
        fig.text(0.12, 0.015, subtitle, fontsize=8, color="#64748b", style="italic")

        plt.tight_layout()

        # 7. Save to disk and buffer
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        buf.seek(0)
        img_bytes = buf.getvalue()

        fig.savefig(str(self.output_file), format="png", dpi=150, bbox_inches="tight")
        plt.close(fig)

        logger.info(f"Trend chart saved successfully to {self.output_file}")
        return str(self.output_file), img_bytes
