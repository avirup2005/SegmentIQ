from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pickle
import json
import numpy as np
import pandas as pd
from uvicorn import run as app_run
import os

# ─────────────────────────────────────────
# Load model files on startup
# ─────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

with open(os.path.join(MODELS_DIR, "model.pkl"), "rb") as f:
    model = pickle.load(f)

with open(os.path.join(MODELS_DIR, "preprocessor.pkl"), "rb") as f:
    preprocessor = pickle.load(f)

with open(os.path.join(MODELS_DIR, "feature_columns.pkl"), "rb") as f:
    feature_columns = pickle.load(f)

with open(os.path.join(MODELS_DIR, "metadata.json"), "r") as f:
    metadata = json.load(f)

print("✅ Model and preprocessor loaded successfully")

# ─────────────────────────────────────────
# Cluster descriptions (for the frontend)
# ─────────────────────────────────────────

CLUSTER_PROFILES = {
    0: {
        "name": "Budget Conscious",
        "emoji": "💰",
        "description": "Lower income customers who shop infrequently and spend modestly. Respond well to discounts and deals.",
        "color": "#6366f1",
        "traits": ["Price sensitive", "Infrequent buyer", "Deal seeker"]
    },
    1: {
        "name": "Mid-Tier Shopper",
        "emoji": "🛍️",
        "description": "Average income customers with moderate spending habits. Balanced across product categories.",
        "color": "#10b981",
        "traits": ["Moderate spender", "Web buyer", "Promo responsive"]
    },
    2: {
        "name": "Premium Customer",
        "emoji": "⭐",
        "description": "High income, high spending customers. Prefer quality over price and rarely use discounts.",
        "color": "#f59e0b",
        "traits": ["High spender", "Loyal", "Premium products"]
    }
}

# ─────────────────────────────────────────
# App setup
# ─────────────────────────────────────────

app = FastAPI(
    title="Customer Segmentation API",
    description="Predicts which customer segment a person belongs to",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Lovable frontend can call this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# Request schema
# ─────────────────────────────────────────

class CustomerInput(BaseModel):
    Age: float
    Education: int              # 0=High School, 1=Diploma, 2=Graduate, 3=Masters, 4=PhD
    Marital_Status: int         # 0=Single/No partner, 1=Has partner
    Parental_Status: int        # 0=No children, 1=Has children
    Children: int
    Income: float
    Total_Spending: float
    Days_as_Customer: int
    Recency: int
    Wines: float
    Fruits: float
    Meat: float
    Fish: float
    Sweets: float
    Gold: float
    Web: int
    Catalog: int
    Store: int
    Discount_Purchases: int
    Total_Promo: int
    NumWebVisitsMonth: int

    class Config:
        json_schema_extra = {
            "example": {
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
        }

# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "Customer Segmentation API is running 🚀",
        "docs": "/docs",
        "endpoints": ["/api/predict", "/api/stats", "/api/health"]
    }


@app.get("/api/health")
def health():
    """Health check — used by Hugging Face Spaces to verify app is alive"""
    return {
        "status": "healthy",
        "model": metadata.get("model_type"),
        "accuracy": metadata.get("accuracy"),
        "trained_on": metadata.get("trained_on")
    }


@app.get("/api/stats")
def stats():
    """
    Returns stats for the dashboard —
    cluster sizes, model accuracy, total customers trained on
    """
    cluster_sizes = metadata.get("cluster_sizes", {})
    total = sum(cluster_sizes.values())

    segments = []
    for cluster_id, count in cluster_sizes.items():
        cid = int(cluster_id)
        profile = CLUSTER_PROFILES.get(cid, {})
        segments.append({
            "id": cid,
            "name": profile.get("name", f"Cluster {cid}"),
            "emoji": profile.get("emoji", ""),
            "count": count,
            "percentage": round((count / total) * 100, 1),
            "color": profile.get("color", "#6366f1")
        })

    return {
        "total_customers": total,
        "n_segments": metadata.get("n_clusters", 3),
        "model_accuracy": metadata.get("accuracy"),
        "model_type": metadata.get("model_type"),
        "trained_on": metadata.get("trained_on"),
        "segments": segments
    }


@app.post("/api/predict")
def predict(customer: CustomerInput):
    """
    Takes customer data, returns predicted segment with profile info.
    This is the main endpoint called by the Lovable frontend.
    """
    try:
        # Build input dict — rename to match training column names
        input_dict = {
            "Age": customer.Age,
            "Education": customer.Education,
            "Marital Status": customer.Marital_Status,
            "Parental Status": customer.Parental_Status,
            "Children": customer.Children,
            "Income": customer.Income,
            "Total_Spending": customer.Total_Spending,
            "Days_as_Customer": customer.Days_as_Customer,
            "Recency": customer.Recency,
            "Wines": customer.Wines,
            "Fruits": customer.Fruits,
            "Meat": customer.Meat,
            "Fish": customer.Fish,
            "Sweets": customer.Sweets,
            "Gold": customer.Gold,
            "Web": customer.Web,
            "Catalog": customer.Catalog,
            "Store": customer.Store,
            "Discount Purchases": customer.Discount_Purchases,
            "Total Promo": customer.Total_Promo,
            "NumWebVisitsMonth": customer.NumWebVisitsMonth,
        }

        # Create DataFrame in the correct column order
        input_df = pd.DataFrame([input_dict])[feature_columns]
        # Force numeric types and handle any stray strings/nulls
        input_df = input_df.apply(pd.to_numeric, errors="coerce").fillna(0).astype(float)

        # Scale using saved preprocessor
        input_scaled = preprocessor.transform(input_df)
        input_scaled_df = pd.DataFrame(input_scaled, columns=feature_columns)

        # Predict
        predicted_cluster = int(model.predict(input_scaled_df)[0])
        probabilities = model.predict_proba(input_scaled_df)[0]

        # Get cluster profile
        profile = CLUSTER_PROFILES.get(predicted_cluster, {})

        return {
            "status": "success",
            "cluster": predicted_cluster,
            "segment_name": profile.get("name", f"Cluster {predicted_cluster}"),
            "emoji": profile.get("emoji", ""),
            "description": profile.get("description", ""),
            "traits": profile.get("traits", []),
            "color": profile.get("color", "#6366f1"),
            "confidence": round(float(max(probabilities)) * 100, 1),
            "probabilities": {
                f"cluster_{i}": round(float(p) * 100, 1)
                for i, p in enumerate(probabilities)
            }
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# ─────────────────────────────────────────
# Run
# ─────────────────────────────────────────

if __name__ == "__main__":
    app_run(app, host="0.0.0.0", port=7860)  # 7860 is default HF Spaces port
