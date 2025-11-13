
import React, { useState, useRef, useEffect } from 'react';
import { FinancialTransaction, FinancialTransactionType } from '../types';

interface FinancialTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<FinancialTransaction, 'id'> & { id?: string }) => void;
  transactionType: FinancialTransactionType;
  transactionToEdit?: FinancialTransaction | null;
}

const FinancialTransactionModal: React.FC<FinancialTransactionModalProps> = ({ isOpen, onClose, onSave, transactionType, transactionToEdit }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setAmount(String(transactionToEdit.amount));
        setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
        setDescription(transactionToEdit.description);
        setCategory(transactionToEdit.category || '');
        setReceiptImage(transactionToEdit.receiptImage || null);
      } else {
        // Reset form for new transaction
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setCategory('');
        setReceiptImage(null);
      }
    }
  }, [isOpen, transactionToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description.trim()) return;

    onSave({
      id: transactionToEdit?.id,
      type: transactionToEdit?.type || transactionType,
      amount: Number(amount),
      date,
      description,
      category,
      receiptImage: receiptImage || undefined,
    });
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentType = transactionToEdit?.type || transactionType;
  const isExpense = currentType === FinancialTransactionType.Expense;
  const title = `${transactionToEdit ? 'Edit' : 'Log'} ${isExpense ? 'Expense' : 'Revenue'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 sm:text-sm">$</span>
                    </div>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500.00" className="w-full pl-7 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700">Date</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                 <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={isExpense ? "e.g., Lumber from Home Depot" : "e.g., Initial project deposit"} className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
             <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category (Optional)</label>
                 <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder={isExpense ? "e.g., Materials" : "e.g., Deposit"} className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            {isExpense && (
                <div>
                    <label className="block text-sm font-medium text-slate-700">Receipt</label>
                    <div className="mt-1">
                        {receiptImage ? (
                             <div className="flex items-center gap-3">
                                <img src={receiptImage} alt="Receipt preview" className="h-16 w-16 object-cover rounded-md border" />
                                <button type="button" onClick={() => setReceiptImage(null)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
                             </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex justify-center items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                Upload Receipt
                            </button>
                        )}
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                        />
                    </div>
                </div>
            )}
            
            <div className="pt-2 flex gap-3">
                <button type="button" onClick={onClose} className="w-full bg-slate-200 text-slate-800 py-2.5 rounded-md font-semibold hover:bg-slate-300">
                    Cancel
                </button>
                 <button type="submit" className={`w-full text-white py-2.5 rounded-md font-semibold ${isExpense ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    Save {isExpense ? 'Expense' : 'Revenue'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialTransactionModal;
