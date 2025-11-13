
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, SubscriptionTier, ServiceMessage } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getAggregatedStats } from '../services/analyticsService';

const USERS_STORAGE_KEY = 'projectprospect_users';
const MESSAGES_STORAGE_KEY = 'projectprospect_messages';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const StatCard: React.FC<{ title: string; value: string; subtext?: string; className?: string }> = ({ title, value, subtext, className }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 ${className}`}>
    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    {subtext && <p className="text-sm text-slate-500 mt-1">{subtext}</p>}
  </div>
);

const AdminDashboard: React.FC = () => {
    const [view, setView] = useState<'overview' | 'messages'>('overview');
    const [messages, setMessages] = useState<ServiceMessage[]>([]);

    const allUsers: User[] = useMemo(() => {
        const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        return savedUsers ? JSON.parse(savedUsers) : [];
    }, []);

    useEffect(() => {
        const savedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
        setMessages(savedMessages ? JSON.parse(savedMessages) : []);
    }, []);
    
    const unreadCount = useMemo(() => messages.filter(m => !m.isRead).length, [messages]);

    const aggregatedStats = useMemo(() => getAggregatedStats(), []);

    const stats = useMemo(() => {
        const totalUsers = allUsers.length;
        const proUsers = allUsers.filter(u => u.subscriptionTier === SubscriptionTier.Pro).length;
        const freeUsers = allUsers.filter(u => u.subscriptionTier === SubscriptionTier.Free).length;
        
        const mrr = proUsers * 49;

        let totalProjectedCommissions = 0;
        let totalLeads = 0;
        
        allUsers.forEach(user => {
            // FIX: The `leads` property on User is optional. Provide an empty array as a fallback.
            totalLeads += (user.leads || []).length;
            (user.leads || []).forEach(lead => {
                if (lead.projectedPlatformCommission) {
                    totalProjectedCommissions += lead.projectedPlatformCommission;
                }
            });
        });

        return {
            totalUsers,
            proUsers,
            freeUsers,
            mrr,
            totalProjectedCommissions,
            totalLeads
        };
    }, [allUsers]);

    const tierData = [
        { name: 'Free Tier', count: stats.freeUsers, color: '#94a3b8' },
        { name: 'Pro Tier ($49/mo)', count: stats.proUsers, color: '#4f46e5' },
    ];
    
    const handleMarkAsRead = (id: string) => {
        const updatedMessages = messages.map(msg => msg.id === id ? { ...msg, isRead: true } : msg);
        setMessages(updatedMessages);
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
    };
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-slate-900 text-white py-4 px-6 shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-500 p-1.5 rounded-lg">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Platform Admin</span>
                    </div>
                    <Link to="/" className="text-slate-300 hover:text-white text-sm font-semibold">Exit to App</Link>
                </div>
            </header>
            
             <div className="max-w-7xl mx-auto px-6 pt-6">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setView('overview')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm ${view === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            Business Overview
                        </button>
                        <button onClick={() => setView('messages')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm relative ${view === 'messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            Service Messages
                            {unreadCount > 0 && <span className="ml-2 bg-indigo-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{unreadCount}</span>}
                        </button>
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6">
                {view === 'overview' && (
                    <>
                        <h1 className="text-2xl font-bold text-slate-900 mb-6">Business Overview</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard title="Monthly Recurring Revenue (MRR)" value={formatCurrency(stats.mrr)} subtext="From Pro subscriptions" className="bg-indigo-50 border-indigo-100" />
                            <StatCard title="Projected Financing Commissions" value={formatCurrency(stats.totalProjectedCommissions)} subtext="Pending from lender referrals" className="bg-green-50 border-green-100" />
                            <StatCard title="Total Registered Users" value={stats.totalUsers.toString()} subtext={`${stats.totalLeads} total leads managed`} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4">User Subscription Tiers</h2>
                                <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={tierData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{fill: 'rgba(248, 250, 252, 0.5)'}} /><Bar dataKey="count" radius={[4, 4, 0, 0]}>{tierData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar></BarChart></ResponsiveContainer></div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent User Signups</h2>
                                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">{allUsers.slice().reverse().slice(0, 10).map(user => (<div key={user.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100"><div><p className="font-medium text-slate-900">{user.email}</p><p className="text-xs text-slate-500">ID: {user.id.substring(0, 8)}...</p></div><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${user.subscriptionTier === SubscriptionTier.Pro ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>{user.subscriptionTier}</span></div>))}{allUsers.length === 0 && <p className="text-slate-500 text-center">No users found.</p>}</div>
                            </div>
                        </div>
                         <h2 className="text-xl font-bold text-slate-900 mb-6 pt-6 border-t border-slate-200">Data Insights (Monetization)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard title="Properties Analyzed" value={aggregatedStats.totalPropertiesAnalyzed.toString()} className="bg-blue-50 border-blue-100" />
                            <StatCard title="Avg. Property Value" value={formatCurrency(aggregatedStats.avgPropertyValue)} className="bg-slate-50" />
                            <StatCard title="Avg. Homeowner Equity" value={formatCurrency(aggregatedStats.avgEquity)} className="bg-slate-50" />
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Trending Projects (Platform-wide)</h3>
                            {aggregatedStats.mostCommonProjects.length > 0 ? (<div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead><tr><th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project Name</th><th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Frequency</th><th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg. Estimated Cost</th></tr></thead><tbody className="bg-white divide-y divide-slate-100">{aggregatedStats.mostCommonProjects.map((project, index) => (<tr key={index}><td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{project.name}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{project.count}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{formatCurrency(project.avgCost)}</td></tr>))}</tbody></table></div>) : (<p className="text-slate-500 italic">Not enough data to determine trending projects.</p>)}
                        </div>
                    </>
                )}
                
                {view === 'messages' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Service Messages</h1>
                        <p className="text-sm text-slate-500 mb-6">Inquiries submitted from the "Contact Us" form.</p>
                        
                        <div className="space-y-4">
                            {messages.length > 0 ? messages.map(msg => (
                                <div key={msg.id} className={`p-4 rounded-lg border ${msg.isRead ? 'bg-slate-50 border-slate-200' : 'bg-indigo-50 border-indigo-200'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-800">{msg.name} <span className="text-sm font-normal text-slate-500">&lt;{msg.email}&gt;</span></p>
                                            <p className="text-xs text-slate-400">{formatDate(msg.timestamp)}</p>
                                        </div>
                                        {!msg.isRead && (
                                            <button onClick={() => handleMarkAsRead(msg.id)} className="text-xs bg-white text-slate-600 font-semibold px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100">
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-slate-700 mt-3 whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            )) : (
                                <p className="text-center text-slate-500 py-8">No service messages yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
