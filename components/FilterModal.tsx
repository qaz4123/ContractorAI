import React from 'react';
import { LeadScore, Status } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    leadScores: LeadScore[];
    statuses: Status[];
    showArchived: boolean;
  };
  onFiltersChange: (newFilters: { leadScores: LeadScore[]; statuses: Status[]; showArchived: boolean }) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, onFiltersChange }) => {
  if (!isOpen) return null;

  const handleScoreChange = (score: LeadScore) => {
    const newScores = filters.leadScores.includes(score)
      ? filters.leadScores.filter(s => s !== score)
      : [...filters.leadScores, score];
    onFiltersChange({ ...filters, leadScores: newScores });
  };

  const handleStatusChange = (status: Status) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };
  
  const handleShowArchivedChange = () => {
      onFiltersChange({ ...filters, showArchived: !filters.showArchived });
  }

  const resetFilters = () => {
    onFiltersChange({ leadScores: [], statuses: [], showArchived: false });
    onClose();
  }

  const applyAndClose = () => {
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end" onClick={onClose}>
      <div className="bg-white rounded-t-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Filter Leads</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-600">Lead Score</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(LeadScore).map(score => (
                <button
                  key={score}
                  onClick={() => handleScoreChange(score)}
                  className={`px-3 py-1 rounded-full text-sm border font-medium transition-colors ${
                    filters.leadScores.includes(score)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-600">Status</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(Status).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-full text-sm border font-medium transition-colors ${
                    filters.statuses.includes(status)
                       ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
           <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-600">Show Archived Leads</h3>
                <button
                    onClick={handleShowArchivedChange}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                        filters.showArchived ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            filters.showArchived ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
        </div>
        
        <div className="mt-6 pt-4 border-t flex gap-3">
            <button onClick={applyAndClose} className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-semibold hover:bg-indigo-700">
                Apply Filters
            </button>
            <button onClick={resetFilters} className="w-full bg-slate-200 text-slate-800 py-2.5 rounded-md font-semibold hover:bg-slate-300">
                Reset
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;