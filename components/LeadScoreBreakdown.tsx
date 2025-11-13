import React from 'react';
import { Lead } from '../types';
import { calculateLeadScore } from '../services/leadUtils';

interface LeadScoreBreakdownProps {
  lead: Lead;
}

const FactorRow: React.FC<{ label: string, value: string, points: number }> = ({ label, value, points }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0">
        <div>
            <p className="text-sm font-medium text-slate-700">{label}</p>
            <p className="text-xs text-slate-500">{value}</p>
        </div>
        <span className={`text-sm font-bold ${points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {points >= 0 ? `+${points}` : points}
        </span>
    </div>
);

const LeadScoreBreakdown: React.FC<LeadScoreBreakdownProps> = ({ lead }) => {
    // Use the single source of truth for scoring logic
    const { value: scoreValue, breakdown, uncertainty } = calculateLeadScore(lead.dossier, lead.estimatedEquity);

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200 -mt-5">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Lead Score Breakdown</h3>
            <div className="space-y-1">
                {breakdown.map(factor => <FactorRow key={factor.label} {...factor} />)}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-slate-300">
                <p className="text-base font-bold text-slate-800">Total Score</p>
                <p className="text-lg font-bold text-slate-900">{scoreValue} / 100</p>
            </div>
            {uncertainty > 0 && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-300 text-center">
                    <p className="text-sm font-bold text-slate-700">±{uncertainty} point uncertainty</p>
                    <p className="text-xs text-slate-500">Score may change as more information is added to the dossier.</p>
                </div>
            )}
        </div>
    );
};

export default LeadScoreBreakdown;