'use client'
import { Suspense, useState, useEffect } from "react";
import useAuth from "@/app/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import Logo from "@/app/UI/Logo";
import Spinner from "@/app/UI/Spinner";
import { getStoreUrl } from "@/app/lib/urls";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner /></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const [credentials, setCredentials] = useState({ phone: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, loginWithToken, token, user, isAdmin, isLoading } = useAuth();
    const searchParams = useSearchParams();
    const urlToken = searchParams.get('token');

    // Handle SSO token from URL - Prioritize URL token to refresh stale sessions
    useEffect(() => {
        if (urlToken) {
            const cleanToken = urlToken.replace(/^["']+|["']+$/g, '');
            // Only trigger if no token exists or if the URL token is different from the current session
            if (!token || cleanToken !== token) {
                console.log('LoginWithToken from URL (forced refresh):', cleanToken);
                loginWithToken(cleanToken).then(() => {
                    // Strip the token from the URL so it's not kept in browser history or leaked
                    window.history.replaceState({}, '', window.location.pathname);
                });
            } else {
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [urlToken, token, loginWithToken]);

    // Redirect if already logged in
    useEffect(() => {
        console.log('Admin Login redirection check:', { isLoading, token, isAdmin });
        if (!isLoading && token && user) {
            if (isAdmin) {
                window.location.href = '/admin/dashboard';
            } else {
                console.log('Regular user on admin login, redirecting to shop');
                window.location.href = `${getStoreUrl()}/login?token=${token}`;
            }
        }
    }, [user, token, isAdmin, isLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Changed from isSubmitting to isLoggingIn in instruction, but keeping original variable name for consistency with declaration
        setError('');

        const result = await login(credentials.phone, credentials.password); // Changed from credentials.phone, credentials.password to phone, password in instruction, but keeping original variable names for consistency with declaration
        
        setIsSubmitting(false);
        if (result.success) {
            const roles = result.user?.roles || [];
            const isResultAdmin = 
                result.user?.role === 'admin' || 
                result.user?.role === 'superadmin' || 
                result.user?.role === 'super_admin' ||
                roles.includes('admin') || 
                roles.includes('superadmin') || 
                roles.includes('super_admin');

            if (isResultAdmin) {
                // Use full page navigation so the admin_session cookie is
                // included in the middleware's request on the very next request.
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = `${getStoreUrl()}/login?token=${result.token}`;
            }
        } else {
            console.error('Login failed:', result.message);
            setError(result.message || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">User Login</h2>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
                            <input
                                type="text"
                                required
                                value={credentials.phone}
                                onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">Password</label>
                            <input
                                type="password"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-[#b5952f] text-white font-bold py-4 rounded-lg uppercase tracking-widest transition-all transform hover:scale-[1.02] disabled:opacity-50 flex justify-center items-center"
                        >
                            {isSubmitting ? <span className="icon-[tabler--loader-2] animate-spin w-6 h-6" /> : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="text-gray-500 text-center mt-8 text-sm">
                    &copy; {new Date().getFullYear()} Ngwindsongk. All rights reserved.
                </p>
            </div>
        </div>
    );
}
