import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PhoneCall, Smartphone, UserPlus, Sparkles, AlertTriangle, Cpu } from 'lucide-react';

// Stagger animation
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.4 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
};

function getFactorIcon(factorName = '') {
  const name = factorName.toLowerCase();
  if (name.includes('call') || name.includes('phone') || name.includes('vishing')) return PhoneCall;
  if (name.includes('device') || name.includes('fingerprint') || name.includes('hardware')) return Smartphone;
  if (name.includes('payee') || name.includes('recipient') || name.includes('contact')) return UserPlus;
  if (name.includes('amount') || name.includes('large')) return AlertTriangle;
  return ShieldAlert;
}

export const InterventionModal = ({
  isOpen = true, 
  onCancel,
  onProceed,
  amount = '25,000',
  payee = 'Ramesh Kumar',
  upiId = 'ramesh@upi',
  explanation = '',
  recommendation = '',
  factors = [],
  riskScore = 75
}) => {
  // STRICT RULE: Only display factors explicitly returned from backend score evaluation.
  // Never fall back to mock default risk factors.
  const displayFactors = factors || [];
  const formattedScore = typeof riskScore === 'number' ? Number(riskScore.toFixed(1)) : riskScore;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '20%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '20%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 120 }}
          className="fixed inset-0 z-50 flex flex-col md:flex-row w-full h-dvh bg-(--color-off-white-canvas) dark:bg-(--color-obsidian) overflow-hidden transition-colors duration-300"
        >
          {/* LEFT PANEL: Urgent Alert & Prominent High-Tech Risk Score Gauge */}
          <div className="w-full md:w-5/12 bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) p-6 md:p-12 flex flex-col justify-center items-center relative overflow-hidden shrink-0 transition-colors duration-300">
            {/* Subtle pulse background effect */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-20 -top-20 w-64 h-64 bg-(--color-off-black-ink) dark:bg-black rounded-full blur-3xl pointer-events-none"
            />
            
            <div className="relative z-10 flex flex-col items-center text-center gap-6 w-full max-w-sm">
              
              {/* Prominent High-Tech Risk Score Gauge Box */}
              <motion.div 
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 140 }}
                className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-black/15 dark:bg-black/35 border border-black/10 dark:border-white/10 backdrop-blur-md w-full shadow-xl"
              >
                {/* Circular Progress Ring */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-black/15 dark:text-white/15"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-(--color-off-black-ink) dark:text-white"
                      strokeDasharray={`${Math.min(100, Math.max(0, Number(formattedScore)))}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black tracking-tight text-(--color-off-black-ink) dark:text-white leading-none">
                      {formattedScore}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-(--color-off-black-ink)/75 dark:text-white/75 mt-1">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-(--color-off-black-ink) dark:bg-white text-(--color-electric-lime) dark:text-(--color-obsidian) text-xs font-black uppercase tracking-wider shadow-sm">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{formattedScore >= 60 ? "CRITICAL RISK" : "MEDIUM RISK"}</span>
                </div>
              </motion.div>
              
              <div className="flex flex-col items-center">
                <motion.h2 
                  initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-4xl md:text-5xl font-extrabold text-(--color-off-black-ink) dark:text-white leading-tight tracking-tight"
                >
                  Payment<br/>Paused
                </motion.h2>
                <motion.p 
                  initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
                  className="mt-3 text-sm md:text-base text-(--color-off-black-ink) dark:text-white opacity-90 font-medium leading-relaxed"
                >
                  RakshaPay's ML model intercepted this transaction due to coercion signals.
                </motion.p>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: Analysis & Derived Model Explanation */}
          <div className="w-full md:w-7/12 flex flex-col h-full bg-(--color-off-white-canvas) dark:bg-(--color-obsidian) relative transition-colors duration-300">
            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:px-16 lg:py-12 space-y-6">
              
              {/* Payment Context Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="p-5 bg-(--color-pure-white) dark:bg-(--color-graphite-dark) border border-(--color-ash) dark:border-(--color-steel) rounded-2xl shadow-sm"
              >
                <p className="text-(length:--text-body) text-(--color-off-black-ink) dark:text-(--color-cloud) leading-relaxed">
                  You are attempting to send <span className="font-bold text-xl">₹{amount}</span> to <br className="hidden md:block"/>
                  <span className="font-bold">{payee}</span> <span className="text-(--color-graphite) dark:text-(--color-ash-dark) text-sm">({upiId})</span>.
                </p>
              </motion.div>

              {/* Model Derived Explanation Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
                className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>AI MODEL DEDUCTION & REASONING</span>
                </div>
                <p className="text-sm font-medium text-amber-950 dark:text-amber-200 leading-relaxed">
                  {explanation || "Payment paused: Risk signals triggered review criteria."}
                </p>
                {recommendation && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    💡 Recommendation: {recommendation}
                  </div>
                )}
              </motion.div>

              {/* Dynamic Risk Factors List */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-widest text-(--color-graphite) dark:text-(--color-ash-dark) mb-3">
                  PRIMARY RISK INDICATORS ({displayFactors.length})
                </h3>

                {displayFactors.length === 0 ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400">
                    No specific situational risk flags selected.
                  </div>
                ) : (
                  <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show" 
                    className="space-y-3"
                  >
                    {displayFactors.map((factor, idx) => {
                      let factorTitle = factor.factor || factor.title || "Risk Indicator";
                      // Clean up phrasing: replace "fingerprint" wording if present
                      if (factorTitle.toLowerCase().includes("fingerprint")) {
                        factorTitle = "New / Unrecognized Device";
                      }
                      const factorDetail = factor.detail || factor.description || "Unusual activity detected";
                      const Icon = getFactorIcon(factorTitle);

                      return (
                        <motion.div
                          variants={itemVariants}
                          key={idx}
                          className="bg-(--color-pure-white) dark:bg-(--color-graphite-dark) border border-(--color-ash) dark:border-(--color-steel) rounded-xl p-4 flex items-start justify-between gap-4 shadow-sm"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="p-2.5 bg-(--color-off-white-canvas) dark:bg-(--color-abyss) rounded-lg shrink-0 text-(--color-off-black-ink) dark:text-(--color-cloud)">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-(--color-off-black-ink) dark:text-(--color-cloud)">
                                {factorTitle}
                              </h4>
                              <p className="text-xs text-(--color-graphite) dark:text-(--color-ash-dark) mt-0.5 leading-relaxed">
                                {factorDetail}
                              </p>
                            </div>
                          </div>

                          {factor.contribution && (
                            <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                              +{factor.contribution}%
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>

            </div>

            {/* Sticky Action Buttons at Bottom */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
              className="p-6 md:px-12 lg:px-16 bg-linear-to-t from-(--color-off-white-canvas) dark:from-(--color-obsidian) via-(--color-off-white-canvas) dark:via-(--color-obsidian) to-transparent shrink-0"
            >
              <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-3.5 px-6 rounded-(--radius-full) bg-(--color-off-black-ink) dark:bg-white text-(--color-electric-lime) dark:text-(--color-obsidian) font-bold text-sm hover:scale-[1.01] transition-transform active:scale-[0.99] shadow-md cursor-pointer"
                >
                  Cancel Payment (Recommended)
                </button>
                <button
                  type="button"
                  onClick={onProceed}
                  className="w-full py-3 px-6 rounded-(--radius-full) bg-transparent border border-(--color-ash) dark:border-(--color-steel) text-(--color-graphite) dark:text-(--color-ash-dark) hover:border-(--color-off-black-ink) dark:hover:border-white hover:text-(--color-off-black-ink) dark:hover:text-white font-bold text-xs transition-colors active:scale-[0.99] cursor-pointer"
                >
                  I understand the risks, send anyway
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InterventionModal;