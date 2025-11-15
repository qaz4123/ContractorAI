
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DossierPage from './pages/DossierPage';
import AddLeadPage from './pages/AddLeadPage';
import AddLeadManuallyPage from './pages/AddLeadManuallyPage';
import BulkAddLeadsPage from './pages/BulkAddLeadsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import BillingPage from './pages/BillingPage';
import AdminDashboard from './pages/AdminDashboard';
import DemoBanner from './components/DemoBanner';
import ApiKeyBanner from './components/ApiKeyBanner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LeadsProvider } from './contexts/LeadsContext';

// Define gm_authFailure on the window object for Google Maps API error handling
declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

function App() {
  const { authUser, userProfile, isLoading, isDemoUser } = useAuth();
  const [isMapsApiOk, setIsMapsApiOk] = useState(true);

  useEffect(() => {
    // This global function is called by the Google Maps script if auth fails.
    window.gm_authFailure = () => {
      setIsMapsApiOk(false);
    };
  }, []);

   if (isLoading && !isDemoUser) {
    return <div className="flex items-center justify-center h-screen bg-slate-100"><div>Loading...</div></div>;
  }

  return (
    <div className={`bg-slate-100 min-h-screen font-sans ${!isMapsApiOk ? 'pt-16 sm:pt-12' : ''}`}>
        {!isMapsApiOk && <ApiKeyBanner />}
        <div>
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
                  <Route path="/bulk-add-leads" element={<BulkAddLeadsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
              ) : (
                 <Route path="*" element={<Navigate to="/" />} />
              )}
            </Routes>
        </div>
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