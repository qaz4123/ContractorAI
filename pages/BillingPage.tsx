
import React, { useState } from 'react';
import { SubscriptionTier } from '../types';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

interface BillingPageProps {}

const BillingPage: React.FC<BillingPageProps> = () => {
    const { userProfile, upgradeTier } = useAuth();
    const [isUpgrading, setIsUpgrading] = useState(false);

    if (!userProfile) {
        return null; // Or loading state
    }
    const user = userProfile;

    const handleUpgradeToPro = () => {
        setIsUpgrading(true);
        // Simulate API call for payment processing
        setTimeout(() => {
            upgradeTier(SubscriptionTier.Pro);
            setIsUpgrading(false);
            alert("Successfully upgraded to Pro tier!");
        }, 2000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-100">
             <Header title="Billing & Subscription" showBackButton />

             <main className="flex-grow p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Current Plan</h2>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <p className="text-lg font-semibold text-slate-900">{user.subscriptionTier} Tier</p>
                                <p className="text-slate-600">
                                    {user.subscriptionTier === SubscriptionTier.Free 
                                        ? "Limited to 3 active leads." 
                                        : "Unlimited leads and full feature access."}
                                </p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${user.subscriptionTier === SubscriptionTier.Pro ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                                {user.subscriptionTier}
                            </div>
                        </div>

                        {user.subscriptionTier === SubscriptionTier.Free && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-slate-800 mb-2">Upgrade to Pro</h3>
                                <p className="text-slate-600 mb-4">Unlock unlimited leads, advanced AI features, and integrated financing tools for just $49/month.</p>
                                <button 
                                    onClick={handleUpgradeToPro}
                                    disabled={isUpgrading}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors flex items-center"
                                >
                                     {isUpgrading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                        </>
                                    ) : (
                                        "Upgrade to Pro - $49/mo"
                                    )}
                                </button>
                                <p className="text-xs text-slate-500 mt-2">Secure payment simulation. No real charge will be made.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 opacity-50 cursor-not-allowed">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Payment Methods</h2>
                        <p className="text-slate-500 italic">Payment method management is disabled in this demo.</p>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 opacity-50 cursor-not-allowed">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Billing History</h2>
                        <p className="text-slate-500 italic">No billing history available.</p>
                    </div>
                </div>
             </main>
        </div>
    );
};

export default BillingPage;
