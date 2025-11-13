
import React, { useState, useRef, useEffect } from 'react';
import { Dossier } from '../types';
import { chatWithDossier } from '../services/geminiService';

interface DossierChatProps {
    dossier: Dossier;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const DossierChat: React.FC<DossierChatProps> = ({ dossier }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', role: 'model', text: 'Hi! I\'ve analyzed this dossier. Ask me anything about this property or homeowner.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Prepare history for Gemini, excluding the very first welcome message if it wasn't from a previous session (simplification here)
        const history = messages.filter(m => m.id !== 'initial').map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const responseText = await chatWithDossier(dossier, inputValue, history);
        const modelMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
        
        setMessages(prev => [...prev, modelMessage]);
        setIsLoading(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-50 flex items-center justify-center"
                aria-label="Open Dossier Assistant"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden transition-all" style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}>
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold">Dossier Assistant</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 bg-slate-50 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                            <span className="block w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                            <span className="block w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="block w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about this lead..."
                    className="flex-grow px-4 py-2 bg-slate-100 border-transparent rounded-full focus:bg-white focus:border-indigo-300 focus:ring-0 text-sm text-slate-900"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex-shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default DossierChat;
