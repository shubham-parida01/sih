import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, AlertTriangle, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { transaction } from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function SendMoneyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'paused_warning' | 'outcome'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ payee_upi: '', payee_name: '', amount: '' });
  const [result, setResult] = useState(null);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await transaction.initiate({
        payee_upi: form.payee_upi,
        payee_name: form.payee_name,
        amount: parseFloat(form.amount)
      });
      setResult(res.data);
      if (res.data.status === 'completed') {
        setStep('outcome');
        toast.success('Payment completed successfully');
      } else if (res.data.status === 'paused') {
        setStep('paused_warning');
      } else {
        setStep('outcome');
      }
    } catch (err) {
      // Failed outcome (e.g. invalid credentials or server error)
      setResult({ status: 'failed', risk_explanation: err.detail || err.message || 'Transaction failed' });
      setStep('outcome');
      toast.error('Payment transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await transaction.confirm(result.transaction_id || result.id);
      setResult(prev => ({ ...prev, ...res.data, status: 'completed' }));
      setStep('outcome');
      toast.success('Payment completed successfully');
    } catch (err) {
      toast.error('Payment confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await transaction.cancel(result.transaction_id || result.id);
      toast.success('Payment cancelled');
      navigate('/wallet');
    } catch (err) {
      toast.error('Payment cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  // Shake variant for transaction failure
  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/wallet')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all text-sm font-semibold mb-6 tap-press"
        >
          <ArrowLeft size={16} /> Cancel Payment
        </button>

        <AnimatePresence mode="wait">
          {/* STEP 1: PAYMENT FORM */}
          {step === 'form' && (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              onSubmit={handleSend}
              className="bg-white rounded-card shadow-fintech border border-slate-100 p-8 space-y-6"
            >
              <div className="text-center pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Send Money via UPI</span>
                <div className="flex items-center justify-center text-4xl font-extrabold tracking-tight text-slate-900">
                  <span className="text-slate-400 mr-2">₹</span>
                  <input 
                    type="number"
                    value={form.amount}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (val > 100000) {
                        toast.error("Daily UPI transaction limit is ₹1,00,000");
                        update('amount', '100000');
                      } else {
                        update('amount', e.target.value);
                      }
                    }}
                    placeholder="0.00"
                    required
                    min="0.01"
                    max="100000"
                    step="0.01"
                    className="w-48 bg-none border-none text-slate-900 font-extrabold outline-none text-center placeholder-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payee UPI ID</label>
                <input 
                  className="input"
                  placeholder="e.g. name@upi"
                  value={form.payee_upi}
                  onChange={e => update('payee_upi', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payee Name</label>
                <input 
                  className="input"
                  placeholder="e.g. John Doe"
                  value={form.payee_name}
                  onChange={e => update('payee_name', e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center gap-2 bg-fintech-blue hover:bg-fintech-blueHover text-white py-3.5 rounded-full font-semibold transition-all shadow-md text-sm tap-press"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>Send ₹{form.amount || '0'} <Send size={15} /></>
                )}
              </button>
            </motion.form>
          )}

          {/* STEP 2: PAUSED RISK WARNING MODAL */}
          {step === 'paused_warning' && result && (
            <motion.div 
              key="paused"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-card shadow-fintech-lg border border-slate-100 p-8 text-center"
            >
              {/* Scale + slight pulse alert warning icon */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6"
              >
                <AlertTriangle size={32} className="text-fintech-amber" />
              </motion.div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Review Paused</h2>
              <p className="text-slate-500 text-xs mb-6">Our AI Model has flagged a potential risk during this transaction.</p>

              {/* Explainability Container */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Risk Rating</span>
                  <span className="text-lg font-extrabold text-fintech-amber">
                    {((result.risk_score || 0) * 100).toFixed(1)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Explainable Factors</span>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {result.risk_explanation || result.explanation || 'No reason provided by backend model.'}
                  </p>
                </div>

                {result.recommendation && (
                  <div className="pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Recommendation Guide</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed italic">
                      {result.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmation Toggles */}
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full py-3.5 text-sm font-semibold transition-all tap-press"
                >
                  Cancel Payment
                </button>
                {result.can_proceed !== false && (
                  <button 
                    type="button" 
                    onClick={handleConfirm}
                    className="flex-1 bg-fintech-blue hover:bg-fintech-blueHover text-white rounded-full py-3.5 text-sm font-semibold transition-all shadow-sm tap-press flex items-center justify-center gap-1.5"
                  >
                    Confirm Send <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: FINAL OUTCOME SCREEN (Success checkmark or failed shake) */}
          {step === 'outcome' && result && (
            <motion.div 
              key="outcome"
              variants={result.status === 'failed' || result.status === 'blocked' ? shakeVariants : {}}
              animate={result.status === 'failed' || result.status === 'blocked' ? 'shake' : {}}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-card shadow-fintech border border-slate-100 p-8 text-center"
            >
              {result.status === 'completed' ? (
                /* Satisfaction Checkmark animation */
                <motion.div 
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle size={32} className="text-fintech-emerald" />
                </motion.div>
              ) : (
                /* Failed block shake visual */
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
                  <XCircle size={32} className="text-fintech-red" />
                </div>
              )}

              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {result.status === 'completed' ? 'Transaction Complete' : 'Transaction Blocked'}
              </h2>

              <div className="text-3xl font-extrabold text-slate-900 tracking-tight my-6">
                ₹{parseFloat(form.amount || 0).toLocaleString()}
              </div>

              <p className="text-xs text-slate-400 font-semibold mb-8">
                To: {form.payee_name || 'UPI Address'} ({form.payee_upi})
              </p>

              {result.risk_explanation && result.status !== 'completed' && (
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 text-left text-xs text-red-600 mb-8 leading-relaxed">
                  <strong>Reason:</strong> {result.risk_explanation || result.explanation}
                </div>
              )}

              <button 
                type="button" 
                onClick={() => navigate('/wallet')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 text-sm font-semibold transition-all shadow-sm tap-press"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
