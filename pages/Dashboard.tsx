
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeadScore, Status, User, SubscriptionTier } from '../types';
import Header from '../components/Header';
import LeadList from '../components/LeadList';
import FilterModal from '../components/FilterModal';
import MapView from '../components/MapView';
import DashboardAnalytics from '../components/DashboardAnalytics';
import AddLeadOptions from '../components/AddLeadOptions';
import KanbanBoard from '../components/KanbanBoard';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../contexts/LeadsContext';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { leads } = useLeads();
  
  if (!userProfile) {
    return null; // Or a loading state, though route protection should prevent this
  }
  const user = userProfile;
  const { subscriptionTier } = user;

  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'board' | 'map'>('list');
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isAddLeadOpen, setAddLeadOpen] = useState(false);
  const [filters, setFilters] = useState<{
    leadScores: LeadScore[];
    statuses: Status[];
    showArchived: boolean;
  }>({
    leadScores: [],
    statuses: [],
    showArchived: false,
  });

  const filteredLeads = useMemo(() => {
    const activeLeads = filters.showArchived ? leads : leads.filter(lead => !lead.isArchived);
    
    return activeLeads.filter(lead => {
      const scoreMatch = filters.leadScores.length === 0 || filters.leadScores.includes(lead.leadScore);
      const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(lead.status);
      return scoreMatch && statusMatch;
    });
  }, [leads, filters]);

  const activeLeads = useMemo(() => leads.filter(lead => !lead.isArchived), [leads]);
  
  // Feature Gating Logic
  const FREE_TIER_LEAD_LIMIT = 3;
  const isFreeTier = subscriptionTier === SubscriptionTier.Free;
  const hasReachedLeadLimit = isFreeTier && activeLeads.length >= FREE_TIER_LEAD_LIMIT;

  const handleMapClick = (coords: { lat: number; lng: number }) => {
       if (hasReachedLeadLimit) {
           alert("You've reached the lead limit for the Free tier. Please upgrade to add more leads.");
           navigate('/pricing');
           return;
       }
       navigate('/add-lead', { state: { coords } });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <Header 
        title="Dashboard"
        onFilterClick={() => setFilterModalOpen(true)}
      />
      
      <main className="flex-grow overflow-y-auto p-4 md:p-8 pb-28">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {isFreeTier && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                      <p className="font-bold text-lg flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-200" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                          Free Tier Status
                      </p>
                      <p className="text-indigo-100 text-sm mt-1">You have used <span className="font-semibold text-white">{activeLeads.length}</span> of <span className="font-semibold text-white">{FREE_TIER_LEAD_LIMIT}</span> available leads.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/pricing')}
                    className="bg-white text-indigo-600 px-6 py-2.5 rounded-full font-bold hover:bg-indigo-50 transition-all hover:scale-105 whitespace-nowrap shadow-md"
                   >
                      Unlock Pro Features
                  </button>
              </div>
          )}

          <DashboardAnalytics leads={activeLeads} />
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                 <h2 className="font-bold text-lg text-slate-800">Pipeline & Leads</h2>
                 <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setView('list')}
                        className={`py-2 px-4 sm:px-5 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setView('board')}
                        className={`py-2 px-4 sm:px-5 rounded-lg text-sm font-bold transition-all ${view === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Board
                    </button>
                    <button
                        onClick={() => setView('map')}
                        className={`py-2 px-4 sm:px-5 rounded-lg text-sm font-bold transition-all ${view === 'map' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Map
                    </button>
                </div>
            </div>
            
            <div className="p-4 sm:p-6 bg-slate-50/50">
                 {view === 'map' && <p className="text-center text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 py-2 rounded-lg mb-4">Tip: Click anywhere on the map to drop a pin and add a new lead.</p>}
                 {view === 'list' && <LeadList leads={filteredLeads} />}
                 {view === 'board' && <KanbanBoard leads={filteredLeads} />}
                 {view === 'map' && <MapView leads={filteredLeads} onMapClick={handleMapClick} />}
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => hasReachedLeadLimit ? navigate('/pricing') : setAddLeadOpen(true)}
        className={`fixed bottom-8 right-8 text-white rounded-full px-6 py-4 shadow-xl shadow-indigo-900/20 z-20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${hasReachedLeadLimit ? 'bg-slate-800 hover:bg-slate-900' : 'bg-indigo-600 hover:bg-indigo-500'}`}
        aria-label="Add New Lead"
      >
        {hasReachedLeadLimit ? (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                <span className="font-bold">Upgrade to Add</span>
            </>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-bold text-lg">New Lead</span>
            </>
        )}
      </button>

      <AddLeadOptions isOpen={isAddLeadOpen} onClose={() => setAddLeadOpen(false)} />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default Dashboard;
