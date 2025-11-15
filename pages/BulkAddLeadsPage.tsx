
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import { Lead, LeadScore, Status, FinancingStatus, Dossier, LeadSource } from '../types';
import { generateDossier, getCoordsFromAddress } from '../services/geminiService';
import { calculateEquity, calculateLeadScore } from '../services/leadUtils';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../contexts/LeadsContext';

type ProcessedLead = Omit<Lead, 'id'>;
type SortKey = 'score-desc' | 'score-asc' | 'equity-desc';

const BulkAddLeadsPage: React.FC = () => {
    const { userProfile } = useAuth();
    const { addLead } = useLeads();
    const navigate = useNavigate();

    const [addressList, setAddressList] = useState('');
    const [processedLeads, setProcessedLeads] = useState<ProcessedLead[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [sortBy, setSortBy] = useState<SortKey>('score-desc');

    const handleProcessList = async () => {
        const addresses = addressList.split('\n').map(a => a.trim()).filter(a => a.length > 0);
        if (addresses.length === 0) {
            setError('Please enter at least one address.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setProgress({ current: 0, total: addresses.length });
        setProcessedLeads([]);

        const results: ProcessedLead[] = [];

        for (const [index, address] of addresses.entries()) {
            setProgress({ current: index + 1, total: addresses.length });
            try {
                const coords = await getCoordsFromAddress(address);
                const { dossier, groundingChunks } = await generateDossier(address, userProfile?.industry, coords);
                
                const estimatedEquity = calculateEquity(dossier);
                const { score: leadScore, value: leadScoreValue, uncertainty: leadScoreUncertainty } = calculateLeadScore(dossier, estimatedEquity);

                const newLead: ProcessedLead = {
                    address,
                    dossier,
                    estimatedEquity,
                    leadScore,
                    leadScoreValue,
                    leadScoreUncertainty,
                    status: Status.New,
                    financingStatus: FinancingStatus.NotOffered,
                    coords,
                    activityLog: [{ id: uuidv4(), timestamp: new Date().toISOString(), note: 'Lead generated from bulk add.' }],
                    groundingChunks,
                    source: LeadSource.AI,
                    isArchived: false,
                    finances: [],
                    schedule: undefined,
                    changeOrders: [],
                    propertyImage: undefined,
                    quote: undefined,
                };
                results.push(newLead);
                setProcessedLeads([...results]);

            } catch (err) {
                results.push({
                    address: `${address} (Failed)`,
                    dossier: { ownerName: 'Error' } as Dossier,
                    leadScore: LeadScore.C,
                    leadScoreValue: 0,
                    estimatedEquity: 0,
                } as ProcessedLead);
                 setProcessedLeads([...results]);
                console.error(`Failed to process address "${address}":`, err);
            }
        }

        setIsProcessing(false);
    };
    
    const handleSaveLeads = async () => {
        setIsSaving(true);
        const leadsToSave = processedLeads.filter(lead => lead.dossier.ownerName !== 'Error');
        for (const lead of leadsToSave) {
            await addLead(lead);
        }
        setIsSaving(false);
        navigate('/dashboard');
    };

    const sortedLeads = useMemo(() => {
        const sorted = [...processedLeads];
        switch (sortBy) {
            case 'score-desc':
                return sorted.sort((a, b) => (b.leadScoreValue || 0) - (a.leadScoreValue || 0));
            case 'score-asc':
                return sorted.sort((a, b) => (a.leadScoreValue || 0) - (b.leadScoreValue || 0));
            case 'equity-desc':
                return sorted.sort((a, b) => (b.estimatedEquity || 0) - (a.estimatedEquity || 0));
            default:
                return sorted;
        }
    }, [processedLeads, sortBy]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    
    const scoreColors = {
        [LeadScore.A]: 'bg-green-100 text-green-800',
        [LeadScore.B]: 'bg-yellow-100 text-yellow-800',
        [LeadScore.C]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-100">
            <Header title="Bulk Add Leads" showBackButton />

            <main className="flex-grow p-4 md:p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">1. Paste Address List</h2>
                        <p className="text-sm text-slate-500 mb-4">Enter one full US address per line. The more addresses you add, the longer processing will take.</p>
                        <textarea
                            value={addressList}
                            onChange={(e) => setAddressList(e.target.value)}
                            placeholder={"123 Maple St, Springfield, IL\n789 Oak Ave, Shelbyville, IL"}
                            className="w-full h-40 px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono disabled:bg-slate-50"
                            disabled={isProcessing}
                        />
                        <button
                            onClick={handleProcessList}
                            disabled={isProcessing || !addressList.trim()}
                            className="w-full mt-4 bg-indigo-600 text-white py-2.5 px-4 rounded-md font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isProcessing ? `Processing ${progress.current} of ${progress.total}...` : 'Process List with AI'}
                        </button>
                    </div>

                    {isProcessing && (
                         <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                        </div>
                    )}

                    {processedLeads.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                                <h2 className="text-xl font-semibold text-slate-800">2. Review & Save Leads</h2>
                                 <div>
                                    <label htmlFor="sort-by" className="text-sm font-medium text-slate-600 mr-2">Sort by:</label>
                                    <select
                                        id="sort-by"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortKey)}
                                        className="text-sm p-1.5 border-slate-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="score-desc">Score (High to Low)</option>
                                        <option value="score-asc">Score (Low to High)</option>
                                        <option value="equity-desc">Equity (High to Low)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Address</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Owner</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Lead Score</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Est. Equity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {sortedLeads.map((lead, index) => (
                                            <tr key={index} className={lead.dossier.ownerName === 'Error' ? 'bg-red-50' : ''}>
                                                <td className="px-4 py-3 text-sm text-slate-600 font-medium">{lead.address}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{lead.dossier.ownerName}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {lead.dossier.ownerName !== 'Error' && (
                                                        <span className={`font-bold px-2 py-1 rounded-full text-xs ${scoreColors[lead.leadScore]}`}>
                                                            {lead.leadScore} ({lead.leadScoreValue})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 font-semibold">{lead.dossier.ownerName !== 'Error' ? formatCurrency(lead.estimatedEquity) : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <button
                                onClick={handleSaveLeads}
                                disabled={isSaving || isProcessing}
                                className="w-full mt-6 bg-green-600 text-white py-2.5 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSaving ? 'Saving...' : 'Add All to Dashboard'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BulkAddLeadsPage;
