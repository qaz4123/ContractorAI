
import React, { useMemo } from 'react';
import { Lead } from '../types';
import { getMarketTrendsForLead } from '../services/analyticsService';

interface MarketInsightsProps {
    lead: Lead;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const MarketInsights: React.FC<MarketInsightsProps> = ({ lead }) => {
    const trends = useMemo(() => getMarketTrendsForLead(lead), [lead]);

    if (trends.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-slate-800 to-indigo-900 p-4 sm:p-5 rounded-lg shadow-md text-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Market Intelligence
            </h2>
            <p className="text-sm text-indigo-200 mb-4">
                How this property compares to <span className="font-bold text-white">{trends[0].dataPoints}</span> others analyzed on our platform.
            </p>

            <div className="space-y-4">
                {trends.map(trend => {
                    const leadValue = trend.category === 'Property Value' ? lead.dossier.estimatedValue : lead.estimatedEquity;
                    const percentDiff = ((leadValue - trend.averageValue) / trend.averageValue) * 100;
                    const isPositive = percentDiff > 0;

                    return (
                        <div key={trend.category} className="bg-white/10 p-3 rounded-lg border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-indigo-100">{trend.category}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                                    {isPositive ? '+' : ''}{Math.round(percentDiff)}% vs Avg
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-bold">{formatCurrency(leadValue)}</p>
                                    <p className="text-xs text-indigo-300">This Property</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-indigo-200">{formatCurrency(trend.averageValue)}</p>
                                    <p className="text-xs text-indigo-400">Market Average</p>
                                </div>
                            </div>
                            {/* Simple comparative bar */}
                             <div className="mt-3 h-1.5 bg-black/20 rounded-full overflow-hidden relative">
                                <div 
                                    className={`absolute h-full rounded-full ${isPositive ? 'bg-green-400' : 'bg-orange-400'}`}
                                    style={{ 
                                        width: `${Math.min(100, (leadValue / (trend.averageValue * 2)) * 100)}%`,
                                        left: 0
                                    }} 
                                />
                                <div className="absolute h-full w-0.5 bg-white/50 top-0 left-1/2" title="Market Average"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MarketInsights;
