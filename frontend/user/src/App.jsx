import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import PaymentScreen from './components/PaymentScreen';
import InterventionModal from './components/InterventionModal';
import { transaction, getSession } from './services/api';

function AppFlow() {
  const navigate = useNavigate();
  
  // Global Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('rakshapay_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rakshapay_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rakshapay_theme', 'light');
    }
  }, [isDark]);

  // Centralized state for the Intervention Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    txnId: '',
    amount: '',
    upiId: '',
    payeeName: '',
    explanation: '',
    recommendation: '',
    factors: [],
  });

  // Check authentication
  const session = getSession();
  const isAuthenticated = !!session.token;

  // Handler for when transaction is paused by backend
  const handleTriggerIntervention = (data) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  // Handler for a safe transaction
  const handlePaymentSuccess = () => {
    toast.success('Money sent successfully!', {
      style: {
        background: 'var(--color-off-black-ink)',
        color: 'var(--color-pure-white)',
      },
      iconTheme: {
        primary: 'var(--color-electric-lime)',
        secondary: 'black',
      },
    });
  };

  // Confirm high-risk payment override
  const handleProceedOverride = async () => {
    try {
      if (modalData.txnId) {
        await transaction.confirm(modalData.txnId);
      }
      setIsModalOpen(false);
      toast.success('Transaction confirmed and sent successfully.', {
        style: {
          background: 'var(--color-electric-lime)',
          color: 'black',
        },
      });
    } catch (err) {
      toast.error(err.detail || err.message || 'Could not confirm transaction');
    }
  };

  // Cancel paused payment
  const handleCancelPayment = async () => {
    try {
      if (modalData.txnId) {
        await transaction.cancel(modalData.txnId);
      }
      setIsModalOpen(false);
      toast('Payment cancelled to protect your wallet.', {
        icon: '🛡️',
        style: {
          background: 'var(--color-off-black-ink)',
          color: 'var(--color-pure-white)',
        },
      });
    } catch (err) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-(--color-pure-white) dark:bg-(--color-obsidian) text-(--color-off-black-ink) dark:text-(--color-cloud) min-h-screen relative font-sans transition-colors duration-300">
      <Toaster position="top-center" />
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage 
              isDark={isDark} 
              setIsDark={setIsDark} 
            />
          } 
        />

        <Route 
          path="/auth" 
          element={
            <AuthScreen 
              onLogin={() => navigate('/app')} 
              isDark={isDark}
              setIsDark={setIsDark}
            />
          } 
        />
        
        <Route 
          path="/app" 
          element={
            isAuthenticated ? (
              <PaymentScreen 
                onTriggerIntervention={handleTriggerIntervention}
                onPaymentSuccess={handlePaymentSuccess}
                isDark={isDark}
                setIsDark={setIsDark}
                onLogout={() => navigate('/auth')}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>

      {/* The Shield Intervention Modal */}
      <InterventionModal 
        isOpen={isModalOpen}
        onCancel={handleCancelPayment}
        onProceed={handleProceedOverride}
        amount={modalData.amount}
        payee={modalData.payeeName || "Merchant"}
        upiId={modalData.upiId}
        explanation={modalData.explanation}
        recommendation={modalData.recommendation}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppFlow />
    </Router>
  );
}
