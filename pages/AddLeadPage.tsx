import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { generateDossier, getAddressFromCoords } from '../services/geminiService';
import { Dossier, Lead, Status, FinancingStatus, LeadSource, GroundingChunk } from '../types';
import Header from '../components/Header';
import { getCachedDossier, setCachedDossier } from '../services/dossierCache';
import { calculateEquity, calculateLeadScore } from '../services/leadUtils';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../contexts/LeadsContext';
import AddressSelectionModal from '../components/AddressSelectionModal';

// Declare google for global Google Maps API
declare const google: any;

// FIX: Define minimal interfaces for Google Maps types to resolve namespace errors.
interface PlaceResult {
    geometry: {
        location: {
            lat: () => number;
            lng: () => number;
        };
    };
    formatted_address?: string;
}

interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

interface GeocoderResult {
    geometry: {
        location: {
            lat: () => number;
            lng: () => number;
        };
    };
    address_components?: GeocoderAddressComponent[];
    formatted_address: string;
    place_id: string;
}

interface AddLeadPageProps {}

const LOADING_MESSAGES = [
    'Analyzing property records...',
    'Cross-referencing demographic data...',
    'Checking for tax liens...',
    'Estimating property value...',
    'Generating project suggestions...',
    'Building your property dossier...',
    'Almost there...',
];

