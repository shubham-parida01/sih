import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Route, Router, Switch, useLocation, useParams } from 'wouter';
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Download,
  FileBarChart,
  Filter,
  Globe2,
  KeyRound,
  Landmark,
  LayoutDashboard,
  ListFilter,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Tag,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import NotFound from '@/pages/not-found';
import { adminApi } from '@/lib/api';

type Theme = 'light' | 'dark';
type Risk = 'Low' | 'Medium' | 'High' | 'Under review';
type Account = {
  id: string;
  holder: string;
  initials: string;
  accountNumber: string;
  customerId: string;
  type: 'Savings' | 'Current';
  kyc: 'Verified' | 'Review';
  score: number;
  risk: Risk;
  transactions: number;
  value: string;
  balance: string;
  branch: string;
  opened: string;
  phone: string;
  email: string;
  is_active?: boolean;
};
type AlertItem = {
  id: string;
  title: string;
  detail: string;
  account: string;
  accountId: string;
  severity: 'Critical' | 'High' | 'Medium';
  time: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  signal: string;
};
type Transaction = {
  id: string;
  accountId: string;
  customer: string;
  type: 'Debit' | 'Credit';
  counterparty: string;
  amount: string;
  rawAmount: number;
  status: 'Cleared' | 'Review' | 'Blocked';
  risk: Risk;
  time: string;
  channel: string;
};

const scoreTrend = [
  { day: '12 May', score: 46 }, { day: '13 May', score: 48 }, { day: '14 May', score: 51 },
  { day: '15 May', score: 53 }, { day: '16 May', score: 49 }, { day: '17 May', score: 50 }, { day: '18 May', score: 52 },
];
const weeklyVolume = [
  { day: 'Mon', cleared: 362, review: 18 }, { day: 'Tue', cleared: 418, review: 23 }, { day: 'Wed', cleared: 390, review: 16 },
  { day: 'Thu', cleared: 476, review: 31 }, { day: 'Fri', cleared: 452, review: 28 }, { day: 'Sat', cleared: 298, review: 12 }, { day: 'Sun', cleared: 214, review: 8 },
];
const accountTrend = [
  { month: 'Dec', score: 41 }, { month: 'Jan', score: 44 }, { month: 'Feb', score: 39 }, { month: 'Mar', score: 47 }, { month: 'Apr', score: 50 }, { month: 'May', score: 52 },
];

type FeedbackContextValue = { 
  notify: (message: string) => void;
  openAlertsCount: number;
  setOpenAlertsCount: (count: number) => void;
};
const FeedbackContext = createContext<FeedbackContextValue | null>(null);
function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('Feedback context is missing');
  return context;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" data-testid="link-brand-home">
      <span className="lime-mark flex h-9 w-9 items-center justify-center rounded-xl">
        <ShieldCheck size={21} strokeWidth={2.4} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-[-.03em]">RakshaPay</span>
        <span className="block text-[9px] font-medium uppercase tracking-[.17em] text-sidebar-foreground/55">Risk intelligence</span>
      </span>
    </Link>
  );
}

const navGroups = [
  { label: 'Workspace', items: [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/accounts', label: 'Accounts', icon: WalletCards },
    { href: '/transactions', label: 'Transactions', icon: ArrowLeftRightIcon },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/analytics', label: 'Risk analytics', icon: BarChart3 },
  ] },
  { label: 'Administration', items: [
    { href: '/settings', label: 'System settings', icon: SettingsIcon },
    { href: '/settings', label: 'Users & roles', icon: Users },
  ] },
];

function ArrowLeftRightIcon(props: LucideProps) {
  return <ArrowUpRight {...props} className="rotate-[-45deg]" />;
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const { notify, openAlertsCount } = useFeedback();
  const handleLogout = () => {
    localStorage.removeItem('rakshapay_token');
    localStorage.removeItem('rakshapay_role');
    localStorage.removeItem('rakshapay_name');
    notify('Signed out successfully');
    window.setTimeout(() => window.location.reload(), 100);
  };
  return (
    <>
      <div className={`mobile-overlay fixed inset-0 z-30 bg-black/45 md:hidden ${mobileOpen ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar mobile-drawer fixed inset-y-0 left-0 z-40 flex w-[238px] flex-col border-r border-sidebar-border md:sticky md:top-0 md:flex ${mobileOpen ? 'is-open' : ''}`}>
        <div className="flex h-[74px] items-center border-b border-sidebar-border px-5"><Logo /></div>
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div className="mb-6" key={group.label}>
              <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/35">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.href === '/' ? location === '/' : location.startsWith(item.href.split('/').slice(0, 2).join('/'));
                  const Icon = item.icon;
                  const count = item.href === '/alerts' ? openAlertsCount : item.count;
                  return (
                    <Link key={`${group.label}-${item.label}`} href={item.href} onClick={onClose} className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-[12px] font-semibold transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
                      <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                      <span className="flex-1">{item.label}</span>
                      {count ? <span className={`mono flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${active ? 'bg-black/15' : 'bg-primary text-primary-foreground'}`}>{count}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button type="button" onClick={handleLogout} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] font-semibold text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <LogOut size={16} /><span>Sign out</span>
          </button>
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-sidebar-accent/70 p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">SA</span>
            <div className="min-w-0"><p className="truncate text-[11px] font-bold">Admin Portal</p><p className="text-[10px] text-sidebar-foreground/45">Bank Administrator</p></div>
            <ChevronDown size={14} className="ml-auto text-sidebar-foreground/35" />
          </div>
        </div>
      </aside>
    </>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground">
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}<span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
    </button>
  );
}

