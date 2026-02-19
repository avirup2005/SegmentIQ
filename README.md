# SegmentIQ

Customer segmentation system built for a college project. It includes a FastAPI
model API deployed on Hugging Face Spaces and a Vite + React frontend deployed
to Vercel.

## What it does
- Segments customers into 3 cohorts (Budget, Mid‑Tier, Premium)
- Returns explainable traits + probabilities per segment
- Ships an interactive UI with live scoring

## Project structure
- `app.py` — FastAPI API
- `models/` — trained artifacts (`.pkl`, `metadata.json`)
- `segmentiq/` — Vite + React frontend

## Local setup

### 1) Backend (FastAPI)
Install dependencies:
```bash
pip install -r requirements.txt
```

Run API:
```bash
python app.py
```

API runs at:
```
http://localhost:7860
```

### 2) Frontend (Vite)
```bash
cd segmentiq
npm install
```

Create `.env`:
```
VITE_CATEGORISER_API_URL=https://avirup2005-customer-segmentation.hf.space
```

Run dev server:
```bash
npm run dev
```

## Deployment

### Hugging Face Spaces (API)
Use Docker Space.
Required files:
- `app.py`
- `models/`
- `requirements.txt`
- `Dockerfile`

### Vercel (Frontend)
Root directory: `segmentiq`
Build command: `npm run build`
Output directory: `dist`
Env var:
```
VITE_CATEGORISER_API_URL=https://avirup2005-customer-segmentation.hf.space
```

## API Endpoints
- `GET /api/health`
- `GET /api/stats`
- `POST /api/predict`

## Author
Avirup Sasmal  
Email: avirupsasmal2005@gmail.com  
GitHub: https://github.com/avirup2005  
LinkedIn: https://linkedin.com/in/avirup-sasmal-0b74a4304
