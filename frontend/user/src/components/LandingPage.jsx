import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ShieldAlert, Cpu, Terminal, Users, ExternalLink } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export function LandingPage({ isDark, setIsDark }) {
  const adminUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5174'
    : 'https://sih-jade-two.vercel.app';

  return (
    <div className="min-h-screen bg-(--color-pure-white) dark:bg-(--color-obsidian) transition-colors duration-300">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-(--color-ash)/40 dark:border-gray-800 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) text-black dark:text-white">
            <ShieldCheck size={21} strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">RakshaPay</span>
            <span className="block text-[9px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">Risk Intelligence</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
          <a 
            href={adminUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            Control Room <ExternalLink size={12} />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative px-6 py-20 lg:py-32 max-w-6xl mx-auto text-center flex flex-col items-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-(--color-electric-lime) dark:text-(--color-iris-gleam) bg-black/10 dark:bg-white/10 px-4 py-1.5 rounded-full mb-6">
          🛡️ India's First Real-Time Coercion Shield
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight">
          Next-Generation UPI <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--color-electric-lime) to-(--color-iris-gleam)">Fraud & Threat Defense</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-gray-400 max-w-2xl">
          RakshaPay runs on-device hardware telemetry and situational sensor modeling to detect coercion calls, device changes, and suspicious behavior vectors prior to transaction processing.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <Link 
            to="/auth" 
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) text-black dark:text-white font-extrabold text-sm px-8 shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Safe UPI Portal</span>
            <ArrowRight size={16} />
          </Link>
          <a 
            href={adminUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 dark:border-gray-700 bg-transparent text-slate-800 dark:text-gray-200 font-extrabold text-sm px-8 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <span>Admin Control Room</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </header>

      {/* Feature Blocks */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 flex flex-col gap-4 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-500">
              <Cpu size={20} />
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">On-Device Extraction</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Extracts on-device screen orientation, active call states, network type, and environment baseline parameters to build a unique user security profile.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 flex flex-col gap-4 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-electric-lime)/10 text-primary">
              <ShieldAlert size={20} />
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Explainable Intervention</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              If risk scoring flags a coercion attack (e.g. user is on a phone call to a first-time payee), the gateway pauses the payment and triggers alert triaging.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 flex flex-col gap-4 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-500">
              <Terminal size={20} />
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Centralized Auditing</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Real-time audit log alerts are broadcast directly to the bank administrator's portal dashboard for transaction hold management.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-12 text-[10px] text-slate-400 dark:text-gray-500 border-t border-slate-200/40 dark:border-gray-800 mt-12">
        <p>© 2026 RakshaPay. Built for Smart India Hackathon. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
