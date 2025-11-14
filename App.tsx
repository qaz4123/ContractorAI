import React, { useState, useEffect } from 'react';
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
import ApiKeyBanner from './components/ApiKeyBanner';

function App() {
  const { authUser, userProfile, isLoading, isDemoUser } = useAuth();
  const [showApiKeyBanner, setShowApiKeyBanner] = useState(false);

  useEffect(() => {
    // Check if the Google Maps API key is the placeholder value.
    // This indicates the user has not configured their own key yet.
    const apiKeyMeta = document.querySelector('meta[name="google-maps-api-key"]');
    if (apiKeyMeta?.getAttribute('content') === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setShowApiKeyBanner(true);
    }
  }, []);

   if (isLoading && !isDemoUser) {
    return <div className="flex items-center justify-center h-screen bg-slate-100"><div>Loading...</div></div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
        {showApiKeyBanner && <ApiKeyBanner />}
        {/* Add padding to the content area to prevent it from being obscured by the fixed banner */}
        <div className={showApiKeyBanner ? "pt-28 sm:pt-20" : ""}>
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