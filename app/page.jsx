'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import Spinner from "@/app/UI/Spinner";

export default function RootPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('Admin Root redirection check:', { isLoading, token, role: user?.role });
        if (!isLoading && token && user) {
            if (user?.role === 'admin' || user?.role === 'super_admin') {
                router.push('/admin/dashboard');
            } else {
                console.log('Regular user on admin root, redirecting to shop');
                const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
                window.location.href = `${storeUrl}/login?token=${token}`;
            }
        } else if (!isLoading && !token) {
            router.push('/login');
        }
    }, [user, token, isLoading, router]);

    if (isLoading) {
        return <Spinner full={true} />;
    }

    if (!token) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Windsong</h1>
            <p className="text-lg text-gray-600 mb-8">You are logged in as a {user?.role}.</p>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
                <p className="text-gray-700 mb-6">Explore our shop and manage your profile.</p>
                <a 
                    href={`${process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}/`} 
                    className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg uppercase tracking-widest hover:bg-[#b5952f] transition-colors"
                >
                    Visit Shop
                </a>
            </div>
        </div>
    );
}
