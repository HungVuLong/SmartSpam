"""
SmartSpam FastAPI Backend
Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import re
import numpy as np
from pathlib import Path

# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SmartSpam API",
    description="Spam detection using TF-IDF + ML models",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Models ──────────────────────────────────────────────────────────────
MODEL_DIR = Path(__file__).parent / "models"

try:
    lr_model = joblib.load(MODEL_DIR / "lr_model.joblib")
    nb_model = joblib.load(MODEL_DIR / "nb_model.joblib")
    vectorizer = joblib.load(MODEL_DIR / "vectorizer.joblib")

    with open(MODEL_DIR / "metrics.json") as f:
        METRICS = json.load(f)

    SPAM_KEYWORDS = set(METRICS["spam_keywords"])
    print("✅ All models loaded successfully")

except Exception as e:
    print(f"❌ Error loading models: {e}")
    raise RuntimeError(f"Could not load models: {e}")


# ─── Schemas ──────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    message: str
    model: str = "logistic_regression"  # or "naive_bayes"


class PredictResponse(BaseModel):
    label: str
    label_num: int
    probability: float
    spam_probability: float
    ham_probability: float
    keywords: list[str]
    model_used: str


# ─── Preprocessing ────────────────────────────────────────────────────────────
def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', 'URL', text)
    text = re.sub(r'\b\d+\b', 'NUM', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_keywords(message: str) -> list[str]:
    """Find words in message that are known spam indicators."""
    clean = preprocess(message)
    words = set(clean.split())

    # Single word keywords
    found = [w for w in words if w in SPAM_KEYWORDS]

    # Check bigrams
    word_list = clean.split()
    bigrams = [f"{word_list[i]} {word_list[i+1]}" for i in range(len(word_list)-1)]
    found += [b for b in bigrams if b in SPAM_KEYWORDS]

    return list(set(found))[:10]  # Return top 10


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "app": "SmartSpam API",
        "version": "1.0.0",
        "endpoints": ["/predict", "/models", "/confusion-matrix"]
    }


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    """Predict if a message is spam or ham."""

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if request.model not in ["logistic_regression", "naive_bayes"]:
        raise HTTPException(
            status_code=400,
            detail="model must be 'logistic_regression' or 'naive_bayes'"
        )

    # Preprocess and vectorize
    clean = preprocess(request.message)
    X = vectorizer.transform([clean])

    # Select model
    model = lr_model if request.model == "logistic_regression" else nb_model

    # Predict
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0]

    ham_prob = float(proba[0])
    spam_prob = float(proba[1])

    label = "spam" if pred == 1 else "ham"
    confidence = spam_prob if pred == 1 else ham_prob

    # Extract keywords
    keywords = extract_keywords(request.message)

    return PredictResponse(
        label=label,
        label_num=int(pred),
        probability=round(confidence, 4),
        spam_probability=round(spam_prob, 4),
        ham_probability=round(ham_prob, 4),
        keywords=keywords,
        model_used=request.model
    )


@app.get("/models")
def get_models():
    """Return model accuracy and performance metrics."""
    return {
        "models": {
            "logistic_regression": {
                "name": "Logistic Regression (TF-IDF)",
                "description": "Linear classifier with TF-IDF features. High precision, interpretable coefficients.",
                "accuracy": METRICS["logistic_regression"]["accuracy"],
                "precision": METRICS["logistic_regression"]["precision"],
                "recall": METRICS["logistic_regression"]["recall"],
                "f1": METRICS["logistic_regression"]["f1"],
            },
            "naive_bayes": {
                "name": "Multinomial Naive Bayes (TF-IDF)",
                "description": "Probabilistic classifier. Fast, efficient, often excellent for text.",
                "accuracy": METRICS["naive_bayes"]["accuracy"],
                "precision": METRICS["naive_bayes"]["precision"],
                "recall": METRICS["naive_bayes"]["recall"],
                "f1": METRICS["naive_bayes"]["f1"],
            }
        },
        "top_spam_indicators": list(SPAM_KEYWORDS)[:20]
    }


@app.get("/confusion-matrix")
def get_confusion_matrix():
    """Return confusion matrices for both models."""
    return {
        "logistic_regression": {
            "matrix": METRICS["logistic_regression"]["confusion_matrix"],
            "labels": ["Ham", "Spam"],
            "accuracy": METRICS["logistic_regression"]["accuracy"]
        },
        "naive_bayes": {
            "matrix": METRICS["naive_bayes"]["confusion_matrix"],
            "labels": ["Ham", "Spam"],
            "accuracy": METRICS["naive_bayes"]["accuracy"]
        }
    }


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": True}