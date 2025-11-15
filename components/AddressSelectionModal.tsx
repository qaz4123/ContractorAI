import React from 'react';

// Make sure google types are available. They should be from @types/google.maps
declare const google: any;

interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

// FIX: Define minimal interface for Google Maps GeocoderResult to resolve namespace error.
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

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: GeocoderResult[];
  onSelect: (selection: GeocoderResult) => void;
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({ isOpen, onClose, options, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-slate-800">Did you mean...?</h2>
                    <p className="text-sm text-slate-500">We found multiple locations. Please select the correct address.</p>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                    {options.map((option, index) => (
                        <button
                            key={option.place_id || index}
                            onClick={() => onSelect(option)}
                            className="w-full text-left p-3 rounded-md hover:bg-slate-100 transition-colors"
                        >
                            <p className="font-medium text-slate-700">{option.formatted_address}</p>
                        </button>
                    ))}
                </div>
                 <div className="p-4 bg-slate-50 rounded-b-lg">
                    <button onClick={onClose} className="w-full text-center text-sm font-semibold text-slate-600 hover:text-slate-900">
                        Cancel and Edit Address
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressSelectionModal;