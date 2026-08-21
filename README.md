<<<<<<< HEAD
# SIH 2026 — Explainable Real-Time Fraud Shield for UPI
## SOAIDEATHON-S40

Privacy-preserving risk engine that detects suspicious payment behavior, device changes, coercive interaction patterns and voice-phishing indicators before a transaction is completed.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────────┐
│   Frontend      │────▶│  Backend Service (FastAPI - Port 8000)   │
│   (React)       │     │  ├── Auth (JWT + Role-Based)             │
│                 │◀────│  ├── User Portal APIs                    │
│                 │     │  ├── Admin Portal APIs                   │
│                 │◀─ws─│  ├── WebSocket (Real-time alerts)        │
│                 │     │  └── Transaction Engine                  │
└─────────────────┘     └────────────────┬─────────────────────────┘
                                         │ HTTP (internal)
                        ┌────────────────▼─────────────────────────┐
                        │  ML Microservice (FastAPI - Port 8001)   │
                        │  ├── Feature Builder (27-dim vector)     │
                        │  ├── Risk Scorer (ONNX Runtime session)  │
                        │  ├── Explainability (Scale-to-Logit)     │
                        │  ├── Device Analyzer                     │
                        │  ├── Behavior Analyzer                   │
                        │  └── Voice Phishing Detector (stub)      │
                        └──────────────────────────────────────────┘
                                         │
                        ┌────────────────▼─────────────────────────┐
                        │        MongoDB Atlas                     │
                        │  ├── users (profile, credentials)        │
                        │  ├── transactions (incl. risk_score)     │
                        │  ├── alerts (admin review queue)         │
                        │  ├── risk_scores (analytics)             │
                        │  ├── device_fingerprints                 │
                        │  ├── webhook_logs (audit trail)          │
                        │  └── audit_logs                          │
                        └──────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- MongoDB Atlas account (configured in `backend/.env`)

### 1. Clone and set up environment

```bash
# Create virtual environments
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Copy env file and configure
copy .env.example .env
# Edit .env with your MongoDB Atlas URI

cd ../ml_service
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
copy .env.example .env
```

### 2. Place the ML Model
Place your trained ONNX model at:
👉 **`ml_service/models/student_model.onnx`**

### 3. Configure the StandardScaler (Optional but Recommended)
StandardScaler values used to normalize training data can be supplied dynamically. Create a configuration file at:
👉 **`ml_service/models/scaler_config.json`**

Format:
```json
{
  "mean": [0.0, 0.0, ..., 0.0],  // Array of 27 values
  "scale": [1.0, 1.0, ..., 1.0]  // Array of 27 values
}
```
*If this file is not present, a robust heuristic scaling is automatically applied to keep inputs within model boundaries.*

### 4. Start the ML Microservice (Port 8001)

```bash
cd ml_service
.\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8001
```

### 5. Start the Backend Service (Port 8000)

```bash
cd backend
.\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📚 API Documentation

Once running, visit:
- **Backend Swagger**: http://localhost:8000/docs
- **ML Service Swagger**: http://localhost:8001/docs

---

## 🔑 Authentication

- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login` → returns JWT + role
- **Admin**: Seeded on first startup (configure in .env)

Login response includes `role` field (`user` or `admin`) so the frontend knows which dashboard to render.

---

## 🔄 Transaction Flow

1. User clicks "Pay" → `POST /api/transaction/initiate`
2. Backend sends to ML service for risk scoring
3. Based on risk score:
   - **< 30 (LOW)**: Auto-approved ✅
   - **30-79 (MEDIUM/HIGH)**: Paused with warning ⚠️
   - **≥ 80 (CRITICAL)**: Blocked, admin notified via WebSocket 🔴
4. User can confirm/cancel paused transactions

The response includes:
* `model_type`: `"onnx"` if the ONNX model executed; `"rule_based"` if it fell back to heuristics.

---

## 📊 Admin Dashboard

- WebSocket real-time alerts: `ws://localhost:8000/api/admin/ws/{admin_id}`
- Risk alert webhook receiver: `POST /api/admin/webhooks/risk-alert`
- Chart data endpoints match frontend `appConfig.json` format:
  - Donut Chart: `GET /api/admin/dashboard` (`risk_distribution` field)
  - 7-day Line Chart: `GET /api/admin/dashboard` (`score_trend` field)
  - Area Chart (Single Account): `GET /api/admin/accounts/{user_id}` (`account_trend` field)
  - Weekly Volume Dual Bar: `GET /api/admin/charts/weekly-volume`
  - Horizontal Reason Bar: `GET /api/admin/charts/risk-reasons`

---

## 👥 Team

Built for Smart India Hackathon 2026.
