import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User, Smartphone, ArrowRight, Loader2, KeyRound, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, saveSession, transaction } from '../services/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const [roleMode, setRoleMode] = useState('user'); // 'user' | 'admin'
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (roleMode === 'admin') {
        const res = await auth.login({
          email: 'admin@sih2026.com',
          password: form.password || 'AdminSecurePass123!',
        });
        saveSession(res.data);
        toast.success('Admin workspace authorized');
        navigate('/admin');
      } else {
        if (isLogin) {
          const res = await auth.login({
            email: form.email,
            password: form.password,
          });
          saveSession(res.data);
          toast.success(`Welcome back, ${res.data.full_name}!`);
          navigate('/wallet');
        } else {
          const DerivedUpi = form.email.split('@')[0] + '@upi';
          await auth.register({
            email: form.email,
            password: form.password,
            full_name: form.full_name,
            phone: form.phone || undefined,
            upi_id: DerivedUpi,
          });
          toast.success('Registration complete! Please sign in.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      toast.error(err.detail || err.message || 'Authorization failed');
    } finally {
      setLoading(false);
    }
  };

  const triggerAdminDemo = async () => {
    setLoading(true);
    setRoleMode('admin');
    try {
      const res = await auth.login({
        email: 'admin@sih2026.com',
        password: 'AdminSecurePass123!',
      });
      saveSession(res.data);
      toast.success('Accessing Admin Workspace...');
      navigate('/admin');
    } catch (err) {
      console.warn("Admin login failed on backend. Falling back to local mock session:", err);
      saveSession({
        access_token: "mock_token_jwt_123",
        refresh_token: "mock_refresh_jwt_123",
        role: "admin",
        user_id: "mock_admin_123",
        full_name: "System Administrator"
      });
      toast.success('Accessing Local Sandbox Admin Workspace...');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const triggerUserDemo = async () => {
    setLoading(true);
    setRoleMode('user');
    const uniqueId = Date.now().toString().slice(-6);
    const demoEmail = `demo_${uniqueId}@sih2026.com`;
    const demoPass = 'UserSecurePass123!';
    const demoName = `Demo User #${uniqueId}`;
    const demoPhone = `+91${Date.now().toString().slice(-10)}`;
    const DerivedUpi = `demo_${uniqueId}@upi`;

    try {
      await auth.register({
        email: demoEmail,
        password: demoPass,
        full_name: demoName,
        phone: demoPhone,
        upi_id: DerivedUpi,
      });

      const res = await auth.login({
        email: demoEmail,
        password: demoPass,
      });
      saveSession(res.data);

      try {
        await transaction.initiate({
          payee_upi: 'retailer@upi',
          payee_name: 'Grocery Mart',
          amount: 1450.00
        });
        await transaction.initiate({
          payee_upi: 'powergrid@upi',
          payee_name: 'Electricity Board',
          amount: 3200.00
        });
      } catch (e) {
        // Fallback silently if seeding fails
      }

      toast.success(`Registered & Logged in as ${demoName}!`);
      navigate('/wallet');
    } catch (err) {
      console.warn("User registration failed on backend. Falling back to local mock session:", err);
      saveSession({
        access_token: "mock_token_jwt_123",
        refresh_token: "mock_refresh_jwt_123",
        role: "user",
        user_id: "mock_user_123",
        full_name: demoName
      });
      toast.success(`Accessing Local Sandbox as ${demoName}!`);
      navigate('/wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative subtle background gradient blur */}
      <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-card p-10 shadow-fintech z-10"
      >
        {/* Logo - Brand visual ONLY */}
        <div className="flex items-center gap-2 mb-8 justify-center cursor-pointer tap-press" onClick={() => navigate('/')}>
          <ShieldCheck size={26} className="text-fintech-blue" />
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Raksha<span className="text-fintech-blue">Pay</span>
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">Access Portal</h2>
        <p className="text-slate-500 text-xs text-center mb-6">Select your entry route to proceed to the workspace</p>

        {/* Quick Demo Access Shortcuts */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-fintech-blue uppercase tracking-wider mb-3">
            <Sparkles size={12} /> Quick Demo Sandbox Access
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={triggerUserDemo} 
              disabled={loading}
              className="flex-1 flex flex-col items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-3 text-xs font-semibold text-slate-700 transition-all tap-press hover:bg-slate-550"
            >
              <User size={14} className="text-fintech-blue" />
              Demo User Portal
            </button>
            <button 
              type="button" 
              onClick={triggerAdminDemo} 
              disabled={loading}
              className="flex-1 flex flex-col items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-3 text-xs font-semibold text-slate-700 transition-all tap-press hover:bg-slate-550"
            >
              <ShieldCheck size={14} className="text-fintech-blue" />
              Demo Bank Admin
            </button>
          </div>
        </div>

        {/* Role selector tab */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6 border border-slate-200/50">
          {['User Portal', 'Bank Admin'].map((role, idx) => {
            const isSelected = (idx === 0 ? roleMode === 'user' : roleMode === 'admin');
            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setRoleMode(idx === 0 ? 'user' : 'admin');
                  setForm({ email: '', password: '', full_name: '', phone: '' });
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* User Sign In / Register Tabs */}
        {roleMode === 'user' && (
          <div className="flex justify-center gap-6 mb-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`pb-2 border-b-2 transition-all ${
                isLogin 
                  ? 'text-fintech-blue border-fintech-blue' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`pb-2 border-b-2 transition-all ${
                !isLogin 
                  ? 'text-fintech-blue border-fintech-blue' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {roleMode === 'admin' ? (
            /* Admin Password Only */
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Security Key</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={16} />
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-fintech-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                  type="password"
                  placeholder="Enter admin password"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            /* User Register / Login Form */
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="reg-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={16} />
                        <input
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-fintech-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                          placeholder="Full Name"
                          value={form.full_name}
                          onChange={e => update('full_name', e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-3.5 text-slate-400" size={16} />
                        <input
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-fintech-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                          placeholder="Phone (e.g. +919876543210)"
                          value={form.phone}
                          onChange={e => update('phone', e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-fintech-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-fintech-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center gap-2 bg-fintech-blue hover:bg-fintech-blueHover text-white py-3.5 rounded-full font-semibold transition-all shadow-md text-sm mt-6 tap-press"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>Authorize Portal Access <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
