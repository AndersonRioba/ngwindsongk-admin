'use client'
import MonitoringFrame from "@/app/UI/MonitoringFrame";

export default function PulsePage() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
    return (
        <div className="p-4 lg:p-8">
            <MonitoringFrame 
                url={`${apiBaseUrl}/pulse`} 
                title="Laravel Pulse" 
            />
        </div>
    );
}
