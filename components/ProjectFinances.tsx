import React, { useMemo } from 'react';
import { FinancialTransaction, FinancialTransactionType } from '../types';

interface ProjectFinancesProps {
    transactions: FinancialTransaction[];
    onAddTransaction: (type: FinancialTransactionType) => void;
    onEditTransaction: (transaction: FinancialTransaction) => void;
    onDeleteTransaction: (id: string) => void;
    isArchived: boolean;
    formatCurrency: (value: number) => string;
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
  <div className={`p-2 rounded-lg ${className}`}>
    <p className="text-xs text-slate-500 font-medium">{title}</p>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
);

const ProjectFinances: React.FC<ProjectFinancesProps> = ({ transactions, onAddTransaction, onEditTransaction, onDeleteTransaction, isArchived, formatCurrency }) => {
    
    const summary = useMemo(() => {
        const revenue = transactions
            .filter(t => t.type === FinancialTransactionType.Revenue)
            .reduce((acc, t) => acc + t.amount, 0);
        const expenses = transactions
            .filter(t => t.type === FinancialTransactionType.Expense)
            .reduce((acc, t) => acc + t.amount, 0);
        const netProfit = revenue - expenses;
        return { revenue, expenses, netProfit };
    }, [transactions]);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
        });
    }

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                <h2 className="text-lg font-semibold text-slate-800">Project Finances</h2>
                <div className="flex gap-2">
                     <button
                        onClick={() => onAddTransaction(FinancialTransactionType.Revenue)}
                        disabled={isArchived}
                        className="flex-1 bg-blue-50 text-blue-700 text-sm font-semibold py-1.5 px-3 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + Add Revenue
                    </button>
                    <button
                        onClick={() => onAddTransaction(FinancialTransactionType.Expense)}
                        disabled={isArchived}
                        className="flex-1 bg-red-50 text-red-700 text-sm font-semibold py-1.5 px-3 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + Add Expense
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-slate-100/70 p-2 rounded-lg">
                <StatCard title="Total Revenue" value={formatCurrency(summary.revenue)} className="bg-green-50" />
                <StatCard title="Total Expenses" value={formatCurrency(summary.expenses)} className="bg-red-50" />
                <StatCard title="Net Profit" value={formatCurrency(summary.netProfit)} className={summary.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'} />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                 {transactions.length > 0 ? (
                    transactions.map(tx => (
                        <div key={tx.id} className="group flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50">
                            <div className="flex-grow min-w-0">
                                <p className={`font-medium truncate ${tx.type === FinancialTransactionType.Revenue ? 'text-green-700' : 'text-red-700'}`}>
                                    {tx.type === FinancialTransactionType.Revenue ? '+' : '-'} {formatCurrency(tx.amount)}
                                </p>
                                <p className="text-slate-600 truncate">{tx.description}</p>
                                <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                {tx.type === FinancialTransactionType.Expense && tx.receiptImage && (
                                    <a href={tx.receiptImage} target="_blank" rel="noopener noreferrer" title="View Receipt" className="text-slate-400 hover:text-indigo-600 p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                    </a>
                                )}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                    <button onClick={() => onEditTransaction(tx)} disabled={isArchived} className="text-slate-400 hover:text-blue-600 p-1 disabled:hidden" aria-label="Edit transaction">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                    </button>
                                    <button onClick={() => onDeleteTransaction(tx.id)} disabled={isArchived} className="text-slate-400 hover:text-red-600 p-1 disabled:hidden" aria-label="Delete transaction">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No financial transactions logged yet.</p>
                )}
            </div>

        </div>
    );
};

export default ProjectFinances;