function Header({ theme, onToggle, onMenu }: { theme: Theme; onToggle: () => void; onMenu: () => void }) {
  const [location] = useLocation();
  const { notify } = useFeedback();
  const titles: Record<string, string> = { '/': 'Overview', '/accounts': 'Accounts', '/alerts': 'Risk alerts', '/transactions': 'Transactions', '/analytics': 'Risk analytics', '/settings': 'System settings' };
  const title = location.startsWith('/accounts/') ? 'Account detail' : titles[location] || 'Overview';
  return (
    <header className="flex min-h-[74px] items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-7">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenu} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground md:hidden"><Menu size={18} /></button>
        <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Control room / {title}</p><h1 className="mt-0.5 text-[19px] font-extrabold tracking-[-.04em]">{title}</h1></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground lg:flex"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />Live Database Connection</div>
        <ThemeToggle theme={theme} onToggle={onToggle} />
        <button type="button" onClick={() => notify('Admin notifications active')} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"><Bell size={16} /><span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" /></button>
        <button type="button" onClick={() => notify('Signed in as Bank Admin')} className="hidden h-9 w-9 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground sm:flex">SA</button>
      </div>
    </header>
  );
}

function Shell({ children, theme, onToggle }: { children: ReactNode; theme: Theme; onToggle: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="app-shell noise flex"><Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="min-w-0 flex-1"><Header theme={theme} onToggle={onToggle} onMenu={() => setMobileOpen(true)} /><main className="page-enter mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'low' | 'medium' | 'high' | 'critical' | 'success' | 'neutral' | 'review' }) {
  const colors = { low: 'bg-primary/12 text-foreground', medium: 'bg-amber-400/15 text-amber-700 dark:text-amber-300', high: 'bg-orange-500/14 text-orange-700 dark:text-orange-300', critical: 'bg-red-500/14 text-red-700 dark:text-red-300', success: 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-300', neutral: 'bg-muted text-muted-foreground', review: 'bg-violet-500/14 text-violet-700 dark:text-violet-300' };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold tracking-[.01em] ${colors[tone]}`}>{children}</span>;
}

function RiskBadge({ risk }: { risk: Risk }) {
  const tone = risk === 'Low' ? 'low' : risk === 'Medium' ? 'medium' : risk === 'High' ? 'high' : 'review';
  return <Badge tone={tone}>{risk}</Badge>;
}

function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div>{eyebrow ? <p className="mb-1 text-[9px] font-bold uppercase tracking-[.17em] text-muted-foreground">{eyebrow}</p> : null}<h2 className="text-[17px] font-extrabold tracking-[-.035em]">{title}</h2>{detail ? <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p> : null}</div>{action}</div>;
}

function MetricCard({ label, value, delta, detail, icon: Icon, positive = true }: { label: string; value: string; delta: string; detail: string; icon: LucideIcon | typeof ArrowLeftRightIcon; positive?: boolean }) {
  return <div className="card-surface group rounded-xl p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5">
    <div className="flex items-start justify-between"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/14 text-primary-foreground dark:text-primary"><Icon size={16} strokeWidth={2.3} /></span><span className={`mono text-[10px] font-medium ${positive ? 'text-emerald-600 dark:text-primary' : 'text-red-600 dark:text-red-400'}`}>{positive ? '↗' : '↘'} {delta}</span></div>
    <p className="mt-5 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</p><p className="mt-1 text-[25px] font-extrabold tracking-[-.06em]">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
  </div>;
}

function ExportButton() {
  const { notify } = useFeedback();
  const [exporting, setExporting] = useState(false);
  const exportReport = () => {
    setExporting(true);
    window.setTimeout(() => {
      const contents = `RakshaPay Risk Intelligence Report\nGenerated: ${new Date().toLocaleString()}\nScope: Monitored Database Accounts\nAll systems operational.`;
      const blob = new Blob([contents], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'rakshapay-risk-report.txt'; anchor.click(); URL.revokeObjectURL(url);
      setExporting(false); notify('Risk report downloaded');
    }, 500);
  };
  return <button type="button" onClick={exportReport} disabled={exporting} className="lime-mark flex h-9 items-center gap-2 rounded-lg px-3 text-[11px] font-extrabold transition-transform hover:-translate-y-0.5 disabled:opacity-60"><Download size={14} />{exporting ? 'Preparing…' : 'Export report'}</button>;
}

// ─── Modal for Admin User Creation ───
function CreateUserModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const { notify } = useFeedback();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    upi_id: '',
    initial_balance: 50000,
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) {
      notify('Please fill in required fields (Name, Email, Password)');
      return;
    }
    setLoading(true);
    try {
      await adminApi.createAccount({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        upi_id: form.upi_id || `${form.email.split('@')[0]}@upi`,
        initial_balance: Number(form.initial_balance) || 50000,
      });
      notify(`Account created for ${form.full_name}!`);
      onCreated();
      onClose();
    } catch (err: any) {
      notify(err.detail || err.message || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card-surface w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Create User Account</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-[12px]">
          <div>
            <label className="block font-semibold mb-1">Full Name *</label>
            <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Rohit Kumar" className="w-full h-9 rounded-lg border border-border bg-background px-3 font-medium outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email Address *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="rohit@sih2026.com" className="w-full h-9 rounded-lg border border-border bg-background px-3 font-medium outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Password *</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Must be at least 8 chars" className="w-full h-9 rounded-lg border border-border bg-background px-3 font-medium outline-none focus:border-primary" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210" className="w-full h-9 rounded-lg border border-border bg-background px-3 font-medium outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-semibold mb-1">UPI ID</label>
              <input type="text" value={form.upi_id} onChange={e => setForm({...form, upi_id: e.target.value})} placeholder="rohit@upi" className="w-full h-9 rounded-lg border border-border bg-background px-3 font-medium outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Initial Balance (₹)</label>
            <input type="number" value={form.initial_balance} onChange={e => setForm({...form, initial_balance: Number(e.target.value)})} placeholder="50000" className="w-full h-9 rounded-lg border border-border bg-background px-3 font-bold outline-none focus:border-primary" />
          </div>
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onClose} className="flex-1 h-9 rounded-lg border border-border font-bold hover:bg-muted">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-9 rounded-lg lime-mark font-bold disabled:opacity-50">{loading ? 'Creating...' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | Risk>('All');
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { notify } = useFeedback();

  const loadBackendAccounts = async () => {
    try {
      const res = await adminApi.accounts();
      if (res?.data?.accounts) {
        setAccountsList(res.data.accounts.map((a: any) => ({
          id: a.id || a._id,
          holder: a.full_name || 'User',
          initials: (a.full_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
          accountNumber: a.upi_id || 'user@upi',
          customerId: (a.id || a._id || 'CUST-101').slice(-8),
          type: 'Savings',
          kyc: 'Verified',
          score: Math.round(a.avg_risk_score || 18),
          risk: a.risk_level === 'high' ? 'High' : a.risk_level === 'medium' ? 'Medium' : 'Low',
          transactions: a.total_transactions || 0,
          value: `₹${(a.balance || 50000).toLocaleString()}`,
          balance: `₹${(a.balance || 50000).toLocaleString()}`,
          branch: 'Connaught Place Branch',
          opened: new Date(a.created_at || Date.now()).toLocaleDateString(),
          phone: a.phone || '+91 98765 00000',
          email: a.email || 'user@sih2026.com'
        })));
      }
    } catch (err) {
      console.warn("Using active monitored state");
    }
  };

  const loadDashboardData = async () => {
    try {
      const res = await adminApi.dashboard();
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.warn("Could not load backend dashboard statistics");
    }
  };

  useEffect(() => {
    loadBackendAccounts();
    loadDashboardData();
  }, []);

  const filteredAccounts = useMemo(() => accountsList.filter((account) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || `${account.holder} ${account.accountNumber} ${account.customerId}`.toLowerCase().includes(query);
    return matchesSearch && (riskFilter === 'All' || account.risk === riskFilter);
  }), [accountsList, search, riskFilter]);

  const pieData = useMemo(() => {
    if (dashboardData?.risk_distribution?.slices) {
      return dashboardData.risk_distribution.slices.map((s: any) => ({
        name: s.name,
        value: Number(s.value) || 0,
        count: s.count,
        percent: s.percent,
        sliceColor: s.sliceColor,
        dotColor: s.dotColor
      }));
    }
    return [
      { name: 'Low risk', value: Math.max(1, accountsList.length - 2), sliceColor: '#beff50', dotColor: 'bg-primary' },
      { name: 'Medium risk', value: 1, sliceColor: '#e7b631', dotColor: 'bg-amber-400' },
      { name: 'High risk', value: 1, sliceColor: '#db5547', dotColor: 'bg-red-500' },
      { name: 'Under review', value: 0, sliceColor: '#92938a', dotColor: 'bg-stone-400' }
    ];
  }, [dashboardData, accountsList]);

  const chartTrend = useMemo(() => {
    if (dashboardData?.score_trend) {
      return dashboardData.score_trend;
    }
    return scoreTrend;
  }, [dashboardData]);

  const totalUsers = dashboardData?.total_users ?? accountsList.length;
  const totalTransactions = dashboardData?.total_transactions ?? 0;
  const totalFlagged = dashboardData?.total_flagged ?? 0;
  const pendingReviews = dashboardData?.pending_reviews ?? 0;

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} · New Delhi</p>
        <h2 className="mt-1 text-[26px] font-extrabold tracking-[-.055em] sm:text-[30px]">Good morning, Admin.</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">Here is the signal across your branch network.</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setShowCreateModal(true)} className="lime-mark flex h-9 items-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold">
          <Plus size={15} /> Create User Account
        </button>
        <ExportButton />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      <MetricCard label="Total accounts" value={totalUsers.toString()} delta="8.8%" detail="monitored in DB" icon={Users} />
      <MetricCard label="Total customers" value={totalUsers.toString()} delta="7.3%" detail="active profiles" icon={UserRound} />
      <MetricCard label="High risk accounts" value={totalFlagged.toString()} delta="12.1%" detail="flagged by ML model" icon={ShieldAlert} positive={false} />
      <MetricCard label="Transactions today" value={totalTransactions.toString()} delta="15.4%" detail="processed by gateway" icon={ArrowLeftRightIcon} />
      <MetricCard label="Pending reviews" value={pendingReviews.toString()} delta="10.7%" detail="triages pending" icon={CreditCard} />
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.12fr_1.35fr_.9fr]">
      <div className="card-surface rounded-xl p-5">
        <SectionHeading eyebrow="Portfolio" title="Risk distribution" detail="Account exposure across the branch" />
        <div className="flex items-center gap-4">
          <div className="h-[164px] w-[164px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={54} outerRadius={76} strokeWidth={0} paddingAngle={2}>
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.sliceColor} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none relative -mt-[107px] text-center">
              <p className="text-[22px] font-extrabold tracking-[-.06em]">{totalUsers}</p>
              <p className="text-[9px] text-muted-foreground">Total accounts</p>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            {pieData.map((slice: any) => (
              <div className="flex items-center gap-2 text-[10px]" key={slice.name}>
                <span className={`h-2 w-2 rounded-full ${slice.dotColor}`} />
                <span className="flex-1 text-muted-foreground">{slice.name}</span>
                <span className="mono font-medium">{slice.count}</span>
                <span className="w-10 text-right text-muted-foreground">{slice.percent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card-surface rounded-xl p-5"><SectionHeading eyebrow="7 day view" title="Risk score overview" detail="Average score across monitored accounts" /><div className="h-[184px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartTrend} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><YAxis domain={[0,100]} ticks={[0,25,50,75,100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} /><Line type="monotone" dataKey="score" stroke="#94d900" strokeWidth={2.5} dot={{ r: 3, fill: '#beff50', stroke: '#6a9400', strokeWidth: 1 }} /></LineChart></ResponsiveContainer></div></div>
      <div className="card-surface rounded-xl p-5"><SectionHeading eyebrow="Signal mix" title="Top risk reasons" detail="What is moving the queue today" /><div className="space-y-1">{[['Coercion Phone Call Flag','42%',ShieldAlert],['Unusual Device Fingerprint','28%',Activity],['First-time High Value Payee','16%',UserRound],['Velocity Burst Limit','8%',CreditCard],['Other','6%',Tag]].map(([name, percent, Icon]) => <div className="flex items-center gap-3 border-b border-border/70 py-3 last:border-0" key={name as string}><span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/12 text-primary-foreground dark:text-primary"><Icon size={12} /></span><span className="flex-1 text-[10px] leading-4 text-muted-foreground">{name as string}</span><span className="mono text-[10px] font-bold">{percent as string}</span></div>)}</div></div>
    </div>

    <div className="card-surface overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5"><div><SectionHeading eyebrow="Monitored book" title="Accounts in Monitored Database" detail={`Showing ${filteredAccounts.length} of ${accountsList.length} accounts`} /></div><div className="flex w-full gap-2 sm:w-auto"><label className="relative flex min-w-0 flex-1 sm:w-[238px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, account, ID…" className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-[11px] outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary" /></label><select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as 'All' | Risk)} className="h-9 rounded-lg border border-border bg-background px-2 text-[11px] font-semibold outline-none focus:border-primary"><option value="All">All risk</option><option value="Low">Low risk</option><option value="Medium">Medium risk</option><option value="High">High risk</option></select></div></div>
      <div className="scrollbar-thin overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-muted/50 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground"><tr>{['Account holder','UPI / Account','Customer ID','Account type','KYC status','Avg risk score','Risk level','Value (30D)','Action'].map((head) => <th key={head} className="px-4 py-3 font-bold">{head}</th>)}</tr></thead><tbody className="divide-y divide-border">{filteredAccounts.map((account) => <tr className="group text-[11px] transition-colors hover:bg-muted/35" key={account.id}><td><span className="px-4 py-3 font-bold text-foreground">{account.holder}</span></td><td className="mono px-4 py-3 text-muted-foreground">{account.accountNumber}</td><td className="mono px-4 py-3 text-muted-foreground">{account.customerId}</td><td className="px-4 py-3 text-muted-foreground">{account.type}</td><td className="px-4 py-3"><span className="flex items-center gap-1.5 text-muted-foreground">{account.kyc}<CheckCircle2 size={12} className="text-emerald-500" /></span></td><td className="mono px-4 py-3 font-medium">{account.score}</td><td className="px-4 py-3"><RiskBadge risk={account.risk} /></td><td className="mono px-4 py-3 text-muted-foreground">{account.value}</td><td className="px-4 py-3"><Link href={`/accounts/${account.id}`} className="text-[10px] font-bold text-primary underline underline-offset-4">View detail</Link></td></tr>)}</tbody></table></div>
      {filteredAccounts.length === 0 ? <div className="p-12 text-center"><Search size={22} className="mx-auto text-muted-foreground" /><p className="mt-3 text-sm font-bold">No accounts match this search</p></div> : null}
    </div>

    <CreateUserModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={loadBackendAccounts} />
  </div>;
}

function AccountsList() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | Risk>('All');
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const { notify } = useFeedback();

  const loadBackendAccounts = async () => {
    try {
      const res = await adminApi.accounts();
      if (res?.data?.accounts) {
        setAccountsList(res.data.accounts.map((a: any) => ({
          id: a.id || a._id,
          holder: a.full_name || 'User',
          initials: (a.full_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
          accountNumber: a.upi_id || 'user@upi',
          customerId: (a.id || a._id || 'CUST-101').slice(-8),
          type: 'Savings',
          kyc: 'Verified',
          score: Math.round(a.avg_risk_score || 18),
          risk: a.risk_level === 'high' ? 'High' : a.risk_level === 'medium' ? 'Medium' : 'Low',
          transactions: a.total_transactions || 0,
          value: `₹${(a.balance || 50000).toLocaleString()}`,
          balance: `₹${(a.balance || 50000).toLocaleString()}`,
          branch: 'Connaught Place Branch',
          opened: new Date(a.created_at || Date.now()).toLocaleDateString(),
          phone: a.phone || '+91 98765 00000',
          email: a.email || 'user@sih2026.com'
        })));
      }
    } catch (err) {
      console.warn("Could not load backend accounts");
    }
  };

  useEffect(() => {
    loadBackendAccounts();
  }, []);

  const filteredAccounts = useMemo(() => accountsList.filter((account) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || `${account.holder} ${account.accountNumber} ${account.customerId}`.toLowerCase().includes(query);
    return matchesSearch && (riskFilter === 'All' || account.risk === riskFilter);
  }), [accountsList, search, riskFilter]);

  return (
    <div className="card-surface overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div>
          <SectionHeading eyebrow="Monitored book" title="Accounts in Monitored Database" detail={`Showing ${filteredAccounts.length} of ${accountsList.length} accounts`} />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <label className="relative flex min-w-0 flex-1 sm:w-[238px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, account, ID…" className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-[11px] outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary" />
          </label>
          <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as 'All' | Risk)} className="h-9 rounded-lg border border-border bg-background px-2 text-[11px] font-semibold outline-none focus:border-primary">
            <option value="All">All risk</option>
            <option value="Low">Low risk</option>
            <option value="Medium">Medium risk</option>
            <option value="High">High risk</option>
          </select>
        </div>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-muted/50 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground">
            <tr>{['Account holder','UPI / Account','Customer ID','Account type','KYC status','Avg risk score','Risk level','Value (30D)','Action'].map((head) => <th key={head} className="px-4 py-3 font-bold">{head}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAccounts.map((account) => (
              <tr className="group text-[11px] transition-colors hover:bg-muted/35" key={account.id}>
                <td><span className="px-4 py-3 font-bold text-foreground">{account.holder}</span></td>
                <td className="mono px-4 py-3 text-muted-foreground">{account.accountNumber}</td>
                <td className="mono px-4 py-3 text-muted-foreground">{account.customerId}</td>
                <td className="px-4 py-3 text-muted-foreground">{account.type}</td>
                <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-muted-foreground">{account.kyc}<CheckCircle2 size={12} className="text-emerald-500" /></span></td>
                <td className="mono px-4 py-3 font-medium">{account.score}</td>
                <td className="px-4 py-3"><RiskBadge risk={account.risk} /></td>
                <td className="mono px-4 py-3 text-muted-foreground">{account.value}</td>
                <td className="px-4 py-3"><Link href={`/accounts/${account.id}`} className="text-[10px] font-bold text-primary underline underline-offset-4">View detail</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAccounts.length === 0 ? <div className="p-12 text-center"><Search size={22} className="mx-auto text-muted-foreground" /><p className="mt-3 text-sm font-bold">No accounts match this search</p></div> : null}
    </div>
  );
}

function AccountDetail() {
  const { id } = useParams<{ id?: string }>();
  const [account, setAccount] = useState<any>(null);
  const { notify } = useFeedback();
  const [held, setHeld] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      try {
        const res = await adminApi.accountDetail(id);
        if (res?.data) {
          const a = res.data.account || res.data;
          setAccount({
            id: a.id || id,
            holder: a.full_name || 'User Account',
            initials: (a.full_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
            accountNumber: a.upi_id || 'user@upi',
            customerId: (a.id || id).slice(-8),
            type: 'Savings',
            kyc: 'Verified',
            score: Math.round(a.avg_risk_score || 18),
            risk: a.risk_level === 'high' ? 'High' : 'Low',
            balance: `₹${(a.balance || 50000).toLocaleString()}`,
            branch: 'Main Branch',
            opened: new Date(a.created_at || Date.now()).toLocaleDateString(),
            phone: a.phone || '+91 98765 00000',
            email: a.email || 'user@sih2026.com'
          });
          setHeld(!a.is_active);
        }
      } catch (err) {
        console.warn("Error loading account detail panel");
      }
    }
    fetchDetail();
  }, [id]);

  const handleToggleHold = async () => {
    if (!account) return;
    try {
      const res = await adminApi.toggleAccountStatus(account.id);
      setHeld(!res.is_active);
      notify(res.is_active ? 'Account placed on active status' : 'Account placed on hold');
    } catch (err: any) {
      notify(err.detail || err.message || 'Failed to update status');
    }
  };

  if (!account) return <EmptyState title="Account loading..." detail="Fetching latest details from database..." link="/" linkLabel="Return to overview" />;
  return <div className="space-y-6">
    <Link href="/accounts" className="inline-flex items-center gap-2 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"><ChevronLeft size={14} />Back to accounts</Link>
    <div className="card-surface rounded-xl p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/14 text-lg font-extrabold text-primary-foreground dark:text-primary">{account.initials}</span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-extrabold tracking-[-.055em]">{account.holder}</h2><RiskBadge risk={account.risk} /></div><p className="mono mt-1 text-[11px] text-muted-foreground">{account.accountNumber} · {account.customerId}</p><p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Building2 size={12} />{account.branch}</p></div></div><div className="flex gap-2"><button type="button" onClick={handleToggleHold} className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-[11px] font-bold transition-colors ${held ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300' : 'border-border hover:bg-muted'}`}><LockKeyhole size={14} />{held ? 'Release hold' : 'Place on hold'}</button></div></div><div className="mt-7 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4"><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-muted-foreground">Available balance</p><p className="mono mt-1 text-xl font-bold">{account.balance}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-muted-foreground">Risk score</p><p className="mono mt-1 text-xl font-bold">{account.score}<span className="ml-1 text-xs font-normal text-muted-foreground">/ 100</span></p></div><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-muted-foreground">Account type</p><p className="mt-1 text-sm font-bold">{account.type}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-muted-foreground">KYC status</p><p className="mt-1 flex items-center gap-1.5 text-sm font-bold">{account.kyc}<CheckCircle2 size={14} className="text-emerald-500" /></p></div></div></div>
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]"><div className="card-surface rounded-xl p-5"><SectionHeading eyebrow="Account signal" title="Risk score over time" detail="Computed from transaction context and customer history" /><div className="h-[230px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={accountTrend} margin={{ top: 10, right: 4, left: -26, bottom: 0 }}><defs><linearGradient id="score-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#beff50" stopOpacity=".3" /><stop offset="100%" stopColor="#beff50" stopOpacity="0" /></linearGradient></defs><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><YAxis domain={[0,100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} /><Area type="monotone" dataKey="score" stroke="#94d900" fill="url(#score-fill)" strokeWidth={2.5} /></AreaChart></ResponsiveContainer></div></div><div className="card-surface rounded-xl p-5"><SectionHeading eyebrow="Profile" title="Account details" /><div className="space-y-4">{[['Customer since', account.opened, CalendarIcon],['Phone number', account.phone, CreditCard],['Email address', account.email, Globe2],['Branch relationship', account.branch, Landmark]].map(([label, value, Icon]) => <div className="flex gap-3" key={label as string}><span className="mt-0.5 text-muted-foreground"><Icon size={14} /></span><div className="min-w-0"><p className="text-[10px] text-muted-foreground">{label as string}</p><p className="mt-0.5 truncate text-[11px] font-semibold">{value as string}</p></div></div>)}</div></div></div>
  </div>;
}

function EmptyState({ title, detail, link, linkLabel }: { title: string; detail: string; link?: string; linkLabel?: string }) {
  return <div className="card-surface flex min-h-[340px] flex-col items-center justify-center rounded-xl px-6 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Search size={21} /></span><h2 className="mt-4 text-lg font-extrabold">{title}</h2><p className="mt-1 max-w-sm text-sm text-muted-foreground">{detail}</p>{link && linkLabel ? <Link href={link} className="lime-mark mt-5 rounded-lg px-4 py-2.5 text-[11px] font-extrabold">{linkLabel}</Link> : null}</div>;
}

function Alerts() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<'All' | AlertItem['status']>('All');
  const [search, setSearch] = useState('');
  const { notify, setOpenAlertsCount } = useFeedback();

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await adminApi.alerts();
        if (res?.data?.alerts) {
          const mapped: AlertItem[] = res.data.alerts.map((a: any) => ({
            id: a.id || a._id,
            title: a.alert_type || 'Risk Signal',
            detail: a.risk_explanation || 'Behavioral pattern flagged',
            account: a.user_name || a.user_email || 'Monitored User',
            accountId: a.user_id || 'user-1',
            severity: a.risk_score > 0.8 ? 'Critical' : a.risk_score > 0.5 ? 'High' : 'Medium',
            time: new Date(a.created_at || Date.now()).toLocaleTimeString(),
            status: a.status === 'reviewed' ? 'Resolved' : 'Open',
            signal: a.alert_type || 'Behavioral'
          }));
          setItems(mapped);
          setOpenAlertsCount(mapped.filter((i) => i.status !== 'Resolved').length);
        }
      } catch (e) {
        console.warn("Using active alert queue");
      }
    }
    loadAlerts();
  }, []);

  const openCount = items.filter(i => i.status === 'Open').length;
  const investigatingCount = items.filter(i => i.status === 'Investigating').length;
  const resolvedCount = items.filter(i => i.status === 'Resolved').length;
  const unresolvedTotal = openCount + investigatingCount;

  const filtered = items.filter((item) => (filter === 'All' || item.status === filter) && `${item.title} ${item.account} ${item.id}`.toLowerCase().includes(search.toLowerCase()));
  const updateAlert = async (id: string, status: AlertItem['status']) => {
    try {
      const action = status === 'Resolved' ? 'approve' : 'reject';
      await adminApi.reviewAlert(id, action, `Reviewed by Admin: ${status}`);
    } catch (e) {}
    setItems((current) => {
      const updated = current.map((item) => item.id === id ? { ...item, status } : item);
      setOpenAlertsCount(updated.filter(i => i.status !== 'Resolved').length);
      return updated;
    });
    notify(status === 'Resolved' ? 'Alert resolved and logged' : 'Alert moved to investigation');
  };

  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-semibold text-muted-foreground">Live queue · {unresolvedTotal} require attention</p><h2 className="mt-1 text-[26px] font-extrabold tracking-[-.055em]">Risk alerts</h2><p className="mt-1 text-[12px] text-muted-foreground">Triage signals before they become customer impact.</p></div><div className="flex items-center gap-2"><Badge tone="critical"><span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />{openCount} open</Badge></div></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricCard label="Open alerts" value={openCount.toString()} delta={`${openCount} active`} detail="awaiting review" icon={Bell} positive={false} /><MetricCard label="Investigating" value={investigatingCount.toString()} delta={`${investigatingCount} active`} detail="in progress triage" icon={Clock3} /><MetricCard label="Resolved today" value={resolvedCount.toString()} delta={`${resolvedCount} closed`} detail="actioned alerts" icon={CheckCircle2} /><MetricCard label="False positive rate" value="4.8%" delta="0.7%" detail="this month" icon={ShieldCheck} /></div>
    <div className="card-surface overflow-hidden rounded-xl"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5"><div className="flex items-center gap-2"><button type="button" onClick={() => setFilter('All')} className={`rounded-md px-3 py-2 text-[11px] font-bold ${filter === 'All' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>All <span className="mono ml-1 opacity-60">{items.length}</span></button><button type="button" onClick={() => setFilter('Open')} className={`rounded-md px-3 py-2 text-[11px] font-bold ${filter === 'Open' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Open <span className="mono ml-1 opacity-60">{openCount}</span></button><button type="button" onClick={() => setFilter('Investigating')} className={`rounded-md px-3 py-2 text-[11px] font-bold ${filter === 'Investigating' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Investigating <span className="mono ml-1 opacity-60">{investigatingCount}</span></button><button type="button" onClick={() => setFilter('Resolved')} className={`rounded-md px-3 py-2 text-[11px] font-bold ${filter === 'Resolved' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Resolved <span className="mono ml-1 opacity-60">{resolvedCount}</span></button></div><label className="relative flex w-full sm:w-[245px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search alerts…" className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-[11px] outline-none focus:border-primary" /></label></div><div className="divide-y divide-border">{filtered.map((alert) => <div key={alert.id} className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-muted/30 sm:p-5"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${alert.severity === 'Critical' ? 'bg-red-500/14 text-red-600 dark:text-red-300' : alert.severity === 'High' ? 'bg-orange-500/14 text-orange-600 dark:text-orange-300' : 'bg-amber-400/15 text-amber-700 dark:text-amber-300'}`}><AlertTriangle size={18} /></span><div className="min-w-[220px] flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[12px] font-extrabold">{alert.title}</p><Badge tone={alert.severity === 'Critical' ? 'critical' : alert.severity === 'High' ? 'high' : 'medium'}>{alert.severity}</Badge></div><p className="mt-1 text-[11px] text-muted-foreground">{alert.detail}</p><p className="mono mt-2 text-[10px] text-muted-foreground">{alert.id} · <span className="font-sans font-bold text-foreground">{alert.account}</span> · {alert.time}</p></div><div className="flex items-center gap-2 sm:ml-auto"><Badge tone={alert.status === 'Resolved' ? 'success' : alert.status === 'Investigating' ? 'review' : 'neutral'}>{alert.status}</Badge>{alert.status !== 'Resolved' ? <><button type="button" onClick={() => updateAlert(alert.id, alert.status === 'Open' ? 'Investigating' : 'Resolved')} className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[10px] font-bold hover:bg-muted">{alert.status === 'Open' ? <><Activity size={12} />Investigate</> : <><Check size={12} />Resolve</>}</button><button type="button" onClick={() => updateAlert(alert.id, 'Resolved')} className="hidden h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-primary/15 sm:flex"><Check size={13} /></button></> : <button type="button" onClick={() => updateAlert(alert.id, 'Open')} className="h-8 rounded-md border border-border px-2.5 text-[10px] font-bold hover:bg-muted">Reopen</button>}</div></div>)}{filtered.length === 0 ? <div className="p-12 text-center"><CheckCircle2 size={25} className="mx-auto text-primary" /><p className="mt-3 text-sm font-bold">Queue is clear</p><p className="mt-1 text-xs text-muted-foreground">No alerts match your current filters.</p></div> : null}</div></div>
  </div>;
}

function Transactions() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'All' | Transaction['status']>('All');
  const [direction, setDirection] = useState<'All' | Transaction['type']>('All');
  const [txns, setTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    async function loadFlagged() {
      try {
        const res = await adminApi.flaggedTransactions();
        if (res?.data?.transactions) {
          setTxns(res.data.transactions.map((t: any) => ({
            id: t.id || t._id || 'TXN-101',
            accountId: t.user_id || 'user-1',
            customer: t.user_name || 'Customer',
            type: 'Debit',
            counterparty: t.payee_upi || 'payee@upi',
            amount: `₹${(t.amount || 0).toLocaleString()}`,
            rawAmount: t.amount || 0,
            status: t.status === 'blocked' ? 'Blocked' : t.status === 'paused' ? 'Review' : 'Cleared',
            risk: t.risk_level === 'critical' ? 'High' : 'Medium',
            time: new Date(t.created_at || Date.now()).toLocaleString(),
            channel: 'UPI'
          })));
        }
      } catch (e) {}
    }
    loadFlagged();
  }, []);

  const filtered = txns.filter((item) => (status === 'All' || item.status === status) && (direction === 'All' || item.type === direction) && `${item.id} ${item.customer} ${item.counterparty}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6">
    <div><p className="text-[11px] font-semibold text-muted-foreground">Live Gateway Feed</p><h2 className="mt-1 text-[26px] font-extrabold tracking-[-.055em]">Transaction monitoring</h2><p className="mt-1 text-[12px] text-muted-foreground">A live view of movement that needs context.</p></div>
    <div className="card-surface overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <label className="relative flex w-full sm:w-[245px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID or payee…" className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-[11px] outline-none focus:border-primary" /></label>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] text-left"><thead className="bg-muted/50 text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground"><tr><th className="px-5 py-3">Transaction</th><th className="px-5 py-3">Counterparty</th><th className="px-5 py-3">Channel</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Risk</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-border">{filtered.map((transaction) => <tr key={transaction.id} className="text-[11px] hover:bg-muted/35"><td className="mono px-5 py-3">{transaction.id}<p className="mt-0.5 font-sans text-[10px] text-muted-foreground">{transaction.time}</p></td><td className="px-5 py-3 font-semibold">{transaction.counterparty}</td><td className="px-5 py-3 text-muted-foreground">{transaction.channel}</td><td className="mono px-5 py-3 font-bold">{transaction.amount}</td><td className="px-5 py-3"><RiskBadge risk={transaction.risk} /></td><td className="px-5 py-3"><Badge tone={transaction.status === 'Cleared' ? 'success' : transaction.status === 'Blocked' ? 'critical' : 'review'}>{transaction.status}</Badge></td></tr>)}</tbody>
        </table>
      </div>
      {filtered.length === 0 ? <div className="p-12 text-center"><CheckCircle2 size={25} className="mx-auto text-primary" /><p className="mt-3 text-sm font-bold">No flagged transactions</p></div> : null}
    </div>
  </div>;
}

function Analytics() {
  const riskReasons = [{ name: 'High-risk entities', value: 42 }, { name: 'Unusual pattern', value: 28 }, { name: 'First-time payee', value: 16 }, { name: 'High-value burst', value: 8 }, { name: 'Other', value: 6 }];
  return <div className="space-y-6">
    <div><p className="text-[11px] font-semibold text-muted-foreground">Portfolio intelligence · live signal monitoring</p><h2 className="mt-1 text-[26px] font-extrabold tracking-[-.055em]">Risk analytics</h2><p className="mt-1 text-[12px] text-muted-foreground">Understand where the branch is accumulating exposure.</p></div>
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="card-surface rounded-xl p-5"><SectionHeading eyebrow="Risk movement" title="Average portfolio score" detail="Portfolio score tracking across monitored database accounts" action={<Badge tone="high"><TrendingUp size={12} className="mr-1" />+7.4%</Badge>} /><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={scoreTrend} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><YAxis domain={[0,100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} /><Line type="monotone" dataKey="score" stroke="#94d900" strokeWidth={3} dot={{ r: 3, fill: '#beff50', stroke: '#6a9400' }} /></LineChart></ResponsiveContainer></div></div>
      <div className="card-surface rounded-xl p-5"><SectionHeading eyebrow="Concentration" title="Risk reasons" detail="Share of triggered signals" /><div className="h-[165px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={riskReasons} layout="vertical" margin={{ top: 0, right: 20, left: 5, bottom: 0 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><Bar dataKey="value" fill="#beff50" radius={[0,4,4,0]} label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--foreground))' }} /></BarChart></ResponsiveContainer></div></div>
    </div>
  </div>;
}

function Settings() {
  const { notify } = useFeedback();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [digest, setDigest] = useState(true);
  const [sensitive, setSensitive] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); notify('System settings saved'); window.setTimeout(() => setSaved(false), 2200); };
  const ToggleRow = ({ id, title, detail, value, onChange }: { id: string; title: string; detail: string; value: boolean; onChange: (value: boolean) => void }) => <div className="flex items-center gap-4 border-b border-border py-4 last:border-0"><div className="min-w-0 flex-1"><p className="text-[12px] font-bold">{title}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div><button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`relative h-6 w-11 shrink-0 rounded-full p-1 transition-colors ${value ? 'bg-primary' : 'bg-muted'}`}><span className={`block h-4 w-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>;
  return <div className="space-y-6"><div><p className="text-[11px] font-semibold text-muted-foreground">Workspace preferences · Admin only</p><h2 className="mt-1 text-[26px] font-extrabold tracking-[-.055em]">System settings</h2></div><div className="card-surface rounded-xl p-5 sm:p-6"><SectionHeading eyebrow="Workspace" title="Monitoring preferences" /><ToggleRow id="auto-refresh" title="Live queue refresh" detail="Refresh account signals and alert counts every 60 seconds." value={autoRefresh} onChange={setAutoRefresh} /><ToggleRow id="daily-digest" title="Daily risk digest" detail="Send a compact review summary at 8:30 AM on business days." value={digest} onChange={setDigest} /></div><div className="flex justify-end"><button type="button" onClick={save} className="lime-mark flex h-10 items-center gap-2 rounded-lg px-5 text-[11px] font-extrabold">{saved ? <Check size={15} /> : null}{saved ? 'Saved' : 'Save changes'}</button></div></div>;
}

