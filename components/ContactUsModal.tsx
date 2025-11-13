
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ServiceMessage } from '../types';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MESSAGES_STORAGE_KEY = 'projectprospect_messages';

const ContactUsModal: React.FC<ContactUsModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newMessage: ServiceMessage = {
            id: uuidv4(),
            name,
            email,
            message,
            timestamp: new Date().toISOString(),
            isRead: false,
        };

        // Simulate saving to backend/localStorage
        setTimeout(() => {
            try {
                const existingMessagesRaw = localStorage.getItem(MESSAGES_STORAGE_KEY);
                const existingMessages: ServiceMessage[] = existingMessagesRaw ? JSON.parse(existingMessagesRaw) : [];
                const updatedMessages = [newMessage, ...existingMessages];
                localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
            } catch (error) {
                console.error("Failed to save message:", error);
            }

            setIsSubmitting(false);
            setIsSuccess(true);

            setTimeout(() => {
                handleClose();
            }, 2000);
        }, 1000);
    };
    
    const handleClose = () => {
        setName('');
        setEmail('');
        setMessage('');
        setIsSuccess(false);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Contact Us</h2>
                    <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                
                {isSuccess ? (
                    <div className="p-8 text-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-lg font-semibold">Message Sent!</h3>
                        <p className="text-slate-600">Thanks for reaching out. We'll get back to you shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700">Your Name</label>
                            <input type="text" id="contact-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input type="email" id="contact-email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700">Message</label>
                            <textarea id="contact-message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 flex justify-center items-center">
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactUsModal;
