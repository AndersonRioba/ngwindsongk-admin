'use client'
import MonitoringFrame from "@/app/UI/MonitoringFrame";

export default function TelescopePage() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
    return (
        <div className="p-4 lg:p-8">
            <MonitoringFrame 
                url={`${apiBaseUrl}/telescope`} 
                title="Laravel Telescope" 
            />
        </div>
    );
}
