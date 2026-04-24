# SmartSpam 🛡️

AI-powered spam detection — FastAPI + scikit-learn + React

## Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI + Uvicorn |
| ML | scikit-learn (TF-IDF, Logistic Regression, Naive Bayes) |
| Frontend | React 18 (no bundler, CDN) |
| Dataset | SMS Spam Collection |

## Quick Start

### 1. Install Python deps
```bash
pip install fastapi uvicorn scikit-learn pandas numpy python-multipart
```

### 2. Train models (one-time)
```bash
cd backend
python3 train_models.py
```

### 3. Start API
```bash
bash start_backend.sh
# → http://localhost:8000
# → Swagger docs: http://localhost:8000/docs
```

### 4. Open frontend
Open `frontend/index.html` in your browser (no build step needed).

---

## API Endpoints

### `POST /predict`
```json
// Request
{ "message": "WIN a FREE iPhone now!", "model": "logistic_regression" }

// Response
{
  "label": "spam",
  "probability": 0.9823,
  "spam_probability": 0.9823,
  "ham_probability": 0.0177,
  "keywords": ["free", "win", "now"],
  "model_used": "logistic_regression"
}
```

### `GET /models`
Returns accuracy and metadata for both trained models.

### `GET /confusion-matrix`
Returns the confusion matrix for both models.

---

## ML Architecture

```
SMS Text Input
     │
     ▼
TF-IDF Vectorizer
(max 5000 features, unigrams + bigrams, English stopwords removed)
     │
     ├──▶ Logistic Regression (C=1.0, L2, max_iter=1000)
     │
     └──▶ Multinomial Naive Bayes (alpha=0.1)
```

Both models achieved **94.4% accuracy** on the test split.

---

## Components

| Component | Description |
|-----------|-------------|
| `InputBox` | Textarea + model toggle + sample messages |
| `ResultBox` | Verdict badge + dual probability bar |
| `HighlightText` | Message with keyword highlights |
| `ModelComparison` | Side-by-side accuracy cards (clickable to switch) |
| `ConfusionMatrix` | TN/FP/FN/TP grid with tab switching |

## Project Structure

```
smartspam/
├── backend/
│   ├── main.py            # FastAPI app
│   ├── train_models.py    # ML training script
│   ├── lr_model.pkl       # Trained LR model
│   ├── nb_model.pkl       # Trained NB model
│   └── metrics.json       # Accuracy + confusion matrices
├── frontend/
│   └── index.html         # React app (no bundler)
├── spam.csv               # Dataset
├── start_backend.sh       # Convenience launcher
└── README.md
```