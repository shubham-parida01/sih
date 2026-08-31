import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Eye, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ShieldAlert,
  ExternalLink,
  Activity,
  Layers,
  Check
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const LandingPage = ({ isDark, setIsDark, onSignIn }) => {
  const navigate = useNavigate();

  const adminUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5174'
    : 'https://sih-jade-two.vercel.app';

  useEffect(() => {
    // Pre-warm Render free tier backend and ML service instances on landing page visit
    const wakeUpUrls = [
      'https://sih-ml-service-ibak.onrender.com/health',
      'https://sih-ml-service-ibak.onrender.com/docs',
      'https://sih-irpg.onrender.com/',
      'https://sih-irpg.onrender.com/docs',
    ];
    wakeUpUrls.forEach((url) => {
      fetch(url, { mode: 'no-cors' }).catch(() => {});
    });
  }, []);

  const handleSignInClick = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      navigate('/auth');
    }
  };

  const handleGetStartedClick = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      navigate('/auth');
    }
  };

  // Container motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-(--color-pure-white) dark:bg-(--color-obsidian) text-(--color-off-black-ink) dark:text-(--color-cloud) transition-colors duration-300 flex flex-col font-sans select-none relative overflow-hidden">
      {/* Background Glow Lighting Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-lime-400/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none dark:from-lime-400/10 dark:via-emerald-500/5 animate-ambient-glow" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <header className="w-full border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#0b0c0e]/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo Left */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2.5 rounded-2xl bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) border border-black/10 dark:border-white/10 shadow-[0_0_20px_rgba(190,255,80,0.3)] transition-transform group-hover:scale-105">
              <ShieldCheck className="w-6 h-6 text-(--color-off-black-ink)" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-(--color-off-black-ink) dark:text-white leading-none">
                RakshaPay
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-lime-700 dark:text-lime-400 mt-0.5">
                AI Fraud Shield
              </span>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-4">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            <a 
              href={adminUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-lime-600 dark:hover:text-lime-400 transition-colors px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
            >
              Control Room <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={handleSignInClick}
              className="bg-(--color-electric-lime) hover:bg-lime-400 text-black font-bold px-6 py-2.5 rounded-full border border-black/10 shadow-[0_0_15px_rgba(190,255,80,0.25)] hover:shadow-[0_0_25px_rgba(190,255,80,0.4)] active:scale-95 transition-all cursor-pointer text-sm flex items-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col justify-between relative z-10">
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="pt-16 pb-12 sm:pt-24 sm:pb-20 text-center flex flex-col items-center justify-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 dark:bg-lime-400/10 border border-lime-500/20 dark:border-lime-400/20 text-lime-800 dark:text-lime-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4 text-lime-600 dark:text-lime-400 animate-pulse" />
              <span>Next-Gen UPI Coercion Protection</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-(--color-off-black-ink) dark:text-white leading-[1.05] mb-6"
          >
            Make your payment <br className="hidden sm:block"/>
            <span className="bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-500 dark:from-lime-400 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              bulletproof safe.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10 leading-relaxed font-medium"
          >
            An explainable real-time ONNX neural fraud shield for UPI that detects coercion and coercion vectors before the money moves.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg">
            <button
              type="button"
              onClick={handleGetStartedClick}
              className="bg-(--color-electric-lime) hover:bg-lime-400 text-black font-extrabold text-lg px-9 py-4 rounded-full border border-black/10 shadow-[0_0_30px_rgba(190,255,80,0.35)] hover:shadow-[0_0_40px_rgba(190,255,80,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Launch Safe UPI Portal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href={adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white font-bold text-lg px-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm backdrop-blur-md"
            >
              <span>Admin Control Room</span>
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </a>
          </motion.div>

          {/* Live High-Tech Stats Bar */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl glass-panel border border-black/5 dark:border-white/10 shadow-lg"
          >
            <div className="flex flex-col items-center justify-center p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                <Zap size={14} className="text-lime-500" /> Latency
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white">&lt;15 ms</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-l border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                <Activity size={14} className="text-emerald-500" /> Model
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white">ONNX AI</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-l border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                <Layers size={14} className="text-cyan-500" /> Features
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white">27 Vector</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-l border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                <Lock size={14} className="text-indigo-500" /> Privacy
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white">100% Local</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Features Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-lime-600 dark:text-lime-400 mb-2">
              WHY RAKSHAPAY
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Architected for absolute security & explainability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="glass-panel border border-gray-200/80 dark:border-gray-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-lime-500/10 dark:bg-lime-400/10 border border-lime-500/20 dark:border-lime-400/20 flex items-center justify-center mb-6 text-lime-700 dark:text-lime-400 group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                  On-Device Scoring
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  Fast, local neural evaluation that checks situational pressure and biometric signals in under 15ms.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold">
                <span className="flex items-center gap-1.5 text-lime-600 dark:text-lime-400">
                  <Zap className="w-4 h-4 fill-current" />
                  &lt;15ms Latency
                </span>
                <span>Zero Latency Delay</span>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="glass-panel border border-gray-200/80 dark:border-gray-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                  Explainable AI
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  Plain language warnings, not just black-box blocks. Know exactly why a payment step was flagged before proceeding.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <ShieldAlert className="w-4 h-4" />
                  Clear Rationale
                </span>
                <span>Human Understandable</span>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="glass-panel border border-gray-200/80 dark:border-gray-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                  Privacy First
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  Your telemetry never leaves the phone. Sensitive sensor state is computed in an encrypted local enclave.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold">
                <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" />
                  100% Local Enclave
                </span>
                <span>Zero Cloud Leak</span>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-8 bg-white/50 dark:bg-[#0b0c0e]/50 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-lime-500/20 text-lime-700 dark:text-lime-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              RakshaPay AI Shield Protocol
            </span>
          </div>
          <p className="font-medium">© {new Date().getFullYear()} RakshaPay Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
