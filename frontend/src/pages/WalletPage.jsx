import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, History, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, CreditCard, Activity, Landmark, Smartphone, MoreHorizontal } from 'lucide-react';
import { user as userAPI } from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function WalletPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await userAPI.dashboard();
      setDashboard(res.data);
    } catch (err) {
      toast.error('Failed to load wallet dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Send, label: 'Pay Someone', color: 'text-blue-600 bg-blue-50', border: 'border-blue-100', onClick: () => navigate('/send') },
    { icon: ArrowDownLeft, label: 'Receive', color: 'text-slate-600 bg-slate-50', border: 'border-slate-100', onClick: () => toast('Receive link feature coming soon') },
    { icon: CreditCard, label: 'Pay Bills', color: 'text-slate-600 bg-slate-50', border: 'border-slate-100', onClick: () => toast('Bill payment options coming soon') },
    { icon: History, label: 'History Logs', color: 'text-slate-500 bg-slate-50', border: 'border-slate-100', onClick: () => navigate('/history') },
  ];

  const balance = dashboard?.balance ?? 0;
  const riskSummary = dashboard?.risk_summary ?? { low: 0, medium: 0, high: 0, critical: 0 };
  const recentTxns = dashboard?.recent_transactions ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Landmark className="animate-pulse text-fintech-blue" size={36} />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Securing Wallet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Greetings */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI Active Account</span>
            <h1 className="text-2xl font-bold text-slate-900">{dashboard?.full_name || 'Account Owner'}</h1>
          </div>
          {/* Green reserved strictly for primary risk verdict badge */}
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Shield Protection Active
          </span>
        </div>

        {/* Paytm-style Balance Card - Light/White surface theme */}
        <div className="bg-white rounded-card shadow-fintech border border-slate-100 p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-blue-50/40 pointer-events-none" />

          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Balance</span>
            <button 
              onClick={() => setShowBalance(!showBalance)} 
              className="text-slate-400 hover:text-slate-600 transition-colors tap-press"
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
            {showBalance ? `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ ••••••'}
          </div>

          {/* UPI Address info with neutral secondary status indicators */}
          <div className="flex justify-between items-center pt-5 border-t border-slate-100 flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">My UPI Address</span>
              <span className="text-xs font-semibold text-slate-600">{dashboard?.upi_id || 'N/A'}</span>
            </div>

            <div className="flex gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200/50 rounded-full px-3 py-1">
                Low risk audit: {riskSummary.low}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
                Warn: {riskSummary.medium + riskSummary.high}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {quickActions.map((action, idx) => (
            <button 
              key={idx} 
              onClick={action.onClick}
              className="bg-white border border-slate-100 rounded-card p-4 flex flex-col items-center gap-3 shadow-fintech hover:border-slate-200 transition-all hover-lift tap-press"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${action.border} ${action.color}`}>
                <action.icon size={20} />
              </div>
              <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Activity: Broken repetition, varied UI layout row shapes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <button 
              onClick={() => navigate('/history')} 
              className="text-xs font-bold text-fintech-blue hover:underline flex items-center gap-1 tap-press"
            >
              View Statement <ArrowUpRight size={14} />
            </button>
          </div>

          {recentTxns.length === 0 ? (
            <div className="bg-white rounded-card shadow-fintech border border-slate-100 p-12 text-center">
              <Activity size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-semibold">No recent transactions recorded</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTxns.slice(0, 3).map((txn, idx) => {
                // Varying UI layouts based on position index
                if (idx === 0) {
                  // Expanded block layout for the primary recent item
                  return (
                    <div 
                      key={txn.id || idx} 
                      className="bg-white rounded-card shadow-fintech border border-slate-100 p-6 space-y-4 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Send size={15} className="text-fintech-blue" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-950">{txn.payee_name || txn.payee_upi}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(txn.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-extrabold text-slate-900">-₹{txn.amount.toLocaleString()}</div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 rounded px-2 py-0.5 mt-1 inline-block">
                            {txn.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                        <span>UPI Transaction Reference: {txn.id ? txn.id.slice(-12) : 'N/A'}</span>
                        <button onClick={() => navigate('/history')} className="text-fintech-blue hover:underline font-bold">Audit Details</button>
                      </div>
                    </div>
                  );
                } else if (idx === 1) {
                  // Clean minimalist inline row layout
                  return (
                    <div 
                      key={txn.id || idx} 
                      className="bg-white rounded-card shadow-fintech border border-slate-100 p-4 flex items-center justify-between hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-8">{new Date(txn.created_at).getDate()} {new Date(txn.created_at).toLocaleString('default', { month: 'short' })}</span>
                        <div className="text-sm font-semibold text-slate-700">{txn.payee_name || txn.payee_upi}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-800">-₹{txn.amount.toLocaleString()}</span>
                        <span className="text-[9px] font-bold uppercase text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">{txn.status}</span>
                      </div>
                    </div>
                  );
                } else {
                  // Text-oriented visual card layout
                  return (
                    <div 
                      key={txn.id || idx} 
                      className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                        <Smartphone size={14} className="text-slate-400" />
                        <span>UPI Send Transfer: {txn.payee_name || txn.payee_upi}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">-₹{txn.amount.toLocaleString()}</span>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
