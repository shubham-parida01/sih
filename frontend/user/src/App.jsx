import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import PersonalDashboard from './components/PersonalDashboard';
import AccountBalancePage from './components/AccountBalancePage';
import PaymentScreen from './components/PaymentScreen';
import Profile from './components/Profile';
import TransactionComplete from './components/TransactionComplete';
import TransactionFailed from './components/TransactionFailed';
import InterventionModal from './components/InterventionModal';

// --- SECURITY FEATURE 1: State & Input Sanitization Helper (XSS Protection) ---
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/javascript:/gi, '')
    .trim();
}

// --- SECURITY FEATURE 2: Bank-Grade Auto-Logout Hook (2 Min Idle Timeout) ---
function useIdleTimeout(onTimeout, idleTimeMs = 120000, isEnabled = true) {
  const handleTimeout = useCallback(() => {
    if (isEnabled && onTimeout) {
      onTimeout();
    }
  }, [isEnabled, onTimeout]);

  useEffect(() => {
    if (!isEnabled) return;

    let timer = setTimeout(handleTimeout, idleTimeMs);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handleTimeout, idleTimeMs);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [handleTimeout, idleTimeMs, isEnabled]);
}

// --- SECURITY FEATURE 3: Protected Route Component Wrapper ---
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// Main App Flow Component
function AppFlow() {
  const navigate = useNavigate();

  // Authentication State (Simulated - Defaulted to true for smooth testing)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('rakshapay_auth') !== 'false';
  });

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

  useEffect(() => {
    localStorage.setItem('rakshapay_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  // Handler for Auto-Logout Security Timeout
  const handleIdleLogout = useCallback(() => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
      toast.error('Session expired due to 2m inactivity. Please sign in again.', {
        duration: 4000,
        style: {
          background: 'var(--color-off-black-ink)',
          color: 'var(--color-pure-white)',
          border: '1px solid var(--color-steel)',
        },
      });
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Activate 2-minute idle auto-logout hook when authenticated
  useIdleTimeout(handleIdleLogout, 120000, isAuthenticated);

  // Centralized state for the Intervention Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    amount: '',
    upiId: '',
    telemetry: {}
  });

  // Handler for when the "Student Model" flags a transaction
  const handleTriggerIntervention = (data) => {
    const sanitizedAmount = sanitizeInput(data?.amount || '25,000');
    const sanitizedUpi = sanitizeInput(data?.upiId || 'ramesh@upi');
    setModalData({
      amount: sanitizedAmount,
      upiId: sanitizedUpi,
      telemetry: data?.telemetry || {}
    });
    setIsModalOpen(true);
  };

  // Handler for a safe transaction (no coercion detected)
  const handlePaymentSuccess = (data) => {
    const sanitizedAmount = sanitizeInput(data?.amount || '25,000');
    const sanitizedUpi = sanitizeInput(data?.upiId || 'ramesh@upi');

    toast.success('Safe Transaction! Money sent successfully.', {
      style: {
        background: 'var(--color-off-black-ink)',
        color: 'var(--color-pure-white)',
      },
      iconTheme: {
        primary: 'var(--color-electric-lime)',
        secondary: 'black',
      },
    });

    navigate('/success', { 
      state: { 
        amount: sanitizedAmount, 
        upiId: sanitizedUpi,
        payee: 'Ramesh Kumar',
        txnId: `TXN-${Math.floor(100000000000 + Math.random() * 900000000000)}`
      } 
    });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  return (
    <div className="bg-[var(--color-pure-white)] dark:bg-[var(--color-obsidian)] text-[var(--color-off-black-ink)] dark:text-[var(--color-cloud)] min-h-screen relative font-sans transition-colors duration-300">
      <Toaster position="top-center" />
      <Routes>
        {/* Step 1: Pre-Login Landing Page */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              onSignIn={() => navigate('/auth')} 
              isDark={isDark}
              setIsDark={setIsDark}
            />
          } 
        />

        {/* Step 2: Auth Screen (Login/Sign Up) */}
        <Route 
          path="/auth" 
          element={
            <AuthScreen 
              onLogin={handleLogin} 
              isDark={isDark}
              setIsDark={setIsDark}
            />
          } 
        />
        
        {/* Step 4: Post-Login Personal Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PersonalDashboard 
                onNavigatePay={() => navigate('/app')} 
                isDark={isDark}
                setIsDark={setIsDark}
              />
            </ProtectedRoute>
          } 
        />

        {/* Step 3: User Profile Page */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile 
                onBack={() => navigate('/dashboard')} 
                isDark={isDark}
                setIsDark={setIsDark}
              />
            </ProtectedRoute>
          } 
        />

        {/* Step 5: Bank Account Balance & Transactions Page */}
        <Route 
          path="/balance" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AccountBalancePage 
                onBack={() => navigate('/dashboard')} 
                isDark={isDark}
                setIsDark={setIsDark}
              />
            </ProtectedRoute>
          } 
        />

        {/* Step 6: Pay Someone Page / Consumer Banking App */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PaymentScreen 
                onTriggerIntervention={handleTriggerIntervention}
                onPaymentSuccess={handlePaymentSuccess}
                isDark={isDark}
                setIsDark={setIsDark}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PaymentScreen 
                onTriggerIntervention={handleTriggerIntervention}
                onPaymentSuccess={handlePaymentSuccess}
                isDark={isDark}
                setIsDark={setIsDark}
              />
            </ProtectedRoute>
          } 
        />

        {/* Step 7: Transaction Complete (Success Screen) */}
        <Route 
          path="/success" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TransactionComplete 
                onReturnHome={() => navigate('/dashboard')} 
                isDark={isDark}
                setIsDark={setIsDark}
              />
            </ProtectedRoute>
          } 
        />

        {/* Step 8 & 9: Transaction Failed / Intervention Result Screen */}
        <Route 
          path="/failed" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TransactionFailed 
                onRetry={() => navigate('/app')} 
                onReturnHome={() => navigate('/dashboard')} 
                isDark={isDark}
                setIsDark={setIsDark}
              />
            </ProtectedRoute>
          } 
        />
      </Routes>

      {/* Step 9: The Global Shield Intervention Modal */}
      <InterventionModal 
        isOpen={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          navigate('/failed', {
            state: {
              amount: sanitizeInput(modalData.amount || '25,000'),
              payee: sanitizeInput(modalData.upiId || 'ramesh@upi'),
              reason: 'Coercion Detection Intervention Triggered',
              errorCode: 'ERR_COERCION_SHIELD_INTERVENTION'
            }
          });
        }}
        onProceed={() => {
          setIsModalOpen(false);
          toast.error('User Overrode Shield: Transaction forced through.', {
            style: {
              background: 'var(--color-alert-red)',
              color: 'var(--color-pure-white)',
            },
          });
          navigate('/success', {
            state: {
              amount: sanitizeInput(modalData.amount || '25,000'),
              upiId: sanitizeInput(modalData.upiId || 'ramesh@upi'),
              payee: 'Ramesh Kumar (Override)',
              txnId: `TXN-OVERRIDE-${Math.floor(100000000000 + Math.random() * 900000000000)}`
            }
          });
        }}
        amount={modalData.amount}
        payee="Ramesh Kumar"
        upiId={modalData.upiId}
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

