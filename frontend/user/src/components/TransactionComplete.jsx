import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight, Home, Share2, Download } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const TransactionComplete = ({ 
  isDark, 
  setIsDark, 
  onReturnHome,
  amount = "25,000",
  payee = "Ramesh Kumar",
  upiId = "ramesh@upi",
  txnId = "TXN-894201948210"
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract navigation state if passed via react-router-dom
  const stateAmount = location.state?.amount || amount;
  const statePayee = location.state?.payee || payee;
  const stateUpiId = location.state?.upiId || upiId;
  const stateTxnId = location.state?.txnId || txnId;

  const handleReturn = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-sans transition-colors duration-300 select-none flex flex-col justify-between p-6 sm:p-12">
      {/* Top Header */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
          <span className="font-extrabold text-sm tracking-tight text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
            RakshaPay
          </span>
        </div>
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
      </header>

      {/* Main Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-8 sm:p-10 shadow-xl flex flex-col items-center"
        >
          {/* Animated Shield Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
            className="w-24 h-24 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] flex items-center justify-center mb-6 shadow-lg border border-[var(--color-ash)] dark:border-[var(--color-steel)]"
          >
            <ShieldCheck className="w-14 h-14" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="w-full"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] text-xs font-bold border border-[var(--color-ash)] dark:border-[var(--color-steel)] mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
              <span>Safe Transaction Completed</span>
            </span>

            <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] tracking-tight mb-2">
              ₹ {stateAmount}
            </h1>
            <p className="text-sm text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] font-medium mb-8">
              Paid to <span className="font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">{statePayee}</span> ({stateUpiId})
            </p>

            {/* Receipt Box */}
            <div className="w-full bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] rounded-[var(--radius-3xl)] p-5 border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-left space-y-3 mb-8 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-ash)]/40 dark:border-[var(--color-steel)]/40">
                <span className="text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] font-semibold">Transaction ID</span>
                <span className="font-mono font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">{stateTxnId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-ash)]/40 dark:border-[var(--color-steel)]/40">
                <span className="text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] font-semibold">Security Check</span>
                <span className="font-bold text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]">Verified (0 Risk Flags)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] font-semibold">Time</span>
                <span className="font-medium text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Return CTA */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleReturn}
              className="w-full py-4 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-extrabold text-base shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span>Return to Dashboard</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
        <p>Protected by RakshaPay Real-Time Coercion Engine</p>
      </footer>
    </div>
  );
};

export default TransactionComplete;
