const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('rakshapay_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
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

export const adminApi = {
  login: (body: any) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  dashboard: () => request('/api/admin/dashboard'),
  accounts: (page = 1, search = '') => {
    let url = `/api/admin/accounts?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request(url);
  },
  accountDetail: (userId: string) => request(`/api/admin/accounts/${userId}`),
  alerts: (page = 1, status = '') => {
    let url = `/api/admin/alerts?page=${page}`;
    if (status) url += `&status=${status}`;
    return request(url);
  },
  reviewAlert: (alertId: string, action: string, notes?: string) => request(`/api/admin/alerts/${alertId}/review`, {
    method: 'POST',
    body: JSON.stringify({ action, review_notes: notes }),
  }),
  flaggedTransactions: (page = 1) => request(`/api/admin/transactions/flagged?page=${page}`),
  createAccount: (body: any) => request('/api/admin/accounts', { method: 'POST', body: JSON.stringify(body) }),
  toggleAccountStatus: (userId: string) => request(`/api/admin/accounts/${userId}/status`, { method: 'PUT' }),
};
