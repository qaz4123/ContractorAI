
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lead, Status } from '../types';

interface DashboardAnalyticsProps {
  leads: Lead[];
}

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; gradientFrom: string; gradientTo: string, iconColor: string }> = ({ title, value, icon, gradientFrom, gradientTo, iconColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className={`absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l ${gradientFrom} ${gradientTo} opacity-[0.08] skew-x-12 transform translate-x-12 group-hover:translate-x-10 transition-transform duration-500`}></div>
    <div className={`p-3.5 rounded-xl ${iconColor} bg-opacity-10 relative z-10`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: `h-7 w-7 ${iconColor}` })}
    </div>
    <div className="ml-5 relative z-10">
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-4xl font-extrabold text-slate-900 mt-1">{value}</p>
    </div>
  </div>
);

const STATUS_COLORS: { [key in Status]: string } = {
    [Status.New]: '#3b82f6', // blue-500
    [Status.Contacted]: '#6366f1', // indigo-500
    [Status.MeetingSet]: '#8b5cf6', // violet-500
    [Status.ProposalSent]: '#f97316', // orange-500
    [Status.PreQualified]: '#eab308', // yellow-500
    [Status.Won]: '#22c55e', // green-500
    [Status.Lost]: '#ef4444', // red-500
};

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ leads }) => {

    const analyticsData = useMemo(() => {
        if (leads.length === 0) {
            return {
                totalLeads: 0,
                winRate: 0,
                avgLeadScore: 0,
                statusCounts: []
            };
        }
        
        const totalLeads = leads.length;

        const wonLeads = leads.filter(l => l.status === Status.Won).length;
        const lostLeads = leads.filter(l => l.status === Status.Lost).length;
        const winRate = (wonLeads + lostLeads) > 0 ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100) : 0;
        
        const avgLeadScore = Math.round(leads.reduce((acc, lead) => acc + (lead.leadScoreValue || 0), 0) / totalLeads);
        
        const statusDistribution = Object.values(Status).map(status => ({
            name: status,
            count: leads.filter(lead => lead.status === status).length,
        }));
        
        return {
            totalLeads,
            winRate,
            avgLeadScore,
            statusCounts: statusDistribution.filter(s => s.count > 0)
        };

    }, [leads]);
    
    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <KpiCard
                    title="Total Leads"
                    value={analyticsData.totalLeads.toString()}
                    gradientFrom="from-blue-500"
                    gradientTo="to-indigo-500"
                    iconColor="text-blue-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                 <KpiCard
                    title="Win Rate"
                    value={`${analyticsData.winRate}%`}
                    gradientFrom="from-emerald-500"
                    gradientTo="to-teal-500"
                    iconColor="text-emerald-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                 <KpiCard
                    title="Avg. Lead Score"
                    value={analyticsData.avgLeadScore.toString()}
                    gradientFrom="from-violet-500"
                    gradientTo="to-purple-500"
                    iconColor="text-violet-600"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
            </div>

            {/* Status Chart */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Pipeline Status</h3>
                <div className="h-80">
                    {analyticsData.statusCounts.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.statusCounts} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(241, 245, 249, 0.4)'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '12px' }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {analyticsData.statusCounts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as Status]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           <p className="font-medium">No data to display yet.</p>
                           <p className="text-sm mt-1">Add leads to see your pipeline visualize here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;
