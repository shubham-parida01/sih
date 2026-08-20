import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  XCircle, 
  ShieldAlert, 
  RotateCcw, 
  Home, 
  Terminal, 
  LifeBuoy, 
  AlertTriangle 
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const TransactionFailed = ({ 
  isDark, 
  setIsDark, 
  onRetry,
  onReturnHome,
  reason = "Coercion Risk Threshold Exceeded",
  errorCode = "ERR_COERCION_SHIELD_INTERVENTION",
  amount = "25,000",
  payee = "ramesh@upi"
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const stateReason = location.state?.reason || reason;
  const stateErrorCode = location.state?.errorCode || errorCode;
  const stateAmount = location.state?.amount || amount;
  const statePayee = location.state?.payee || payee;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate('/app');
    }
  };

  const handleHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-obsidian)] text-[var(--color-cloud)] font-mono transition-colors duration-300 select-none flex flex-col justify-between p-6 sm:p-12">
      {/* Terminal Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between border-b border-[var(--color-steel)] pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[var(--color-alert-red)]" />
          <span className="font-bold text-sm tracking-wider text-[var(--color-cloud)]">
            RAKSHAPAY_SHIELD // SYSTEM_HALT
          </span>
        </div>
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
      </header>

      {/* Main Terminal Card */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[var(--color-abyss)] border border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-6 sm:p-10 shadow-2xl space-y-6"
        >
          {/* Header Banner */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-alert-red)]/20 border border-[var(--color-alert-red)] flex items-center justify-center text-[var(--color-alert-red)] shrink-0">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[var(--radius-full)] bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)] text-[10px] font-extrabold tracking-widest uppercase mb-1">
                <AlertTriangle className="w-3 h-3" />
                TRANSACTION BLOCKED
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-cloud)] tracking-tight">
                {stateReason}
              </h1>
            </div>
          </div>

          {/* Details Summary */}
          <div className="space-y-2 text-xs text-[var(--color-ash-dark)] border-t border-b border-[var(--color-steel)]/60 py-4">
            <div className="flex justify-between">
              <span>INTENDED AMOUNT:</span>
              <span className="font-bold text-[var(--color-cloud)]">₹ {stateAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>PAYEE TARGET:</span>
              <span className="font-bold text-[var(--color-cloud)]">{statePayee}</span>
            </div>
            <div className="flex justify-between">
              <span>ERROR CODE:</span>
              <span className="font-mono text-[var(--color-alert-red)]">{stateErrorCode}</span>
            </div>
          </div>

          {/* Technical Diagnostics Box */}
          <div className="bg-[var(--color-obsidian)] border border-[var(--color-steel)] rounded-[var(--radius-lg)] p-4 text-xs font-mono space-y-1.5">
            <div className="text-[var(--color-ash-dark)] font-bold mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[var(--color-alert-red)]" />
              <span>DIAGNOSTIC LOG (ENCLAVE INFERENCE):</span>
            </div>
            <p className="text-[var(--color-alert-red)]">[CRITICAL] Active phone call during high-value transfer.</p>
            <p className="text-[var(--color-ash-dark)]">[WARNING] Device motion indicates forced user posture.</p>
            <p className="text-[var(--color-iris-gleam)]">[STATUS] Money transfer paused to protect user funds.</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleRetry}
              className="w-full sm:w-1/2 py-3.5 rounded-[var(--radius-full)] bg-[var(--color-iris-gleam)] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Payment</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleHome}
              className="w-full sm:w-1/2 py-3.5 rounded-[var(--radius-full)] bg-[var(--color-graphite-dark)] border border-[var(--color-steel)] text-[var(--color-cloud)] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[var(--color-steel)] transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full text-center text-[10px] text-[var(--color-ash-dark)]">
        <span>RakshaPay Security Audit Log • Enclave Session ID #84920</span>
      </footer>
    </div>
  );
};

export default TransactionFailed;
