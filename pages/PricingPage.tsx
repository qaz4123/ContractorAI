
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { User, SubscriptionTier } from '../types';

interface PricingPageProps {
    user: User | null;
    onLogout: () => void;
}

const PricingCard: React.FC<{ 
    tier: string, 
    price: string, 
    description: string, 
    features: string[], 
    isPopular?: boolean,
    buttonText: string,
    buttonLink: string,
    isCurrent?: boolean
}> = ({ tier, price, description, features, isPopular, buttonText, buttonLink, isCurrent }) => (
    <div className={`bg-white rounded-2xl shadow-lg border relative flex flex-col ${isPopular ? 'border-indigo-500 scale-105 z-10' : 'border-slate-200'}`}>
        {isPopular && <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>}
        <div className="p-6 border-b border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900">{tier}</h3>
            <div className="mt-4 flex items-baseline text-slate-900">
                <span className="text-5xl font-extrabold tracking-tight">{price}</span>
                {price !== 'Custom' && <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>}
            </div>
            <p className="mt-2 text-slate-500">{description}</p>
        </div>
        <div className="flex-grow p-6">
            <ul className="space-y-4">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="h-6 w-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-slate-700">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div className="p-6 bg-slate-50 rounded-b-2xl">
            {isCurrent ? (
                 <div className="w-full block text-center bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-lg cursor-default">
                    Current Plan
                </div>
            ) : (
                <Link to={buttonLink} className={`w-full block text-center font-bold py-3 px-6 rounded-lg transition-colors ${isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
                    {buttonText}
                </Link>
            )}
        </div>
    </div>
);

const PricingPage: React.FC<PricingPageProps> = ({ user, onLogout }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header user={user} onLogout={onLogout} />
            
            <main className="flex-grow py-20 px-4">
                <div className="max-w-5xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Choose the plan that best fits your business needs. No hidden fees.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <PricingCard 
                        tier="Free"
                        price="$0"
                        description="Perfect for trying out the platform."
                        features={[
                            "3 Active Leads",
                            "Basic AI Dossiers",
                            "Standard Support",
                            "Manual Lead Entry"
                        ]}
                        buttonText={user ? "Your Current Plan" : "Start for Free"}
                        buttonLink={user ? "/dashboard" : "/register"}
                        isCurrent={user?.subscriptionTier === SubscriptionTier.Free}
                    />
                    <PricingCard 
                        tier="Pro"
                        price="$49"
                        description="For growing independent contractors."
                        features={[
                            "Unlimited Leads",
                            "Advanced AI Dossiers & Enrichment",
                            "Financing Integration",
                            "Quote & Change Order Management",
                            "Priority Support"
                        ]}
                        isPopular
                        buttonText={user ? "Upgrade Now" : "Get Started"}
                        buttonLink={user ? "/billing" : "/register"}
                         isCurrent={user?.subscriptionTier === SubscriptionTier.Pro}
                    />
                     <PricingCard 
                        tier="Enterprise"
                        price="Custom"
                        description="For large teams and organizations."
                        features={[
                            "Everything in Pro",
                            "Team Management",
                            "API Access",
                            "Dedicated Account Manager",
                            "Custom CRM Integrations"
                        ]}
                        buttonText="Contact Sales"
                        buttonLink="#"
                        isCurrent={user?.subscriptionTier === SubscriptionTier.Enterprise}
                    />
                </div>
            </main>
        </div>
    );
};

export default PricingPage;
