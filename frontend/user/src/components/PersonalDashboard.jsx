import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Bell, 
  Send, 
  QrCode, 
  Wallet, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const PersonalDashboard = ({ isDark, setIsDark, onNavigatePay, userName = "Abhishek" }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleActionClick = (action) => {
    if (action === 'Pay Someone') {
      if (onNavigatePay) {
        onNavigatePay();
      } else {
        navigate('/app');
      }
    } else if (action === 'Check Balance') {
      navigate('/balance');
    }
  };

  // Recent Mock Transactions Data
  const recentTransactions = [
    {
      id: 'tx-1',
      title: 'Paid Ramesh',
      subtitle: 'ramesh@upi • UPI Transfer',
      amount: '- ₹25,000',
      type: 'debit',
      date: 'Today, 2:45 PM',
      status: 'Protected',
    },
    {
      id: 'tx-2',
      title: 'Received from Swiggy',
      subtitle: 'Order Refund • Instant',
      amount: '+ ₹450',
      type: 'credit',
      date: 'Yesterday, 8:12 PM',
      status: 'Completed',
    },
    {
      id: 'tx-3',
      title: 'Paid Uber',
      subtitle: 'uber.ride@icici • Transport',
      amount: '- ₹320',
      type: 'debit',
      date: 'Aug 18, 2026',
      status: 'Protected',
    },
    {
      id: 'tx-4',
      title: 'Received from Rahul',
      subtitle: 'rahul.k@okaxis • Dinner Split',
      amount: '+ ₹1,200',
      type: 'credit',
      date: 'Aug 17, 2026',
      status: 'Completed',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-sans transition-colors duration-300 select-none pb-12">
      {/* Top Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {/* Top Header */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-ash)] dark:border-[var(--color-steel)]">
          {/* Left Header: Avatar & Greeting */}
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-extrabold text-lg flex items-center justify-center border border-[var(--color-ash)] dark:border-[var(--color-steel)] shadow-sm shrink-0"
            >
              {userName.charAt(0)}
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] group-hover:underline">
                Hello, {userName}
              </h1>
              <p className="text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] font-medium">
                RakshaPay Secure Wallet
              </p>
            </div>
          </div>

          {/* Right Header: Theme Toggle & Notification Bell */}
          <div className="flex items-center gap-3 relative">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                className="w-10 h-10 rounded-[var(--radius-full)] bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] hover:opacity-80 transition-all flex items-center justify-center cursor-pointer relative"
              >
                <Bell className="w-5 h-5 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-[var(--radius-full)] bg-[var(--color-off-black-ink)] dark:bg-[var(--color-iris-gleam)]" />
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-4 shadow-xl z-50"
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-ash)]/50 dark:border-[var(--color-steel)]/50">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                        Security Alerts
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowNotifications(false)}
                        className="text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] hover:text-[var(--color-off-black-ink)] dark:hover:text-[var(--color-cloud)] p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] rounded-[var(--radius-lg)] border border-[var(--color-ash)] dark:border-[var(--color-steel)]">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)]" />
                          <span className="text-xs font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                            Shield Operational
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                          All local sensors verified. Zero threats detected in your area.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* RakshaPay Shield Status Banner (Unique Element) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] rounded-[var(--radius-3xl)] p-6 border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] shadow-md mb-8 transition-colors duration-300 relative overflow-hidden"
        >
          {/* Banner Layout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              {/* Pulse Shield Icon */}
              <div className="w-14 h-14 rounded-[var(--radius-3xl)] bg-[var(--color-off-black-ink)] dark:bg-[var(--color-obsidian)] text-[var(--color-electric-lime)] dark:text-[var(--color-iris-gleam)] flex items-center justify-center shrink-0 border border-[var(--color-ash)] dark:border-[var(--color-steel)] shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-[var(--radius-full)] bg-[var(--color-off-black-ink)] dark:bg-[var(--color-cloud)] animate-pulse" />
                  <span className="text-xs uppercase font-extrabold tracking-widest opacity-90">
                    PROTECTION ONLINE
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight leading-tight">
                  Shield Active: Scanning for environmental risks.
                </h2>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <span className="px-4 py-2 rounded-[var(--radius-full)] bg-[var(--color-off-black-ink)]/10 dark:bg-white/10 backdrop-blur-sm border border-[var(--color-off-black-ink)]/20 dark:border-white/20 text-xs font-bold inline-block">
                On-Device ML Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Central Hub Actions (Paytm-Style Grid) */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
              Quick Payment Services
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. Pay Someone */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleActionClick('Pay Someone')}
              className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm group hover:border-[var(--color-off-black-ink)] dark:hover:border-[var(--color-iris-gleam)]"
            >
              <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center mb-3 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] group-hover:bg-[var(--color-electric-lime)] dark:group-hover:bg-[var(--color-iris-gleam)] group-hover:text-[var(--color-off-black-ink)] dark:group-hover:text-[var(--color-cloud)] transition-colors">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-0.5">
                Pay Someone
              </span>
              <span className="text-[11px] text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                UPI ID or Phone
              </span>
            </motion.div>

            {/* 2. Scan QR */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleActionClick('Scan QR')}
              className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm group hover:border-[var(--color-off-black-ink)] dark:hover:border-[var(--color-iris-gleam)]"
            >
              <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center mb-3 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] group-hover:bg-[var(--color-electric-lime)] dark:group-hover:bg-[var(--color-iris-gleam)] group-hover:text-[var(--color-off-black-ink)] dark:group-hover:text-[var(--color-cloud)] transition-colors">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-0.5">
                Scan QR
              </span>
              <span className="text-[11px] text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                Any UPI Scanner
              </span>
            </motion.div>

            {/* 3. Check Balance */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleActionClick('Check Balance')}
              className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm group hover:border-[var(--color-off-black-ink)] dark:hover:border-[var(--color-iris-gleam)]"
            >
              <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center mb-3 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] group-hover:bg-[var(--color-electric-lime)] dark:group-hover:bg-[var(--color-iris-gleam)] group-hover:text-[var(--color-off-black-ink)] dark:group-hover:text-[var(--color-cloud)] transition-colors">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-0.5">
                Check Balance
              </span>
              <span className="text-[11px] text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                Bank Accounts
              </span>
            </motion.div>

            {/* 4. Bank Transfer */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleActionClick('Bank Transfer')}
              className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm group hover:border-[var(--color-off-black-ink)] dark:hover:border-[var(--color-iris-gleam)]"
            >
              <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center mb-3 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] group-hover:bg-[var(--color-electric-lime)] dark:group-hover:bg-[var(--color-iris-gleam)] group-hover:text-[var(--color-off-black-ink)] dark:group-hover:text-[var(--color-cloud)] transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] mb-0.5">
                Bank Transfer
              </span>
              <span className="text-[11px] text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
                Account & IFSC
              </span>
            </motion.div>
          </div>
        </section>

        {/* Recent Transactions List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
              Recent Activity
            </h2>
            <span className="text-xs font-bold text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] cursor-pointer hover:text-[var(--color-off-black-ink)] dark:hover:text-[var(--color-cloud)] transition-colors">
              View All
            </span>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <motion.div
                key={tx.id}
                whileHover={{ x: 3 }}
                className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-lg)] p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-[var(--radius-full)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center shrink-0 ${
                    tx.type === 'debit' 
                      ? 'bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]' 
                      : 'bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]'
                  }`}>
                    {tx.type === 'debit' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                      {tx.title}
                    </h3>
                    <p className="text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] mt-0.5">
                      {tx.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold block ${
                    tx.type === 'debit'
                      ? 'text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]'
                      : 'text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]'
                  }`}>
                    {tx.amount}
                  </span>
                  <span className="text-[11px] text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] block mt-0.5">
                    {tx.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default PersonalDashboard;
