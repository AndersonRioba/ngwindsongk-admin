'use client'
import { useState, useMemo } from "react"
import Image from "next/image"
import useSWR from "swr"
import { fetcher, postData, putData, getFile } from "@/app/lib/data"
import Search from "@/app/UI/Search"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    success: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
}

function SaleRowSkeleton() {
    return (
        <tr className="animate-pulse border-b">
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-10" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
        </tr>
    )
}

function OrderDetail({ order, onClose }) {
    const primaryImage = (product) => {
        const img = product?.product_images?.find(i => i.is_primary)
        return img?.url || product?.product_images?.[0]?.url || ''
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-4 md:p-6 mx-2 md:mx-0" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        Order #{order.id}
                        {order.order_type === 'b2b' && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">B2B Wholesale</span>
                        )}
                        {order.order_type === 'b2c' && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">B2C Retail</span>
                        )}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="icon-[mdi--close] w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{order.order_detail?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{order.order_detail?.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{order.order_detail?.address || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Payment</p>
                        <p className="font-medium capitalize">{order.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.payment_status] || statusColors.pending}`}>
                            {order.payment_status || 'pending'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Shipment Status</p>
                        <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.shipment?.status] || statusColors.pending}`}>
                            {order.shipment?.status || 'pending'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {order.order_detail?.notes && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm mt-1 bg-gray-50 rounded p-2">{order.order_detail.notes}</p>
                    </div>
                )}

                <h4 className="font-semibold mb-3">Items</h4>
                <div className="space-y-3">
                    {order.sales?.map((sale, i) => (
                        <div key={i} className="flex items-center gap-4 border rounded-lg p-3">
                            {(sale.product?.product_images?.find(i => i.is_primary)?.url || sale.product?.product_images?.[0]?.url) ? (
                                <Image
                                    src={sale.product?.product_images?.find(i => i.is_primary)?.url || sale.product?.product_images?.[0]?.url}
                                    alt={sale.product?.name}
                                    width={56}
                                    height={56}
                                    className="w-14 h-14 rounded-lg object-cover"
                                    unoptimized={true}
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <span className="icon-[mdi--package-variant] w-6 h-6 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{sale.product?.name || 'Product'}</p>
                                {sale.product_variation && (
                                    <p className="text-xs text-gray-500">Variation #{sale.product_variation.sku}</p>
                                )}
                                <p className="text-sm text-gray-500">Qty: {sale.quantity} x KES {Number(sale.price).toLocaleString()}</p>
                            </div>
                            <p className="font-semibold whitespace-nowrap">KES {Number(sale.total).toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {
                    !order.shipment &&
                    <button onClick={e => postData(
                        () => { },
                        {
                            orders: [order]
                        },
                        '/shipments'
                    )} className="block px-5 py-2 text-primary border-primary border-2 rounded-full hover:text-white hover:bg-primary my-7 text-sm">Mark Shipped</button>
                }
                {
                    order.shipment &&
                    <button onClick={e => putData(
                        () => { },
                        {
                            status: 'completed'
                        },
                        `/orders/${order.id}`
                    )} className="block px-5 py-2 text-primary border-primary border-2 rounded-full hover:text-white hover:bg-primary my-7 text-sm">Mark Completed</button>
                }

                <div className="mt-4 pt-4 border-t flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Total</span>
                        <span className="text-xl font-bold text-primary">KES {Number(order.total).toLocaleString()}</span>
                    </div>
                    
                    <button 
                        onClick={() => getFile(`Invoice-${order.slug}.pdf`, `/orders/${order.slug}/invoice`, {})}
                        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-semibold transition-all"
                    >
                        <span className="icon-[mdi--file-pdf-box] w-5 h-5" />
                        Download Invoice PDF
                    </button>
                </div>
            </div>
        </div>
    )
}

import BeautifulDatePicker from "@/app/UI/BeautifulDatePicker";

export default function Page() {
    let [search, setSearch] = useState('')
    let [statusFilter, setStatusFilter] = useState('')
    let [orderTypeFilter, setOrderTypeFilter] = useState('')
    let [sort, setSort] = useState('newest')
    let [selectedOrder, setSelectedOrder] = useState(null)
    let [page, setPage] = useState(1)

    // Export States
    let [dateFrom, setDateFrom] = useState('')
    let [dateTo, setDateTo] = useState('')

    const params = { page, sort }
    if (statusFilter) params.status = statusFilter
    if (orderTypeFilter) params.order_type = orderTypeFilter
    if (search) params.search = search

    let { data, isLoading, error } = useSWR(['/sales', params], fetcher)

    const handleExport = () => {
        getFile(`sales_report_${new Date().toISOString().split('T')[0]}.xlsx`, '/export/sales', { 
            date_from: dateFrom, 
            date_to: dateTo 
        })
    }

    const { orders, pagination } = useMemo(() => {
        const allOrders = data?.data || [];
        // Only include orders with successful payment status
        const orders = allOrders.filter(order => order.payment_status === 'success');
        
        const pagination = data ? { current: data.current_page, last: data.last_page, total: data.total } : null;
        return { orders, pagination };
    }, [data])

    const stats = useMemo(() => {
        if (!orders.length) return { total: 0, revenue: 0, pending: 0, completed: 0 }
        return {
            total: pagination?.total || orders.length,
            revenue: orders.filter(o => o.payment_status == 'success').reduce((sum, o) => sum + Number(o.total), 0),
            pending: orders.filter(o => (o.status || 'pending') === 'pending').length,
            completed: orders.filter(o => o.status === 'completed').length,
        }
    }, [orders, pagination])

    return (
        <main className="mx-4 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />
            <div className="flex flex-col md:flex-row mt-8 justify-between items-start md:items-center gap-6">
                <h2 className="text-3xl font-black text-gray-800 tracking-tight lowercase capitalize">Sales Intelligence</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 my-8">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 luxe-reveal">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Orders</p>
                    <p className="text-3xl font-black mt-2 text-gray-900 italic tracking-tighter">{stats.total}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 luxe-reveal delay-75">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Revenue</p>
                    <p className="text-3xl font-black mt-2 text-primary italic tracking-tighter">KES {stats.revenue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 luxe-reveal delay-150">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting Fulfillment</p>
                    <p className="text-3xl font-black mt-2 text-Warning italic tracking-tighter">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 luxe-reveal delay-300">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Successful Shipments</p>
                    <p className="text-3xl font-black mt-2 text-Success italic tracking-tighter">{stats.completed}</p>
                </div>
            </div>

            {/* Filters & Export */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 luxe-reveal">
                <div className="flex flex-col xl:flex-row gap-8 items-end">
                    
                    {/* Search & Sort */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search Database</label>
                            <Search search={search} setSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Query invoice or customer..." />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Order Status</label>
                            <select
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 cursor-pointer"
                            >
                                <option value="">All Transactions</option>
                                <option value="pending">Pending Approval</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed & Shipped</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Order Type</label>
                            <select
                                value={orderTypeFilter}
                                onChange={e => { setOrderTypeFilter(e.target.value); setPage(1) }}
                                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 cursor-pointer"
                            >
                                <option value="">All Orders</option>
                                <option value="b2c">Retail (B2C)</option>
                                <option value="b2b">Wholesale (B2B)</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Intelligence */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <BeautifulDatePicker 
                            label="Commencement"
                            value={dateFrom}
                            onChange={setDateFrom}
                        />
                        <BeautifulDatePicker 
                            label="Termination"
                            value={dateTo}
                            onChange={setDateTo}
                        />
                    </div>

                    {/* Export Action */}
                    <button 
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-[0.2em] text-[11px] h-14 px-8 rounded-2xl transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                    >
                        <span className="icon-[solar--folder-export-bold-duotone] w-6 h-6" />
                        Export to Excel
                    </button>
                </div>
            </div>

            <section className="bg-white rounded-3xl shadow-sm border overflow-hidden mb-10">
                <div className="admin-table-wrapper scrollbar-hide">
                    <table className="admin-table text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b">
                            <tr>
                                <th className="px-8 py-5">Order ID</th>
                                <th className="px-8 py-5">Type</th>
                                <th className="px-8 py-5">Customer</th>
                                <th className="px-8 py-5">Phone</th>
                                <th className="px-8 py-5">Volume</th>
                                <th className="px-8 py-5">Total (KES)</th>
                                <th className="px-8 py-5">Payment Status</th>
                                <th className="px-8 py-5">Logistics</th>
                                <th className="px-8 py-5 text-right">Date</th>
                            </tr>
                        </thead>

                    <tbody>
                        {isLoading || error ? (
                            [...new Array(10)].map((_, i) => <SaleRowSkeleton key={i} />)
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="p-12 text-center text-gray-400">
                                    <span className="icon-[mdi--cart-off] w-12 h-12 block mx-auto mb-3" />
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <tr
                                    key={order.id}
                                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <td className="px-8 py-5 font-bold text-gray-800">#{order.id}</td>
                                    <td className="px-8 py-5">
                                        {order.order_type === 'b2b' ? (
                                            <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm">B2B</span>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-200 shadow-sm">B2C</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 font-bold text-gray-700">{order.order_detail?.full_name || '—'}</td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-500">{order.order_detail?.phone || '—'}</td>
                                    <td className="px-8 py-5">
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                            {order.sales?.length || 0} ITEMS
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-black text-gray-900 text-base">KES {Number(order.total).toLocaleString()}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            order.payment_status === 'success' ? 'bg-green-50 text-green-600 border-green-100' :
                                            order.payment_status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse'
                                        }`}>
                                            {order.payment_status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            order.shipment?.status === 'completed' || order.shipment?.status === 'success' ? 'bg-green-50 text-green-600 border-green-100' :
                                            order.shipment?.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                            {order.shipment?.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase text-right">
                                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            </section>

            {/* Pagination */}
            {pagination && pagination.last > 1 && (
                <div className="flex justify-center items-center gap-2 my-8">
                    <button
                        disabled={pagination.current === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 px-4">
                        Page {pagination.current} of {pagination.last}
                    </span>
                    <button
                        disabled={pagination.current === pagination.last}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </main>
    )
}
