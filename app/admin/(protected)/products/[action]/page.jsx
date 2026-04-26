import { redirect } from 'next/navigation';

export default function Page({ params, searchParams }) {
    const action = params?.action;
    
    if (searchParams && Object.keys(searchParams).length > 0) {
        const queryString = new URLSearchParams(searchParams).toString();
        redirect(`/admin/products/${action}/info${queryString ? `?${queryString}` : ''}`);
    } else {
        redirect(`/admin/products/${action}/info`);
    }
}