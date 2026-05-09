'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import Spinner from "@/app/UI/Spinner";
import { getStoreUrl } from "@/app/lib/urls";

export default function AdminPrivateRoute({ children }) {
    const { user, token, isAdmin, isLoading, isVerifyingToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('AdminPrivateRoute redirection check:', { isLoading, isVerifyingToken, token, isAdmin });
        if (!isLoading && !isVerifyingToken) {
            if (!token) {
                console.log('No token detected, redirecting to admin login');
                router.push('/login');
            } else if (user && !isAdmin) {
                // Only redirect to shop if we have a user object and confirmed they are NOT an admin
                console.log('User identified as non-admin, redirecting to shop');
                window.location.href = `${getStoreUrl()}/login?token=${token}`;
            }
        }
    }, [isAdmin, token, isLoading, isVerifyingToken, router, user]);

    if (isLoading || isVerifyingToken) {
        return <Spinner full={true} />;
    }

    if (!token || !isAdmin) {
        return null;
    }

    return children;
}
