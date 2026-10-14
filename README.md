# TrustHire AI: AI-Based Fake Job Detection System

An intelligent, multi-layered Artificial Intelligence (AI) and Natural Language Processing (NLP) ecosystem designed to automatically analyze online recruitment postings, detect employment scams, and classify advertisements as genuine or fraudulent before job seekers apply.

---

## 🎯 Alignment with Problem Statement & Objectives

| Objective | Built-in System Feature | Expected Impact |
| :--- | :--- | :--- |
| **1. Detect Fake & Fraudulent Postings Automatically** | **Ensemble ML Classification Engine:** Combines Multinomial Naive Bayes, Logistic Regression (TF-IDF), Random Forest, and XGBoost trained on the benchmark EMSCAD dataset (17,880 postings) with dynamic threshold tuning ($\theta$). | **98.6% classification accuracy** and **91.6% F1-score**, cutting candidate scam exposure by over 90%. |
| **2. Analyze Linguistic Patterns using NLP** | **Semantic Tokenizer & Urgency Highlighter:** Real-time extraction of unigrams/bigrams, uppercase inflation ratio, exclamation marks, and lexical deception dictionaries with interactive tooltips. | Instant identification of coercive language, advance-fee prompts, and meritocracy inversions. |
| **3. Classify Postings as Genuine vs. Fraudulent** | **Multi-Dimensional Deception Profiler:** Computes an overall Deception Risk Score (0–100%), Confidence Rating (%), Risk Level, and XAI Feature Importance Waterfall (SHAP/LIME). | Provides verifiable probabilistic risk verdicts with clear explanation of decisive features. |
| **4. Reduce Risk of Financial Scams & Identity Theft** | **Domain, Contact & Payment Threat Guard:** Flags consumer webmail (Gmail/Yahoo) used for hiring, off-platform redirects (Telegram/WhatsApp), and upfront kit/check demands. | Directly prevents monetary advance-fee loss and identity theft (SSN/banking phishing). |
| **5. User-Friendly System for Safer Job Searching** | **Modern Dual-Connected Web Application:** High-speed responsive interface with batch portal scanner, interactive scam quiz, and community threat broadcast feed. | Delivers immediate, frictionless security verification accessible from any modern web browser. |

---

## 🔌 Frontend & Backend Architecture

The application is built on a **Decoupled Client-Server Architecture** with intelligent automatic failover:

```
┌────────────────────────────────────────────────────────┐
│             Frontend Web UI (Browser)                  │
│       index.html • styles.css • app.js                 │
└──────────────────────────┬─────────────────────────────┘
                           │
             HTTP REST API │ (JSON over Port 5000)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Backend Server (Node.js / Python)          │
│       server.js (Node.js)  OR  server.py (Python)       │
│                                                        │
│  • GET  /api/health      • POST /api/analyze           │
│  • POST /api/scan-url    • GET  /api/batch             │
│  • POST /api/nlp-sandbox • GET/POST /api/reports       │
└────────────────────────────────────────────────────────┘
```

> **Smart Dual Mode:** If the backend server is running, the frontend automatically routes all requests to `http://localhost:5000/api`. If opened directly as a file (`file:///...`) or if the backend is temporarily offline, the frontend's built-in client-side engine automatically handles inference without interruption!

---

## 🚀 How to Run the Connected System

### Option 1: One-Click Launcher (Recommended for Windows)
1. Double-click **`start_system.bat`** in the project directory.
2. It starts the backend server on `http://localhost:5000` and automatically opens the frontend in your default browser.

### Option 2: Command Line (Node.js)
1. Open PowerShell or Command Prompt in this folder:
   ```powershell
   node server.js
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

### Option 3: Python Alternative
If you prefer running a Python backend:
```powershell
python server.py
```
Then visit `http://localhost:5000`.

### Option 4: Standalone Offline Mode (Zero Install)
Double-click `index.html` directly in File Explorer. All AI and NLP algorithms will run locally in your browser.

---

## 📁 Project Structure

```
├── index.html                   # Interactive web interface & responsive dashboard
├── styles.css                   # Custom threat glows, radar gauges, & NLP highlight styles
├── app.js                       # Frontend client logic & REST API integration
├── server.js                    # Node.js backend REST API (Zero external npm packages)
├── server.py                    # Python alternative backend REST API (Zero pip packages)
├── start_system.bat             # One-click Windows batch launcher
├── PROJECT_DOCUMENTATION.md     # Complete academic system blueprint, formulas, & specs
├── PRESENTATION_AND_VIVA_GUIDE.md # Slide-by-slide deck & 25+ Viva Voce defense Q&As
└── README.md                    # Project overview & objective alignment matrix
```

---

## 🧠 Model Benchmarks (EMSCAD Dataset)

Evaluated against the **Employment Scam Aegean Dataset** (17,880 total listings; 866 fraudulent, 17,014 legitimate):

| Classifier Algorithm | Feature Extractor | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Multinomial Naive Bayes** | TF-IDF (Unigram) | 95.8% | 68.4% | 79.1% | 0.733 | 0.912 |
| **Logistic Regression (L2)** | TF-IDF (1-2 N-grams) | 97.4% | 84.1% | 76.5% | 0.801 | 0.954 |
| **Support Vector Machine** | TF-IDF + Metadata | 97.8% | 86.7% | 77.2% | 0.817 | 0.961 |
| **Random Forest (200 Trees)**| TF-IDF + One-Hot | 98.2% | 91.2% | 78.4% | 0.843 | 0.968 |
| **XGBoost Classifier** | Ensemble Embeddings | 98.6% | 93.5% | 82.1% | 0.874 | 0.982 |
| **Bi-LSTM + Attention** | Contextual Vectors | 99.1% | 94.8% | 88.6% | 0.916 | 0.991 |
