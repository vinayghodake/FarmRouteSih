# Unified Agricultural Backend: APMC Price Forecasting & Fruit Quality Grading

An enterprise-ready backend service uniting two core agricultural AI capabilities:
1. **APMC Mandi Price Forecasting**: Ingests daily market prices from `data.gov.in`, cleans records, trains ML time-series models, predicts 6–7 days forward prices, and plots trend graphs with confidence bounds.
2. **Ultralytics YOLO Fruit Quality & Grade Classifier**: Inspects fruit images, identifies blemishes/defects, assigns commercial quality grades (**Grade A**, **Grade B**, **Grade C**), and provides visual HUD badges and fine-tuning endpoints.

---

## Architecture Overview

```
apmc_price_predictor/
├── main.py                     # Unified FastAPI server mounting all endpoints
├── config.py                   # APMC configuration & storage paths
├── client.py                   # data.gov.in APMC ingestion client
├── cleaner.py                  # APMC data cleaning & interpolation engine
├── forecaster.py               # 7-day ML price forecasting engine
├── visualizer.py               # Price trend graph generator
├── scheduler.py                # Weekly background APScheduler
├── pipeline.py                 # APMC end-to-end pipeline orchestrator
│
├── fruit_classifier/           # Ultralytics YOLO Fruit Grading Module
│   ├── config.py               # Fruit quality & grading hyperparameters
│   ├── dataset_manager.py      # Dataset splits & synthetic sample generator
│   ├── trainer.py              # Background asynchronous YOLO fine-tuner
│   ├── inference.py            # YOLO inference, defect assessment & HUD badge
│   └── router.py               # Dedicated FastAPI APIRouter (/api/fruit/*)
│
├── dataset_fruits/             # Fruit training, validation, and test images
├── data/                       # APMC raw and cleaned CSV datasets
├── models/                     # Saved ML & YOLO model weights
├── outputs/                    # Output forecasts, trend charts & annotated badges
└── tests/
    ├── test_pipeline.py        # APMC pipeline test suite
    └── test_fruit_classifier.py# Fruit quality classifier test suite
```

---

## Quick Start

### 1. Start the Unified Backend Server
```powershell
cd C:\Users\Admin\.gemini\antigravity\scratch\apmc_price_predictor
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Open Swagger Documentation
Navigate to **[http://localhost:8000/docs](http://localhost:8000/docs)** to test all endpoints.

---

## Unified REST API Endpoints

### 🍇 Fruit Quality & Grading Endpoints (`/api/fruit/*`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/fruit/classify` | Upload fruit image for grade (A/B/C), confidence, and defect breakdown |
| `POST` | `/api/fruit/image-only` | Stream annotated JPEG image directly with visual HUD overlay badge |
| `POST` | `/api/fruit/train/start` | Start YOLO model fine-tuning in background |
| `GET` | `/api/fruit/train/status` | Check live training progress and validation accuracy |
| `GET` | `/api/fruit/dataset/summary` | Inspect dataset distribution across Grade A, B, and C |
| `POST` | `/api/fruit/dataset/generate-sample` | Generate synthetic sample fruit images for instant testing |
| `GET` | `/api/fruit/model/info` | Inspect active YOLO model weights & class definitions |

### 📈 APMC Price Forecasting Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/pipeline/run` | Execute on-demand APMC data fetching, cleaning & ML retraining |
| `GET` | `/api/forecast/latest` | Retrieve latest 7-day price predictions JSON |
| `GET` | `/api/forecast/trend.png` | Stream high-res price trend graph image (PNG) |
| `GET` | `/api/data/history` | Query cleaned historical mandi prices |
| `GET` | `/api/scheduler/status` | Check weekly cron scheduler health |

---

## Running the Complete Test Suite

```powershell
python -m pytest tests/ -v
```
