import React, { useState } from 'react';
import { ProjectSuggestion } from '../types';

interface ProjectSuggestionsProps {
    suggestions?: ProjectSuggestion[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);


const ProjectSuggestions: React.FC<ProjectSuggestionsProps> = ({ suggestions }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    const handleToggle = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM14.596 4.343a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zM15.25 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM5.404 14.596a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 111.06-1.06l1.06 1.06zM14.596 14.596a.75.75 0 11-1.06 1.06l1.06 1.06a.75.75 0 111.06-1.06l-1.06-1.06zM10 15.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM10 4a6 6 0 100 12 6 6 0 000-12zM10 6a4 4 0 110 8 4 4 0 010-8z" clipRule="evenodd" />
                </svg>
                AI Suggested Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col">
                        <div className="flex-grow">
                             <div className="flex justify-between items-start">
                                <p className="font-semibold text-slate-800 text-sm pr-2">{suggestion.name}</p>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${suggestion.estimatedROI >= 100 ? 'bg-green-100 text-green-800' : suggestion.estimatedROI >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-200 text-slate-700'}`}>
                                    ~{suggestion.estimatedROI}% ROI
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{suggestion.reason}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-slate-500 font-medium">
                                    Est. Cost: <span className="font-semibold text-slate-700">{formatCurrency(suggestion.estimatedCost)}</span>
                                </p>
                                <button
                                    onClick={() => handleToggle(index)}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-1 rounded hover:bg-indigo-50 transition-colors"
                                    aria-expanded={expandedIndex === index}
                                >
                                    {expandedIndex === index ? 'Hide Cost Breakdown' : 'View Cost Breakdown'}
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedIndex === index ? 'max-h-40' : 'max-h-0'}`}>
                                <div className="mt-2 pt-2 border-t border-dashed border-slate-300 space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Est. Material Cost (~60%)</span>
                                        <span className="font-medium text-slate-700">{formatCurrency(suggestion.estimatedCost * 0.6)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Est. Labor Cost (~40%)</span>
                                        <span className="font-medium text-slate-700">{formatCurrency(suggestion.estimatedCost * 0.4)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectSuggestions;