import React, { useState } from 'react';
import { Lead, Status } from '../types';

interface ChangeOrdersProps {
    lead: Lead;
    onCreateClick: () => void;
    onDelete: (id: string) => void;
    formatCurrency: (value: number) => string;
}

const ChangeOrders: React.FC<ChangeOrdersProps> = ({ lead, onCreateClick, onDelete, formatCurrency }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (lead.status !== Status.Won) {
        return null; // Only show this component for 'Won' leads
    }

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    Change Orders
                </h2>
                <button
                    onClick={onCreateClick}
                    disabled={lead.isArchived}
                    className="bg-indigo-50 text-indigo-700 text-sm font-semibold py-1.5 px-3 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    + Create Change Order
                </button>
            </div>

            <div className="space-y-3">
                {(lead.changeOrders || []).length > 0 ? (
                    lead.changeOrders?.map((co, index) => (
                        <div key={co.id} className="group bg-slate-50 border border-slate-200 rounded-lg">
                            <div
                                className="w-full flex justify-between items-start p-3 text-left"
                            >
                                <button
                                    onClick={() => setExpandedId(expandedId === co.id ? null : co.id)}
                                    aria-expanded={expandedId === co.id}
                                    className="flex-grow flex items-center text-left"
                                >
                                    <div>
                                        <p className="font-semibold text-sm text-slate-800">Change Order #{index + 1}</p>
                                        <p className="text-xs text-slate-500">{formatDate(co.createdAt)}</p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-2">
                                     <p className="font-semibold text-sm text-green-700">{formatCurrency(co.total)}</p>
                                      <button
                                        onClick={() => setExpandedId(expandedId === co.id ? null : co.id)}
                                        aria-expanded={expandedId === co.id}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transition-transform ${expandedId === co.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                      </button>
                                     <button onClick={() => onDelete(co.id)} disabled={lead.isArchived} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 disabled:hidden" aria-label="Delete change order">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedId === co.id ? 'max-h-[500px]' : 'max-h-0'}`}>
                                <div className="px-3 pb-3 border-t border-slate-200">
                                    <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap"><strong className="text-slate-700">Scope of Work:</strong> {co.scopeOfWork}</p>
                                    <div className="mt-2 pt-2 border-t border-dashed">
                                        {co.lineItems.map(item => (
                                             <div key={item.id} className="flex justify-between text-xs text-slate-700 hover:bg-slate-100 p-1 rounded">
                                                <span className="flex-1 truncate pr-4">{item.description} ({item.quantity}x)</span>
                                                <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No change orders have been created.</p>
                )}
            </div>
        </div>
    );
};

export default ChangeOrders;