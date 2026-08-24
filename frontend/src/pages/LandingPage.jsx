import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Zap, Eye, Cpu, Landmark, Activity, Check, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState('idle'); // idle -> scanning -> result
  const [demoProgress, setDemoProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (demoState === 'scanning') {
      interval = setInterval(() => {
        setDemoProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setDemoState('result');
            return 100;
          }
          return p + 5;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [demoState]);

  const triggerDemo = () => {
    setDemoProgress(0);
    setDemoState('scanning');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      {/* Premium Dot-Mesh Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0" 
        style={{
          backgroundImage: 'radial-gradient(#1A73E8 1.2px, transparent 0)',
          backgroundSize: '28px 28px'
        }}
      />
      {/* Soft floating radial gradient lights */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-50/40 blur-[100px] pointer-events-none -z-10" />

      {/* Top Corporate Navbar Header */}
      <header className="relative z-10 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center max-w-6xl w-full mx-auto rounded-b-xl md:rounded-none">
        <div className="flex items-center gap-2 cursor-pointer tap-press" onClick={() => navigate('/')}>
          <ShieldCheck size={26} className="text-fintech-blue" />
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Raksha<span className="text-fintech-blue">Pay</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/auth')} 
            className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-all tap-press"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth')} 
            className="bg-fintech-blue hover:bg-fintech-blueHover text-white text-sm font-semibold rounded-full px-5 py-2.5 shadow-sm transition-all tap-press flex items-center gap-2"
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Centered Hero Section (Pinterest Reference Style) */}
      <main className="relative z-10 flex-grow max-w-4xl w-full mx-auto px-6 pt-16 pb-24 text-center flex flex-col items-center">
        {/* Upper Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-xs font-bold text-fintech-blue bg-blue-50 border border-blue-100/50 rounded-full px-4.5 py-1.5 mb-8"
        >
          <Landmark size={13} /> Enterprise Payment Integrity Platform
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6 max-w-2xl"
        >
          Every payment, <br />
          <span className="text-fintech-blue">checked before it sends.</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-base sm:text-lg max-w-xl mb-10 leading-relaxed"
        >
          RakshaPay mitigates transaction risk, voice phishing, and coercion transfers locally in real-time, delivering explanation audits directly to bank clearing networks.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4 mb-16"
        >
          <button 
            onClick={() => navigate('/auth')} 
            className="bg-fintech-blue hover:bg-fintech-blueHover text-white font-semibold rounded-full px-8 py-4 shadow-md hover:shadow-lg transition-all tap-press flex items-center gap-2 text-sm"
          >
            Access User Portal <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => navigate('/auth')} 
            className="bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-full px-8 py-4 shadow-sm transition-all tap-press text-sm"
          >
            Bank Admin Console
          </button>
        </motion.div>

        {/* Floating Device Showcase Grid (Pinterest Style) */}
        <div className="relative w-full max-w-3xl mt-6 flex justify-center">
          {/* Main Floating Simulator Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="w-full bg-white rounded-card shadow-fintech-lg border border-slate-100 p-8 text-left z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Simulator Platform</span>
              <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Target Account</span>
                <span className="text-xs font-semibold text-slate-800">scammer@upi</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Transfer Amount</span>
                <span className="text-xs font-bold text-slate-800">₹15,000.00</span>
              </div>
            </div>

            <div className="min-h-[72px] flex flex-col justify-center">
              {demoState === 'idle' && (
                <button 
                  onClick={triggerDemo}
                  className="bg-fintech-blue hover:bg-fintech-blueHover text-white text-xs font-bold py-3.5 px-6 rounded-full shadow transition-all tap-press w-full sm:w-auto self-start"
                >
                  Analyze Risk Vector
                </button>
              )}

              {demoState === 'scanning' && (
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-2">
                    <span>Scrutinizing risk vectors...</span>
                    <span>{demoProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-fintech-blue transition-all duration-100" 
                      style={{ width: `${demoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {demoState === 'result' && (
                <div className="flex items-start gap-3 bg-red-50/50 border border-red-100 rounded-xl p-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-ping" />
                  <div className="flex-grow">
                    <div className="flex justify-between text-xs font-extrabold text-red-600 mb-1">
                      <span>CRITICAL RISK INTERCEPTED</span>
                      <span>94% Accuracy</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Behavioral stress vectors and active call mismatches flagged. Settlement transaction blocked.
                    </p>
                    <button 
                      onClick={() => setDemoState('idle')}
                      className="text-[10px] font-bold text-fintech-blue mt-2 block hover:underline"
                    >
                      Reset Simulator
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Left Floating Badge (Accurate Interception) */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[-40px] top-[15%] hidden md:flex items-center gap-3 bg-white border border-slate-100 shadow-fintech rounded-full py-3 px-4 z-20"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Mitigation Rate</span>
              <span className="text-xs font-bold text-slate-800">99.9% Intercepted</span>
            </div>
          </motion.div>

          {/* Right Floating Badge (Latency) */}
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[-40px] bottom-[25%] hidden md:flex items-center gap-3 bg-white border border-slate-100 shadow-fintech rounded-full py-3 px-4 z-20"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Zap size={15} className="text-fintech-blue" />
            </div>
            <div className="text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Decision Latency</span>
              <span className="text-xs font-bold text-slate-800">&lt; 5.0ms Edge Processing</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Corporate Features Section - Asymmetric grid */}
      <section className="bg-white border-t border-slate-100 py-24 px-6 relative z-10">
        <div className="max-w-5xl w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Pre-transaction compliance checks at massive scale.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              We provide banks and retail networks with transparent neural modeling that evaluates transaction risk metrics without affecting checkout flows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'Decoupled Edge Neurals', desc: 'Validates on-device biometric and stress sequences locally under 5ms.' },
              { icon: ShieldCheck, title: 'Transparent Explanation Logs', desc: 'Translates model outputs into direct, actionable explanations for compliance teams.' },
              { icon: Eye, title: 'Network-Level Auditing', desc: 'Bridges retail client sessions with real-time websocket triaging systems.' }
            ].map((feat, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-card p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                  <feat.icon size={18} className="text-fintech-blue" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate footer */}
      <footer className="relative z-10 bg-slate-50 border-t border-slate-100 py-10 px-6 text-center text-xs font-semibold text-slate-400">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 RakshaPay Technologies, Inc. All rights reserved. Enterprise-grade pre-transaction threat mitigation.</span>
          <div className="flex gap-6">
            <span className="hover:text-slate-600 cursor-pointer">Security Suite</span>
            <span className="hover:text-slate-600 cursor-pointer">Network Integrity</span>
            <span className="hover:text-slate-600 cursor-pointer">Clearing Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
