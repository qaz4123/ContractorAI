import React, { useState, useEffect } from 'react';
import { Lead, FinancingStatus, Lender } from '../types';

interface FinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onFinancingStatusUpdate: (newStatus: FinancingStatus, activityNote?: string, lenderId?: string, commission?: number) => void;
}

const MOCK_LENDERS: Lender[] = [
    { id: 'l1', name: 'Acorn Finance', logo: '🌰', minAPR: 4.99, maxLoanAmount: 100000, commissionRate: 0.015 },
    { id: 'l2', name: 'Hearth', logo: '🔥', minAPR: 3.99, maxLoanAmount: 250000, commissionRate: 0.012 },
    { id: 'l3', name: 'Synchrony', logo: '💳', minAPR: 5.99, maxLoanAmount: 50000, commissionRate: 0.02 },
    { id: 'l4', name: 'GreenSky', logo: '🟢', minAPR: 6.99, maxLoanAmount: 75000, commissionRate: 0.018 },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

const FinancingModal: React.FC<FinancingModalProps> = ({ isOpen, onClose, lead, onFinancingStatusUpdate }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [homeownerName, setHomeownerName] = useState('');
  const [projectAmount, setProjectAmount] = useState('');
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setHomeownerName(lead.dossier.ownerName);
      // Pre-fill if available
      setEmail(lead.dossier.ownerProfile?.email || '');
      setPhone(lead.dossier.ownerProfile?.phone || '');
      // Default to email if available, otherwise phone
      if (lead.dossier.ownerProfile?.email) {
          setContactMethod('email');
      } else if (lead.dossier.ownerProfile?.phone) {
          setContactMethod('phone');
      }
    }
  }, [lead]);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const calculateMonthlyPayment = (amount: number, apr: number, years: number) => {
      const principal = amount;
      const monthlyRate = (apr / 100) / 12;
      const numPayments = years * 12;
      return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
  }

  const validateInputs = () => {
    setError(null);
    if (contactMethod === 'email') {
        if (!email.trim() || !EMAIL_REGEX.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }
    } else { // phone
        if (!phone.trim() || !PHONE_REGEX.test(phone)) {
            setError('Please enter a valid 10-digit phone number.');
            return false;
        }
    }
    if (!projectAmount || Number(projectAmount) <= 0) {
        setError('Please enter a valid project amount.');
        return false;
    }
    return true;
  }

  const handleNext = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateInputs()) {
          setStep(2);
      }
  }

  const handleSend = async (lender: Lender) => {
    setSelectedLender(lender);
    setIsSending(true);
    setIsSuccess(false);

    const amount = Number(projectAmount);
    const potentialCommission = amount * lender.commissionRate;

    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
      setIsSending(false);
      
      const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      const contactTarget = contactMethod === 'email' ? `to ${email}` : `via SMS to ${phone}`;
      const activityNote = `Sent financing pre-qualification link via ${lender.name} for ${formattedAmount} ${contactTarget}.`;
      
      onFinancingStatusUpdate(FinancingStatus.Pending, activityNote, lender.id, potentialCommission);
      
      setTimeout(() => {
        handleClose();
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setStep(1);
    // Do not clear pre-filled contact info
    // setEmail('');
    // setPhone('');
    setProjectAmount('');
    setSelectedLender(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end" onClick={handleClose}>
      <div className="bg-white rounded-t-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Offer Financing</h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>
        
        {isSuccess ? (
             <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold">Invitation Sent via {selectedLender?.name}!</h3>
                <p className="text-slate-600">The homeowner will receive the pre-qualification link shortly.</p>
            </div>
        ) : step === 1 ? (
            <form onSubmit={handleNext}>
                <p className="text-sm text-slate-600 mb-6">Enter project details to see available financing offers from our partners.</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="homeownerName" className="block text-sm font-medium text-slate-700">Homeowner Name</label>
                        <input type="text" id="homeownerName" value={homeownerName} readOnly className="mt-1 w-full px-3 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-0 cursor-not-allowed" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contact Method</label>
                        <div className="flex gap-4">
                            <label className="flex items-center"><input type="radio" name="contactMethod" value="email" checked={contactMethod === 'email'} onChange={() => setContactMethod('email')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300" /> <span className="ml-2 text-sm">Email</span></label>
                            <label className="flex items-center"><input type="radio" name="contactMethod" value="phone" checked={contactMethod === 'phone'} onChange={() => setContactMethod('phone')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300" /> <span className="ml-2 text-sm">Phone (SMS)</span></label>
                        </div>
                    </div>

                    {contactMethod === 'email' ? (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                    ) : (
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Mobile Phone</label>
                            <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="555-123-4567" className="mt-1 w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                    )}
                   
                    <div>
                        <label htmlFor="projectAmount" className="block text-sm font-medium text-slate-700">Estimated Project Amount</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500 sm:text-sm">$</span>
                            </div>
                            <input type="number" id="projectAmount" value={projectAmount} onChange={e => setProjectAmount(e.target.value)} placeholder="75000" className="w-full pl-7 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-md font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Find Offers
                    </button>
                </div>
            </form>
        ) : (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">Select a lending partner to send to the homeowner.</p>
                    <button onClick={() => setStep(1)} className="text-sm text-indigo-600 hover:underline">Edit Details</button>
                </div>
                <div className="bg-slate-50 p-3 rounded-md mb-4 text-center">
                    <span className="text-sm text-slate-500">Project Amount:</span>
                    <span className="ml-2 font-bold text-slate-800">{formatCurrency(Number(projectAmount))}</span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {MOCK_LENDERS.map(lender => {
                        const amount = Number(projectAmount);
                        if (amount > lender.maxLoanAmount) return null;
                        
                        // Calculate a sample monthly payment for a 10-year term
                        const estPayment = calculateMonthlyPayment(amount, lender.minAPR, 10);

                        return (
                            <div key={lender.id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl" role="img" aria-label={lender.name}>{lender.logo}</span>
                                        <h3 className="font-bold text-slate-800">{lender.name}</h3>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Top Match</span>
                                </div>
                                <div className="flex justify-between text-sm mb-4">
                                    <div>
                                        <p className="text-slate-500">Est. APR as low as</p>
                                        <p className="font-semibold text-slate-800">{lender.minAPR}%</p>
                                    </div>
                                     <div className="text-right">
                                        <p className="text-slate-500">Est. Monthly (10yr)</p>
                                        <p className="font-semibold text-slate-800">~{formatCurrency(estPayment)}/mo</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSend(lender)}
                                    disabled={isSending}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
                                >
                                    {isSending && selectedLender?.id === lender.id ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                    ) : (
                                        `Send ${lender.name} Invite`
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default FinancingModal;