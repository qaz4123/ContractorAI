
import React, { useState } from 'react';
import { Lead } from '../types';

interface CrmExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const SalesforceIcon = () => (
    <svg className="w-8 h-8 text-[#00A1E0]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.35 15.34a.79.79 0 01-.19-.53.81.81 0 01.21-.53c.15-.14.33-.21.55-.21a.73.73 0 01.56.21c.15.15.22.33.22.53a.76.76 0 01-.22.53c-.15.15-.34.22-.56.22a.7.7 0 01-.55-.22zm-.86-2.5c.3-.3.66-.46 1.07-.46.42 0 .78.15 1.08.46.3.3.45.66.45 1.08s-.15.78-.45 1.07a1.48 1.48 0 01-1.08.45c-.41 0-.77-.15-1.07-.45a1.48 1.48 0 01-.45-1.07c0-.42.15-.78.45-1.08zm.86-5.46c.15-.14.33-.21.55-.21a.73.73 0 01.56.21c.15.15.22.33.22.53a.76.76 0 01-.22.53c-.15.15-.34.22-.56.22a.7.7 0 01-.55-.22.79.79 0 01-.19-.53.81.81 0 01.21-.53zm-.86-2.5c.3-.3.66-.46 1.07-.46.42 0 .78.15 1.08.46.3.3.45.66.45 1.08s-.15.78-.45 1.07a1.48 1.48 0 01-1.08.45c-.41 0-.77-.15-1.07-.45a1.48 1.48 0 01-.45-1.07c0-.42.15-.78.45-1.08zm6.11 11.2a.73.73 0 01.56.21c.15.15.22.33.22.53a.76.76 0 01-.22.53c-.15.15-.34.22-.56.22a.7.7 0 01-.55-.22.79.79 0 01-.19-.53.81.81 0 01.21-.53c.14-.14.33-.21.55-.21zm-.86-2.5c.3-.3.66-.46 1.07-.46.42 0 .78.15 1.08.46.3.3.45.66.45 1.08s-.15.78-.45 1.07a1.48 1.48 0 01-1.08.45c-.41 0-.77-.15-1.07-.45a1.48 1.48 0 01-.45-1.07c0-.42.15-.78.45-1.08zM18 11.75a6.43 6.43 0 00-6.43-6.43A6.43 6.43 0 005.14 11.75a6.43 6.43 0 006.43 6.43 6.43 6.43 0 006.43-6.43z"/></svg>
);
  
const HubSpotIcon = () => (
    <svg className="w-8 h-8 text-[#FF7A59]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M15.13 8.33a5.52 5.52 0 10-5.85 5.2 5.51 5.51 0 005.85-5.2zM12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
);

const ZohoIcon = () => (
    <svg className="w-8 h-8 text-[#E62E2D]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.75 21a.75.75 0 01-.75-.75V3.75a.75.75 0 011.5 0V12h6.25a.75.75 0 010 1.5H5.5v6.75A.75.75 0 014.75 21z" fill="currentColor"/>
    <path d="M12.75 19a.75.75 0 01-.75-.75V9.75a.75.75 0 011.5 0V11h5.25a.75.75 0 010 1.5H13.5v5.75a.75.75 0 01-.75.75z" fill="currentColor"/>
    <path d="M9.75 16a.75.75 0 01-.75-.75V6.75a.75.75 0 011.5 0V8h8.25a.75.75 0 010 1.5H10.5v5.75a.75.75 0 01-.75.75z" fill="currentColor"/>
    </svg>
);

const CRM_LIST = [
    { name: 'Salesforce', icon: <SalesforceIcon /> },
    { name: 'HubSpot', icon: <HubSpotIcon /> },
    { name: 'Zoho CRM', icon: <ZohoIcon /> },
]

const CrmExportModal: React.FC<CrmExportModalProps> = ({ isOpen, onClose, lead }) => {
  const [exportingTo, setExportingTo] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = (crmName: string) => {
    setExportingTo(crmName);
    setIsSuccess(false);
    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500); // Close after showing success
    }, 1000);
  };

  const handleClose = () => {
    setExportingTo(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end" onClick={handleClose}>
      <div className="bg-white rounded-t-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Export Lead</h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>
        <p className="text-sm text-slate-600 mb-6">Export lead <span className="font-semibold">{lead?.dossier.ownerName}</span> to your CRM.</p>
        
        <div className="space-y-3">
          {CRM_LIST.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => handleExport(name)}
              disabled={!!exportingTo}
              className="w-full flex items-center p-3 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {icon}
              <span className="ml-4 font-semibold text-slate-700">{name}</span>
              <div className="ml-auto">
                {exportingTo === name && !isSuccess && (
                  <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {exportingTo === name && isSuccess && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrmExportModal;
