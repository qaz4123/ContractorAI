
import React, { useState } from 'react';
import { FinancialTransaction, FinancialTransactionType } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<FinancialTransaction, 'id'>) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'Cash' | 'Credit Card' | 'Bank Transfer' | 'Other'>('Credit Card');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    onSave({
      type: FinancialTransactionType.Revenue,
      amount: Number(amount),
      date,
      description: description,
      category: category,
    });
    onClose();
    // Reset form
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Credit Card');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Log a Payment</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 sm:text-sm">$</span>
                    </div>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700">Payment Date</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
             <div>
                <label htmlFor="method" className="block text-sm font-medium text-slate-700">Payment Method</label>
                <select id="method" value={category} onChange={e => setCategory(e.target.value as any)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Credit Card</option>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>Other</option>
                </select>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
                 <textarea id="notes" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="e.g., Initial deposit" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div className="pt-2 flex gap-3">
                <button type="button" onClick={onClose} className="w-full bg-slate-200 text-slate-800 py-2.5 rounded-md font-semibold hover:bg-slate-300">
                    Cancel
                </button>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-semibold hover:bg-indigo-700">
                    Save Payment
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
