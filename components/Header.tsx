
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, SubscriptionTier } from '../types';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onFilterClick?: () => void;
  onExportClick?: () => void;
  onArchiveClick?: () => void;
  isArchived?: boolean;
  user?: User | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton, onFilterClick, onExportClick, onArchiveClick, isArchived, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicPage = ['/', '/pricing'].includes(location.pathname);
  const isDashboard = location.pathname === '/dashboard';

  // Don't render standard header on login/register pages as they have their own layouts now
  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <header className={`sticky top-0 z-30 border-b transition-all ${isPublicPage ? 'py-4 bg-white/80 border-transparent' : 'py-3 bg-white/90 border-slate-200/80'} backdrop-blur-md supports-[backdrop-filter]:bg-white/60`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Go Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
              <div className="bg-indigo-600 text-white p-1.5 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">ContractorAI</span>
          </Link>
           {title && !isPublicPage && <span className="mx-4 text-slate-300 font-light text-2xl">/</span>}
           {title && !isPublicPage && <h1 className="text-lg font-semibold text-slate-800 hidden sm:block truncate max-w-xs">{title}</h1>}
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-3">
            {/* Public Navigation */}
            {!user && (
                <>
                    <Link to="/pricing" className={`text-sm font-semibold px-4 py-2 rounded-full transition-all ${location.pathname === '/pricing' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>Pricing</Link>
                    <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 hidden sm:block hover:bg-slate-50 rounded-full transition-colors">Sign In</Link>
                    <Link to="/register" className="bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-indigo-500 transition-all shadow-sm hover:shadow-md ml-2">Get Started</Link>
                </>
            )}

            {/* Authenticated Navigation */}
            {user && (
                <>
                    {!isDashboard && <Link to="/dashboard" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">Dashboard</Link>}
                     {user.subscriptionTier === SubscriptionTier.Free && (
                        <Link to="/pricing" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:shadow-md transition-all shadow-sm mr-1 sm:mr-0 flex items-center gap-1.5">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.414-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 8 8 0 008 18a8 8 0 008-8 8 8 0 00-3.605-6.447z" clipRule="evenodd" /></svg>
                           UPGRADE
                        </Link>
                    )}
                     <div className="hidden sm:flex items-center">
                        <Link to="/billing" className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors ${location.pathname === '/billing' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                            Billing
                        </Link>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center border-l-2 border-slate-100 ml-2 pl-2 sm:ml-4 sm:pl-4 gap-1.5">
                         {onArchiveClick && (
                            <button
                            onClick={onArchiveClick}
                            className={`p-2 rounded-full transition-colors ${isArchived ? 'bg-yellow-100 text-yellow-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                            title={isArchived ? 'Un-archive lead' : 'Archive lead'}
                            >
                            {isArchived ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            )}
                            </button>
                        )}
                        {onExportClick && (
                            <button onClick={onExportClick} className="text-slate-500 p-2 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Export to CRM">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </button>
                        )}
                        {onFilterClick && (
                            <button onClick={onFilterClick} className="text-slate-500 p-2 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Filter Leads">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L12 14.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 016 17v-2.586L3.293 6.707A1 1 0 013 6V4z" />
                                </svg>
                            </button>
                        )}
                        {onLogout && (
                            <button onClick={onLogout} className="text-slate-400 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors" title="Logout">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </>
            )}
        </nav>
      </div>
    </header>
  );
};

export default Header;