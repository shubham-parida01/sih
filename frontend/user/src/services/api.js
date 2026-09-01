const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://sih-irpg.onrender.com');

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
    signal: AbortSignal.timeout(60000)
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const auth = {
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (credential) => request('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  me: () => request('/api/auth/me'),
};

export const transaction = {
  initiate: (body) => request('/api/transaction/initiate', { method: 'POST', body: JSON.stringify(body) }),
  confirm: (txnId) => request(`/api/transaction/confirm/${txnId}`, { method: 'POST', body: JSON.stringify({ user_acknowledged_risk: true }) }),
  cancel: (txnId) => request(`/api/transaction/cancel/${txnId}`, { method: 'POST' }),
  history: () => request('/api/transaction/history'),
};

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
