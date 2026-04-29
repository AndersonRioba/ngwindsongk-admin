'use client'

import useSWR from 'swr';
import { fetcher } from '@/app/lib/data';

export default function RecentActivityPage() {
    const { data, error, isLoading } = useSWR(['/admin/pageviews/stats', { days: 1 }], fetcher, {
        refreshInterval: 10000, // Refresh every 10 seconds for "live" feel
    });

    if (error) return <div className="p-8 text-red-500">Failed to load activity data</div>;
    if (isLoading) return <div className="p-8 animate-pulse text-gray-400 font-bold uppercase tracking-widest">Fetching live stream...</div>;

    const activity = data?.recent_activity || [];

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        Recent Activity
                        <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-green-100">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Live Feed
                        </span>
                    </h1>
                    <p className="text-gray-500 font-medium">Real-time stream of the last 50 visitor actions on the storefront.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Interaction</th>
                                <th className="px-8 py-5">Device Detail</th>
                                <th className="px-8 py-5">Browser</th>
                                <th className="px-8 py-5 text-right">Visitor IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {activity.length > 0 ? activity.map((hit) => (
                                <tr key={hit.id} className="hover:bg-indigo-50/30 transition-all group">
                                    <td className="px-8 py-6 text-sm font-bold text-gray-500 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span>{new Date(hit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                            <span className="text-[10px] text-gray-300 font-medium">{new Date(hit.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">View</span>
                                                <span className="text-sm font-black text-gray-900 truncate max-w-[300px] group-hover:text-indigo-600 transition-colors">{hit.path}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[300px] flex items-center gap-1">
                                                <span className="icon-[solar--link-bold] w-3 h-3" />
                                                {hit.referrer || 'Direct Entry'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                hit.device_type === 'mobile' ? 'bg-blue-50 text-blue-600' : 
                                                hit.device_type === 'tablet' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                                <span className={
                                                    hit.device_type === 'mobile' ? 'icon-[solar--smartphone-bold-duotone]' : 
                                                    hit.device_type === 'tablet' ? 'icon-[solar--tablet-bold-duotone]' : 'icon-[solar--monitor-bold-duotone]'
                                                } />
                                            </span>
                                            <span className="text-xs font-black text-gray-600 uppercase tracking-tighter">{hit.device_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{hit.browser}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-xs font-mono font-bold text-gray-300 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                            {hit.ip_address}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="icon-[solar--ghost-bold-duotone] w-12 h-12 text-gray-200" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Waiting for incoming traffic...</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
