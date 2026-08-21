<h1 align="center">
  <br>
  🛡️ RakshaPay
</h1>

<p align="center">
  <b>Smart India Hackathon 2026 — Team SOAIDEATHON-S40</b>
</p>

<p align="center">
  A privacy-preserving real-time risk interceptor engine designed to detect suspicious transaction behavior, unauthorized device swaps, typing indicators, and vishing activity before a UPI transaction is executed.
</p>

<p align="center">
  <a href="https://github.com/shubham-parida01/sih">
    <img src="https://img.shields.io/badge/SIH--2026-SOAIDEATHON--S40-blue?style=for-the-badge" alt="SIH 2026 Badge">
  </a>
  <img src="https://img.shields.io/badge/FastAPI-v0.115.6-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI Badge">
  <img src="https://img.shields.io/badge/React-v18-20232a?style=for-the-badge&logo=react&logoColor=61dafb" alt="React Badge">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47a248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Badge">
  <img src="https://img.shields.io/badge/ONNX-Runtime-00599c?style=for-the-badge&logo=onnx&logoColor=white" alt="ONNX Badge">
</p>

<hr>

<h2>🏗️ 1. Architecture Overview</h2>

<p>
  RakshaPay uses a decoupled, high-performance monorepo microservice architecture. Compute-heavy machine learning scoring is isolated from the transactional API gateway to ensure maximum responsiveness (<150ms latency).
</p>

<table width="100%">
  <tr>
    <td align="center">
      <b>System Component Layout & Data Flow</b>
<pre>
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
                          │  ├── Feature Preprocessor (27-dim space) │
                          │  ├── Risk Scorer (ONNX Runtime session)  │
                          │  ├── Heuristic Scaler Fallback           │
                          │  └── Device & Behavioral Analyzer        │
                          └────────────────┬─────────────────────────┘
                                           │
                          ┌────────────────▼─────────────────────────┐
                          │        MongoDB Atlas                     │
                          │  ├── users (profile, credentials)        │
                          │  ├── transactions (incl. risk_score)     │
                          │  └── alerts (admin review queue)         │
                          └──────────────────────────────────────────┘
</pre>
    </td>
  </tr>
</table>

<hr>

<h2>🚀 2. Live Deployed Services</h2>

<table width="100%">
  <thead>
    <tr style="background-color: #f7fafc;">
      <th align="left">Service</th>
      <th align="left">Environment</th>
      <th align="left">Render Deployed Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Core Backend Gateway</b></td>
      <td>Python 3.12.8</td>
      <td><a href="https://sih-irpg.onrender.com" target="_blank">https://sih-irpg.onrender.com</a></td>
    </tr>
    <tr>
      <td><b>ML scoring Microservice</b></td>
      <td>Python 3.12.8 + ONNX Runtime</td>
      <td><a href="https://sih-ml-service-ibak.onrender.com" target="_blank">https://sih-ml-service-ibak.onrender.com</a></td>
    </tr>
  </tbody>
</table>

<hr>

<h2>🌟 3. Key Product Features</h2>

<ul>
  <li><b>Real-Time Interception Policy:</b> Decides transaction outputs dynamically on a 0-100 risk scale.
    <ul>
      <li><i>Score &lt; 30 (Low Risk):</i> Auto-approves payment instantly.</li>
      <li><i>Score 30-79 (Medium Risk):</i> Pauses transaction, prompts user in-app confirmation screen.</li>
      <li><i>Score &gt;= 80 (High/Critical Risk):</i> Blocks payment and triggers high-priority alerts.</li>
    </ul>
  </li>
  <li><b>27-Dimensional Preprocessing:</b> Computes feature matrices containing behavioral details, location cyclicity, device swaps, and speech patterns.</li>
  <li><b>Admin Alert WebSockets:</b> Persistent wss:// socket streams critical alerts dynamically to active admin dashboards.</li>
</ul>

<hr>

<h2>📚 4. Semantic API Reference</h2>

<details>
  <summary><b>🔑 Click to view Authentication & User Endpoints</b></summary>
  <br>
  
  <h4>POST /api/auth/register</h4>
  <p>Creates a new user profile.</p>
  <pre><code>// Request Body:
{
  "email": "tester@example.com",
  "password": "Password123",
  "full_name": "Test User"
}</code></pre>

  <h4>POST /api/auth/login</h4>
  <p>Authenticates user credentials and issues JWT token.</p>
  <pre><code>// Request Body:
{
  "email": "tester@example.com",
  "password": "Password123"
}</code></pre>
</details>

<details>
  <summary><b>💸 Click to view Transaction & Risk Endpoints</b></summary>
  <br>
  
  <h4>POST /api/transaction/initiate</h4>
  <p>Initiates transaction evaluation. Risk score is computed dynamically by the ONNX model.</p>
  <pre><code>// Request Body:
{
  "amount": 25000.0,
  "upi_id": "receiver@upi",
  "behavioral_data": {
    "typing_speed": 125.4,
    "is_pasted": false
  },
  "device_data": {
    "device_id": "dev_id_hash",
    "is_emulator": false
  }
}</code></pre>

  <h4>POST /api/transaction/confirm</h4>
  <p>Confirms a paused transaction (Risk score 30-79).</p>
  <pre><code>// Request Body:
{
  "transaction_id": "60c72b2f9b..."
}</code></pre>
</details>

<details>
  <summary><b>📊 Click to view Admin Dashboard & WebSockets</b></summary>
  <br>
  
  <h4>GET /api/admin/dashboard</h4>
  <p>Returns general aggregate metrics formatting matching AppConfig.json.</p>
  
  <h4>GET /api/admin/charts/weekly-volume</h4>
  <p>Returns approved vs blocked daily amount volumes.</p>

  <h4>WSS /api/admin/ws/{admin_id}</h4>
  <p>Persistent socket endpoint to stream real-time critical fraud warnings.</p>
</details>

<hr>

<h2>🛠️ 5. Local Setup Instructions</h2>

<h3>1. Clone and Configure</h3>
<pre><code>git clone https://github.com/shubham-parida01/sih.git
cd sih</code></pre>

<h3>2. Start ML Microservice</h3>
<pre><code>cd ml_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Place student_model.onnx inside /models
uvicorn app.main:app --host 0.0.0.0 --port 8001</code></pre>

<h3>3. Start Backend Core</h3>
<pre><code>cd ../backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Copy and configure .env file
copy .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload</code></pre>

<hr>

<p align="center">
  Built for <b>Smart India Hackathon 2026</b>.
</p>