const AddLeadPage: React.FC<AddLeadPageProps> = () => {
    const { userProfile } = useAuth();
    const { addLead } = useLeads();
    const user = userProfile;
    
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGeolocating, setIsGeolocating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const addressInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
    const [addressOptions, setAddressOptions] = useState<GeocoderResult[]>([]);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

    useEffect(() => {
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined' && addressInputRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place && place.geometry && place.formatted_address) {
                    setAddress(place.formatted_address);
                    setSelectedPlace(place);
                } else {
                    setSelectedPlace(null);
                }
            });
        }
    }, []);

    useEffect(() => {
        let interval: number | undefined;
        if (isLoading) {
            let messageIndex = 0;
            setLoadingMessage(LOADING_MESSAGES[0]);
            interval = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
                setLoadingMessage(LOADING_MESSAGES[messageIndex]);
            }, 2500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading]);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setIsGeolocating(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const foundAddress = await getAddressFromCoords(latitude, longitude);
                    setAddress(foundAddress);
                    setSelectedPlace(null); // We geocoded, so there's no 'place' object
                } catch (err) {
                     setError(err instanceof Error ? err.message : "Could not determine address from location.");
                } finally {
                    setIsGeolocating(false);
                }
            },
            (err) => {
                let message = "An unknown error occurred.";
                if (err.code === err.PERMISSION_DENIED) message = "Geolocation permission denied.";
                else if (err.code === err.POSITION_UNAVAILABLE) message = "Location information is unavailable.";
                setError(message);
                setIsGeolocating(false);
            }
        );
    };
    
    const proceedWithDossierGeneration = async (finalAddress: string, coords: { lat: number; lng: number }) => {
        try {
            let dossier: Dossier;
            let groundingChunks: GroundingChunk[] | undefined;
            let activityNote: string;

            const cachedDossier = getCachedDossier(finalAddress);

            if (cachedDossier) {
                setLoadingMessage('Loading from cache...');
                dossier = cachedDossier;
                groundingChunks = [];
                activityNote = 'Loaded dossier from cache.';
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                const { dossier: newDossier, groundingChunks: newGroundingChunks } = await generateDossier(finalAddress, user?.industry, coords);
                dossier = newDossier;
                groundingChunks = newGroundingChunks;
                setCachedDossier(finalAddress, dossier);
                activityNote = 'Generated dossier using AI Lookup with real-time data.';
            }

            const estimatedEquity = calculateEquity(dossier);
            if (!dossier.mortgageDetails.estimatedRemainingBalance) {
                dossier.mortgageDetails.estimatedRemainingBalance = Math.round(dossier.estimatedValue - estimatedEquity);
            }
            const { score: leadScore, value: leadScoreValue, uncertainty: leadScoreUncertainty } = calculateLeadScore(dossier, estimatedEquity);

            const newLead: Omit<Lead, 'id'> = {
                address: finalAddress,
                dossier,
                estimatedEquity,
                leadScore,
                leadScoreValue,
                leadScoreUncertainty,
                status: Status.New,
                financingStatus: FinancingStatus.NotOffered,
                coords,
                activityLog: [{ id: uuidv4(), timestamp: new Date().toISOString(), note: activityNote }],
                groundingChunks,
                quote: undefined,
                source: LeadSource.AI,
                isArchived: false,
                finances: [],
                propertyImage: undefined,
                schedule: undefined,
                changeOrders: [],
            };

            addLead(newLead);
            navigate(`/dashboard`, { replace: true });

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim()) {
            setError("Address cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);

        if (selectedPlace && selectedPlace.geometry) {
            const coords = { lat: selectedPlace.geometry.location.lat(), lng: selectedPlace.geometry.location.lng() };
            await proceedWithDossierGeneration(selectedPlace.formatted_address || address, coords);
            return;
        }

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address, componentRestrictions: { country: 'us' } }, (results: GeocoderResult[] | null, status: string) => {
            if (status === 'OK' && results) {
                const validResults = results.filter(result =>
                    result.address_components?.some(comp => comp.types.includes('street_number'))
                );

                if (validResults.length === 0) {
                    setError("Please enter a specific residential address including a house number.");
                    setIsLoading(false);
                    return;
                }

                if (validResults.length === 1) {
                    const result = validResults[0];
                    const coords = { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() };
                    proceedWithDossierGeneration(result.formatted_address, coords);
                } else {
                    setAddressOptions(validResults);
                    setIsSelectionModalOpen(true);
                    setIsLoading(false);
                }
            } else {
                setError("Could not find a valid location for the address. Please try being more specific.");
                setIsLoading(false);
            }
        });
    };
    
    const handleAddressSelection = (selection: GeocoderResult) => {
        setIsSelectionModalOpen(false);
        setIsLoading(true);
        const coords = { lat: selection.geometry.location.lat(), lng: selection.geometry.location.lng() };
        setAddress(selection.formatted_address);
        proceedWithDossierGeneration(selection.formatted_address, coords);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100">
            <Header title="Add Lead with AI" showBackButton />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-sm w-full mx-auto bg-white rounded-xl shadow-lg border border-slate-200/50 p-8">
                    <div className="text-left mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Property Address Lookup</h2>
                        <p className="text-sm text-slate-500 mt-1">Enter a property address to generate an instant qualification dossier using real-time data.</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                            <div className="relative">
                                <input
                                    ref={addressInputRef}
                                    type="text"
                                    id="address"
                                    value={address}
                                    onChange={(e) => {
                                        setAddress(e.target.value);
                                        setSelectedPlace(null);
                                    }}
                                    placeholder="e.g., 123 Main St, Anytown, USA"
                                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 text-sm"
                                    disabled={isLoading || isGeolocating}
                                />
                                <button
                                    type="button"
                                    onClick={handleUseMyLocation}
                                    disabled={isLoading || isGeolocating}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                    aria-label="Use my current location"
                                >
                                    {isGeolocating ? (
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading || isGeolocating}
                            className="w-full bg-[#4F46E5] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#4338CA] disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="w-48 text-left">{loadingMessage}</span>
                                </>
                            ) : (
                                "Generate Dossier"
                            )}
                        </button>
                    </form>
                </div>
            </main>
            <AddressSelectionModal
                isOpen={isSelectionModalOpen}
                onClose={() => setIsSelectionModalOpen(false)}
                options={addressOptions}
                onSelect={handleAddressSelection}
            />
        </div>
    );
};

export default AddLeadPage;