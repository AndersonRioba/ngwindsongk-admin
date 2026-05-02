'use client'
import MonitoringFrame from "@/app/UI/MonitoringFrame";

export default function PulsePage() {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/pulse`;
    return (
        <div className="p-4 lg:p-8">
            <MonitoringFrame 
                url={url} 
                title="Laravel Pulse" 
            />
        </div>
    );
}
