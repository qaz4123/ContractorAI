
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface RegisterPageProps {}

const SocialButton: React.FC<{ provider: 'Google' | 'Facebook', onClick: () => void }> = ({ provider, onClick }) => {
    const isGoogle = provider === 'Google';
    const Icon = isGoogle ? (
        <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.31 0-11.62-4.22-13.48-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
    ) : (
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-.83 0-1.5.67-1.5 1.5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>
    );

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border font-semibold transition-colors ${
                isGoogle 
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                : 'bg-[#1877F2] border-[#1877F2] text-white hover:bg-[#166fe5]'
            }`}
        >
            {Icon}
            Continue with {provider}
        </button>
    );
};

const Requirement: React.FC<{ met: boolean, text: string }> = ({ met, text }) => (
    <div className={`flex items-center text-xs transition-colors ${met ? 'text-green-600' : 'text-slate-500'}`}>
        {met ? (
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        ) : (
             <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        )}
        <span>{text}</span>
    </div>
);


const RegisterPage: React.FC<RegisterPageProps> = () => {
    const { handleRegister } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [passwordFocused, setPasswordFocused] = useState(false);
    
    const [passwordValidity, setPasswordValidity] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
    });

    useEffect(() => {
        setPasswordValidity({
            minLength: password.length >= 9,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*]/.test(password),
        });
    }, [password]);

    const allPasswordRequirementsMet = Object.values(passwordValidity).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!allPasswordRequirementsMet) {
            setError('Password does not meet all requirements.');
            return;
        }

        if (!fullName.trim()) {
            setError('Please enter your full name.');
            return;
        }
        
        if (!industry) {
            setError('Please select your primary industry.');
            return;
        }

        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // After successful auth creation, create the user profile in Firestore
            const userProfile = await handleRegister({ email, fullName, companyName, industry });
            if (userProfile) {
                navigate('/dashboard', { replace: true });
            } else {
                 setError('Could not create user profile.');
            }
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else {
                setError('An unexpected error occurred during registration.');
            }
            console.error("Firebase registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSocialLogin = () => {
        alert("Social login is for demonstration purposes only.");
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Value Props */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-16">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 opacity-95"></div>
                <div className="relative z-10 max-w-xl text-white">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-inner border border-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold tracking-tight">ContractorAI</span>
                    </div>
                    <h2 className="text-5xl font-extrabold mb-8 leading-tight">Start closing more deals today.</h2>
                    <ul className="space-y-6 text-xl text-indigo-50 font-medium">
                        <li className="flex items-center gap-4">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Instant AI property intelligence
                        </li>
                        <li className="flex items-center gap-4">
                             <div className="bg-white/20 p-1.5 rounded-full">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Integrated financing offers
                        </li>
                        <li className="flex items-center gap-4">
                             <div className="bg-white/20 p-1.5 rounded-full">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Full project & financial tracking
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 relative bg-white">
                <Link to="/" className="absolute top-8 left-8 group flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Home
                </Link>

                <div className="max-w-md w-full mx-auto mt-12 lg:mt-0">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</h1>
                        <p className="text-slate-600 text-lg">Start your 14-day free trial. No credit card needed.</p>
                    </div>

                     <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <SocialButton provider="Google" onClick={handleSocialLogin} />
                        <SocialButton provider="Facebook" onClick={handleSocialLogin} />
                    </div>
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-sm font-semibold">OR</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                required
                                placeholder="e.g., John Doe"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                required
                                placeholder="you@company.com"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                className="w-full px-4 py-3 bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                required
                                placeholder="Create a strong password"
                                aria-describedby="password-requirements"
                                disabled={isLoading}
                            />
                        </div>

                         {passwordFocused && (
                            <div id="password-requirements" className="p-3 bg-slate-50 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <Requirement met={passwordValidity.minLength} text="At least 9 characters" />
                                <Requirement met={passwordValidity.hasUpper} text="One uppercase letter" />
                                <Requirement met={passwordValidity.hasLower} text="One lowercase letter" />
                                <Requirement met={passwordValidity.hasNumber} text="One number" />
                                <Requirement met={passwordValidity.hasSpecial} text="One special char (!@#...)" />
                            </div>
                        )}

                        <div>
                            <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700 mb-2">Company Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                placeholder="e.g., Doe Construction"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="industry" className="block text-sm font-semibold text-slate-700 mb-2">Primary Industry</label>
                             <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all appearance-none" required disabled={isLoading}>
                                <option value="" disabled>Select an industry...</option>
                                <option value="General Contracting">General Contracting</option>
                                <option value="Kitchen & Bath Remodeling">Kitchen & Bath Remodeling</option>
                                <option value="Roofing">Roofing</option>
                                <option value="Siding & Windows">Siding & Windows</option>
                                <option value="Landscaping">Landscaping</option>
                                <option value="Plumbing/HVAC">Plumbing/HVAC</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        {error && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-md">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!allPasswordRequirementsMet || isLoading}
                            className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Free Account'}
                        </button>
                    </form>

                    <p className="text-center text-slate-600 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;