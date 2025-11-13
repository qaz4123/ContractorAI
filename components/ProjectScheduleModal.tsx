import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lead, ProjectSchedule, ProjectPhase, ProjectPhaseStatus } from '../types';
import { generateProjectPhases } from '../services/geminiService';

interface ProjectScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSave: (schedule: ProjectSchedule) => void;
}

const ProjectScheduleModal: React.FC<ProjectScheduleModalProps> = ({ isOpen, onClose, lead, onSave }) => {
    const [phases, setPhases] = useState<ProjectPhase[]>([]);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setPhases(lead.schedule?.phases || []);
            setError(null);
            setAiPrompt('');
        }
    }, [isOpen, lead.schedule]);
    
    const handleAddPhase = () => {
        const lastPhase = phases[phases.length - 1];
        const newStartDate = new Date();
        if (lastPhase) {
            newStartDate.setDate(new Date(lastPhase.endDate).getDate() + 1);
        }
        
        setPhases(prev => [...prev, {
            id: uuidv4(),
            name: '',
            startDate: newStartDate.toISOString().split('T')[0],
            endDate: newStartDate.toISOString().split('T')[0],
            status: ProjectPhaseStatus.Upcoming,
        }]);
    };
    
    const handleDeletePhase = (id: string) => {
        setPhases(prev => prev.filter(phase => phase.id !== id));
    };

    const handlePhaseChange = (id: string, field: keyof Omit<ProjectPhase, 'id'|'status'>, value: string) => {
        setPhases(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };
    
    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) return;
        setIsLoadingAI(true);
        setError(null);
        try {
            const generatedPhases = await generateProjectPhases(aiPrompt);
            let currentStartDate = new Date();
            const lastExistingPhase = phases[phases.length - 1];
            if (lastExistingPhase) {
                currentStartDate.setDate(new Date(lastExistingPhase.endDate).getDate() + 1);
            }

            const newPhases: ProjectPhase[] = generatedPhases.map(genPhase => {
                const startDate = new Date(currentStartDate);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + (genPhase.suggestedDurationDays || 1));
                
                const newPhase = {
                    id: uuidv4(),
                    name: genPhase.name,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    status: ProjectPhaseStatus.Upcoming
                };
                currentStartDate = new Date(endDate);
                currentStartDate.setDate(currentStartDate.getDate() + 1); // Next phase starts the day after
                return newPhase;
            });

            setPhases(prev => [...prev, ...newPhases]);
            setAiPrompt('');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoadingAI(false);
        }
    };
    
    const handleSave = () => {
        let durationString = 'Not yet estimated';

        if (phases.length > 0) {
            const startDates = phases.map(p => new Date(`${p.startDate}T00:00:00`));
            const endDates = phases.map(p => new Date(`${p.endDate}T00:00:00`));

            if (!startDates.some(d => isNaN(d.getTime())) && !endDates.some(d => isNaN(d.getTime()))) {
                const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
                const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
                
                // Add 1 day to be inclusive of start and end dates
                const durationInMs = maxDate.getTime() - minDate.getTime() + (1000 * 60 * 60 * 24);
                const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
                
                if (durationInDays > 0) {
                    const durationInWeeks = durationInDays / 7;

                    if (durationInDays <= 1) {
                        durationString = 'Approx. 1 day';
                    } else if (durationInDays < 7) {
                        durationString = `Approx. ${durationInDays} days`;
                    } else if (durationInWeeks <= 12) { // up to ~3 months
                        const lower = Math.floor(durationInWeeks);
                        const upper = Math.ceil(durationInWeeks);
                        if (lower === upper) {
                            durationString = `Approx. ${lower} week${lower !== 1 ? 's' : ''}`;
                        } else {
                            durationString = `Approx. ${lower}-${upper} weeks`;
                        }
                    } else {
                        const months = Math.round(durationInDays / 30.44); // avg days in month
                        durationString = `Approx. ${months} month${months !== 1 ? 's' : ''}`;
                    }
                }
            }
        }

        const schedule: ProjectSchedule = {
            id: lead.schedule?.id || uuidv4(),
            phases,
            projectDuration: durationString,
        };
        onSave(schedule);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b bg-white rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">Project Schedule</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                    </div>
                </div>
                
                <div className="p-4 flex-grow overflow-y-auto space-y-4">
                    <div className="bg-indigo-50 p-3 rounded-md border border-indigo-200">
                        <label htmlFor="ai-prompt-schedule" className="block text-sm font-semibold text-indigo-800 mb-1">Generate Schedule with AI</label>
                        <p className="text-xs text-indigo-700 mb-2">Describe the project to get a suggested timeline. (e.g., "Standard bathroom remodel")</p>
                        <div className="flex gap-2">
                            <input
                                id="ai-prompt-schedule"
                                type="text"
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                placeholder="Enter project type..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                disabled={isLoadingAI}
                            />
                             <button onClick={handleGenerateAI} disabled={isLoadingAI || !aiPrompt.trim()} className="bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center shrink-0">
                                {isLoadingAI ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> : 'Generate'}
                             </button>
                        </div>
                         {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    </div>

                    <div className="space-y-2">
                        {phases.map(phase => (
                            <div key={phase.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-slate-200">
                                <div className="col-span-12 sm:col-span-5">
                                    <input type="text" value={phase.name} onChange={e => handlePhaseChange(phase.id, 'name', e.target.value)} placeholder="Phase Name" className="w-full text-sm p-1 border-b focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <input type="date" value={phase.startDate} onChange={e => handlePhaseChange(phase.id, 'startDate', e.target.value)} className="w-full text-sm p-1 border-b focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <input type="date" value={phase.endDate} onChange={e => handlePhaseChange(phase.id, 'endDate', e.target.value)} className="w-full text-sm p-1 border-b focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div className="col-span-12 sm:col-span-1 text-right">
                                    <button onClick={() => handleDeletePhase(phase.id)} className="text-slate-400 hover:text-red-600 p-1 rounded-full text-xl font-bold">&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddPhase} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800">+ Add Phase Manually</button>
                </div>

                 <div className="p-4 border-t bg-white rounded-b-lg flex gap-3">
                    <button onClick={onClose} className="w-full bg-slate-200 text-slate-800 py-2.5 rounded-md font-semibold hover:bg-slate-300">Cancel</button>
                    <button onClick={handleSave} className="w-full bg-green-600 text-white py-2.5 rounded-md font-semibold hover:bg-green-700">Save Schedule</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectScheduleModal;