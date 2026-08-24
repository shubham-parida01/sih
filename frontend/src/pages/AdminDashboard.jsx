import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, LayoutDashboard, Users, AlertTriangle, BarChart3,
  LogOut, Search, ChevronRight, Bell, Eye, X, CheckCircle,
  XCircle, Flag, Activity, ChevronLeft, Calendar, UserCheck
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart
} from 'recharts';
import { admin as adminAPI, getSession, clearSession, connectAdminWS } from '../services/api';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-fintech text-xs font-semibold">
      <div className="font-bold text-slate-800 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex gap-2 justify-between mt-1">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="font-bold text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Sidebar Navigation ───
function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'accounts', icon: Users, label: 'Portals Registry' },
    { id: 'alerts', icon: AlertTriangle, label: 'Risk Logs' },
    { id: 'flagged', icon: Flag, label: 'Fraud Flags' },
    { id: 'charts', icon: BarChart3, label: 'Weekly Volume' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-100 py-6 px-4 flex flex-col fixed top-0 bottom-0 left-0 z-50">
      <div className="flex items-center gap-2 mb-8 px-2">
        <ShieldCheck size={24} className="text-fintech-blue" />
        <div>
          <div className="font-bold text-base text-slate-900 tracking-tight">
            Raksha<span className="text-fintech-blue">Pay</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank Administrator</div>
        </div>
      </div>

      <div className="flex-grow space-y-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all tap-press ${
              activeTab === t.id 
                ? 'text-fintech-blue bg-blue-50/70 border-l-4 border-fintech-blue' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout} 
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all tap-press"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}


