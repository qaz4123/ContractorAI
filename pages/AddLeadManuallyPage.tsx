import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import { Lead, LeadScore, Status, FinancingStatus, Dossier, LeadSource } from '../types';
import { getCoordsFromAddress } from '../services/geminiService';

interface AddLeadManuallyPageProps {
    addLead: (lead: Omit<Lead, 'id'>) => void;
}

const AddLeadManuallyPage: React.FC<AddLeadManuallyPageProps> = ({ addLead }) => {
    const [ownerName, setOwnerName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let coords = { lat: 39.78, lng: -89.65 }; // Default coords
        if (address) {
            try {
                coords = await getCoordsFromAddress(address);
            } catch (error) {
                console.error("Could not geocode manual address, using default.", error);
            }
        }
        
        const minimalDossier: Dossier = {
            ownerName: ownerName || 'N/A',
            estimatedValue: 0,
            taxLiens: false,
            mortgageDetails: {
                originalLoanAmount: 0,
                loanYear: new Date().getFullYear(),
                lenderName: 'N/A',
                estimatedRate: 0,
                estimatedMonthlyPayment: 0,
            },
            propertyDetails: {
                yearBuilt: 0,
                sqFootage: 0,
                bedrooms: 0,
                bathrooms: 0,
                lastSaleDate: 'N/A',
                lastSalePrice: 0,
                lotSize: undefined,
                yearRenovated: undefined,
                hoaFees: undefined,
                propertyType: undefined,
                roofingMaterial: undefined,
                exteriorFinish: undefined,
                heatingSystem: undefined,
                coolingSystem: undefined,
            },
            demographics: {
                estHouseholdIncome: 'N/A',
                estOwnerAgeRange: 'N/A',
                lifeStageProfile: 'N/A',
                maritalStatus: 'N/A',
            },
            neighborhoodInfo: undefined,
            schoolRatings: undefined,
            recentPermits: undefined,
        };

        const newLead: Omit<Lead, 'id'> = {
            address: address || 'Address not provided',
            dossier: minimalDossier,
            estimatedEquity: 0,
            leadScore: LeadScore.C, // Default to C as there's no data
            leadScoreValue: 0,
            status: Status.New,
            financingStatus: FinancingStatus.NotOffered,
            coords,
            activityLog: [{ id: uuidv4(), timestamp: new Date().toISOString(), note: `Lead manually entered. Phone: ${phone || 'N/A'}, Email: ${email || 'N/A'}` }],
            groundingChunks: [],
            quote: undefined,
            source: LeadSource.Manual,
            isArchived: false,
            finances: [],
            propertyImage: undefined,
            schedule: undefined,
            changeOrders: [],
        };

        addLead(newLead);
        setIsLoading(false);
        navigate(`/dashboard`, { replace: true });
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100">
            <Header title="Add Lead Manually" showBackButton />

            <main className="flex-grow p-4 md:p-6">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-8">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">New Lead Details</h2>
                    <p className="text-sm text-slate-500 mb-6">Quickly add a lead with the information you have. You can add more details later.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700">Owner Name</label>
                            <input
                                type="text"
                                id="ownerName"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="e.g., Jane Smith"
                                className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="e.g., 456 Oak Ave, Anytown, USA"
                                className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g., 555-123-4567"
                                className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g., jane.smith@email.com"
                                className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-md font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 Saving...
                                </>
                            ) : (
                                "Save Lead"
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddLeadManuallyPage;