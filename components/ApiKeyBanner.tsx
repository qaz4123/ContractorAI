
import React from 'react';

const ApiKeyBanner: React.FC = () => {
    return (
        <div className="bg-red-600 text-white p-4 z-50 fixed top-0 left-0 right-0 shadow-lg border-b-2 border-red-700">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                    <strong className="font-bold">Action Required:</strong> The Google Maps API key is invalid. 
                    Map features are disabled. Please update the key in <code className="bg-red-400 font-mono p-1 rounded">'index.html'</code>.
                    <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-red-200 ml-2 whitespace-nowrap">
                        Get Key &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyBanner;