// ─── Dashboard Overview Panel (Visual widgets vary) ───
function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard statistics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data) return <div className="text-slate-400 text-xs font-semibold text-center py-12">No statistics data available</div>;

  const riskDist = data.risk_distribution?.slices || [];
  const scoreTrend = data.score_trend || [];
  const recentAlerts = data.recent_alerts || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Control metrics</h1>
        <p className="text-slate-500 text-sm mt-1">Unified Pre-Transaction UPI Audit Overview</p>
      </div>

      {/* Stats Cards: Broken symmetry via varying visual treatments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dominant Stat widget: Total Checked */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-card p-6 shadow-fintech flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total volume checked</span>
              <div className="text-3xl font-extrabold text-slate-950">{data.total_transactions ?? '—'}</div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
              System running
            </span>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Pre-transaction latency index:</span>
            <span className="text-slate-800 font-bold">&lt; 5.0 milliseconds</span>
          </div>
        </div>

        {/* Small Stat widget: Intercepted Actions */}
        <div className="bg-white border border-slate-100 rounded-card p-6 shadow-fintech flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Intercepted threats</span>
            <div className="text-2xl font-extrabold text-red-600">{data.total_blocked ?? '—'}</div>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">Pre-transaction vector blockages</div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Alerts card */}
        <div className="bg-white border border-slate-100 rounded-card p-6 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Review Flags</span>
            <div className="text-xl font-extrabold text-amber-600">{data.total_flagged ?? '—'}</div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Triage Pending
          </span>
        </div>

        {/* Registered users card */}
        <div className="bg-white border border-slate-100 rounded-card p-6 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Registered Portals</span>
            <div className="text-xl font-extrabold text-slate-900">{data.total_users ?? '—'}</div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Active Registry
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie */}
        <div className="bg-white rounded-card shadow-fintech border border-slate-100 p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" nameKey="name" paddingAngle={4}>
                {riskDist.map((entry, i) => {
                  const colorMap = { 'Low risk': '#10B981', 'Medium risk': '#F59E0B', 'High risk': '#F59E0B', 'Under review': '#94A3B8' };
                  return <Cell key={i} fill={colorMap[entry.name] || '#64748B'} />;
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Score Trend Line */}
        <div className="bg-white rounded-card shadow-fintech border border-slate-100 p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Historical Scoring Index</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#1A73E8" strokeWidth={2.5} dot={{ fill: '#1A73E8', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts List (Varying layout row shapes) */}
      <div className="bg-white rounded-card shadow-fintech border border-slate-100 p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Pending Triaging Queue</h3>
        {recentAlerts.length === 0 ? (
          <p className="text-slate-400 text-xs font-semibold text-center py-6">All transaction reviews cleared</p>
        ) : (
          <div className="space-y-4">
            {recentAlerts.slice(0, 3).map((a, i) => {
              if (i === 0) {
                // Dominant layout: detailed block style
                return (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={15} className="text-fintech-amber" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{a.user_name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Triage category: {a.alert_type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">Score: {((a.risk_score || 0) * 100).toFixed(1)}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">{a.status}</span>
                    </div>
                  </div>
                );
              } else {
                // Secondary layout: simple inline list row
                return (
                  <div key={i} className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">{a.user_name || 'User portal'}</span>
                    <div className="flex gap-4 items-center">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Risk Rating: {((a.risk_score || 0) * 100).toFixed(1)}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{a.status}</span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Accounts List + Detail Panel ───
function AccountsPanel() {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { loadAccounts(); }, [page, search]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.accounts(page, search || undefined);
      setAccounts(res.data.accounts || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load registry portals'); }
    finally { setLoading(false); }
  };

  const openDetail = async (userId) => {
    setSelectedUser(userId);
    setDetailLoading(true);
    try {
      const res = await adminAPI.accountDetail(userId);
      setDetail(res.data);
    } catch { toast.error('Failed to load user portal detail logs'); }
    finally { setDetailLoading(false); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Registries</h1>
          <p className="text-slate-500 text-sm mt-1">{total} portals active in database</p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
          <input 
            className="input w-64 pl-12 py-2.5 text-xs font-semibold" 
            placeholder="Search username or email..."
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Accounts List */}
        <div className="flex-1 w-full space-y-2">
          {loading ? <LoadingSkeleton /> : accounts.length === 0 ? (
            <div className="bg-white rounded-card border border-slate-100 p-8 text-center text-slate-400 font-semibold text-xs">No accounts found</div>
          ) : (
            accounts.map((acc, i) => (
              <motion.div
                key={acc.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => openDetail(acc.id)}
                className={`bg-white border rounded-card p-4 flex items-center justify-between cursor-pointer transition-all hover-lift ${
                  selectedUser === acc.id ? 'border-fintech-blue bg-blue-50/10 shadow-sm' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                    {(acc.full_name || acc.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{acc.full_name || 'N/A'}</div>
                    <div className="text-xs text-slate-400 font-medium">{acc.email}</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </motion.div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-8 pt-4">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-400">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages} 
                className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Specific Account Panel Details */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, x: 15, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '100%', maxWidth: 440 }}
              exit={{ opacity: 0, x: 15, width: 0 }}
              className="w-full lg:max-w-md flex-shrink-0 overflow-hidden"
            >
              <div className="bg-white border border-slate-100 rounded-card shadow-fintech p-6 sticky top-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specific Account Panel</h3>
                  <button onClick={() => { setSelectedUser(null); setDetail(null); }} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>

                {detailLoading ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading detail metrics...</div>
                ) : detail ? (
                  <div className="space-y-6">
                    {/* Normal details */}
                    <div>
                      <div className="text-base font-bold text-slate-900 mb-1">{detail.account?.full_name}</div>
                      <div className="text-xs text-slate-500 font-medium">{detail.account?.email}</div>
                      <div className="text-xs text-slate-400 font-semibold mt-3 space-y-1">
                        <div>UPI Address: <span className="text-slate-700 font-bold">{detail.account?.upi_id}</span></div>
                        <div>Account Balance: <span className="text-slate-700 font-bold">₹{(detail.account?.balance || 0).toLocaleString()}</span></div>
                        <div className="flex items-center gap-1.5 pt-1">
                          Registry Status: 
                          <span className="text-[9px] font-bold uppercase rounded-full px-2 py-0.2 text-slate-500 bg-slate-100">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Historical Average Risk Score Stat Badge */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">Average Risk Score (as Payee)</span>
                      <span className={`text-base font-extrabold rounded-full px-4 py-1 ${
                        detail.avg_risk_score_as_payee >= 60 ? 'text-red-600 bg-red-50' :
                        detail.avg_risk_score_as_payee >= 30 ? 'text-amber-600 bg-amber-50' :
                        'text-slate-500 bg-slate-100'
                      }`}>
                        {(detail.avg_risk_score_as_payee).toFixed(1)}%
                      </span>
                    </div>

                    {/* Recharts Consolidated Chart (Bar + Line Overlay) */}
                    {detail.transaction_chart && detail.transaction_chart.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Volume & Risk Scoring Matrix</h4>
                        <ResponsiveContainer width="100%" height={180}>
                          <ComposedChart data={detail.transaction_chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 600 }} />
                            <YAxis yAxisId="left" tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 600 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 600 }} domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                            <Bar yAxisId="left" dataKey="value" name="Value (INR)" fill="rgba(26, 115, 232, 0.15)" stroke="#1A73E8" strokeWidth={1} radius={[2, 2, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="count" name="Risk Vector" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// ─── Risk Alerts Panel ───
function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => { loadAlerts(); }, [page, filter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.alerts(page, filter === 'all' ? undefined : filter);
      setAlerts(res.data.alerts || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load warning logs'); }
    finally { setLoading(false); }
  };

  const handleReview = async (alertId, action) => {
    try {
      await adminAPI.reviewAlert(alertId, action, reviewingId === alertId ? reviewNotes : undefined);
      toast.success(`Triage complete: marked as ${action}`);
      setReviewingId(null);
      setReviewNotes('');
      loadAlerts();
    } catch (err) {
      toast.error('Alert triaging failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Audit Flags</h1>
        <p className="text-slate-500 text-sm mt-1">{total} warnings registered</p>
      </div>

      <div className="flex gap-2 border-b border-slate-100 pb-4">
        {['pending', 'reviewed', 'false_positive', 'all'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`text-xs font-bold px-4 py-2 rounded-full border transition-all whitespace-nowrap tap-press ${
              filter === f 
                ? 'bg-fintech-blue text-white border-fintech-blue shadow-sm' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-550'
            }`}
          >
            {f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton /> : alerts.length === 0 ? (
        <div className="bg-white rounded-card p-12 border border-slate-100 text-center text-slate-400 font-semibold text-xs">No warning flags logged</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a, i) => (
            <motion.div
              key={a.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white border border-slate-100 rounded-card p-6 shadow-fintech space-y-4"
            >
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-fintech-amber" />
                  <span className="text-sm font-bold text-slate-900">{a.user_email || 'System Account'}</span>
                </div>
                {/* Score badge with neutral secondary outline indicators */}
                <span className={`text-[10px] font-bold uppercase rounded-full px-3 py-1 ${
                  a.risk_level === 'critical' ? 'text-red-600 bg-red-50 border border-red-100' : 'text-slate-500 bg-slate-100 border border-slate-200/50'
                }`}>
                  Score: {((a.risk_score || 0) * 100).toFixed(1)}%
                </span>
              </div>

              {a.risk_explanation && (
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                  {a.risk_explanation}
                </p>
              )}

              {a.status === 'pending' && (
                <div className="space-y-3 pt-2">
                  {reviewingId === a.id ? (
                    <div className="space-y-3">
                      <input 
                        className="input text-xs font-semibold py-2.5" 
                        placeholder="Add review audit notes..." 
                        value={reviewNotes}
                        onChange={e => setReviewNotes(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleReview(a.id, 'approve')} className="flex-1 bg-fintech-blue hover:bg-fintech-blueHover text-white text-xs font-bold py-2 rounded-full transition-all tap-press">
                          Approve
                        </button>
                        <button onClick={() => handleReview(a.id, 'reject')} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-full transition-all tap-press">
                          Reject
                        </button>
                        <button onClick={() => handleReview(a.id, 'false_positive')} className="flex-1 border border-slate-200 hover:bg-slate-555 text-slate-600 text-xs font-bold py-2 rounded-full transition-all tap-press">
                          False Positive
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setReviewingId(a.id)}
                      className="text-xs font-bold text-fintech-blue bg-blue-50 border border-blue-100 rounded-full px-4 py-2 hover:bg-blue-100 transition-all tap-press"
                    >
                      Audit Review
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── Flagged Transactions Panel ───
function FlaggedPanel() {
  const [txns, setTxns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.flaggedTransactions()
      .then(r => { setTxns(r.data.transactions || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error('Failed to load fraud flags statement'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Fraud Flags</h1>
        <p className="text-slate-500 text-sm mt-1">{total} transactions flagged</p>
      </div>

      {loading ? <LoadingSkeleton /> : txns.length === 0 ? (
        <div className="bg-white rounded-card border border-slate-100 p-8 text-center text-slate-400 font-semibold text-xs">No transaction flags active</div>
      ) : (
        <div className="bg-white rounded-card border border-slate-100 shadow-fintech overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Payee</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {txns.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{t.user_name}</td>
                    <td className="px-6 py-4">{t.payee_name || t.payee_upi}</td>
                    <td className="px-6 py-4 font-extrabold">₹{t.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">{((t.risk_score || 0) * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4">
                      {/* Neutral badges for non-verdict indicators */}
                      <span className={`text-[9px] font-bold uppercase rounded-full px-2 py-0.5 ${
                        t.status === 'paused' ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-100'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Weekly volume Panel ───
function AnalyticsPanel() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [riskReasons, setRiskReasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.weeklyVolume(), adminAPI.riskReasons()])
      .then(([wv, rr]) => {
        setWeeklyData(wv.data.weeklyVolume || []);
        setRiskReasons(rr.data.riskReasons || []);
      })
      .catch(() => toast.error('Failed to load weekly logs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Weekly logs</h1>
        <p className="text-slate-500 text-sm mt-1">Transaction clearances & threat vectors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Volume */}
        <div className="bg-white rounded-card border border-slate-100 p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Cleared vs Flags</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
              <Bar dataKey="cleared" name="Cleared" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="review" name="Flagged" fill="#F59E0B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk factors */}
        <div className="bg-white rounded-card border border-slate-100 p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Threat factors</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={riskReasons} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Threat incidents" fill="#1A73E8" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


// ─── Loading Skeleton ───
function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-14 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}


// ─── Main Admin Dashboard ───
export default function AdminDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [realtimeAlert, setRealtimeAlert] = useState(null);

  useEffect(() => {
    if (session.token && session.userId) {
      const ws = connectAdminWS(session.userId, session.token, (data) => {
        setRealtimeAlert(data);
        toast.custom((t) => (
          <div className="bg-white border border-red-200 rounded-card p-5 shadow-fintech-lg flex items-center gap-4 max-w-sm">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 animate-bounce">
              <AlertTriangle className="text-fintech-red" size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Real-Time Risk Threat!</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Amount: ₹{data.amount} — Score: {((data.risk_score || 0) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ), { duration: 6000 });
      });
      return () => ws.close();
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/auth');
    toast.success('Logged out');
  };

  const panels = {
    dashboard: <DashboardOverview />,
    accounts: <AccountsPanel />,
    alerts: <AlertsPanel />,
    flagged: <FlaggedPanel />,
    charts: <AnalyticsPanel />,
  };

  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="p-10 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {panels[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Realtime High-Risk Warning Modal Alert Overlay */}
      <AnimatePresence>
        {realtimeAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-card border border-slate-100 shadow-fintech-lg max-w-sm w-full p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertTriangle size={24} className="text-fintech-red" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">High-Risk Payer Alert</h3>
              <p className="text-slate-500 text-xs mb-4">Urgent review requested by active client socket</p>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left text-xs font-semibold text-slate-600 mb-6 space-y-2">
                <div>User ID: <span className="text-slate-900">{realtimeAlert.user_id || 'N/A'}</span></div>
                <div>Amount: <span className="text-slate-900">₹{realtimeAlert.amount}</span></div>
                <div>Risk Rating: <span className="text-fintech-red">{((realtimeAlert.risk_score || 0) * 100).toFixed(1)}%</span></div>
              </div>

              <button 
                onClick={() => setRealtimeAlert(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-2.5 text-xs font-semibold transition-all tap-press shadow-sm"
              >
                Close Alert
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
