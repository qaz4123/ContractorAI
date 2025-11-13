import React from 'react';
import { Dossier } from '../types';

interface DataIntegrationsProps {
    dossier: Dossier;
    onEnrich: () => void;
    isEnriching: boolean;
    isDisabled: boolean;
}

const DataIntegrations: React.FC<DataIntegrationsProps> = ({ dossier, onEnrich, isEnriching, isDisabled }) => {
    const hasEnrichedData = dossier.neighborhoodInfo || dossier.schoolRatings || dossier.recentPermits;

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    Data Enrichment
                </h2>
                <div className="flex items-center gap-2">
                    {hasEnrichedData && (
                        <button
                            onClick={onEnrich}
                            disabled={isEnriching || isDisabled}
                            className="bg-slate-100 text-slate-700 text-sm font-semibold py-1 px-3 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                             {isEnriching ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            ) : (
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                            )}
                            <span>{isEnriching ? 'Refreshing...' : 'Refresh Enrichment'}</span>
                        </button>
                    )}
                </div>
            </div>

            {!hasEnrichedData ? (
                <div className="text-center py-6">
                    <p className="text-sm text-slate-500 mb-4">Deepen your insights by fetching neighborhood stats, school ratings, and recent permit activity.</p>
                    <button
                        onClick={onEnrich}
                        disabled={isEnriching || isDisabled}
                        className="bg-indigo-50 text-indigo-700 py-2 px-4 rounded-md font-semibold hover:bg-indigo-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto gap-2"
                    >
                         {isEnriching ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                Enriching Dossier...
                            </>
                        ) : (
                           'Enrich Dossier with AI'
                        )}
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {dossier.neighborhoodInfo && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                 <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    Neighborhood
                                 </h3>
                                 <div className="text-sm space-y-1 text-slate-700">
                                    <p><span className="text-slate-500 font-medium">Vibe:</span> {dossier.neighborhoodInfo.vibe}</p>
                                    <p><span className="text-slate-500 font-medium">Walk Score:</span> {dossier.neighborhoodInfo.walkScore}</p>
                                    <p><span className="text-slate-500 font-medium">Crime:</span> {dossier.neighborhoodInfo.crimeRate}</p>
                                 </div>
                            </div>
                        )}
                         {dossier.schoolRatings && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                 <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
                                    Schools
                                 </h3>
                                 <p className="text-sm text-slate-700">{dossier.schoolRatings}</p>
                            </div>
                        )}
                        {dossier.recentPermits && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                 <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                                    Recent Permits
                                 </h3>
                                 <p className="text-sm text-slate-700">{dossier.recentPermits}</p>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200/80">
                        <strong>Disclaimer:</strong> This data is sourced from real-time public web searches. Availability and completeness can vary.
                    </p>
                </>
            )}
        </div>
    );
};

export default DataIntegrations;