
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Lead, Status, FinancingStatus, Quote, LeadSource, ProjectSchedule, ProjectPhaseStatus, FinancialTransaction, FinancialTransactionType, ChangeOrder, ActivityLogItem } from '../types';
import Header from '../components/Header';
import CrmExportModal from '../components/CrmExportModal';
import FinancingModal from '../components/FinancingModal';
import ActivityLog from '../components/ActivityLog';
import QuoteGeneratorModal from '../components/QuoteGeneratorModal';
import QuoteSummary from '../components/QuoteSummary';
import ProjectSuggestions from '../components/ProjectSuggestions';
import AddToCalendarModal from '../components/AddToCalendarModal';
import ProjectScheduleComponent from '../components/ProjectSchedule';
import ProjectScheduleModal from '../components/ProjectScheduleModal';
import ProjectFinances from '../components/ProjectFinances';
import FinancialTransactionModal from '../components/FinancialTransactionModal';
import LeadScoreBreakdown from '../components/LeadScoreBreakdown';
import ChangeOrders from '../components/ChangeOrders';
import ChangeOrderModal from '../components/ChangeOrderModal';
import DataIntegrations from '../components/DataIntegrations';
import OutreachGeneratorModal from '../components/OutreachGeneratorModal';
import DossierChat from '../components/DossierChat';
import MarketInsights from '../components/MarketInsights';
import VoiceMemoModal from '../components/VoiceMemoModal';
import { enrichDossier, summarizeDossierForContractor, generateDossier, enrichOwnerProfile } from '../services/geminiService';
import { setCachedDossier } from '../services/dossierCache';
import { calculateEquity, calculateLeadScore } from '../services/leadUtils';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../contexts/LeadsContext';


declare const google: any;

interface DossierPageProps {}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const LeadSourceIcon: React.FC<{ source: LeadSource }> = ({ source }) => {
    const iconMap = {
        [LeadSource.AI]: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>,
        [LeadSource.Manual]: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>,
        [LeadSource.Web]: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.998 5.998 0 0116 9.5a.5.5 0 01-.5.5h-1.034a.5.5 0 00-.472.331l-.256.768a.5.5 0 01-.94.065l-.425-1.275a.5.5 0 00-.94-.065l-.256.768a.5.5 0 01-.472.331H9a.5.5 0 01-.5-.5 2.5 2.5 0 00-5 0 .5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5c0-.18.01-.357.032-.531z" clipRule="evenodd" /></svg>,
    };
    return <div title={`Source: ${source}`} className="p-1.5 bg-slate-200 text-slate-600 rounded-full">{iconMap[source]}</div>;
};

const FinancingStatusBadge: React.FC<{ status: FinancingStatus }> = ({ status }) => {
    const statusStyles: { [key in FinancingStatus]: string } = {
        [FinancingStatus.NotOffered]: 'bg-slate-200 text-slate-700',
        [FinancingStatus.Pending]: 'bg-yellow-100 text-yellow-800',
        [FinancingStatus.PreQualified]: 'bg-blue-100 text-blue-800',
        [FinancingStatus.Approved]: 'bg-green-100 text-green-800',
        [FinancingStatus.Denied]: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>{status}</span>
    );
};

