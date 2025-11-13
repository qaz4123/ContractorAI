
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DemoBanner: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-semibold sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>You are in a demo environment. Your data will not be saved permanently.</span>
                <button 
                    onClick={() => navigate('/register')}
                    className="ml-2 bg-white/20 hover:bg-white/30 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors"
                >
                    Create a Real Account
                </button>
            </div>
        </div>
    );
};

export default DemoBanner;
