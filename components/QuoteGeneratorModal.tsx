import React, { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lead, Quote, QuoteLineItem } from '../types';
import { generateQuoteLineItems, generateVisualQuoteItems } from '../services/geminiService';

interface QuoteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSaveQuote: (quote: Quote) => void;
}

const QuoteGeneratorModal: React.FC<QuoteGeneratorModalProps> = ({ isOpen, onClose, lead, onSaveQuote }) => {
    const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
    const [notes, setNotes] = useState('');
    const [contractorName, setContractorName] = useState('');
    const [materialCost, setMaterialCost] = useState('');
    const [laborCost, setLaborCost] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLineItems(lead.quote?.lineItems || []);
            setNotes(lead.quote?.notes || '');
            setContractorName(lead.quote?.contractorName || '');
            setMaterialCost(String(lead.quote?.materialCost || ''));
            setLaborCost(String(lead.quote?.laborCost || ''));
            setError(null);
            setAiPrompt('');
            setImages([]);
        }
    }, [isOpen, lead.quote]);
    
    // Cleanup effect for object URLs
    useEffect(() => {
        return () => {
            images.forEach(image => URL.revokeObjectURL(image.preview));
        };
    }, [images]);

    const total = useMemo(() => {
        return lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    }, [lineItems]);

    const expectedProfit = useMemo(() => {
        const matCost = Number(materialCost) || 0;
        const labCost = Number(laborCost) || 0;
        return total - matCost - labCost;
    }, [total, materialCost, laborCost]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const handleItemChange = (id: string, field: keyof Omit<QuoteLineItem, 'id'>, value: string | number) => {
        setLineItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, [field]: typeof value === 'string' ? value : Number(value) } : item
            )
        );
    };

    const handleAddItem = () => {
        setLineItems(prev => [...prev, { id: uuidv4(), description: '', quantity: 1, unitPrice: 0 }]);
    };

    const handleDeleteItem = (id: string) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]); // remove the data URI prefix
            reader.onerror = error => reject(error);
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // FIX: Explicitly type 'file' as 'File' to resolve type inference issue with URL.createObjectURL.
            const newImages = Array.from(e.target.files).map((file: File) => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleGenerateAIItems = async () => {
        if (!aiPrompt.trim() && images.length === 0) return;
        setIsLoadingAI(true);
        setError(null);
        try {
            let generatedItems: Omit<QuoteLineItem, 'id'>[];
            if (images.length > 0) {
                const imagePayload = await Promise.all(images.map(async img => ({
                    mimeType: img.file.type,
                    data: await fileToBase64(img.file)
                })));
                generatedItems = await generateVisualQuoteItems(aiPrompt, imagePayload);
            } else {
                generatedItems = await generateQuoteLineItems(aiPrompt);
            }

            const newItemsWithIds: QuoteLineItem[] = generatedItems.map(item => ({ ...item, id: uuidv4() }));
            setLineItems(prev => [...prev, ...newItemsWithIds]);
            setAiPrompt('');
            setImages([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleSave = () => {
        const newQuote: Quote = {
            id: lead.quote?.id || uuidv4(),
            createdAt: lead.quote?.createdAt || new Date().toISOString(),
            lineItems,
            notes,
            total,
            contractorName,
            materialCost: Number(materialCost) || 0,
            laborCost: Number(laborCost) || 0,
            expectedProfit,
        };
        onSaveQuote(newQuote);
        onClose();
    };

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b bg-white rounded-t-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Create / Edit Quote</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                <p className="text-sm text-slate-500">For {lead.dossier.ownerName}</p>
            </div>
            
            <div className="p-4 flex-grow overflow-y-auto space-y-4">
                {/* AI Generator Section */}
                <div className="bg-indigo-50 p-3 rounded-md border border-indigo-200 space-y-3">
                    <div>
                        <label htmlFor="ai-prompt" className="block text-sm font-semibold text-indigo-800 mb-1">Generate Items with AI Visual Estimator</label>
                        <p className="text-xs text-indigo-700 mb-2">Describe the project and/or upload photos of the job site. AI will analyze them to suggest line items.</p>
                        <input
                            id="ai-prompt"
                            type="text"
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            placeholder="e.g., Full kitchen remodel..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            disabled={isLoadingAI}
                        />
                    </div>
                     <div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button 
                            onClick={() => imageInputRef.current?.click()}
                            disabled={isLoadingAI}
                            className="w-full flex justify-center items-center gap-2 px-3 py-2 border-2 border-dashed border-indigo-300 bg-indigo-100/50 rounded-md text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                            Add Photos
                        </button>
                        {images.length > 0 && (
                            <div className="mt-2 grid grid-cols-4 gap-2">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img src={image.preview} alt={`upload preview ${index}`} className="w-full h-20 object-cover rounded-md border border-slate-300" />
                                        <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                     <button onClick={handleGenerateAIItems} disabled={isLoadingAI || (!aiPrompt.trim() && images.length === 0)} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center">
                        {isLoadingAI ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> : 'Generate'}
                     </button>
                     {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>

                {/* Line Items */}
                <div className="space-y-2">
                    {lineItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-slate-200">
                           <div className="col-span-6">
                             <input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} placeholder="Description" className="w-full text-sm p-1 border-b focus:outline-none focus:border-indigo-500" />
                           </div>
                            <div className="col-span-2">
                               <input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} placeholder="Qty" className="w-full text-sm p-1 border-b focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="col-span-3">
                                <input type="number" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)} placeholder="Unit Price" className="w-full text-sm p-1 border-b focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="col-span-1 text-right">
                                <button onClick={() => handleDeleteItem(item.id)} className="text-slate-400 hover:text-red-600 p-1 rounded-full text-xl font-bold">&times;</button>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddItem} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800">+ Add Line Item</button>
            </div>

            <div className="p-4 border-t bg-white rounded-b-lg space-y-4">
                <div>
                    <label htmlFor="contractorName" className="block text-sm font-medium text-slate-700">Contractor Name</label>
                    <input
                        type="text"
                        id="contractorName"
                        value={contractorName}
                        onChange={e => setContractorName(e.target.value)}
                        placeholder="e.g., Your Company Name"
                        className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="materialCost" className="block text-sm font-medium text-slate-700">Total Material Cost</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-slate-500 sm:text-sm">$</span></div>
                            <input
                                type="number"
                                id="materialCost"
                                value={materialCost}
                                onChange={e => setMaterialCost(e.target.value)}
                                placeholder="e.g., 10000"
                                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="laborCost" className="block text-sm font-medium text-slate-700">Total Labor Cost</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-slate-500 sm:text-sm">$</span></div>
                            <input
                                type="number"
                                id="laborCost"
                                value={laborCost}
                                onChange={e => setLaborCost(e.target.value)}
                                placeholder="e.g., 5000"
                                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-slate-100 p-3 rounded-md border border-slate-200">
                    <span className="text-sm font-semibold text-slate-700">Expected Profit</span>
                    <span className="text-lg font-bold text-slate-900">{formatCurrency(expectedProfit)}</span>
                </div>

                <div className="flex justify-end items-center">
                    <span className="text-sm font-semibold text-slate-600">Quote Total:</span>
                    <span className="text-xl font-bold text-slate-800 ml-4">{formatCurrency(total)}</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="w-full bg-slate-200 text-slate-800 py-2.5 rounded-md font-semibold hover:bg-slate-300">Cancel</button>
                    <button onClick={handleSave} className="w-full bg-green-600 text-white py-2.5 rounded-md font-semibold hover:bg-green-700">Save Quote</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default QuoteGeneratorModal;