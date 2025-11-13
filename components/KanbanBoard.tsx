
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, Status, LeadScore } from '../types';

interface KanbanBoardProps {
    leads: Lead[];
}

const STATUS_COLUMNS = Object.values(Status);

const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads }) => {
    const navigate = useNavigate();

    const getLeadsByStatus = (status: Status) => {
        return leads.filter(lead => lead.status === status);
    };

    const scoreColors = {
        [LeadScore.A]: 'bg-green-100 text-green-800',
        [LeadScore.B]: 'bg-yellow-100 text-yellow-800',
        [LeadScore.C]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="flex overflow-x-auto pb-4 gap-4">
            {STATUS_COLUMNS.map(status => (
                <div key={status} className="min-w-[280px] w-72 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{status}</h3>
                        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {getLeadsByStatus(status).length}
                        </span>
                    </div>
                    <div className="bg-slate-100 p-2 rounded-xl min-h-[500px] max-h-[700px] overflow-y-auto space-y-3 custom-scrollbar">
                        {getLeadsByStatus(status).map(lead => (
                            <div 
                                key={lead.id} 
                                onClick={() => navigate(`/dossier/${lead.id}`)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold text-slate-800 truncate" title={lead.dossier.ownerName}>{lead.dossier.ownerName}</p>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColors[lead.leadScore]}`}>
                                        {lead.leadScore}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate mb-3" title={lead.address}>{lead.address}</p>
                                <div className="flex items-center justify-between text-xs font-medium pt-3 border-t border-slate-100">
                                    <span className="text-green-700">
                                        ~{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(lead.estimatedEquity)} Eq.
                                    </span>
                                    {lead.quote && (
                                         <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">Quote: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(lead.quote.total)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                         {getLeadsByStatus(status).length === 0 && (
                            <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm font-medium">
                                No leads
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