const DossierPage: React.FC<DossierPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const { leads, updateLead } = useLeads();
  
  const currentLead = leads.find(l => l.id === id);
  const user = userProfile!;

  const [isScoreBreakdownVisible, setIsScoreBreakdownVisible] = useState(false);
  const [isCrmModalOpen, setCrmModalOpen] = useState(false);
  const [isFinancingModalOpen, setFinancingModalOpen] = useState(false);
  const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isFinanceModalOpen, setFinanceModalOpen] = useState(false);
  const [isChangeOrderModalOpen, setChangeOrderModalOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isVoiceMemoModalOpen, setIsVoiceMemoModalOpen] = useState(false);
  const [financeModalType, setFinanceModalType] = useState<FinancialTransactionType>(FinancialTransactionType.Expense);
  const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapApiLoaded, setIsMapApiLoaded] = useState(false);

  useEffect(() => {
    const checkApi = () => {
        if (typeof google !== 'undefined' && google.maps) {
            setIsMapApiLoaded(true);
            return true;
        }
        return false;
    };
    if (checkApi()) return;
    const intervalId = setInterval(() => { if (checkApi()) clearInterval(intervalId); }, 100);
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    if (currentLead) {
      setIsSummaryLoading(true);
      summarizeDossierForContractor(currentLead.dossier)
        .then(setAiSummary)
        .finally(() => setIsSummaryLoading(false));
    }
  }, [currentLead]); // Re-run summary when the lead object changes


  useEffect(() => {
    if (isMapApiLoaded && currentLead && !currentLead.propertyImage && mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
            center: currentLead.coords,
            zoom: 15,
            mapId: `DOSSIER_MAP_${currentLead.id}`,
            disableDefaultUI: true,
        });
        new google.maps.Marker({
            position: currentLead.coords,
            map: map,
        });
    }
  }, [currentLead, isMapApiLoaded]);


  if (!currentLead) {
    return <Navigate to="/dashboard" />;
  }

  const { dossier } = currentLead;
  
  const scoreUncertaintyDisplay = currentLead.leadScoreUncertainty && currentLead.leadScoreUncertainty > 0 ? ` (±${currentLead.leadScoreUncertainty})` : '';
  const scoreValueDisplay = currentLead.leadScoreValue !== undefined ? `(${currentLead.leadScoreValue}${scoreUncertaintyDisplay} / 100)` : '';

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value as Status;
      const note = `Status updated to: ${newStatus}`;
      const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
      updateLead({ ...currentLead, status: newStatus, activityLog: [newActivity, ...currentLead.activityLog] });
  };
  
  const addActivityLog = (note: string) => {
    if (!note.trim()) return;
    const newActivity: ActivityLogItem = { id: uuidv4(), timestamp: new Date().toISOString(), note };
    updateLead({ ...currentLead, activityLog: [newActivity, ...currentLead.activityLog] });
  }

  const handleAddActivity = (note: string) => {
    if (!note.trim()) return;
    addActivityLog(note);
  };
  
  const handleAddMultipleActivities = (notes: string[]) => {
      if (!notes || notes.length === 0) return;
      const newActivities: ActivityLogItem[] = notes.map(note => ({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          note,
      }));
      updateLead({ ...currentLead, activityLog: [...newActivities, ...currentLead.activityLog] });
  };


  const handleDeleteActivity = (activityId: string) => {
    const updatedLog = currentLead.activityLog.filter(act => act.id !== activityId);
    updateLead({ ...currentLead, activityLog: updatedLog });
  };

  const handleFinancingStatusUpdate = (newStatus: FinancingStatus, activityNote?: string, lenderId?: string, commission?: number) => {
    const updatedLead: Lead = { ...currentLead, financingStatus: newStatus };
    if (lenderId) updatedLead.selectedLenderId = lenderId;
    if (commission) updatedLead.projectedPlatformCommission = commission;
    if (activityNote) {
        const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note: activityNote };
        updatedLead.activityLog = [newActivity, ...updatedLead.activityLog];
    }
    updateLead(updatedLead);
  };

  const handleSaveQuote = (quote: Quote) => {
    const isNewQuote = !currentLead.quote;
    const updatedLead = { ...currentLead, quote, status: Status.ProposalSent };
    const note = isNewQuote ? `Quote created for ${formatCurrency(quote.total)}. Status updated to Proposal Sent.` : `Quote updated. New total: ${formatCurrency(quote.total)}.`;
    const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
    updatedLead.activityLog = [newActivity, ...updatedLead.activityLog];
    updateLead(updatedLead);
  };

  const handleDeleteQuote = () => {
    if (window.confirm("Are you sure you want to delete this quote? This action cannot be undone.")) {
        const note = `Quote of ${formatCurrency(currentLead.quote!.total)} deleted.`;
        const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
        updateLead({ ...currentLead, quote: undefined, activityLog: [newActivity, ...currentLead.activityLog] });
    }
  };

  const handleArchiveToggle = () => {
    const newArchivedState = !currentLead.isArchived;
    const note = newArchivedState ? 'Lead archived.' : 'Lead un-archived.';
    const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
    updateLead({ ...currentLead, isArchived: newArchivedState, activityLog: [newActivity, ...currentLead.activityLog] });
  };

  const handleSaveTransaction = (transaction: Omit<FinancialTransaction, 'id'> & { id?: string }) => {
    let note = '';
    let updatedFinances;

    if (transaction.id) {
        updatedFinances = (currentLead.finances || []).map(f => f.id === transaction.id ? { ...f, ...transaction, type: f.type } as FinancialTransaction : f);
        note = `Financial transaction updated: ${formatCurrency(transaction.amount)} for "${transaction.description}".`;
    } else {
        const newTransaction = { ...transaction, id: uuidv4() } as FinancialTransaction;
        updatedFinances = [newTransaction, ...(currentLead.finances || [])];
        note = `${transaction.type} of ${formatCurrency(transaction.amount)} logged for "${transaction.description}".`;
    }
    const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
    updateLead({ ...currentLead, finances: updatedFinances, activityLog: [newActivity, ...currentLead.activityLog] });
  };

  const handleDeleteTransaction = (id: string) => {
      const txToDelete = (currentLead.finances || []).find(f => f.id === id);
      if (!txToDelete || !window.confirm(`Are you sure you want to delete this ${txToDelete.type.toLowerCase()} of ${formatCurrency(txToDelete.amount)}?`)) return;
      const updatedFinances = (currentLead.finances || []).filter(f => f.id !== id);
      const note = `Financial transaction deleted: ${txToDelete.type} of ${formatCurrency(txToDelete.amount)} for "${txToDelete.description}".`;
      const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
      updateLead({ ...currentLead, finances: updatedFinances, activityLog: [newActivity, ...currentLead.activityLog] });
  };
  
  const handleOpenFinanceModal = (type: FinancialTransactionType) => {
    setTransactionToEdit(null);
    setFinanceModalType(type);
    setFinanceModalOpen(true);
  };
  
  const handleOpenEditFinanceModal = (tx: FinancialTransaction) => {
    setTransactionToEdit(tx);
    setFinanceModalType(tx.type);
    setFinanceModalOpen(true);
  }

  const handleSaveSchedule = (schedule: ProjectSchedule) => {
    const note = `Project schedule ${currentLead.schedule ? 'updated' : 'created'}.`;
    const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
    updateLead({ ...currentLead, schedule, activityLog: [newActivity, ...currentLead.activityLog] });
  };

  const handlePhaseStatusUpdate = (phaseId: string, newStatus: ProjectPhaseStatus) => {
      if (!currentLead.schedule) return;
      const updatedPhases = currentLead.schedule.phases.map(p => p.id === phaseId ? { ...p, status: newStatus } : p);
      const updatedSchedule = { ...currentLead.schedule, phases: updatedPhases };
      const phaseName = currentLead.schedule.phases.find(p => p.id === phaseId)?.name;
      const note = `Schedule update: Phase "${phaseName}" status changed to ${newStatus}.`;
      const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
      updateLead({ ...currentLead, schedule: updatedSchedule, activityLog: [newActivity, ...currentLead.activityLog] });
  };

    const handleSaveChangeOrder = (changeOrder: ChangeOrder) => {
      const updatedChangeOrders = [...(currentLead.changeOrders || []), changeOrder];
      const newTransaction: FinancialTransaction = {
          id: uuidv4(),
          type: FinancialTransactionType.Revenue,
          date: changeOrder.createdAt,
          amount: changeOrder.total,
          description: `Change Order #${updatedChangeOrders.length}: ${changeOrder.description}`,
          category: 'Change Order',
      };
      const updatedFinances = [...(currentLead.finances || []), newTransaction];
      let updatedQuote = currentLead.quote;
      if (updatedQuote) {
          const newTotal = updatedQuote.total + changeOrder.total;
          const newLineItems = [...updatedQuote.lineItems, ...changeOrder.lineItems];
          updatedQuote = { ...updatedQuote, total: newTotal, lineItems: newLineItems };
      }
      const note = `Change Order #${updatedChangeOrders.length} created for ${formatCurrency(changeOrder.total)}.`;
      const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
      updateLead({ ...currentLead, changeOrders: updatedChangeOrders, finances: updatedFinances, quote: updatedQuote, activityLog: [newActivity, ...currentLead.activityLog] });
  };

  const handleDeleteChangeOrder = (id: string) => {
    const orderToDelete = (currentLead.changeOrders || []).find(co => co.id === id);
    if (!orderToDelete || !window.confirm(`Are you sure you want to delete this change order for ${formatCurrency(orderToDelete.total)}? A reversing transaction will be created.`)) return;
    const reversingTransaction: FinancialTransaction = {
        id: uuidv4(),
        type: FinancialTransactionType.Expense,
        date: new Date().toISOString(),
        amount: orderToDelete.total,
        description: `Reversal for deleted Change Order: ${orderToDelete.description}`,
        category: 'Change Order Reversal'
    };
    const updatedFinances = [...(currentLead.finances || []), reversingTransaction];
    const updatedChangeOrders = (currentLead.changeOrders || []).filter(co => co.id !== id);
    const note = `Change Order for ${formatCurrency(orderToDelete.total)} deleted. A reversing expense was logged.`;
    const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
    updateLead({ ...currentLead, changeOrders: updatedChangeOrders, finances: updatedFinances, activityLog: [newActivity, ...currentLead.activityLog] });
  };
  
  const handlePhotoClick = () => { fileInputRef.current?.click(); };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const note = `Added a property photo.`;
        const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
        const updatedLead = { ...currentLead, propertyImage: reader.result as string, activityLog: [newActivity, ...currentLead.activityLog] };
        updateLead(updatedLead);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleOwnerNameChange = (newName: string) => {
    const note = `Owner name updated to: ${newName}.`;
    const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
    const updatedLead = { 
        ...currentLead, 
        dossier: { ...currentLead.dossier, ownerName: newName },
        activityLog: [newActivity, ...currentLead.activityLog]
    };
    updateLead(updatedLead);
  };

  const handleEnrichDossier = async (type: 'neighborhood' | 'owner') => {
      setIsEnriching(true);
      try {
          const enrichmentFunction = type === 'owner' ? enrichOwnerProfile : enrichDossier;
          const dossierToEnrich = { ...currentLead.dossier };

          // Clear old data for the specific enrichment type
          if (type === 'neighborhood') {
              dossierToEnrich.neighborhoodInfo = undefined;
              dossierToEnrich.schoolRatings = undefined;
              dossierToEnrich.recentPermits = undefined;
          } else {
              dossierToEnrich.ownerProfile = {
                  ...dossierToEnrich.ownerProfile,
                  email: undefined,
                  phone: undefined
              };
          }

          const { dossier: enrichedDossier, groundingChunks: newChunks } = await enrichmentFunction(dossierToEnrich, currentLead.address);
          
          const mergedChunks = [...(currentLead.groundingChunks || []), ...(newChunks || [])];
          const uniqueChunks = mergedChunks.filter((chunk, index, self) => index === self.findIndex((c) => ((c.web?.uri === chunk.web?.uri && c.web?.uri !== undefined) || (c.maps?.uri === chunk.maps?.uri && c.maps?.uri !== undefined))));
          
          const note = `Dossier enriched with ${type} data.`;
          const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };
          
          updateLead({ ...currentLead, dossier: enrichedDossier, groundingChunks: uniqueChunks, activityLog: [newActivity, ...currentLead.activityLog] });
      } catch (error) {
          alert(`Failed to enrich dossier with ${type} data. Please try again.`);
      } finally {
          setIsEnriching(false);
      }
  };
  
   const handleRefreshDossier = async () => {
      if (!window.confirm("This will use AI to fetch the latest data and overwrite existing information, updating your local cache. Are you sure?")) {
        return;
      }
      setIsRefreshing(true);
      try {
          const { dossier: newDossier, groundingChunks: newChunks } = await generateDossier(currentLead.address, user.industry);
          setCachedDossier(currentLead.address, newDossier);
          
          const newEquity = calculateEquity(newDossier);
          if (!newDossier.mortgageDetails.estimatedRemainingBalance) {
                newDossier.mortgageDetails.estimatedRemainingBalance = Math.round(newDossier.estimatedValue - newEquity);
          }
          const { score: newScore, value: newScoreValue, uncertainty: newUncertainty } = calculateLeadScore(newDossier, newEquity);

          const note = "Main dossier data refreshed with the latest AI analysis.";
          const newActivity = { id: uuidv4(), timestamp: new Date().toISOString(), note };

          const updatedLead = {
              ...currentLead,
              dossier: newDossier,
              groundingChunks: newChunks,
              estimatedEquity: newEquity,
              leadScore: newScore,
              leadScoreValue: newScoreValue,
              leadScoreUncertainty: newUncertainty,
              activityLog: [newActivity, ...currentLead.activityLog],
          };
          
          updateLead(updatedLead);
      } catch (error) {
          alert("Failed to refresh dossier. Please try again.");
      } finally {
          setIsRefreshing(false);
      }
  };

  const isFinancingEnabled = currentLead.status === Status.Contacted || currentLead.status === Status.MeetingSet;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Header title="Property Dossier" showBackButton onExportClick={() => setCrmModalOpen(true)} onArchiveClick={handleArchiveToggle} isArchived={currentLead.isArchived} />
      
      <main className="flex-grow p-4 md:p-6 pb-28 relative">
        <div className="max-w-4xl mx-auto space-y-6">
          {currentLead.isArchived && ( <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert"><p className="font-bold">Archived</p><p>This lead is archived. Un-archive to perform actions.</p></div> )}

          {/* Summary Section */}
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3 flex-grow min-w-0">
                <LeadSourceIcon source={currentLead.source} />
                <div className="min-w-0">
                  <input type="text" value={dossier.ownerName} onChange={(e) => handleOwnerNameChange(e.target.value)} disabled={currentLead.isArchived} className="text-xl font-bold text-slate-800 bg-transparent focus:bg-slate-100 rounded px-2 py-0.5 w-full border-transparent focus:border-slate-300 focus:ring-0" aria-label="Owner Name" />
                  <p className="text-sm text-slate-500 px-2">{currentLead.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                  <button onClick={() => setIsOutreachModalOpen(true)} disabled={currentLead.isArchived} className="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold py-1.5 px-3 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>Generate Outreach</button>
                  <button onClick={handleRefreshDossier} disabled={currentLead.isArchived || isRefreshing} className="text-slate-500 p-2 rounded-full hover:bg-slate-100 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Refresh Main Dossier">
                    {isRefreshing ? ( <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg> )}
                  </button>
                  <button onClick={() => setIsScoreBreakdownVisible(!isScoreBreakdownVisible)} aria-expanded={isScoreBreakdownVisible} className={`text-center p-2 rounded-md transition-all hover:shadow-lg ${ currentLead.leadScore === 'A' ? 'bg-green-100 text-green-800 hover:bg-green-200' : currentLead.leadScore === 'B' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-red-100 text-red-800 hover:bg-red-200' }`}><div className="text-2xl font-bold">{currentLead.leadScore}</div><div className="text-xs font-medium">{scoreValueDisplay}</div></button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4">
                <div className="flex-grow"><label htmlFor="status" className="block text-xs font-medium text-slate-500">Lead Status</label><select id="status" value={currentLead.status} onChange={handleStatusChange} disabled={currentLead.isArchived} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-slate-100">{Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="text-right"><label className="block text-xs font-medium text-slate-500 mb-1.5">Financing</label><FinancingStatusBadge status={currentLead.financingStatus} /></div>
            </div>
             <button onClick={() => setIsOutreachModalOpen(true)} disabled={currentLead.isArchived} className="w-full sm:hidden mt-3 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold py-2 px-3 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>Generate Outreach</button>
          </div>
          
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isScoreBreakdownVisible ? 'max-h-[500px]' : 'max-h-0'}`}><LeadScoreBreakdown lead={currentLead} /></div>
          
          <div className="bg-gradient-to-br from-indigo-700 to-slate-800 p-4 sm:p-5 rounded-lg shadow-md text-white">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-indigo-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>AI Summary</h2>
            {isSummaryLoading ? (<div className="space-y-2 animate-pulse"><div className="h-4 bg-slate-600 rounded w-5/6"></div><div className="h-4 bg-slate-600 rounded w-4/6"></div><div className="h-4 bg-slate-600 rounded w-3/4"></div></div>) : (<ul className="list-disc list-inside space-y-2 text-indigo-200 text-sm font-medium pl-1">{aiSummary.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}</ul>)}
          </div>

          <MarketInsights lead={currentLead} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">Financial Snapshot</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg"><p className="text-xs text-blue-700 font-semibold">Est. Value</p><p className="font-bold text-slate-800 text-xl">{formatCurrency(dossier.estimatedValue)}</p></div>
                    <div className="bg-green-50 border border-green-100 p-3 rounded-lg"><p className="text-xs text-green-700 font-semibold">Est. Equity</p><p className="font-bold text-slate-800 text-xl">{formatCurrency(currentLead.estimatedEquity)}</p></div>
                </div>
                 {dossier.taxLiens && ( <div className="flex items-center gap-3 p-3 bg-red-50 border-l-4 border-red-400 rounded"><div className="text-red-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg></div><div><p className="text-sm text-red-700 font-semibold">Active Tax Lien Found</p></div></div> )}
                <div><h3 className="font-semibold text-slate-700 text-base">Mortgage Details</h3><div className="mt-2 text-sm space-y-2 text-slate-600"><p><strong>Lender:</strong> {dossier.mortgageDetails.lenderName}</p><p><strong>Loan ( {dossier.mortgageDetails.loanYear} ):</strong> {formatCurrency(dossier.mortgageDetails.originalLoanAmount)} at ~{dossier.mortgageDetails.estimatedRate}%</p><p><strong>Est. Balance:</strong> {formatCurrency(dossier.mortgageDetails.estimatedRemainingBalance || 0)}</p></div></div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
                 <h2 className="text-lg font-semibold text-slate-800">Property & Owner Profile</h2>
                 <div className="w-full h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 relative"> {currentLead.propertyImage ? (<div className="relative group"><img src={currentLead.propertyImage} alt="Property" className="w-full h-40 object-cover rounded-lg" /><button onClick={handlePhotoClick} disabled={currentLead.isArchived} className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden">Change</button></div>) : (<div className="w-full h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 relative">{isMapApiLoaded && typeof google !== 'undefined' && google.maps ? (<div ref={mapRef} className="w-full h-full rounded-lg"></div>) : (<div className="w-full h-full flex items-center justify-center text-slate-500">Loading map...</div>)}<div className="absolute bottom-2 left-1/2 -translate-x-1/2"><button onClick={handlePhotoClick} disabled={currentLead.isArchived} className="bg-white text-slate-700 text-sm font-semibold py-1.5 px-4 rounded-full hover:bg-slate-50 border border-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Add Photo</button></div></div>)}<input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" capture="environment" /></div>
                 <div><h3 className="font-semibold text-slate-700 text-base">Core Stats</h3><p className="mt-1 text-sm text-slate-600">{dossier.propertyDetails.yearBuilt} build, {dossier.propertyDetails.sqFootage} sqft, {dossier.propertyDetails.bedrooms} beds, {dossier.propertyDetails.bathrooms} baths</p></div>
                 <div><h3 className="font-semibold text-slate-700 text-base">Demographics</h3><p className="mt-1 text-sm text-slate-600">{dossier.demographics.lifeStageProfile}, Age ~{dossier.demographics.estOwnerAgeRange}, Income {dossier.demographics.estHouseholdIncome}</p></div>
                {(dossier.ownerProfile?.phone || dossier.ownerProfile?.email) && (
                    <div>
                        <h3 className="font-semibold text-slate-700 text-base">Contact Info</h3>
                        <div className="mt-1 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                            {dossier.ownerProfile.phone && (
                                <a href={`tel:${dossier.ownerProfile.phone}`} className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                    <span>{dossier.ownerProfile.phone}</span>
                                </a>
                            )}
                            {dossier.ownerProfile.email && (
                                <a href={`mailto:${dossier.ownerProfile.email}`} className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                    <span>{dossier.ownerProfile.email}</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </div>

          <DataIntegrations dossier={dossier} onEnrich={() => handleEnrichDossier('neighborhood')} isEnriching={isEnriching} isDisabled={currentLead.isArchived} />
          <ProjectSuggestions suggestions={dossier.projectSuggestions} />

          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-2">
                 <h2 className="text-lg font-semibold text-slate-800">Quote</h2>
                 <div className="flex items-center gap-2">{currentLead.quote && ( <button onClick={handleDeleteQuote} disabled={currentLead.isArchived} className="text-red-600 text-sm font-semibold py-1 px-3 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Delete</button> )}<button onClick={() => setQuoteModalOpen(true)} disabled={currentLead.isArchived} className="bg-slate-100 text-slate-700 text-sm font-semibold py-1 px-3 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{currentLead.quote ? 'View / Edit Quote' : 'Create Quote'}</button></div>
            </div>
            {currentLead.quote ? ( <QuoteSummary quote={currentLead.quote} formatCurrency={formatCurrency} /> ) : ( <p className="text-sm text-slate-500">No quote has been created for this lead yet.</p> )}
          </div>
          
          <ProjectFinances transactions={currentLead.finances || []} onAddTransaction={handleOpenFinanceModal} onEditTransaction={handleOpenEditFinanceModal} onDeleteTransaction={handleDeleteTransaction} isArchived={currentLead.isArchived} formatCurrency={formatCurrency} />
          <ProjectScheduleComponent lead={currentLead} onEditClick={() => setScheduleModalOpen(true)} onUpdatePhaseStatus={handlePhaseStatusUpdate} />
          <ChangeOrders lead={currentLead} onCreateClick={() => setChangeOrderModalOpen(true)} onDelete={handleDeleteChangeOrder} formatCurrency={formatCurrency} />
          <ActivityLog activities={currentLead.activityLog} onAddActivity={handleAddActivity} onDeleteActivity={handleDeleteActivity} isArchived={currentLead.isArchived} onAddToCalendarClick={() => setCalendarModalOpen(true)} onAddVoiceMemoClick={() => setIsVoiceMemoModalOpen(true)} />

          {currentLead.groundingChunks && currentLead.groundingChunks.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Data Sources</h2>
                <ul className="list-disc list-inside space-y-2 text-sm">{currentLead.groundingChunks.map((chunk, index) => { const source = chunk.web || chunk.maps; if (!source || !source.uri) return null; return ( <li key={index}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{source.title || source.uri}</a><span className="text-xs text-slate-500 ml-2">({chunk.web ? 'Web' : 'Map'})</span></li> ); })}</ul>
            </div>
          )}
          <div className="bg-slate-200 p-3 rounded-lg border border-slate-300"><p className="text-xs text-slate-600"><strong>Disclaimer:</strong> All data are estimates for marketing context ONLY and cannot be used as the sole basis for offering or denying services or credit.</p></div>
        </div>
        <DossierChat dossier={dossier} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-4xl mx-auto">
          <button disabled={!isFinancingEnabled || currentLead.isArchived} onClick={() => setFinancingModalOpen(true)} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 004.566 0V7.151c.22.071.412.164.567.267v1.698a2.5 2.5 0 004.566 0V7.151c.22.071.412.164.567.267l1.962-1.132a1 1 0 00.11-1.542A1 1 0 0017.34.45L12.79.167a1 1 0 00-.786 0L7.45.45a1 1 0 00-.592 1.256l1.962 1.132z" /><path fillRule="evenodd" d="M12 10a2.5 2.5 0 00-2.5 2.5V17a2.5 2.5 0 105 0v-4.5A2.5 2.5 0 0012 10zm-3 2.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" clipRule="evenodd" /></svg>Offer Financing</button>
          {!isFinancingEnabled && <p className="text-xs text-center text-slate-500 mt-2">Financing can be offered once status is "Contacted" or "Meeting Set".</p>}
        </div>
      </footer>

      <CrmExportModal isOpen={isCrmModalOpen} onClose={() => setCrmModalOpen(false)} lead={currentLead} />
      <FinancingModal isOpen={isFinancingModalOpen} onClose={() => setFinancingModalOpen(false)} lead={currentLead} onFinancingStatusUpdate={handleFinancingStatusUpdate} />
      <QuoteGeneratorModal isOpen={isQuoteModalOpen} onClose={() => setQuoteModalOpen(false)} lead={currentLead} onSaveQuote={handleSaveQuote} />
      <AddToCalendarModal isOpen={isCalendarModalOpen} onClose={() => setCalendarModalOpen(false)} lead={currentLead} onSave={handleAddActivity} />
      <ProjectScheduleModal isOpen={isScheduleModalOpen} onClose={() => setScheduleModalOpen(false)} lead={currentLead} onSave={handleSaveSchedule} />
      <FinancialTransactionModal isOpen={isFinanceModalOpen} onClose={() => { setFinanceModalOpen(false); setTransactionToEdit(null); }} onSave={handleSaveTransaction} transactionType={financeModalType} transactionToEdit={transactionToEdit} />
      <ChangeOrderModal isOpen={isChangeOrderModalOpen} onClose={() => setChangeOrderModalOpen(false)} onSave={handleSaveChangeOrder} />
      <OutreachGeneratorModal isOpen={isOutreachModalOpen} onClose={() => setIsOutreachModalOpen(false)} lead={currentLead} />
      <VoiceMemoModal isOpen={isVoiceMemoModalOpen} onClose={() => setIsVoiceMemoModalOpen(false)} onSave={handleAddMultipleActivities} />
    </div>
  );
};

export default DossierPage;