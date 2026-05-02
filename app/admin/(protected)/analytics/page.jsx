'use client'

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/data';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function AnalyticsPage() {
    const [days, setDays] = useState(7);
    const { data, error, isLoading } = useSWR(['/admin/pageviews/stats', { days }], fetcher);

    if (error) return <div className="p-8 text-red-500">Failed to load analytics data</div>;
    if (isLoading) return <div className="p-8 animate-pulse">Loading analytics...</div>;

    const stats = data || {};

    // 1. Line Chart Data (Views + Visitors)
    const lineChartData = {
        labels: stats.daily_trends?.map(d => d.date) || [],
        datasets: [
            {
                label: 'Page Views',
                data: stats.daily_trends?.map(d => d.views) || [],
                borderColor: 'rgb(109, 49, 237)',
                backgroundColor: 'rgba(109, 49, 237, 0.5)',
                tension: 0.3,
            },
            {
                label: 'Unique Visitors',
                data: stats.daily_trends?.map(d => d.visitors) || [],
                borderColor: 'rgb(20, 184, 166)',
                backgroundColor: 'rgba(20, 184, 166, 0.5)',
                tension: 0.3,
            },
        ],
    };

    // 2. Top Pages Data
    const topPagesData = {
        labels: stats.top_pages?.map(p => p.path) || [],
        datasets: [
            {
                label: 'Views',
                data: stats.top_pages?.map(p => p.views) || [],
                backgroundColor: 'rgba(109, 49, 237, 0.8)',
            },
        ],
    };

    // 3. Device Breakdown Data
    const deviceData = {
        labels: stats.device_breakdown?.map(d => d.device_type) || [],
        datasets: [
            {
                data: stats.device_breakdown?.map(d => d.count) || [],
                backgroundColor: [
                    'rgba(109, 49, 237, 0.8)',
                    'rgba(20, 184, 166, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                ],
            },
        ],
    };

    // 4. Browser Breakdown Data
    const browserData = {
        labels: stats.browser_breakdown?.map(b => b.browser) || [],
        datasets: [
            {
                label: 'Views',
                data: stats.browser_breakdown?.map(b => b.count) || [],
                backgroundColor: 'rgba(20, 184, 166, 0.8)',
            },
        ],
    };

    // 5. Country Data
    const countryData = {
        labels: stats.top_countries?.map(c => c.country) || [],
        datasets: [
            {
                label: 'Views',
                data: stats.top_countries?.map(c => c.count) || [],
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
            },
        ],
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Traffic Analytics</h1>
                    <p className="text-gray-500">Real-time tracking of visitor behavior and site performance.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                days === d ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Last {d} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Page Views" value={stats.summary?.total_views || 0} icon="icon-[solar--eye-bold-duotone]" color="text-indigo-600" bg="bg-indigo-50" />
                <MetricCard title="Unique Visitors" value={stats.summary?.unique_visitors || 0} icon="icon-[solar--users-group-rounded-bold-duotone]" color="text-teal-600" bg="bg-teal-50" />
                <MetricCard title="Avg Views / Day" value={Math.round((stats.summary?.total_views || 0) / days)} icon="icon-[solar--chart-bold-duotone]" color="text-amber-600" bg="bg-amber-50" />
                <MetricCard title="Pages Tracked" value={stats.top_pages?.length || 0} icon="icon-[solar--layers-bold-duotone]" color="text-rose-600" bg="bg-rose-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Traffic Trend</h3>
                    <div className="h-[300px]">
                        <Line data={lineChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Device Type</h3>
                    <div className="h-[250px] flex items-center justify-center">
                        <Doughnut data={deviceData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Pages */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Top Pages</h3>
                    <div className="h-[300px]">
                        <Bar data={topPagesData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Browser Breakdown */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Browsers</h3>
                    <div className="h-[300px]">
                        <Bar data={browserData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Country Breakdown */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Top Countries</h3>
                    <div className="h-[300px]">
                        <Bar data={countryData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6">Top Referrers</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="pb-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Source</th>
                                <th className="pb-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest text-right">Views</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.top_referrers?.length > 0 ? stats.top_referrers.map((ref, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0">
                                    <td className="py-4 font-bold text-gray-700 truncate max-w-xs">{ref.referrer || 'Direct / Unknown'}</td>
                                    <td className="py-4 text-right font-black text-indigo-600">{ref.count.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="2" className="py-8 text-center text-gray-400 italic">No referrer data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold">Recent Activity</h3>
                        <p className="text-sm text-gray-400">Live stream of the last 50 page views.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Live
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                <th className="pb-4">Time</th>
                                <th className="pb-4">Page Path</th>
                                <th className="pb-4">Location</th>
                                <th className="pb-4">Device</th>
                                <th className="pb-4">Browser</th>
                                <th className="pb-4 text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recent_activity?.length > 0 ? stats.recent_activity.map((hit, i) => (
                                <tr key={hit.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                                        {new Date(hit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800 truncate max-w-xs">{hit.path}</span>
                                            <span className="text-[10px] text-gray-400 truncate max-w-xs">{hit.referrer || 'Direct'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">{hit.country || 'Unknown'}</span>
                                            <span className="text-[10px] text-gray-400">{hit.city}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                            hit.device_type === 'mobile' ? 'bg-blue-50 text-blue-600' : 
                                            hit.device_type === 'tablet' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'
                                        }`}>
                                            {hit.device_type}
                                        </span>
                                    </td>
                                    <td className="py-4 text-xs text-gray-600">{hit.browser}</td>
                                    <td className="py-4 text-right text-xs font-mono text-gray-400">{hit.ip_address}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400 italic">No activity recorded yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                <span className={`${icon} w-8 h-8`} />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h4 className="text-2xl font-black text-gray-900">{value.toLocaleString()}</h4>
            </div>
        </div>
    );
}
