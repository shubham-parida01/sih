import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, Lock, Mail, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import { auth, saveSession } from '../services/api';

export const AuthScreen = ({ onLogin, isDark: externalIsDark, setIsDark: externalSetIsDark }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [internalIsDark, setInternalIsDark] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = externalIsDark !== undefined ? externalIsDark : internalIsDark;
  const toggleTheme = (newValue) => {
    const nextVal = typeof newValue === 'boolean' ? newValue : !isDark;
    if (externalSetIsDark) {
      externalSetIsDark(nextVal);
    } else {
      setInternalIsDark(nextVal);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in email and password");
      return;
    }
    setLoading(true);

    try {
      if (isLogin) {
        const res = await auth.login({ email, password });
        saveSession(res.data);
        toast.success(`Welcome back, ${res.data.full_name || 'User'}!`);
        if (onLogin) onLogin();
      } else {
        if (!fullName) {
          toast.error("Please enter your full name");
          setLoading(false);
          return;
        }
        await auth.register({
          email,
          password,
          full_name: fullName,
          phone: phone || undefined,
          upi_id: upiId || `${email.split('@')[0]}@upi`,
        });

        // Automatically log in
        const res = await auth.login({ email, password });
        saveSession(res.data);
        toast.success("Account created successfully!");
        if (onLogin) onLogin();
      }
    } catch (err) {
      toast.error(err.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-(--color-pure-white) dark:bg-(--color-obsidian) font-sans select-none transition-colors duration-300 relative overflow-hidden">
      {/* Left Panel (Editorial Accent) */}
      <div className="w-full md:w-2/5 bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-400 dark:from-lime-400 dark:via-emerald-500 dark:to-teal-600 p-8 md:p-14 flex flex-col justify-between shrink-0 min-h-80 md:min-h-screen transition-colors duration-300 relative overflow-hidden">
        {/* Glow Orb Effect */}
        <div className="absolute top-[-20%] left-[-20%] w-[350px] h-[350px] bg-white/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Left: Brand Name */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-black/10 dark:bg-black/20 border border-black/10 backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-black dark:text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-black dark:text-white">
            RakshaPay
          </h1>
        </div>

        {/* Bottom Left: Tagline & Heading */}
        <div className="mt-12 md:mt-0 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 dark:bg-black/20 text-black dark:text-white text-[11px] font-extrabold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PAYMENT ELEVATED</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-black dark:text-white leading-[1.05] tracking-tight max-w-sm">
            Make your payment safe
          </h2>
        </div>
      </div>

      {/* Right Panel (Workspace) */}
      <div className="w-full md:w-3/5 bg-(--color-pure-white) dark:bg-(--color-obsidian) relative flex items-center justify-center p-6 sm:p-10 md:p-12 min-h-screen transition-colors duration-300">
        {/* Ambient Glow Background */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-lime-400/10 dark:bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Theme Toggle (Top Right) */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20">
          <ThemeToggle isDark={isDark} setIsDark={toggleTheme} />
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md glass-panel dark:bg-gray-900/80 rounded-3xl p-8 sm:p-10 md:p-12 shadow-2xl border border-gray-200 dark:border-gray-800 my-auto transition-colors duration-300 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full"
            >
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {isLogin ? 'Welcome back' : 'Create Account'}
                </h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                  {isLogin ? 'Sign in to access your secure portal' : 'Sign up for a secure user account'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label 
                      htmlFor="fullName" 
                      className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider"
                    >
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rohit Kumar"
                        className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider"
                  >
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <Eye className="w-4 h-4 shrink-0" />
                      ) : (
                        <EyeOff className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-(--color-electric-lime) hover:bg-lime-400 text-black font-extrabold text-sm py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(190,255,80,0.4)] active:scale-[0.99] transition-all cursor-pointer shadow-md mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Create Account'}
                </button>
              </form>

              {/* Footer Toggle */}
              <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-extrabold text-gray-900 dark:text-white hover:text-lime-600 dark:hover:text-lime-400 cursor-pointer transition-colors ml-1"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;