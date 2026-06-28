# gmail-phishing-detector
AI-powered Chrome Extension that detects phishing emails in real-time inside Gmail using Machine Learning, BERT semantic analysis, and SPF/DMARC email authentication
# Gmail Phishing Detector

An AI-powered Chrome Extension that automatically detects phishing emails 
in real-time inside Gmail using Machine Learning and multi-layer intelligent detection.

## What It Does
- Scans every email you open in Gmail automatically
- Shows a colored banner instantly:
  - Green = Safe
  - Yellow = Suspicious  
  - Red = Phishing
- Click the banner to see full layer-by-layer explanation
- Shows exactly WHY an email was flagged

## Tech Stack
- Python, FastAPI, Uvicorn
- Scikit-Learn (Random Forest — 98.48% accuracy on 82,000+ emails)
- Sentence-Transformers (BERT) for AI semantic understanding
- SPF/DMARC DNS authentication checking (dnspython)
- Chrome Extension Manifest V3, JavaScript

## Detection System — 6 Layers

| Layer | What It Checks | Weight |
|-------|---------------|--------|
| Domain Verification | Trusted domain? Lookalike attack? Typosquatting? | 25% |
| Credential Detection | Asking for password, OTP, card, Aadhaar, AWS keys? | 20% |
| AI Semantic (BERT) | Email intent — informing you or requesting something? | 20% |
| Email Authentication | SPF and DMARC DNS records configured? | 15% |
| URL Analysis | Suspicious links, IP-based URLs, shorteners? | 10% |
| Behavioral Signals | Urgency tactics, BEC patterns, scam language? | 10% |

## ML Model Results

| Model | Accuracy |
|-------|----------|
| Random Forest (Selected) | 98.48% |
| Logistic Regression | 98.34% |
| LightGBM | 98.00% |
| XGBoost | 97.59% |
| Naive Bayes | 95.80% |

## Real-World Test Results

| Email | Result | Score |
|-------|--------|-------|
| HDFC Bank OTP notification | Safe | 6/100 |
| Slice Bank transaction alert | Safe | 20/100 |
| Internshala jobs email | Safe | 30/100 |
| BEC — AWS credentials request | Phishing | 70/100 |
| PayPal lookalike (paypa1.com) | Phishing | 80/100 |
| Fake .tk domain urgent request | Phishing | 75/100 |

## How to Run

### 1. Install Python dependencies
pip install -r backend/requirements.txt

### 2. Download dataset from Kaggle
kaggle datasets download -d naserabdullahalam/phishing-email-dataset -p dataset/ --unzip

### 3. Train the ML model
cd backend
python train.py

### 4. Start the API server
python -m uvicorn app:app --reload --port 8000

### 5. Load Chrome Extension
- Open Chrome and go to chrome://extensions
- Enable Developer Mode (top right)
- Click Load unpacked
- Select the extension/ folder
- Open Gmail and open any email

## Project Structure

gmail-phishing-detector/
├── backend/
│   ├── train.py
│   ├── app.py
│   ├── smart_predict.py
│   ├── domain_checker.py
│   ├── credential_detector.py
│   ├── url_analyzer.py
│   ├── semantic_analyzer.py
│   ├── email_auth_checker.py
│   └── requirements.txt
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   └── icons/
└── README.md

## Note
The dataset and trained model file are not included in this repository 
due to file size limits. Download the dataset from Kaggle and run 
train.py to generate the model automatically.

## Research Reference
Kyaw, P.H.; Gutierrez, J.; Ghobakhlou, A. 
A Systematic Review of Deep Learning Techniques for Phishing Email Detection. 
Electronics 2024, 13, 3823.
