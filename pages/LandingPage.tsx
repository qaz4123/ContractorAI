
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ContactUsModal from '../components/ContactUsModal';

interface LandingPageProps {}

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = () => {
    const [isContactModalOpen, setContactModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* FIX: Removed `user` and `onLogout` props as they are not defined on the Header component and are handled by the AuthContext within the Header itself. */}
            <Header />
            
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-slate-900 pt-24 pb-32 px-4">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                     <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 to-slate-950"></div>
                    <div className="relative max-w-5xl mx-auto text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-semibold mb-6 border border-indigo-500/30 backdrop-blur-md">
                            The OS for Modern Contractors
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                            Win Better Jobs,<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Faster than Ever before.</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                            Stop chasing bad leads. Use AI to instantly qualify homeowners, generate detailed property dossiers, and offer integrated financing on the spot.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                             <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 hover:scale-105">
                                Start Your Free Trial
                            </Link>
                            <Link to="/pricing" className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10">
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Social Proof / Stats Strip */}
                <div className="bg-white py-8 border-b border-slate-100">
                    <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-8 text-slate-500 font-semibold uppercase tracking-widest text-xs sm:text-sm">
                        <span>Trusted by 1,000+ Contractors</span>
                        <span className="hidden md:inline text-slate-300">&bull;</span>
                        <span>$50M+ in Projects Financed</span>
                        <span className="hidden md:inline text-slate-300">&bull;</span>
                        <span>Average 30% Higher Close Rate</span>
                    </div>
                </div>

                {/* Features Grid */}
                <section className="py-24 px-4 bg-slate-50/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Your unfair advantage.</h2>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need to move from "lead" to "signed contract" in record time, all in one place.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                                title="AI Property Dossiers"
                                description="Instant deep-dives into any property. Know the homeowner's equity, mortgage details, and demographics before you even pick up the phone."
                            />
                             <FeatureCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                title="Embedded Financing"
                                description="Don't let budget kill the deal. Offer competitive monthly payment options from top lenders directly within your proposal workflow."
                            />
                             <FeatureCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                title="Full Lifecycle Management"
                                description="Track every lead from first contact to final payment. Manage quotes, change orders, and project schedules in one intuitive dashboard."
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto text-center text-white">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">Ready to upgrade your sales process?</h2>
                        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">Join thousands of contractors who are closing bigger jobs, faster.</p>
                         <Link to="/register" className="bg-white text-indigo-700 px-10 py-4 rounded-xl font-bold text-xl hover:bg-indigo-50 transition-all shadow-xl inline-block hover:scale-105">
                            Create Free Account
                        </Link>
                        <p className="mt-6 text-sm text-indigo-200 opacity-80 font-medium">No credit card required to start. Cancel anytime.</p>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                         <div className="flex items-center gap-2.5 mb-4">
                            <div className="bg-indigo-500 text-white p-2 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">ContractorAI</span>
                        </div>
                        <p className="text-sm">&copy; {new Date().getFullYear()} ContractorAI. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-start md:justify-end gap-x-8 gap-y-4 text-sm font-medium">
                        <Link to="/admin" className="text-slate-500 hover:text-indigo-400 transition-colors">Admin Demo</Link>
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <button onClick={() => setContactModalOpen(true)} className="hover:text-white transition-colors">Contact Us</button>
                    </div>
                </div>
            </footer>
            
            <ContactUsModal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)} />
        </div>
    );
};

export default LandingPage;