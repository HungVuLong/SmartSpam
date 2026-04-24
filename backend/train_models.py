"""
SmartSpam ML Training Script
Trains Naive Bayes and Logistic Regression on SMS Spam Collection dataset
Outputs: models/lr_model.joblib, models/nb_model.joblib, models/vectorizer.joblib, models/metrics.json
"""

import os
import json
import re
import numpy as np
import pandas as pd
from pathlib import Path

# Sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, confusion_matrix, classification_report,
    precision_score, recall_score, f1_score
)
import joblib

# ─── 1. CREATE / LOAD DATASET ────────────────────────────────────────────────
# Embedded SMS Spam Dataset (subset for self-contained training)
# Full dataset from UCI: https://archive.ics.uci.edu/ml/datasets/SMS+Spam+Collection

SMS_DATA = "SMSSpamCollection"
BASE_DIR = Path(__file__).parent
DATA_FILE = BASE_DIR / SMS_DATA
MODELS_DIR = BASE_DIR / "models"

def create_dataset():
    df = pd.read_csv(DATA_FILE, sep='\t', header=None, names=['label', 'message'])
    df['label_num'] = df['label'].map({'ham': 0, 'spam': 1})
    print(f"Dataset size: {len(df)} samples")
    print(f"Spam: {df['label_num'].sum()} ({df['label_num'].mean()*100:.1f}%)")
    print(f"Ham:  {(~df['label_num'].astype(bool)).sum()} ({(1-df['label_num'].mean())*100:.1f}%)")
    return df

# ─── 2. PREPROCESSING ─────────────────────────────────────────────────────────
def preprocess(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', 'URL', text)
    text = re.sub(r'\b\d+\b', 'NUM', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ─── 3. TRAIN MODELS ──────────────────────────────────────────────────────────
def train():
    os.makedirs(MODELS_DIR, exist_ok=True)

    df = create_dataset()
    df['clean'] = df['message'].apply(preprocess)

    X = df['clean']
    y = df['label_num']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words='english',
        sublinear_tf=True
    )
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # ── Logistic Regression ──
    lr = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
    lr.fit(X_train_tfidf, y_train)
    lr_preds = lr.predict(X_test_tfidf)
    lr_proba = lr.predict_proba(X_test_tfidf)

    lr_acc = accuracy_score(y_test, lr_preds)
    lr_cm = confusion_matrix(y_test, lr_preds).tolist()
    lr_precision = precision_score(y_test, lr_preds, zero_division=0)
    lr_recall = recall_score(y_test, lr_preds, zero_division=0)
    lr_f1 = f1_score(y_test, lr_preds, zero_division=0)

    # ── Naive Bayes ──
    nb = MultinomialNB(alpha=0.1)
    nb.fit(X_train_tfidf, y_train)
    nb_preds = nb.predict(X_test_tfidf)

    nb_acc = accuracy_score(y_test, nb_preds)
    nb_cm = confusion_matrix(y_test, nb_preds).tolist()
    nb_precision = precision_score(y_test, nb_preds, zero_division=0)
    nb_recall = recall_score(y_test, nb_preds, zero_division=0)
    nb_f1 = f1_score(y_test, nb_preds, zero_division=0)

    print(f"\n=== Logistic Regression ===")
    print(f"Accuracy:  {lr_acc:.4f}")
    print(f"Precision: {lr_precision:.4f}")
    print(f"Recall:    {lr_recall:.4f}")
    print(f"F1 Score:  {lr_f1:.4f}")

    print(f"\n=== Naive Bayes ===")
    print(f"Accuracy:  {nb_acc:.4f}")
    print(f"Precision: {nb_precision:.4f}")
    print(f"Recall:    {nb_recall:.4f}")
    print(f"F1 Score:  {nb_f1:.4f}")

    # ── Feature extraction for keywords ──
    feature_names = vectorizer.get_feature_names_out()
    lr_coefs = lr.coef_[0]
    top_spam_idx = np.argsort(lr_coefs)[-50:]
    spam_keywords = [feature_names[i] for i in top_spam_idx]

    # Save models
    joblib.dump(lr, MODELS_DIR / 'lr_model.joblib')
    joblib.dump(nb, MODELS_DIR / 'nb_model.joblib')
    joblib.dump(vectorizer, MODELS_DIR / 'vectorizer.joblib')

    # Save metrics
    metrics = {
        "logistic_regression": {
            "accuracy": round(lr_acc, 4),
            "precision": round(lr_precision, 4),
            "recall": round(lr_recall, 4),
            "f1": round(lr_f1, 4),
            "confusion_matrix": lr_cm,
            "labels": ["Ham", "Spam"]
        },
        "naive_bayes": {
            "accuracy": round(nb_acc, 4),
            "precision": round(nb_precision, 4),
            "recall": round(nb_recall, 4),
            "f1": round(nb_f1, 4),
            "confusion_matrix": nb_cm,
            "labels": ["Ham", "Spam"]
        },
        "spam_keywords": spam_keywords
    }

    with open(MODELS_DIR / 'metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)

    print("\n✅ Models saved to backend/models/")
    print(f"✅ Spam keywords extracted: {len(spam_keywords)}")
    return metrics

if __name__ == '__main__':
    train()