
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, LeadScore, LeadSource } from '../types';

interface LeadListProps {
  leads: Lead[];
}

const LeadSourceIcon: React.FC<{ source: LeadSource }> = ({ source }) => {
    const iconMap = {
        [LeadSource.AI]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>,
        [LeadSource.Manual]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>,
        [LeadSource.Web]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.998 5.998 0 0116 9.5a.5.5 0 01-.5.5h-1.034a.5.5 0 00-.472.331l-.256.768a.5.5 0 01-.94.065l-.425-1.275a.5.5 0 00-.94-.065l-.256.768a.5.5 0 01-.472.331H9a.5.5 0 01-.5-.5 2.5 2.5 0 00-5 0 .5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5c0-.18.01-.357.032-.531z" clipRule="evenodd" /></svg>,
    };
    return <div title={`Source: ${source}`} className="p-2 bg-slate-200 text-slate-600 rounded-full">{iconMap[source]}</div>;
};

const LeadScoreBadge: React.FC<{ score: LeadScore }> = ({ score }) => {
  const scoreStyles = {
    [LeadScore.A]: 'bg-green-100 text-green-800',
    [LeadScore.B]: 'bg-yellow-100 text-yellow-800',
    [LeadScore.C]: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${scoreStyles[score]}`}>
      Score {score}
    </span>
  );
};

const LeadList: React.FC<LeadListProps> = ({ leads }) => {
    const navigate = useNavigate();

    if (leads.length === 0) {
        return <div className="text-center text-slate-500 py-10">No leads match the current filters.</div>;
    }

    return (
        <div className="space-y-3">
        {leads.map(lead => (
            <div
                key={lead.id}
                onClick={() => navigate(`/dossier/${lead.id}`)}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 hover:border-indigo-500"
            >
                <div className="flex items-center gap-4">
                    <LeadSourceIcon source={lead.source} />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-slate-800 truncate">{lead.dossier.ownerName}</p>
                                <p className="text-sm text-slate-500">{lead.address}</p>
                            </div>
                            <LeadScoreBadge score={lead.leadScore} />
                        </div>
                    </div>
                </div>
                 <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                    <p className="text-slate-600">
                        <span className="font-medium">Status:</span>
                        <span className="ml-1.5 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">{lead.status}</span>
                    </p>
                    <p className="text-green-700 font-semibold">
                        ~{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(lead.estimatedEquity)} equity
                    </p>
                </div>
            </div>
        ))}
        </div>
    );
};

export default LeadList;
