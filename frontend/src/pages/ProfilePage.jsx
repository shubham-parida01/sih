import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, ShieldAlert, ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { user as userAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    upi_id: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userAPI.profile();
      setProfile({
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        upi_id: res.data.upi_id || '',
      });
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone || undefined,
        upi_id: profile.upi_id || undefined,
      });
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-height-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-fintech-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/wallet')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium tap-press"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="bg-white rounded-card shadow-fintech border border-slate-100 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-500 text-sm mb-8">Manage your digital identity and account details</p>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={profile.full_name} 
                  onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-fintech-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={profile.email} 
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-400 cursor-not-allowed text-sm font-medium"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Email address cannot be changed.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={profile.phone} 
                  onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +919876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-fintech-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">UPI ID</label>
              <div className="relative">
                <ShieldAlert className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={profile.upi_id} 
                  onChange={e => setProfile(prev => ({ ...prev, upi_id: e.target.value }))}
                  placeholder="e.g. name@upi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-fintech-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full btn btn-primary flex items-center justify-center gap-2 bg-fintech-blue hover:bg-fintech-blueHover text-white py-3.5 rounded-full font-semibold transition-all shadow-md text-sm tap-press"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Settings</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
