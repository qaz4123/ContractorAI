
import React, { useState } from 'react';
import { FinancialTransaction } from '../types';
import PaymentModal from './PaymentModal';

interface PaymentsProps {
    payments: FinancialTransaction[];
    onAddPayment: (payment: Omit<FinancialTransaction, 'id'>) => void;
    formatCurrency: (value: number) => string;
    isArchived: boolean;
}

const Payments: React.FC<PaymentsProps> = ({ payments, onAddPayment, formatCurrency, isArchived }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Payments</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={isArchived}
                    className="bg-slate-100 text-slate-700 text-sm font-semibold py-1 px-3 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    + Log Payment
                </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {payments.length > 0 ? (
                    payments.map(payment => (
                        <div key={payment.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50">
                            <div>
                                <p className="font-medium text-slate-800">{formatCurrency(payment.amount)} <span className="text-xs text-slate-500 font-normal">({payment.category})</span></p>
                                <p className="text-xs text-slate-500">{formatDate(payment.date)}</p>
                            </div>
                            {payment.description && <p className="text-xs text-slate-600 truncate max-w-xs" title={payment.description}>{payment.description}</p>}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No payments logged yet.</p>
                )}
            </div>

            {payments.length > 0 && (
                 <div className="flex justify-between text-base font-bold text-slate-800 mt-3 pt-3 border-t-2 border-slate-200">
                    <span>Total Paid</span>
                    <span>{formatCurrency(totalPaid)}</span>
                </div>
            )}
            
            <PaymentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onAddPayment}
            />
        </div>
    );
};

export default Payments;
