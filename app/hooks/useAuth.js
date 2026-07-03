'use client';
import { useContext } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { postData } from "@/app/lib/data";
import { save } from "@/app/lib/storage";
import { useRouter } from "next/navigation";

export default function useAuth() {
    const context = useContext(AuthContext);
    const router = useRouter();

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, token, setToken, isLoading, isVerifyingToken, setIsVerifyingToken } = context;

    const login = async (phone, password) => {
        return new Promise((resolve) => {
            postData((response) => {
                if (response.success && response.token) {
                    const userData = response.user;
                    const userToken = response.token;

                    setUser(userData);
                    setToken(userToken);

                    save('user', userData);
                    save('token', userToken);
                    document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax; Secure";

                    resolve({ success: true, user: userData, token: userToken });
                } else {
                    resolve({ success: false, message: response.message || "Login failed" });
                }
            }, { phone, password }, '/login');
        });
    };

    const loginWithToken = async (newToken) => {
        setIsVerifyingToken(true);
        return new Promise((resolve) => {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                headers: {
                    'Authorization': `Bearer ${newToken}`,
                    'Accept': 'application/json'
                }
            })
                .then(res => res.json())
                .then(response => {
                    if (response.user) {
                        let userData = response.user;
                        
                        // Merge roles and permissions if they are siblings
                        if (response.roles && !userData.roles) {
                            userData.roles = response.roles;
                        }
                        if (response.permissions && !userData.permissions) {
                            userData.permissions = response.permissions;
                        }

                        setUser(userData);
                        setToken(newToken);
                        save('user', userData);
                        save('token', newToken);
                        document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax; Secure";
                        resolve({ success: true, user: userData, token: newToken });
                    } else {
                        resolve({ success: false, message: "Invalid token" });
                    }
                })
                .catch(err => {
                    resolve({ success: false, message: err.message });
                })
                .finally(() => {
                    setIsVerifyingToken(false);
                });
        });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Redirect to the admin login interface
        router.push('/login');
    };

    return {
        user,
        token,
        isAdmin: (
            user?.role === 'admin' || 
            user?.role === 'superadmin' || 
            user?.role === 'super_admin' ||
            (user?.roles && Array.isArray(user.roles) && (
                user.roles.includes('admin') || 
                user.roles.includes('superadmin') || 
                user.roles.includes('super_admin')
            ))
        ),
        isLoading,
        isVerifyingToken,
        login,
        loginWithToken,
        logout
    };
}
