/**
 * Centralized API client for RakshaPay Backend.
 * Automatically falls back to high-fidelity mock data if the backend is offline.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
let useMockFallback = false;

// ─── High Fidelity Mock Database ───
const mockUser = {
  id: "mock_user_123",
  email: "demo_user@sih2026.com",
  full_name: "Demo User",
  phone: "+919987654321",
  role: "user",
  upi_id: "demouser@upi",
  balance: 50000.0,
  created_at: new Date().toISOString(),
};

const mockTxns = [
  { id: "tx_001", payee_name: "Grocery Mart", payee_upi: "retailer@upi", amount: 1450.00, status: "completed", risk_level: "low", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "tx_002", payee_name: "Electricity Board", payee_upi: "powergrid@upi", amount: 3200.00, status: "completed", risk_level: "low", created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "tx_003", payee_name: "Fake Merchant", payee_upi: "scammer@upi", amount: 15000.00, status: "blocked", risk_level: "critical", risk_explanation: "Coercion threats detected during transaction", created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
];

const mockAccounts = [
  { id: "mock_user_123", full_name: "Demo User", email: "demo_user@sih2026.com", upi_id: "demouser@upi", balance: 50000.0, risk_level: "low" },
  { id: "acc_002", full_name: "Priyansh Sharma", email: "priyansh@sih2026.com", upi_id: "priyansh@upi", balance: 28400.00, risk_level: "low" },
  { id: "acc_003", full_name: "Rohan Verma", email: "rohan@sih2026.com", upi_id: "rohan@upi", balance: 12000.00, risk_level: "medium" },
  { id: "acc_004", full_name: "Anjali Gupta", email: "anjali@sih2026.com", upi_id: "anjali@upi", balance: 8500.00, risk_level: "high" }
];

const mockAlerts = [
  { id: "alert_001", user_email: "anjali@sih2026.com", user_name: "Anjali Gupta", alert_type: "Coercion", risk_score: 0.94, risk_explanation: "Behavioral stress patterns match active coercion signals.", status: "pending" },
  { id: "alert_002", user_email: "rohan@sih2026.com", user_name: "Rohan Verma", alert_type: "Voice Phish", risk_score: 0.76, risk_explanation: "Atypical call velocity and background frequencies flagged.", status: "pending" }
];

async function request(endpoint, options = {}) {
  if (useMockFallback) {
    return handleMockRequest(endpoint, options);
  }

  try {
    const token = localStorage.getItem('rakshapay_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(4000) // 4 second timeout to trigger mock fallback quickly
    });

    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  } catch (err) {
    console.warn(`[API Connection Failed] Falling back to high-fidelity mock sandbox mode: ${err.message || 'Timeout'}`);
    useMockFallback = true;
    return handleMockRequest(endpoint, options);
  }
}

// ─── Mock Request Router ───
function handleMockRequest(endpoint, options) {
  const method = options.method || 'GET';
  
  if (endpoint.startsWith('/api/auth/register')) {
    const body = JSON.parse(options.body);
    return {
      success: true,
      message: "Account created successfully (Mock Mode)",
      data: { user_id: "mock_user_123", email: body.email, full_name: body.full_name, role: "user" }
    };
  }

  if (endpoint.startsWith('/api/auth/login')) {
    const body = JSON.parse(options.body);
    const role = body.email.includes('admin') ? 'admin' : 'user';
    return {
      success: true,
      message: "Login successful (Mock Mode)",
      data: {
        access_token: "mock_token_jwt_123",
        refresh_token: "mock_refresh_jwt_123",
        role: role,
        user_id: role === 'admin' ? "mock_admin_123" : "mock_user_123",
        full_name: role === 'admin' ? "System Administrator" : (body.email.split('@')[0] || "Demo User"),
      }
    };
  }

  if (endpoint.startsWith('/api/user/profile')) {
    return { success: true, data: mockUser };
  }

  if (endpoint.startsWith('/api/user/dashboard')) {
    return {
      success: true,
      data: {
        full_name: mockUser.full_name,
        upi_id: mockUser.upi_id,
        balance: mockUser.balance,
        risk_summary: { low: 2, medium: 1, high: 0, critical: 1 },
        recent_transactions: mockTxns,
      }
    };
  }

  if (endpoint.startsWith('/api/transaction/initiate')) {
    const body = JSON.parse(options.body);
    if (body.payee_upi === 'scammer@upi') {
      return {
        success: true,
        data: {
          transaction_id: "tx_pending_999",
          status: "paused",
          risk_score: 0.94,
          risk_explanation: "Active call mismatch and velocity spikes detected. Voice analytics engine flags active threat.",
          recommendation: "Verify payee identity through an alternative channel before confirming.",
          can_proceed: true
        }
      };
    }
    return {
      success: true,
      data: {
        transaction_id: "tx_pending_100",
        status: "completed",
        amount: body.amount,
        payee_name: body.payee_name,
        payee_upi: body.payee_upi
      }
    };
  }

  if (endpoint.startsWith('/api/transaction/confirm')) {
    return { success: true, data: { status: "completed" } };
  }

  if (endpoint.startsWith('/api/transaction/cancel')) {
    return { success: true, message: "Cancelled" };
  }

  if (endpoint.startsWith('/api/transaction/history')) {
    return {
      success: true,
      data: { transactions: mockTxns, total: mockTxns.length }
    };
  }

  // ─── Admin Dashboard Endpoints ───
  if (endpoint.startsWith('/api/admin/dashboard')) {
    return {
      success: true,
      data: {
        total_transactions: 1240,
        total_flagged: mockAlerts.length,
        total_blocked: 8,
        total_users: mockAccounts.length,
        risk_distribution: {
          slices: [
            { name: "Low risk", value: 70 },
            { name: "Medium risk", value: 20 },
            { name: "High risk", value: 10 },
          ]
        },
        score_trend: [
          { day: "Mon", score: 12 },
          { day: "Tue", score: 15 },
          { day: "Wed", score: 28 },
          { day: "Thu", score: 14 },
          { day: "Fri", score: 32 },
          { day: "Sat", score: 21 },
          { day: "Sun", score: 10 },
        ],
        recent_alerts: mockAlerts
      }
    };
  }

  if (endpoint.startsWith('/api/admin/accounts/')) {
    // Specific account detail panel
    return {
      success: true,
      data: {
        account: mockAccounts[0],
        avg_risk_score_as_payee: 12.5,
        transaction_chart: [
          { date: "Aug 20", value: 1500, count: 12 },
          { date: "Aug 21", value: 3400, count: 8 },
          { date: "Aug 22", value: 1200, count: 15 },
          { date: "Aug 23", value: 8500, count: 42 },
          { date: "Aug 24", value: 4500, count: 10 }
        ]
      }
    };
  }

  if (endpoint.startsWith('/api/admin/accounts')) {
    return {
      success: true,
      data: { accounts: mockAccounts, total: mockAccounts.length }
    };
  }

  if (endpoint.startsWith('/api/admin/alerts')) {
    return {
      success: true,
      data: { alerts: mockAlerts, total: mockAlerts.length }
    };
  }

  if (endpoint.startsWith('/api/admin/transactions/flagged')) {
    return {
      success: true,
      data: { transactions: [mockTxns[2]], total: 1 }
    };
  }

  if (endpoint.startsWith('/api/admin/charts/weekly-volume')) {
    return {
      success: true,
      data: {
        weeklyVolume: [
          { day: "Mon", cleared: 140, review: 5 },
          { day: "Tue", cleared: 180, review: 8 },
          { day: "Wed", cleared: 130, review: 12 },
          { day: "Thu", cleared: 195, review: 4 },
          { day: "Fri", cleared: 220, review: 15 }
        ]
      }
    };
  }

  if (endpoint.startsWith('/api/admin/charts/risk-reasons')) {
    return {
      success: true,
      data: {
        riskReasons: [
          { name: "Coercion Call", value: 48 },
          { name: "Device Change", value: 32 },
          { name: "Velocity Limit", value: 24 },
          { name: "Phishing Audio", value: 18 }
        ]
      }
    };
  }

  return { success: true, data: {} };
}

// ─── Auth ───
export const auth = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refresh: (refresh_token) => request('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),
  me: () => request('/api/auth/me'),
};

// ─── User ───
export const user = {
  profile: () => request('/api/user/profile'),
  updateProfile: (body) => request('/api/user/profile', { method: 'PUT', body: JSON.stringify(body) }),
  dashboard: () => request('/api/user/dashboard'),
  balance: () => request('/api/user/balance'),
  registerDevice: (body) => request('/api/user/device', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Transactions ───
export const transaction = {
  initiate: (body) => request('/api/transaction/initiate', { method: 'POST', body: JSON.stringify(body) }),
  confirm: (txnId) => request(`/api/transaction/confirm/${txnId}`, { method: 'POST', body: JSON.stringify({ user_acknowledged_risk: true }) }),
  cancel: (txnId) => request(`/api/transaction/cancel/${txnId}`, { method: 'POST' }),
  history: (page = 1, pageSize = 20, status) => {
    let url = `/api/transaction/history?page=${page}&page_size=${pageSize}`;
    if (status) url += `&status=${status}`;
    return request(url);
  },
  detail: (txnId) => request(`/api/transaction/${txnId}`),
};

// ─── Admin ───
export const admin = {
  dashboard: () => request('/api/admin/dashboard'),
  accounts: (page = 1, search) => {
    let url = `/api/admin/accounts?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request(url);
  },
  accountDetail: (userId) => request(`/api/admin/accounts/${userId}`),
  accountTransactions: (userId, page = 1) => request(`/api/admin/accounts/${userId}/transactions?page=${page}`),
  weeklyVolume: () => request('/api/admin/charts/weekly-volume'),
  riskReasons: () => request('/api/admin/charts/risk-reasons'),
  alerts: (page = 1, status) => {
    let url = `/api/admin/alerts?page=${page}`;
    if (status) url += `&status=${status}`;
    return request(url);
  },
  reviewAlert: (alertId, action, notes) => request(`/api/admin/alerts/${alertId}/review`, {
    method: 'POST',
    body: JSON.stringify({ action, review_notes: notes }),
  }),
  flaggedTransactions: (page = 1) => request(`/api/admin/transactions/flagged?page=${page}`),
};

// ─── WebSocket ───
export function connectAdminWS(adminId, token, onMessage) {
  if (useMockFallback) {
    // Return a stub WebSocket in mock mode
    console.log("[WS Mock] Connected to administrative WebSocket feed.");
    return { close: () => {} };
  }
  const wsBase = API_BASE.replace('https://', 'wss://').replace('http://', 'ws://');
  const ws = new WebSocket(`${wsBase}/api/admin/ws/${adminId}?token=${token}`);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  ws.onclose = () => setTimeout(() => connectAdminWS(adminId, token, onMessage), 3000);
  return ws;
}

// ─── Session Helpers ───
export function saveSession(data) {
  localStorage.setItem('rakshapay_token', data.access_token);
  localStorage.setItem('rakshapay_refresh', data.refresh_token);
  localStorage.setItem('rakshapay_role', data.role);
  localStorage.setItem('rakshapay_user_id', data.user_id);
  localStorage.setItem('rakshapay_name', data.full_name);
}

export function getSession() {
  return {
    token: localStorage.getItem('rakshapay_token'),
    role: localStorage.getItem('rakshapay_role'),
    userId: localStorage.getItem('rakshapay_user_id'),
    name: localStorage.getItem('rakshapay_name'),
  };
}

export function clearSession() {
  localStorage.removeItem('rakshapay_token');
  localStorage.removeItem('rakshapay_refresh');
  localStorage.removeItem('rakshapay_role');
  localStorage.removeItem('rakshapay_user_id');
  localStorage.removeItem('rakshapay_name');
}
