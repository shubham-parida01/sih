import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, ChevronLeft, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import { transaction } from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const statusFilters = ['all', 'completed', 'paused', 'blocked', 'cancelled', 'failed'];

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [txns, setTxns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [page, statusFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await transaction.history(
        page, 
        15, 
        statusFilter === 'all' ? undefined : statusFilter
      );
      setTxns(res.data.transactions || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load transaction history statement');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/wallet')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all text-sm font-semibold tap-press"
          >
            <ArrowLeft size={16} /> Back to Wallet
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{total} records</span>
        </div>

        <div className="bg-white rounded-card shadow-fintech border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Account Statement</h1>
              <p className="text-slate-500 text-xs mt-1">Transaction log with real-time neural protection audit scoring</p>
            </div>
            <button 
              onClick={loadTransactions} 
              className="p-2 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 text-slate-500 transition-all tap-press"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-slate-100">
            {statusFilters.map(filter => (
              <button
                key={filter}
                onClick={() => { setStatusFilter(filter); setPage(1); }}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all whitespace-nowrap tap-press ${
                  statusFilter === filter
                    ? 'bg-fintech-blue text-white border-fintech-blue shadow-sm'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs font-semibold">
              <RefreshCw className="animate-spin mx-auto mb-3 text-fintech-blue" size={24} />
              Loading statement records...
            </div>
          ) : txns.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-semibold">No transactions found matching this filter</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {txns.map((txn, idx) => (
                <div key={txn.id || idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <Send size={14} className="text-fintech-blue" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{txn.payee_name || txn.payee_upi}</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{new Date(txn.created_at).toLocaleString()}</span>
                        {txn.risk_level && (
                          <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.2 ${
                            txn.risk_level === 'low' ? 'text-emerald-600 bg-emerald-50' :
                            txn.risk_level === 'medium' || txn.risk_level === 'high' ? 'text-amber-600 bg-amber-50' :
                            'text-red-600 bg-red-50'
                          }`}>
                            Risk: {txn.risk_level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-950">-₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 mt-1 inline-block ${
                      txn.status === 'completed' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' :
                      txn.status === 'paused' ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                      txn.status === 'blocked' ? 'text-red-600 bg-red-50 border border-red-100' : 
                      'text-slate-500 bg-slate-50 border border-slate-200'
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all tap-press"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-xs font-bold text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all tap-press"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
