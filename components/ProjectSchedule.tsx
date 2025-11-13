import React from 'react';
import { Lead, ProjectPhaseStatus, Status } from '../types';

interface ProjectScheduleProps {
    lead: Lead;
    onEditClick: () => void;
    onUpdatePhaseStatus: (phaseId: string, newStatus: ProjectPhaseStatus) => void;
}

const ProjectSchedule: React.FC<ProjectScheduleProps> = ({ lead, onEditClick, onUpdatePhaseStatus }) => {
    const isCreatable = lead.status === Status.Won && !lead.isArchived;

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

    const statusStyles: { [key in ProjectPhaseStatus]: string } = {
        [ProjectPhaseStatus.Upcoming]: 'bg-slate-200 text-slate-800',
        [ProjectPhaseStatus.InProgress]: 'bg-blue-100 text-blue-800',
        [ProjectPhaseStatus.Completed]: 'bg-green-100 text-green-800',
    };

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        Project Schedule
                    </h2>
                    {lead.schedule?.projectDuration && (
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            {lead.schedule.projectDuration}
                        </span>
                    )}
                </div>
                {lead.schedule && (
                    <button
                        onClick={onEditClick}
                        disabled={lead.isArchived}
                        className="bg-slate-100 text-slate-700 text-sm font-semibold py-1 px-3 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Edit Schedule
                    </button>
                )}
            </div>

            {!lead.schedule ? (
                <div>
                    <p className="text-sm text-slate-500 mb-3">No project schedule created yet. A schedule can be created once the lead status is 'Won'.</p>
                    <button
                        onClick={onEditClick}
                        disabled={!isCreatable}
                        className="w-full bg-indigo-50 text-indigo-700 py-2.5 rounded-md font-semibold hover:bg-indigo-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        Create Schedule
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {lead.schedule.phases.map((phase) => (
                        <div key={phase.id} className="grid grid-cols-12 gap-3 items-center p-2 rounded-md bg-slate-50 border border-slate-200/80">
                            <div className="col-span-12 sm:col-span-5">
                                <p className="font-medium text-sm text-slate-800">{phase.name}</p>
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                                <p className="text-xs text-slate-500 font-medium">{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</p>
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <select
                                    value={phase.status}
                                    onChange={(e) => onUpdatePhaseStatus(phase.id, e.target.value as ProjectPhaseStatus)}
                                    disabled={lead.isArchived}
                                    className={`w-full text-xs font-semibold border-0 rounded p-1 appearance-none focus:ring-0 ${statusStyles[phase.status]}`}
                                >
                                    {Object.values(ProjectPhaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectSchedule;