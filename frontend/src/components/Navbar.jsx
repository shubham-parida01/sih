import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Send, History, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSession, clearSession } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();

  const handleLogout = () => {
    clearSession();
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  const navItems = [
    { path: '/wallet', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/send', label: 'Pay Someone', icon: Send },
    { path: '/history', label: 'History', icon: History },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 cursor-pointer tap-press"
            >
              <ShieldCheck size={24} className="text-fintech-blue" />
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Raksha<span className="text-fintech-blue">Pay</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-6">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all tap-press ${
                      isActive 
                        ? 'text-fintech-blue bg-blue-50' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="hidden sm:inline-flex items-center text-xs font-bold text-fintech-blue bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 hover:bg-blue-100 transition-all"
              >
                Admin Panel
              </button>
            )}

            <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded-full px-3.5 py-1.5">
              {session.name || 'Account Active'}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all tap-press"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="flex md:hidden border-t border-slate-100 py-2 justify-around">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-lg transition-all ${
                  isActive ? 'text-fintech-blue' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
