import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertCircle, 
  XCircle, 
  Building2,
  Filter 
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const AccountBalancePage = ({ isDark, setIsDark, onBack }) => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  const mockTransactions = [
    {
      id: 'tx-101',
      name: 'Paid Ramesh',
      upiId: 'ramesh@upi',
      amount: '- ₹ 25,000',
      type: 'sent',
      status: 'paused',
      statusMessage: 'Paused (Risk Shield)',
      date: 'Today, 2:45 PM',
    },
    {
      id: 'tx-102',
      name: 'Swiggy Refund',
      upiId: 'swiggy@icici',
      amount: '+ ₹ 450',
      type: 'received',
      status: 'success',
      statusMessage: 'Success',
      date: 'Yesterday, 8:12 PM',
    },
    {
      id: 'tx-103',
      name: 'Paid Uber India',
      upiId: 'uber.cab@axis',
      amount: '- ₹ 320',
      type: 'sent',
      status: 'failed',
      statusMessage: 'Failed (Network Error)',
      date: 'Aug 18, 2026',
    },
    {
      id: 'tx-104',
      name: 'Received from Rahul',
      upiId: 'rahul.k@okaxis',
      amount: '+ ₹ 1,200',
      type: 'received',
      status: 'success',
      statusMessage: 'Success',
      date: 'Aug 17, 2026',
    },
    {
      id: 'tx-105',
      name: 'Paid Zomato',
      upiId: 'zomato@hdfc',
      amount: '- ₹ 680',
      type: 'sent',
      status: 'success',
      statusMessage: 'Success',
      date: 'Aug 16, 2026',
    },
    {
      id: 'tx-106',
      name: 'Electric Bill Payment',
      upiId: 'bescom@statebank',
      amount: '- ₹ 1,850',
      type: 'sent',
      status: 'failed',
      statusMessage: 'Failed (Bank Timeout)',
      date: 'Aug 15, 2026',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] font-sans transition-colors duration-300 select-none pb-12">
      {/* App Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] border-b border-[var(--color-ash)] dark:border-[var(--color-steel)] backdrop-blur-md transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleBack}
              className="p-2 rounded-[var(--radius-full)] bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] hover:opacity-80 transition-all cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]" />
            </motion.button>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
              Balance & History
            </h1>
          </div>

          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {/* The Balance Card (Prominent) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-abyss)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] rounded-[var(--radius-3xl)] p-6 sm:p-8 shadow-sm transition-colors duration-300"
        >
          {/* Bank Info Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                <Building2 className="w-5 h-5 text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                  State Bank of India
                </h2>
                <p className="text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] font-medium">
                  Primary Account • xxxx 4589
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-[11px] font-semibold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
              Primary UPI
            </span>
          </div>

          {/* Balance Amount & Toggle */}
          <div className="pt-2">
            <p className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] mb-2">
              Available Savings Balance
            </p>
            
            <div className="flex items-center justify-between gap-4">
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                {showBalance ? '₹ 1,24,500' : '₹ •••••••'}
              </div>

              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="p-3 rounded-[var(--radius-full)] bg-[var(--color-pure-white)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] hover:bg-[var(--color-electric-lime)] dark:hover:bg-[var(--color-iris-gleam)] hover:text-[var(--color-off-black-ink)] dark:hover:text-[var(--color-cloud)] transition-colors cursor-pointer shrink-0 shadow-sm"
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Transaction History Section */}
        <section>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm uppercase font-extrabold tracking-widest text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)]">
              Payment History
            </h2>

            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] text-xs font-semibold text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] hover:text-[var(--color-off-black-ink)] dark:hover:text-[var(--color-cloud)] transition-colors cursor-pointer"
            >
              <span>All Types</span>
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Staggered List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {mockTransactions.map((tx) => (
              <motion.div
                key={tx.id}
                variants={itemVariants}
                whileHover={{ x: 2 }}
                className={`border rounded-[var(--radius-lg)] p-4 flex items-center justify-between transition-all ${
                  tx.status === 'paused'
                    ? 'bg-[var(--color-electric-lime)]/20 dark:bg-[var(--color-iris-gleam)]/20 border-[var(--color-electric-lime)] dark:border-[var(--color-iris-gleam)]'
                    : 'bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-graphite-dark)] border-[var(--color-ash)] dark:border-[var(--color-steel)]'
                }`}
              >
                {/* Left Side: Icon & Details */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-[var(--radius-full)] border border-[var(--color-ash)] dark:border-[var(--color-steel)] flex items-center justify-center shrink-0 ${
                    tx.type === 'sent'
                      ? 'bg-[var(--color-pure-white)] dark:bg-[var(--color-abyss)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]'
                      : 'bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]'
                  }`}>
                    {tx.type === 'sent' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                      {tx.name}
                    </h3>
                    <p className="text-xs text-[var(--color-graphite)] dark:text-[var(--color-ash-dark)] mt-0.5">
                      {tx.date}
                    </p>
                  </div>
                </div>

                {/* Right Side: Amount & Status Tag */}
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-bold text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)]">
                    {tx.amount}
                  </span>

                  {/* Status Tags */}
                  {tx.status === 'paused' && (
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-full)] bg-[var(--color-electric-lime)] dark:bg-[var(--color-iris-gleam)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] text-[10px] font-extrabold border border-[var(--color-ash)] dark:border-[var(--color-steel)]">
                      <AlertCircle className="w-3 h-3" />
                      <span>{tx.statusMessage}</span>
                    </div>
                  )}

                  {tx.status === 'failed' && (
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-full)] bg-[var(--color-off-white-canvas)] dark:bg-[var(--color-abyss)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] text-[10px] font-extrabold border border-[var(--color-ash)] dark:border-[var(--color-steel)]">
                      <XCircle className="w-3 h-3" />
                      <span>{tx.statusMessage}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default AccountBalancePage;
