
import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User as AuthUser } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, setDoc, writeBatch, addDoc, query, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from './services/firebase';
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
import { Lead, User, SubscriptionTier } from './types';
import { MOCK_LEADS } from './constants';
import DemoBanner from './components/DemoBanner';

const DEMO_SESSION_KEY = 'contractorai_demo_session';
const USERS_STORAGE_KEY = 'contractorai_users';

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(() => !!sessionStorage.getItem(DEMO_SESSION_KEY));

  // Load demo data from localStorage if session is active
  useEffect(() => {
    if (isDemoUser) {
      const savedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const demoUser = savedUsers.find(u => u.isDemo);

      if (demoUser) {
        setAuthUser({ uid: demoUser.id } as AuthUser);
        setUserProfile(demoUser);
        setLeads(demoUser.leads || MOCK_LEADS);
      } else {
        // If session says demo but no user data, create it.
        handleDemoLogin(true); 
      }
      setIsLoading(false);
    }
  }, []);
  
  // Firebase Auth Listener (skipped in demo mode)
  useEffect(() => {
    if (isDemoUser) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setAuthUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profileData = userDoc.data() as User;
          setUserProfile(profileData);
          setIsDemoUser(!!profileData.isDemo);
        } else {
          console.log("No user profile found for UID:", user.uid);
          setUserProfile(null);
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
        setLeads([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoUser]);

  // Firestore Leads Listener (skipped in demo mode)
  useEffect(() => {
    if (isDemoUser || !authUser) return;

    const leadsCollectionRef = collection(db, 'users', authUser.uid, 'leads');
    const q = query(leadsCollectionRef);
    const unsubscribeLeads = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadsData);
    });

    return () => unsubscribeLeads();
  }, [authUser, isDemoUser]);

  const handleRegister = async (details: {
    email: string;
    fullName: string;
    companyName?: string;
    industry?: string;
  }): Promise<User> => {
    if (!auth.currentUser) {
        throw new Error("No authenticated user found.");
    }
    const newUserProfile: User = {
      id: auth.currentUser.uid,
      email: details.email,
      fullName: details.fullName,
      companyName: details.companyName,
      industry: details.industry,
      subscriptionTier: SubscriptionTier.Free,
    };
    await setDoc(doc(db, 'users', auth.currentUser.uid), newUserProfile);
    const batch = writeBatch(db);
    const leadsCollectionRef = collection(db, 'users', auth.currentUser.uid, 'leads');
    MOCK_LEADS.forEach(lead => {
        const newLeadRef = doc(leadsCollectionRef);
        const { id, ...leadData } = lead;
        batch.set(newLeadRef, leadData);
    });
    await batch.commit();
    setUserProfile(newUserProfile);
    return newUserProfile;
  };

  const updateDemoUserInStorage = (updatedProfile: User) => {
    const savedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    let allUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
    const existingUserIndex = allUsers.findIndex(u => u.id === updatedProfile.id);
    if (existingUserIndex > -1) {
      allUsers[existingUserIndex] = updatedProfile;
    } else {
      allUsers.push(updatedProfile);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
  };

  const handleDemoLogin = async (calledFromInit = false) => {
    const demoUID = 'demo-user-id';
    const demoUserProfile: User = {
        id: demoUID,
        email: 'demo@contractorai.com',
        fullName: 'Demo User',
        companyName: 'Demo Contracting Inc.',
        industry: 'General Contracting',
        subscriptionTier: SubscriptionTier.Pro,
        isDemo: true,
        leads: MOCK_LEADS,
    };
    updateDemoUserInStorage(demoUserProfile);
    sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
    setAuthUser({ uid: demoUID } as AuthUser);
    setUserProfile(demoUserProfile);
    setLeads(MOCK_LEADS);
    setIsDemoUser(true);
    if (!calledFromInit) return demoUserProfile;
    return null;
  };

  const handleLogout = () => {
    if (isDemoUser) {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      setIsDemoUser(false);
      setAuthUser(null);
      setUserProfile(null);
      setLeads([]);
      // The state change will trigger a re-render and the router will automatically redirect.
    } else {
      auth.signOut();
    }
  };
  
  const addLead = async (lead: Omit<Lead, 'id'>) => {
    if (isDemoUser && userProfile) {
      const newLead = { ...lead, id: uuidv4() };
      const updatedLeads = [newLead, ...leads];
      setLeads(updatedLeads);
      const updatedUser = { ...userProfile, leads: updatedLeads };
      setUserProfile(updatedUser);
      updateDemoUserInStorage(updatedUser);
      return;
    }
    if (!authUser) return;
    const leadsCollectionRef = collection(db, 'users', authUser.uid, 'leads');
    await addDoc(leadsCollectionRef, lead);
  };

  const updateLead = async (updatedLead: Lead) => {
    if (isDemoUser && userProfile) {
      const updatedLeads = leads.map(l => l.id === updatedLead.id ? updatedLead : l);
      setLeads(updatedLeads);
      const updatedUser = { ...userProfile, leads: updatedLeads };
      setUserProfile(updatedUser);
      updateDemoUserInStorage(updatedUser);
      return;
    }
    if (!authUser || !updatedLead.id) return;
    const { id, ...leadData } = updatedLead;
    const leadDocRef = doc(db, 'users', authUser.uid, 'leads', id);
    await setDoc(leadDocRef, leadData, { merge: true });
  };

  const upgradeTier = async (tier: SubscriptionTier) => {
      if (!authUser || !userProfile) return;
      const updatedUser = { ...userProfile, subscriptionTier: tier, leads };
      if (isDemoUser) {
        setUserProfile(updatedUser);
        updateDemoUserInStorage(updatedUser);
        return;
      }
      const userDocRef = doc(db, 'users', authUser.uid);
      await updateDoc(userDocRef, { subscriptionTier: tier });
      setUserProfile(updatedUser);
  }
  
   if (isLoading && !isDemoUser) {
    return <div className="flex items-center justify-center h-screen bg-slate-100"><div>Loading...</div></div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
        {isDemoUser && <DemoBanner />}
        <Routes>
          <Route path="/" element={<LandingPage user={userProfile} onLogout={handleLogout} />} />
          <Route path="/pricing" element={<PricingPage user={userProfile} onLogout={handleLogout} />} />
          <Route path="/login" element={!authUser ? <LoginPage onDemoLogin={handleDemoLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!authUser ? <RegisterPage onRegister={handleRegister} /> : <Navigate to="/dashboard" />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {authUser && userProfile ? (
            <>
              <Route path="/dashboard" element={<Dashboard user={userProfile} leads={leads} onLogout={handleLogout} />} />
              <Route path="/billing" element={<BillingPage user={userProfile} onLogout={handleLogout} onUpgrade={upgradeTier} />} />
              <Route path="/dossier/:id" element={<DossierPage user={userProfile} leads={leads} updateLead={updateLead} />} />
              <Route path="/add-lead" element={<AddLeadPage addLead={addLead} user={userProfile} />} />
              <Route path="/add-lead-manually" element={<AddLeadManuallyPage addLead={addLead} />} />
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
    <App />
  </HashRouter>
);

export default AppWithRouter;