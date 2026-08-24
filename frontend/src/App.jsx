import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import WalletPage from './pages/WalletPage';
import SendMoneyPage from './pages/SendMoneyPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import { getSession } from './services/api';

function ProtectedRoute({ children, requiredRole }) {
  const session = getSession();
  if (!session.token) return <Navigate to="/auth" replace />;
  if (requiredRole && session.role !== requiredRole) return <Navigate to="/wallet" replace />;
  return children;
}

export default function App() {
  useEffect(() => {
    // Silently pre-warm the production backend and ML service on Render
    const urls = [
      'https://sih-irpg.onrender.com/',
      'https://sih-ml-service-ibak.onrender.com/health'
    ];
    console.log('[RakshaPay App] Re-verifying active pre-warm states...');
    urls.forEach(url => {
      fetch(url, { mode: 'no-cors' }).catch(() => {});
    });
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/send" element={<ProtectedRoute><SendMoneyPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