function CalendarIcon({ size = 14 }: { size?: number }) {
  return <Clock3 size={size} />;
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div className="fixed bottom-5 right-5 z-[60] flex max-w-[300px] items-center gap-3 rounded-xl border border-primary/35 bg-card px-4 py-3 text-[11px] font-bold shadow-xl"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={13} /></span><span className="flex-1">{message}</span><button type="button" onClick={onDismiss} className="text-muted-foreground hover:text-foreground"><X size={14} /></button></div>;
}

function AdminLoginScreen({ onLoginSuccess, theme }: { onLoginSuccess: () => void; theme: Theme }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { notify } = useFeedback();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      notify('Passcode is required');
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.login({
        email: 'admin@sih2026.com',
        password: password
      });
      
      if (res.data?.access_token) {
        localStorage.setItem('rakshapay_token', res.data.access_token);
        localStorage.setItem('rakshapay_role', res.data.role);
        localStorage.setItem('rakshapay_name', res.data.full_name || 'Admin');
        notify('Workspace Decrypted. Welcome, Administrator!');
        onLoginSuccess();
        window.setTimeout(() => window.location.reload(), 100);
      } else {
        notify('Failed to authenticate');
      }
    } catch (err: any) {
      notify(err.detail || err.message || 'Invalid admin passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 dark:bg-black select-none">
      <div className="card-surface w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border">
        <div className="flex flex-col items-center text-center">
          <span className="lime-mark flex h-12 w-12 items-center justify-center rounded-2xl mb-4">
            <LockKeyhole size={24} className="text-primary-foreground dark:text-primary" />
          </span>
          <h2 className="text-2xl font-extrabold tracking-[-.055em]">Control Room Decryption</h2>
          <p className="mt-2 text-xs text-muted-foreground max-w-xs">
            Entering security perimeter. Enter bank administrator passcode to decrypt workspace.
          </p>
        </div>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••"
              className="w-full h-11 rounded-lg border border-border bg-background px-3.5 font-bold outline-none focus:border-primary text-center tracking-[0.2em] text-lg"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg lime-mark font-extrabold text-[12px] uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {loading ? 'Decrypting...' : 'Decrypt Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AppRouter({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return <Shell theme={theme} onToggle={onToggle}><Switch><Route path="/" component={Dashboard} /><Route path="/accounts" component={AccountsList} /><Route path="/accounts/:id" component={AccountDetail} /><Route path="/alerts" component={Alerts} /><Route path="/transactions" component={Transactions} /><Route path="/analytics" component={Analytics} /><Route path="/settings" component={Settings} /><Route component={NotFound} /></Switch></Shell>;
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('rakshapay-theme') as Theme) || 'light');
  const [toast, setToast] = useState('');
  const [openAlertsCount, setOpenAlertsCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('rakshapay_token');
  });

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('rakshapay-theme', theme); }, [theme]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(timer); }, [toast]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchInitialAlerts() {
      try {
        const res = await adminApi.alerts();
        if (res?.data?.alerts) {
          const open = res.data.alerts.filter((a: any) => a.status !== 'reviewed' && a.status !== 'Resolved').length;
          setOpenAlertsCount(open);
        }
      } catch (e) {}
    }
    fetchInitialAlerts();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <FeedbackContext.Provider value={{ notify: setToast, openAlertsCount, setOpenAlertsCount }}>
        <AdminLoginScreen onLoginSuccess={() => setIsAuthenticated(true)} theme={theme} />
        {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
      </FeedbackContext.Provider>
    );
  }

  return (
    <FeedbackContext.Provider value={{ notify: setToast, openAlertsCount, setOpenAlertsCount }}>
      <Router base={(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}>
        <AppRouter theme={theme} onToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
      </Router>
      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </FeedbackContext.Provider>
  );
}

export default App;