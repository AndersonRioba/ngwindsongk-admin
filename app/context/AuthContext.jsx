'use client';
import React, { createContext, useState, useEffect } from 'react';
import { load } from '@/app/lib/storage';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifyingToken, setIsVerifyingToken] = useState(false);

    useEffect(() => {
        const storedToken = load('token');
        const storedUser = load('user');
        
        if (storedToken) {
            setToken(storedToken);
            setIsVerifyingToken(true);
            
            // Re-verify token on mount to refresh user roles/permissions
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Accept': 'application/json'
                }
            })
            .then(res => res.json())
            .then(response => {
                if (response.user) {
                    const userData = response.user;
                    setUser(userData);
                    // Update storage with fresh data (including Spatie roles)
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    // Token invalid
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
            })
            .catch(err => {
                console.error('Initial verification failed:', err);
                // On network error, we trust the storedUser temporarily but it might be stale
                if (storedUser) setUser(storedUser);
            })
            .finally(() => {
                setIsVerifyingToken(false);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const value = {
        user,
        setUser,
        token,
        setToken,
        isLoading,
        isVerifyingToken,
        setIsVerifyingToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
