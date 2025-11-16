// FIX: Add missing React import to resolve "Cannot find namespace 'React'" error.
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DossierPage from './pages/DossierPage';
import AddLeadPage from './pages/AddLeadPage';
import AddLeadManuallyPage from './pages/AddLeadManuallyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import BillingPage from './pages/BillingPage';
import AdminDashboard from './pages/AdminDashboard';
import DemoBanner from './components/DemoBanner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LeadsProvider } from './contexts/LeadsContext';

function App() {
  const { authUser, userProfile, isLoading, isDemoUser } = useAuth();

   if (isLoading && !isDemoUser) {
    return <div className="flex items-center justify-center h-screen bg-slate-100"><div>Loading...</div></div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
        {isDemoUser && <DemoBanner />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!authUser ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {authUser && userProfile ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/dossier/:id" element={<DossierPage />} />
              <Route path="/add-lead" element={<AddLeadPage />} />
              <Route path="/add-lead-manually" element={<AddLeadManuallyPage />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          ) : (
             <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
    </div>
  );
}

const AppWithRouter: React.FC = () => (
  <HashRouter>
    <AuthProvider>
      <LeadsProvider>
        <App />
      </LeadsProvider>
    </AuthProvider>
  </HashRouter>
);

export default AppWithRouter;