
import React, { useState } from 'react';
import { Lead } from '../types';
import { generateOutreachMessage } from '../services/geminiService';

interface OutreachGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const OutreachGeneratorModal: React.FC<OutreachGeneratorModalProps> = ({ isOpen, onClose, lead }) => {
    const [type, setType] = useState<'email' | 'sms'>('email');
    const [tone, setTone] = useState('Professional');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setIsLoading(true);
        const message = await generateOutreachMessage(lead.dossier, type, tone);
        setGeneratedMessage(message);
        setIsLoading(false);
        setIsCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Generate Outreach</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                
                <div className="p-4 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select value={type} onChange={e => setType(e.target.value as 'email' | 'sms')} className="w-full p-2 border border-slate-300 rounded-md">
                                <option value="email">Email</option>
                                <option value="sms">SMS Text</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                            <select value={tone} onChange={e => setTone(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md">
                                <option value="Professional">Professional</option>
                                <option value="Friendly">Friendly</option>
                                <option value="Urgent">Urgent (High Interest)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading} 
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                             <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                Drafting...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                Generate Draft
                            </>
                        )}
                    </button>

                    {generatedMessage && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Draft Message</label>
                            <textarea 
                                className="w-full p-3 border border-slate-300 rounded-md text-sm h-40" 
                                value={generatedMessage}
                                onChange={(e) => setGeneratedMessage(e.target.value)}
                            />
                            <button 
                                onClick={handleCopy} 
                                className={`w-full mt-2 py-2 rounded-md font-semibold text-sm transition-colors ${isCopied ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                                {isCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutreachGeneratorModal;
