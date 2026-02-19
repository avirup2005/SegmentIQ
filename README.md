# SegmentIQ

SegmentIQ is a customer segmentation system built for a college project. It
turns raw customer behavior into explainable segments and ships them through a
FastAPI backend and a React/Vite frontend. The ML pipeline clusters customers
with KMeans, then trains a Logistic Regression model to predict the segment for
new inputs. The UI presents results with confidence and probability breakdowns.

## Highlights
- End‑to‑end pipeline: data → features → clustering → classifier → API → UI
- Explainable segment output (name, traits, confidence, probabilities)
- Live scoring through Hugging Face Spaces
- Modern, interactive UI deployed to Vercel

## Model pipeline (summary)
1. Feature engineering: RFM + channel + product mix signals
2. Unsupervised clustering (KMeans)
3. Supervised classification (Logistic Regression)
4. Artifact export to `models/` (model, preprocessor, metadata)
5. FastAPI serves predictions and metadata

## Project structure
- `app.py` — FastAPI API (loads models and serves `/api/*` routes)
- `models/` — trained artifacts (`model.pkl`, `preprocessor.pkl`, `metadata.json`)
- `customer_segmentation.ipynb` — training notebook
- `segmentiq/` — Vite + React frontend
- `Dockerfile` — Hugging Face Docker Space config
- `requirements.txt` — backend dependencies

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
Use a Docker Space.
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
- `GET /api/health` — health + model metadata
- `GET /api/stats` — segment distribution + accuracy
- `POST /api/predict` — predict segment for a single customer

### Example request
```json
{
  "Age": 45,
  "Education": 2,
  "Marital_Status": 1,
  "Parental_Status": 1,
  "Children": 2,
  "Income": 55000,
  "Total_Spending": 800,
  "Days_as_Customer": 1200,
  "Recency": 30,
  "Wines": 300,
  "Fruits": 50,
  "Meat": 200,
  "Fish": 80,
  "Sweets": 60,
  "Gold": 110,
  "Web": 4,
  "Catalog": 3,
  "Store": 6,
  "Discount_Purchases": 2,
  "Total_Promo": 1,
  "NumWebVisitsMonth": 5
}
```

## Author
Avirup Sasmal  
Email: avirupsasmal2005@gmail.com  
GitHub: https://github.com/avirup2005  
LinkedIn: https://linkedin.com/in/avirup-sasmal-0b74a4304
