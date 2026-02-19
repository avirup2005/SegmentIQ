import numpy as np
from fastapi.testclient import TestClient

import app as app_module


client = TestClient(app_module.app)

SAMPLE_INPUT = {
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


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    payload = r.json()
    assert payload["message"]
    assert "/api/predict" in payload["endpoints"]


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    payload = r.json()
    assert payload["status"] == "healthy"
    assert "model" in payload
    assert "accuracy" in payload
    assert "trained_on" in payload


def test_stats():
    r = client.get("/api/stats")
    assert r.status_code == 200
    payload = r.json()
    assert payload["n_segments"] >= 1
    assert isinstance(payload["segments"], list)
    assert len(payload["segments"]) == payload["n_segments"]
    for seg in payload["segments"]:
        assert "id" in seg
        assert "name" in seg
        assert "count" in seg
        assert "percentage" in seg


def test_predict_response_schema():
    r = client.post("/api/predict", json=SAMPLE_INPUT)
    assert r.status_code == 200
    payload = r.json()
    assert payload["status"] == "success"
    assert isinstance(payload["cluster"], int)
    assert payload["segment_name"]
    assert isinstance(payload["traits"], list)
    assert "probabilities" in payload


class DummyModel:
    def __init__(self, cluster_id, n_clusters):
        self.cluster_id = cluster_id
        self.n_clusters = n_clusters

    def predict(self, _X):
        return np.array([self.cluster_id])

    def predict_proba(self, _X):
        probs = np.zeros(self.n_clusters, dtype=float)
        probs[self.cluster_id] = 1.0
        return np.array([probs])


def test_predict_for_all_clusters(monkeypatch):
    n_clusters = len(app_module.CLUSTER_PROFILES)
    for cluster_id in range(n_clusters):
        dummy = DummyModel(cluster_id, n_clusters)
        monkeypatch.setattr(app_module, "model", dummy)
        r = client.post("/api/predict", json=SAMPLE_INPUT)
        assert r.status_code == 200
        payload = r.json()
        assert payload["status"] == "success"
        assert payload["cluster"] == cluster_id
        assert payload["segment_name"] == app_module.CLUSTER_PROFILES[cluster_id]["name"]
        for i in range(n_clusters):
            assert f"cluster_{i}" in payload["probabilities"]
