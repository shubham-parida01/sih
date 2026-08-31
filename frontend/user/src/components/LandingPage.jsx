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
  ExternalLink
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
    <div className="min-h-screen bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] transition-colors duration-300 flex flex-col font-sans select-none animate-fade-in">
      {/* Navbar */}
      <header className="w-full border-b border-[var(--color-ash)] dark:border-[var(--color-steel)] bg-[var(--color-pure-white)]/90 dark:bg-[var(--color-obsidian)]/90 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo Left */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] transition-transform group-hover:scale-105">
              <ShieldCheck className="w-6 h-6 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
              RakshaPay
            </span>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-4">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            <a 
              href={adminUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] hover:text-[var(--color-electric-lime)] dark:hover:text-[var(--color-iris-gleam)] transition-colors"
            >
              Control Room <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={handleSignInClick}
              className="bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-bold px-5 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm text-sm flex items-center gap-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col justify-between">
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="pt-16 pb-12 sm:pt-24 sm:pb-20 text-center flex flex-col items-center justify-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-full)] bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] text-xs font-semibold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-off-black-ink)] dark:text-[var(--color-iris-gleam)]" />
              <span>Next-Gen Coercion Protection</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] leading-[1.08] mb-6"
          >
            Make your payment safe.
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] max-w-2xl mb-10 leading-relaxed font-normal"
          >
            An explainable real-time fraud shield for UPI that stops coercion before the money moves.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg">
            <button
              type="button"
              onClick={handleGetStartedClick}
              className="bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-bold text-lg px-8 py-4 rounded-[var(--radius-full)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Launch Safe UPI Portal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href={adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] bg-transparent text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-bold text-lg px-8 hover:bg-[var(--color-off-white-canvas)] dark:hover:bg-[var(--color-graphite-dark)] transition-all shadow-sm"
            >
              <span>Admin Control Room</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </motion.div>
        </motion.section>

        {/* Features Grid (Bento Box) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-xs uppercase font-bold tracking-widest text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] mb-2">
              WHY RAKSHAPAY
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] tracking-tight">
              Architected for absolute safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-8 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div>
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center mb-6 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-2 tracking-tight">
                  On-Device Scoring
                </h3>
                <p className="text-sm text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] leading-relaxed">
                  Fast, local ML evaluation that checks situational pressure and biometric signals in under 15ms.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[var(--color-ash)]/50 dark:border-[var(--color-steel)]/50 flex items-center justify-between text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                <span className="flex items-center gap-1 font-semibold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <Zap className="w-3.5 h-3.5 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
                  &lt;15ms Latency
                </span>
                <span>Zero Latency Delay</span>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-8 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div>
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center mb-6 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-2 tracking-tight">
                  Explainable AI
                </h3>
                <p className="text-sm text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] leading-relaxed">
                  Plain language warnings, not just blocks. Know exactly why a payment step was flagged before proceeding.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[var(--color-ash)]/50 dark:border-[var(--color-steel)]/50 flex items-center justify-between text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                <span className="flex items-center gap-1 font-semibold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <ShieldAlert className="w-3.5 h-3.5 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
                  Clear Rationale
                </span>
                <span>Human Understandable</span>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-8 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div>
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center mb-6 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-2 tracking-tight">
                  Privacy First
                </h3>
                <p className="text-sm text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] leading-relaxed">
                  Your telemetry never leaves the phone. Sensitive sensor state is computed in an encrypted local enclave.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[var(--color-ash)]/50 dark:border-[var(--color-steel)]/50 flex items-center justify-between text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                <span className="flex items-center gap-1 font-semibold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
                  100% Local Enclave
                </span>
                <span>Zero Cloud Leak</span>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-[var(--color-ash)] dark:border-[var(--color-steel)] py-6 bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
            <span className="font-semibold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
              RakshaPay AI Shield Protocol
            </span>
          </div>
          <p>© {new Date().getFullYear()} RakshaPay Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
