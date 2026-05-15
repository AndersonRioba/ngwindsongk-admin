'use client'
import { useState, useMemo } from "react"
import useSWR from "swr"
import { fetcher, getFile } from "@/app/lib/data"
import Search from "@/app/UI/Search"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

const methodColors = {
    pickup: 'bg-purple-100 text-purple-800',
    delivery: 'bg-indigo-100 text-indigo-800',
}

import BeautifulDatePicker from "@/app/UI/BeautifulDatePicker";

export default function DeliveriesPage() {
    let [search, setSearch] = useState('')
    let [dateFrom, setDateFrom] = useState('')
    let [dateTo, setDateTo] = useState('')
    let [page, setPage] = useState(1)

    const params = { page, sort: 'shipping_asc' }
    if (search) params.search = search
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo

    let { data, isLoading, error } = useSWR(['/sales', params], fetcher)

    const { orders, pagination } = useMemo(() => {
        const allOrders = data?.data || [];
        // Only include orders with successful payment status for the manifest
        const orders = allOrders.filter(order => order.payment_status === 'success');
        
        const pagination = data ? { current: data.current_page, last: data.last_page, total: data.total } : null;
        return { orders, pagination };
    }, [data])

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        return {
            today: orders.filter(o => o.expected_shipping_date === today).length,
            upcoming: orders.filter(o => o.expected_shipping_date > today).length,
            total: pagination?.total || 0
        }
    }, [orders, pagination])

    const handleExport = () => {
        getFile(`deliveries_manifest_${new Date().toISOString().split('T')[0]}.xlsx`, '/export/deliveries', { 
            date_from: dateFrom, 
            date_to: dateTo 
        })
    }

    return (
        <main className="mx-4 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />
            <div className="flex flex-col md:flex-row mt-8 justify-between items-start md:items-center gap-6">
                <h2 className="text-3xl font-black text-gray-800 tracking-tight lowercase capitalize">Fulfillment Manifest</h2>
            </div>

            {/* Priority Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 luxe-reveal">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Same-Day Priority</p>
                    <p className="text-4xl font-black mt-2 text-red-600 italic tracking-tighter">{stats.today}</p>
                    <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase">Cutoff: 10:00 AM EAT</p>
                </div>
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 luxe-reveal delay-75">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduled (Next Days)</p>
                    <p className="text-4xl font-black mt-2 text-secondary italic tracking-tighter">{stats.upcoming}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 luxe-reveal delay-150">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Fulfillment Queue</p>
                    <p className="text-4xl font-black mt-2 text-primary italic tracking-tighter">{stats.total}</p>
                </div>
            </div>

            {/* Fulfillment Filters */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 luxe-reveal">
                <div className="flex flex-col xl:flex-row gap-8 items-end">
                    
                    {/* Search Field */}
                    <div className="flex-[1.5] space-y-3 w-full">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search Database</label>
                        <Search search={search} setSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search by name, phone, or order slug..." />
                    </div>

                    {/* Date Intelligence */}
                    <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <BeautifulDatePicker 
                            label="Manifest Start"
                            value={dateFrom}
                            onChange={setDateFrom}
                        />
                        <BeautifulDatePicker 
                            label="Manifest End"
                            value={dateTo}
                            onChange={setDateTo}
                        />
                    </div>

                    {/* Export Action */}
                    <button 
                        onClick={handleExport}
                        className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] h-14 px-8 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                    >
                        <span className="icon-[solar--delivery-bold-duotone] w-6 h-6" />
                        Export Manifest
                    </button>
                </div>
            </div>

            {/* Deliveries Table */}
            <section className="bg-white rounded-3xl shadow-sm border overflow-hidden mb-10">
                <div className="admin-table-wrapper">
                    <table className="admin-table text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b">
                            <tr>
                                <th className="px-5 py-5">Ship Date</th>
                                <th className="px-5 py-5">Order</th>
                                <th className="px-5 py-5">Customer</th>
                                <th className="px-5 py-5">Method</th>
                                <th className="px-5 py-5">Station / Address</th>
                                <th className="px-5 py-5">Status</th>
                                <th className="px-5 py-5 text-right">Invoice</th>
                            </tr>
                        </thead>

                    <tbody>
                        {isLoading ? (
                            [...new Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b">
                                    <td colSpan={7} className="p-4"><div className="h-10 bg-gray-100 rounded w-full" /></td>
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-gray-400 font-medium">
                                    No scheduled deliveries found for this period.
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => {
                                const isPriority = order.expected_shipping_date === new Date().toISOString().split('T')[0];
                                return (
                                    <tr key={order.id} className={`border-b hover:bg-gray-50 transition-colors ${isPriority ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-5 py-5">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${isPriority ? 'bg-red-600 text-white border-red-700' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {order.expected_shipping_date || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 font-black text-primary text-sm tracking-widest">#{order.slug}</td>
                                        <td className="px-5 py-5">
                                            <div className="font-black text-gray-900 text-sm uppercase tracking-tight italic">{order.order_detail?.full_name}</div>
                                            <div className="text-[10px] text-gray-500 font-bold mt-1 tracking-widest">{order.order_detail?.phone}</div>
                                        </td>
                                        <td className="px-5 py-5 text-center">
                                            <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${methodColors[order.delivery_method] || 'bg-gray-100 text-gray-600'}`}>
                                                {order.delivery_method}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 text-xs font-black text-gray-600 uppercase tracking-tight">
                                            {order.delivery_method === 'pickup' ? (
                                                <span className="text-purple-600 flex items-center gap-2">
                                                    <span className="icon-[mdi--store-marker] w-5 h-5" />
                                                    {order.pickup_station || 'N/A'}
                                                </span>
                                            ) : (
                                                <span className="text-gray-600 flex items-center gap-2">
                                                    <span className="icon-[mdi--home-map-marker] w-5 h-5" />
                                                    <span className="line-clamp-1 max-w-[200px]">{order.order_detail?.address}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-5 text-center">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusColors[order.shipment?.status] || statusColors.pending}`}>
                                                {order.shipment?.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 text-right">
                                            <button 
                                                onClick={() => getFile(`Invoice-${order.slug}.pdf`, `/orders/${order.slug}/invoice`, {})}
                                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-sm"
                                                title="Download Invoice"
                                            >
                                                <span className="icon-[mdi--file-pdf-box] w-6 h-6" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                </div>
            </section>

            {/* Pagination Controls */}
            {pagination && pagination.last > 1 && (
                <div className="flex justify-center items-center gap-2 my-8">
                    <button
                        disabled={pagination.current === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-50 shadow-sm"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-bold text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
                        PAGE {pagination.current} / {pagination.last}
                    </span>
                    <button
                        disabled={pagination.current === pagination.last}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-50 shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </main>
    )
}
