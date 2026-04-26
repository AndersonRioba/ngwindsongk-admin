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
        const orders = data?.data || []
        const pagination = data ? { current: data.current_page, last: data.last_page, total: data.total } : null
        return { orders, pagination }
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
        <main className="mx-2 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />
            <div className="flex mt-8 justify-between items-center">
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
            <section className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600">Ship Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Order</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Customer</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Method</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Station / Address</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 text-right">Invoice</th>
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
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${isPriority ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                {order.expected_shipping_date || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-primary">#{order.slug}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-sm">{order.order_detail?.full_name}</div>
                                            <div className="text-[10px] text-gray-500">{order.order_detail?.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`capitalize px-2 py-1 rounded-full text-[10px] font-bold ${methodColors[order.delivery_method] || 'bg-gray-100'}`}>
                                                {order.delivery_method}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-medium max-w-xs truncate">
                                            {order.delivery_method === 'pickup' ? (
                                                <span className="text-purple-600 flex items-center gap-1">
                                                    <span className="icon-[mdi--store-marker] w-4 h-4" />
                                                    {order.pickup_station || 'N/A'}
                                                </span>
                                            ) : (
                                                <span className="text-gray-600 flex items-center gap-1">
                                                    <span className="icon-[mdi--home-map-marker] w-4 h-4" />
                                                    {order.order_detail?.address}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`capitalize px-2 py-1 rounded-full text-[10px] font-bold ${statusColors[order.shipment?.status] || statusColors.pending}`}>
                                                {order.shipment?.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => getFile(`Invoice-${order.slug}.pdf`, `/orders/${order.slug}/invoice`, {})}
                                                className="text-primary hover:text-primary/70 transition-colors"
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
