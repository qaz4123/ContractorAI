
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as AuthUser } from 'firebase/auth';
import { doc, getDoc, setDoc, writeBatch, collection, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, SubscriptionTier } from '../types';
import { MOCK_LEADS } from '../constants';

const DEMO_SESSION_KEY = 'projectprospect_demo_session';
const USERS_STORAGE_KEY = 'projectprospect_users';

interface AuthContextType {
    authUser: AuthUser | null;
    userProfile: User | null;
    isLoading: boolean;
    isDemoUser: boolean;
    handleRegister: (details: {
        email: string;
        fullName: string;
        companyName?: string;
        industry?: string;
    }) => Promise<User>;
    handleDemoLogin: (calledFromInit?: boolean) => Promise<User | null>;
    handleLogout: () => void;
    upgradeTier: (tier: SubscriptionTier) => Promise<void>;
    setUserProfile: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
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
            } else {
                // If session says demo but no user data, create it.
                handleDemoLogin(true);
            }
            setIsLoading(false);
        }
    }, [isDemoUser]);

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
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isDemoUser]);

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
            email: 'demo@projectprospect.com',
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
        } else {
            auth.signOut();
        }
    };
    
    const upgradeTier = async (tier: SubscriptionTier) => {
        if (!authUser || !userProfile) return;
        const updatedUser: User = { ...userProfile, subscriptionTier: tier };
        if (isDemoUser) {
            setUserProfile(updatedUser);
            updateDemoUserInStorage({...updatedUser, leads: userProfile.leads});
            return;
        }
        const userDocRef = doc(db, 'users', authUser.uid);
        await updateDoc(userDocRef, { subscriptionTier: tier });
        setUserProfile(updatedUser);
    }
    
    const value = {
        authUser,
        userProfile,
        isLoading,
        isDemoUser,
        handleRegister,
        handleDemoLogin,
        handleLogout,
        upgradeTier,
        setUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};