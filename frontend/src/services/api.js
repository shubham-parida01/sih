/**
 * Centralized API client for RakshaPay Backend.
 * Direct connection to backend gateway; throws native errors if backend database is offline.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('rakshapay_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(60000) // 60 second timeout to allow backend cold starts
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
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
  createAccount: (body) => request('/api/admin/accounts', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── WebSocket ───
export function connectAdminWS(adminId, token, onMessage) {
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
