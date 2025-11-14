
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, addDoc, doc, setDoc, query } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/firebase';
import { Lead } from '../types';
import { useAuth } from './AuthContext';
import { MOCK_LEADS } from '../constants';

const USERS_STORAGE_KEY = 'projectprospect_users';


interface LeadsContextType {
    leads: Lead[];
    addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
    updateLead: (updatedLead: Lead) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const { authUser, userProfile, isDemoUser, setUserProfile } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);

    useEffect(() => {
        if (isDemoUser) {
             const savedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
             if (savedUsersRaw) {
                const savedUsers: any[] = JSON.parse(savedUsersRaw);
                const demoUser = savedUsers.find(u => u.isDemo);
                if (demoUser && demoUser.leads) {
                    setLeads(demoUser.leads);
                    return;
                }
             }
             setLeads(MOCK_LEADS);
             return;
        }
        
        if (!authUser) {
            setLeads([]);
            return;
        }

        const leadsCollectionRef = collection(db, 'users', authUser.uid, 'leads');
        const q = query(leadsCollectionRef);
        const unsubscribeLeads = onSnapshot(q, (snapshot) => {
            const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
            setLeads(leadsData);
        }, (error) => {
            console.error("Error fetching leads:", error);
        });

        return () => unsubscribeLeads();
    }, [authUser, isDemoUser]);

    const updateDemoUserInStorage = (updatedProfile: any) => {
        const savedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
        let allUsers: any[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        const existingUserIndex = allUsers.findIndex(u => u.id === updatedProfile.id);
        if (existingUserIndex > -1) {
          allUsers[existingUserIndex] = updatedProfile;
        } else {
          allUsers.push(updatedProfile);
        }
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
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
    
    const value = {
        leads,
        addLead,
        updateLead,
    };

    return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
};

export const useLeads = () => {
    const context = useContext(LeadsContext);
    if (context === undefined) {
        throw new Error('useLeads must be used within a LeadsProvider');
    }
    return context;
};
