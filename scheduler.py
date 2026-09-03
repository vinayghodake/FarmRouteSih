"""Background Job Scheduler for Weekly APMC Pipeline Execution.

Configures an APScheduler background runner that executes the data fetching,
cleansing, model retraining, and forecast generation once a week.
Guarantees resilient error recovery so the scheduler never dies.
"""

import logging
from datetime import datetime
from typing import Any, Dict, Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from config import settings
from pipeline import pipeline

logger = logging.getLogger("apmc.scheduler")


class APMCScheduler:
    """Manages the weekly automated pipeline cadence."""

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.job_id = "weekly_apmc_pipeline_job"
        self.last_run_info: Dict[str, Any] = {
            "last_run_time": None,
            "status": "NEVER_RUN",
            "summary": None,
            "error": None,
        }

    def _scheduled_job_wrapper(self) -> None:
        """Wrapper executed by the cron trigger with crash prevention."""
        logger.info("Weekly APMC scheduled execution triggered.")
        self.last_run_info["last_run_time"] = datetime.now().isoformat()
        self.last_run_info["status"] = "RUNNING"

        try:
            result = pipeline.run()
            if result.get("status") == "success":
                self.last_run_info["status"] = "SUCCESS"
                self.last_run_info["summary"] = {
                    "commodity": result["ingestion"]["commodity"],
                    "market": result["ingestion"]["market"],
                    "rows_fetched": result["ingestion"]["rows_fetched"],
                    "model_used": result["forecasting"]["metadata"]["model_used"],
                    "execution_time_seconds": result["execution_time_seconds"],
                }
                self.last_run_info["error"] = None
                logger.info("Weekly APMC scheduled job completed successfully.")
            else:
                self.last_run_info["status"] = "FAILED"
                self.last_run_info["error"] = result.get("error_message")
                logger.error(f"Weekly APMC scheduled job reported failure: {result.get('error_message')}")
        except Exception as exc:
            self.last_run_info["status"] = "CRASH_PREVENTED"
            self.last_run_info["error"] = str(exc)
            logger.error(f"Unexpected exception during scheduled job: {exc}", exc_info=True)

    def start(self) -> None:
        """Initialize and start the background cron scheduler."""
        if not self.scheduler.running:
            # Configure weekly trigger
            trigger = CronTrigger(
                day_of_week=settings.SCHEDULE_DAY_OF_WEEK,
                hour=settings.SCHEDULE_HOUR,
                minute=settings.SCHEDULE_MINUTE,
            )
            self.scheduler.add_job(
                func=self._scheduled_job_wrapper,
                trigger=trigger,
                id=self.job_id,
                name="Weekly APMC Ingestion & ML Forecasting",
                replace_existing=True,
            )
            self.scheduler.start()
            logger.info(
                f"Scheduler started. Weekly job configured for: Day={settings.SCHEDULE_DAY_OF_WEEK.upper()}, "
                f"Time={settings.SCHEDULE_HOUR:02d}:{settings.SCHEDULE_MINUTE:02d}."
            )

    def trigger_now(self) -> Dict[str, Any]:
        """Manually trigger immediate execution without waiting for weekly cron."""
        logger.info("Manual trigger requested.")
        self._scheduled_job_wrapper()
        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        """Retrieve scheduler health and execution timestamps."""
        job = self.scheduler.get_job(self.job_id) if self.scheduler.running else None
        next_run = job.next_run_time.isoformat() if (job and job.next_run_time) else None

        return {
            "scheduler_running": self.scheduler.running,
            "weekly_schedule": {
                "day_of_week": settings.SCHEDULE_DAY_OF_WEEK,
                "hour": settings.SCHEDULE_HOUR,
                "minute": settings.SCHEDULE_MINUTE,
            },
            "next_run_time": next_run,
            "last_run": self.last_run_info,
        }

    def shutdown(self) -> None:
        """Gracefully stop background scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            logger.info("Scheduler stopped.")


# Singleton scheduler instance
scheduler = APMCScheduler()
