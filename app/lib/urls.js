export const getStoreUrl = () => {
    const publicUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
    
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // If we are on the production admin subdomain but the store URL is still localhost
        if (hostname === 'admin.ngwindsongk.com' && publicUrl.includes('localhost')) {
            return 'https://ngwindsongk.com';
        }
        
        // General production fallback for any ngwindsongk.com subdomain
        if (hostname.includes('ngwindsongk.com') && publicUrl.includes('localhost')) {
            return 'https://ngwindsongk.com';
        }
        
        // If we are on any production-like environment (not localhost) but URL is localhost
        if (!hostname.includes('localhost') && publicUrl.includes('localhost')) {
            return 'https://ngwindsongk.com'; // Default production fallback
        }
    }
    
    return publicUrl;
};
