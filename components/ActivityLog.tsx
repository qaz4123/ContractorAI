
import React, { useState } from 'react';
import { ActivityLogItem } from '../types';

interface ActivityLogProps {
    activities: ActivityLogItem[];
    onAddActivity: (note: string) => void;
    onDeleteActivity: (id: string) => void;
    isArchived: boolean;
    onAddToCalendarClick: () => void;
    onAddVoiceMemoClick: () => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities, onAddActivity, onDeleteActivity, isArchived, onAddToCalendarClick, onAddVoiceMemoClick }) => {
    const [newNote, setNewNote] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddActivity(newNote);
        setNewNote('');
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Activity Log</h2>
            <div className="mb-4">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={isArchived ? "Lead is archived." : "Add a note... (e.g., Called, left voicemail)"}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-slate-100 mb-2"
                    rows={2}
                    disabled={isArchived}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                     <button
                        type="button"
                        onClick={onAddToCalendarClick}
                        disabled={isArchived}
                        className="w-full sm:w-auto flex-grow bg-white text-slate-700 border border-slate-300 py-2 px-4 rounded-md font-semibold text-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        Add to Calendar
                    </button>
                    <button
                        type="button"
                        onClick={onAddVoiceMemoClick}
                        disabled={isArchived}
                        className="w-full sm:w-auto flex-grow bg-white text-slate-700 border border-slate-300 py-2 px-4 rounded-md font-semibold text-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 5.5A.5.5 0 016 5v4a4 4 0 008 0V5a.5.5 0 011 0v4a5 5 0 01-10 0V5A.5.5 0 015.5 5.5z" /><path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
                        Add Voice Memo
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!newNote.trim() || isArchived}
                        className="w-full sm:w-auto flex-grow bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Add Note
                    </button>
                </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {activities.length > 0 ? (
                    activities.map(activity => (
                        <div key={activity.id} className="group text-sm border-l-2 border-indigo-200 pl-3 flex justify-between items-start gap-2">
                            <div>
                                <p className="text-slate-800">{activity.note}</p>
                                <p className="text-xs text-slate-500 mt-1">{formatDate(activity.timestamp)}</p>
                            </div>
                            <button 
                                onClick={() => onDeleteActivity(activity.id)}
                                disabled={isArchived}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 rounded-full p-1 transition-opacity disabled:hidden"
                                aria-label="Delete note"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No activities logged yet.</p>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
