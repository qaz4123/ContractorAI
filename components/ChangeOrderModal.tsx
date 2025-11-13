
import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { QuoteLineItem, ChangeOrder } from '../types';
import { generateChangeOrderDetails } from '../services/geminiService';

interface ChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (changeOrder: ChangeOrder) => void;
}

const ChangeOrderModal: React.FC<ChangeOrderModalProps> = ({ isOpen, onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [scopeOfWork, setScopeOfWork] = useState('');
    const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const total = useMemo(() => {
        return lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    }, [lineItems]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const handleGenerate = async () => {
        if (!description.trim()) return;
        setIsLoadingAI(true);
        setError(null);
        try {
            const details = await generateChangeOrderDetails(description);
            setScopeOfWork(details.scopeOfWork);
            setLineItems(details.lineItems);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleSave = () => {
        if (!scopeOfWork || lineItems.length === 0) return;
        const newChangeOrder: ChangeOrder = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            description,
            scopeOfWork,
            lineItems,
            total,
        };
        onSave(newChangeOrder);
        handleClose();
    };
    
    const handleClose = () => {
        setDescription('');
        setScopeOfWork('');
        setLineItems([]);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b bg-white rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">Create Change Order</h2>
                        <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                    </div>
                </div>

                <div className="p-4 flex-grow overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="co-description" className="block text-sm font-medium text-slate-700 mb-1">1. Describe the change request</label>
                        <textarea
                            id="co-description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g., Homeowner wants to add two pot lights and a dimmer switch in the living room."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                            disabled={isLoadingAI}
                        />
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isLoadingAI || !description.trim()} className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-md font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2">
                        {isLoadingAI ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                Generating...
                            </>
                        ) : (
                           '2. Generate Scope & Pricing with AI'
                        )}
                    </button>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    {(scopeOfWork || lineItems.length > 0) && (
                        <div className="pt-4 border-t border-slate-300 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">3. Review and Confirm</label>
                                <div className="bg-white p-3 rounded-md border">
                                    <h4 className="font-semibold text-slate-800 mb-1">Scope of Work</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{scopeOfWork}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {lineItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm text-slate-700 bg-white p-2 rounded border">
                                        <span className="flex-1 truncate pr-4">{item.description} ({item.quantity}x)</span>
                                        <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                 <div className="p-4 border-t bg-white rounded-b-lg space-y-3">
                    <div className="flex justify-end items-center">
                        <span className="text-sm font-semibold text-slate-600">Change Order Total:</span>
                        <span className="text-xl font-bold text-slate-800 ml-4">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleClose} className="w-full bg-slate-200 text-slate-800 py-2.5 rounded-md font-semibold hover:bg-slate-300">Cancel</button>
                        <button onClick={handleSave} disabled={!scopeOfWork || lineItems.length === 0} className="w-full bg-green-600 text-white py-2.5 rounded-md font-semibold hover:bg-green-700 disabled:bg-green-300">
                            Save Change Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangeOrderModal;
