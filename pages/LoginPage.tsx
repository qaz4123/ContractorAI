
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';


interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
    const { handleDemoLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard', { replace: true });
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                 setError('Invalid email or password.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error("Firebase login error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const onDemoLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const user = await handleDemoLogin();
            if (user) {
                navigate('/dashboard', { replace: true });
            } else {
                 setError('Could not log in as demo user.');
            }
        } catch (err) {
            setError('Could not log in as demo user.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Branding & Testimonial */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-16">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 to-slate-950/95"></div>
                <div className="relative z-10 max-w-xl text-white">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-indigo-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold tracking-tight">ContractorAI</span>
                    </div>
                    <h2 className="text-5xl font-extrabold mb-8 leading-tight">Welcome back to your command center.</h2>
                    <blockquote className="text-xl text-indigo-100 leading-relaxed border-l-4 border-indigo-500 pl-6 py-2 italic">
                        "Since using ContractorAI, our close rate has gone up by 40%. The financing integration alone has paid for itself ten times over. It's an absolute game-changer."
                    </blockquote>
                    <div className="mt-6 flex items-center gap-4 pl-6">
                        {/* Avatar Placeholder */}
                        <div className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center text-indigo-200 font-bold">SJ</div>
                        <div>
                             <p className="font-bold text-white">Sarah Jenkins</p>
                             <p className="text-indigo-300 text-sm">Owner, Jenkins Contracting</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-16 relative bg-white">
                <Link to="/" className="absolute top-8 left-8 group flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Home
                </Link>

                <div className="max-w-md w-full mx-auto mt-12 lg:mt-0">
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Sign In</h1>
                        <p className="text-slate-600 text-lg">Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                required
                                placeholder="you@company.com"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                                required
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                        
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-md">
                                {error}
                            </div>
                        )}

                        <button
                            id="login-button"
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                     <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Want to see it in action?</p>
                        <button onClick={onDemoLogin} disabled={isLoading} className="w-full text-sm bg-white border border-slate-300 text-slate-600 py-2.5 px-4 rounded-lg font-bold hover:bg-slate-100 transition-colors disabled:opacity-50">
                            Log In as Demo User
                        </button>
                    </div>

                    <p className="text-center text-slate-600 mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
                            Create free account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;