import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Fingerprint, 
  Building2, 
  QrCode, 
  Copy, 
  Check, 
  Plus, 
  ChevronRight,
  User,
  Smartphone,
  Lock
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const Profile = ({ isDark, setIsDark, onBack, userName = "Abhishek" }) => {
  const navigate = useNavigate();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  const upiAliases = [
    { id: 'alias-1', upiId: 'abhishek@raksha', isPrimary: true },
    { id: 'alias-2', upiId: '9876543210@upi', isPrimary: false },
    { id: 'alias-3', upiId: 'abhishek@sbi', isPrimary: false },
  ];

  const bankAccounts = [
    {
      id: 'bank-1',
      name: 'State Bank of India',
      accNumber: '•••• 4589',
      type: 'Savings Account',
      isPrimary: true,
    },
    {
      id: 'bank-2',
      name: 'HDFC Bank',
      accNumber: '•••• 8921',
      type: 'Savings Account',
      isPrimary: false,
    },
    {
      id: 'bank-3',
      name: 'ICICI Bank',
      accNumber: '•••• 3104',
      type: 'Salary Account',
      isPrimary: false,
    },
  ];

  const handleCopy = (alias) => {
    navigator.clipboard?.writeText(alias);
    setCopiedId(alias);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-sans transition-colors duration-300 select-none pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] border-b border-[var(--color-ash)] dark:border-[var(--color-steel)] backdrop-blur-md transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleBack}
              className="p-2 rounded-[var(--radius-full)] bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] hover:opacity-80 transition-all cursor-pointer"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]" />
            </motion.button>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
              My Profile
            </h1>
          </div>

          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* User Hero Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Circle Avatar */}
            <div className="w-20 h-20 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-black text-3xl flex items-center justify-center border-2 border-[var(--color-ash)] dark:border-[var(--color-steel)] shadow-md shrink-0">
              {userName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  {userName}
                </h2>
                <span className="p-1 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] font-medium mb-1">
                +91 98765 43210 • abhishek@domain.com
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-[11px] font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                <Lock className="w-3 h-3 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
                <span>On-Device Enclave Verified</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              className="px-4 py-2.5 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-xs font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] hover:opacity-80 transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Show My QR</span>
            </button>
          </div>
        </motion.div>

        {/* Bento Grid: Biometrics & Security */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Bento Card 1: Biometric Status & Coercion Shield Toggle */}
          <motion.div
            variants={itemVariants}
            className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <Fingerprint className="w-5 h-5 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  AI SHIELD
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-1">
                Biometric Coercion Guard
              </h3>
              <p className="text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] leading-relaxed mb-6">
                Evaluates physical tremor, situational pressure, and device state before authorizing payments.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-ash)]/50 dark:border-[var(--color-steel)]/50">
              <span className="text-xs font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                {biometricsEnabled ? 'Protection Active' : 'Protection Disabled'}
              </span>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                className="w-12 h-6 bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] rounded-[var(--radius-full)] p-1 relative transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                <motion.div
                  animate={{ x: biometricsEnabled ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-4 h-4 bg-[var(--color-off-black-ink)] dark:bg-white rounded-[var(--radius-full)]"
                />
              </button>
            </div>
          </motion.div>

          {/* Bento Card 2: UPI Aliases */}
          <motion.div
            variants={itemVariants}
            className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                  3 Active IDs
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-3">
                UPI Handles & Aliases
              </h3>

              <div className="space-y-2">
                {upiAliases.map((alias) => (
                  <div 
                    key={alias.id}
                    className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                        {alias.upiId}
                      </span>
                      {alias.isPrimary && (
                        <span className="px-2 py-0.5 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] text-[9px] font-extrabold">
                          Default
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(alias.upiId)}
                      className="text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] hover:text-[var(--color-off-black-ink)] dark:hover:text-[var(--color-cloud)] p-1 cursor-pointer"
                    >
                      {copiedId === alias.upiId ? (
                        <Check className="w-3.5 h-3.5 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Section: Linked Bank Accounts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
              Linked Bank Accounts
            </h3>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bank Account</span>
            </button>
          </div>

          <div className="space-y-3">
            {bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-5 flex items-center justify-between hover:border-[var(--color-off-black-ink)] dark:hover:border-[var(--color-iris-gleam)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] shrink-0">
                    <Building2 className="w-6 h-6 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                        {bank.name}
                      </h4>
                      {bank.isPrimary && (
                        <span className="px-2 py-0.5 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] text-[10px] font-bold">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] mt-0.5">
                      {bank.type} • {bank.accNumber}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]" />
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Profile;
