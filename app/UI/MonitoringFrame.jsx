'use client'
import { useState, useEffect } from 'react';

export default function MonitoringFrame({ url, title }) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-4 border-b flex items-center justify-between bg-gray-50/50">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    <p className="text-xs text-gray-500">Real-time monitoring from the backend API.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isLoading && (
                        <div className="flex items-center gap-2 text-primary animate-pulse">
                            <span className="icon-[solar--refresh-bold-duotone] w-4 h-4 animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest">Loading Dashboard...</span>
                        </div>
                    )}
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                    >
                        Open in New Tab
                        <span className="icon-[solar--export-bold-duotone] w-3 h-3" />
                    </a>
                </div>
            </div>
            
            <div className="flex-1 relative">
                <iframe 
                    src={url} 
                    className="absolute inset-0 w-full h-full border-0"
                    onLoad={() => setIsLoading(false)}
                    title={title}
                />
            </div>
        </div>
    );
}
