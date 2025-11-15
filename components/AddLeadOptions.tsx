
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AddLeadOptionsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddLeadOptions: React.FC<AddLeadOptionsProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;
  
  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end" onClick={onClose}>
      <div className="bg-white rounded-t-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-center text-slate-700">Add a New Lead</h2>
        </div>
        <div className="p-4 space-y-3">
            <button 
                onClick={() => handleNavigate('/add-lead')}
                className="w-full text-left flex items-center gap-4 p-4 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                </div>
                <div>
                    <p className="font-semibold text-slate-800">Use AI Address Lookup</p>
                    <p className="text-sm text-slate-500">Generate a full dossier from an address.</p>
                </div>
            </button>
            <button
                onClick={() => handleNavigate('/add-lead-manually')} 
                className="w-full text-left flex items-center gap-4 p-4 rounded-lg hover:bg-slate-100 transition-colors"
            >
                 <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                 </div>
                 <div>
                    <p className="font-semibold text-slate-800">Enter Details Manually</p>
                    <p className="text-sm text-slate-500">Quickly add a lead from a call or referral.</p>
                </div>
            </button>
            <button
                onClick={() => handleNavigate('/bulk-add-leads')} 
                className="w-full text-left flex items-center gap-4 p-4 rounded-lg hover:bg-slate-100 transition-colors"
            >
                 <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
                    </svg>
                 </div>
                 <div>
                    <p className="font-semibold text-slate-800">Bulk Add from List</p>
                    <p className="text-sm text-slate-500">Paste a list of addresses to process.</p>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddLeadOptions;