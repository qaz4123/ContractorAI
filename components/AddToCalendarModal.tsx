
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '../types';

interface AddToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  lead: Lead;
}

// Helper to format dates for ICS files (e.g., 20231027T053400Z)
const formatIcsDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
};


const AddToCalendarModal: React.FC<AddToCalendarModalProps> = ({ isOpen, onClose, onSave, lead }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [duration, setDuration] = useState(30); // in minutes
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (lead) {
            setTitle(`Follow-up with ${lead.dossier.ownerName}`);
            setDescription(`Discuss potential projects at ${lead.address}.`);
        }
    }, [lead]);

    if (!isOpen) return null;

    const handleSaveAndDownload = (e: React.FormEvent) => {
        e.preventDefault();

        const startTime = new Date(`${date}T${time}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//ContractorAI//App//EN',
            'BEGIN:VEVENT',
            `UID:${uuidv4()}@contractorai.com`,
            `DTSTAMP:${formatIcsDate(new Date())}`,
            `DTSTART:${formatIcsDate(startTime)}`,
            `DTEND:${formatIcsDate(endTime)}`,
            `SUMMARY:${title}`,
            `DESCRIPTION:${description}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'follow-up.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        const formattedDate = startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        onSave(`Calendar event created: "${title}" for ${formattedDate}.`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Add to Calendar</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                
                <form onSubmit={handleSaveAndDownload} className="space-y-4">
                    <div>
                        <label htmlFor="event-title" className="block text-sm font-medium text-slate-700">Event Title</label>
                        <input type="text" id="event-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="event-date" className="block text-sm font-medium text-slate-700">Date</label>
                            <input type="date" id="event-date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                         <div>
                            <label htmlFor="event-time" className="block text-sm font-medium text-slate-700">Time</label>
                            <input type="time" id="event-time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="event-duration" className="block text-sm font-medium text-slate-700">Duration (minutes)</label>
                        <select id="event-duration" value={duration} onChange={e => setDuration(Number(e.target.value))} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                           <option value={15}>15 minutes</option>
                           <option value={30}>30 minutes</option>
                           <option value={45}>45 minutes</option>
                           <option value={60}>1 hour</option>
                           <option value={90}>1.5 hours</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="event-description" className="block text-sm font-medium text-slate-700">Description</label>
                         <textarea id="event-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="w-full bg-slate-200 text-slate-800 py-2.5 rounded-md font-semibold hover:bg-slate-300">
                            Cancel
                        </button>
                         <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                            Save to Calendar
                        </button>
                    </div>
                </form>
              </div>
        </div>
    );
};

export default AddToCalendarModal;