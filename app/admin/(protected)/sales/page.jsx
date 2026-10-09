'use client'
import { useState, useMemo } from "react"
import Image from "next/image"
import useSWR from "swr"
import { fetcher, postData, putData, getFile, deleteData } from "@/app/lib/data"
import Search from "@/app/UI/Search"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    success: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
    pending_verification: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-800',
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

function OrderDetail({ order, onClose, mutate }) {
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
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border">
                            {order.slug}
                        </span>
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
                        <p className="text-sm text-gray-500">Order ID / Ref</p>
                        <p className="font-mono font-bold text-gray-900">
                            #{order.id} <span className="text-primary font-black">({order.slug})</span>
                        </p>
                    </div>
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
                    {order.delivery_method === 'pickup' ? (
                        <div>
                            <p className="text-sm text-gray-500">Pickup Station</p>
                            <p className="font-medium">
                                {order.pickup_station ? (
                                    <span className="inline-flex items-center gap-1">🏪 {order.pickup_station}</span>
                                ) : (
                                    <span className="text-gray-400 italic">Not specified</span>
                                )}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-sm text-gray-500">Delivery Location</p>
                                <p className="font-medium">
                                    {order.delivery_zone || order.delivery_county ? (
                                        <span className="inline-flex items-center gap-1">
                                            📍 {order.delivery_zone ? `${order.delivery_zone} ` : ''}
                                            {order.delivery_county ? (order.delivery_zone ? `(${order.delivery_county})` : order.delivery_county) : ''}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">Not specified</span>
                                    )}
                                </p>
                            </div>
                            {order.carrier_type && (
                                <div>
                                    <p className="text-sm text-gray-500">Carrier Option</p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
                                        order.carrier_type === 'rider'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                    }`}>
                                        {order.carrier_type === 'rider' ? '🛵 Bike Rider' : '🚐 Matatu SACCO'}
                                        {order.carrier_name ? ` (${order.carrier_name})` : ''}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                    <div>
                        <p className="text-sm text-gray-500">Payment</p>
                        <p className="font-medium capitalize">{order.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment_status === 'pending_verification'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : order.payment_status === 'pending' && order.payment_reference
                                    ? 'bg-orange-100 text-orange-800 animate-pulse'
                                    : statusColors[order.payment_status] || statusColors.pending
                        }`}>
                            {order.payment_status === 'pending_verification'
                                ? '⚠️ Underpayment — Pending Review'
                                : order.payment_status === 'pending' && order.payment_reference
                                    ? 'Awaiting Verification'
                                    : (order.payment_status || 'pending')}
                        </span>
                    </div>
                    {order.payment_reference && (
                        <div>
                            <p className="text-sm text-gray-500">Receipt Code</p>
                            <p className="font-bold text-gray-900">{order.payment_reference}</p>
                        </div>
                    )}
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
                        () => { mutate(); onClose(); },
                        {
                            status: 'completed'
                        },
                        `/orders/${order.id}`
                    )} className="block px-5 py-2 text-primary border-primary border-2 rounded-full hover:text-white hover:bg-primary my-7 text-sm">Mark Completed</button>
                }
                
                {/* Underpayment alert — shown only when payment_status = pending_verification */}
                {order.payment_status === 'pending_verification' && order.amount_paid != null && (
                    <div className="my-4 border border-amber-300 bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-amber-600 text-lg">⚠️</span>
                            <h4 className="font-bold text-amber-800 text-sm">Underpayment Detected</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-sm mb-3">
                            <span className="text-gray-500">Amount Paid:</span>
                            <span className="font-semibold text-gray-800">KES {Number(order.amount_paid).toLocaleString()}</span>
                            <span className="text-gray-500">Amount Expected:</span>
                            <span className="font-semibold text-gray-800">KES {Number(order.total).toLocaleString()}</span>
                            <span className="text-gray-500">Shortfall:</span>
                            <span className="font-bold text-red-600">KES {(Number(order.total) - Number(order.amount_paid)).toLocaleString()}</span>
                            {order.payment_reference && <>
                                <span className="text-gray-500">M-Pesa Ref:</span>
                                <span className="font-mono text-xs text-gray-700">{order.payment_reference}</span>
                            </>}
                        </div>
                        {order.payment_notes && (
                            <p className="text-xs text-amber-700 bg-amber-100 rounded p-2 mb-3 italic">{order.payment_notes}</p>
                        )}
                        <button
                            onClick={e => postData(
                                () => { mutate(); onClose(); },
                                {},
                                `/admin/orders/${order.id}/verify-payment`
                            )}
                            className="w-full py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all shadow shadow-amber-400/30"
                        >
                            ✓ Approve as Fully Paid (Admin Override)
                        </button>
                    </div>
                )}

                {order.payment_status !== 'success' && order.payment_status !== 'pending_verification' && order.payment_reference &&
                    <button onClick={e => postData(
                        () => { mutate(); onClose(); },
                        {},
                        `/admin/orders/${order.id}/verify-payment`
                    )} className="block w-full px-5 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 font-bold mb-4 shadow-lg shadow-green-600/30 transition-all">
                        Approve M-Pesa Payment ({order.payment_reference})
                    </button>
                }

                <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Items Subtotal</span>
                        <span className="font-semibold text-gray-800">KES {(Number(order.total) - Number(order.shipping || 0)).toLocaleString()}</span>
                    </div>
                    {Number(order.shipping) > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Shipping {order.delivery_county ? `(${order.delivery_county})` : ''}</span>
                            <span className="font-semibold text-gray-800">KES {Number(order.shipping).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t mt-1">
                        <span className="text-gray-700 font-bold">Total</span>
                        <span className="text-xl font-bold text-primary">KES {Number(order.total).toLocaleString()}</span>
                    </div>
                    
                    <button 
                        onClick={() => getFile(`Invoice-${order.slug}.pdf`, `/orders/${order.slug}/invoice`, {})}
                        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-semibold transition-all mt-2"
                    >
                        <span className="icon-[mdi--file-pdf-box] w-5 h-5" />
                        Download Invoice PDF
                    </button>

                    {/* DELETE DISABLED — uncomment to re-enable cascading order deletion */}
                    {/* <button 
                        onClick={e => {
                            if (confirm(`CAUTION: Are you absolutely sure you want to permanently delete Order #${order.id}? This action CANNOT be undone.`)) {
                                deleteData(
                                    () => { mutate(); onClose(); },
                                    {},
                                    `/orders/${order.id}`
                                );
                            }
                        }}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]"
                    >
                        <span className="icon-[mdi--trash-can-outline] w-5 h-5" />
                        Delete Transaction
                    </button> */}
                </div>
            </div>
        </div>
    )
}

import BeautifulDatePicker from "@/app/UI/BeautifulDatePicker";

const DATE_PRESETS = [
    { key: 'all_time', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'this_week', label: 'This Week' },
    { key: 'last_week', label: 'Last Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'last_3_months', label: 'Last 3 Months' },
    { key: 'last_6_months', label: 'Last 6 Months' },
    { key: 'this_quarter', label: 'This Quarter' },
    { key: 'last_quarter', label: 'Last Quarter' },
    { key: 'this_year', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' },
];

function calculatePresetDates(presetKey) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    const pad = (n) => String(n).padStart(2, '0');
    const toYMD = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    switch (presetKey) {
        case 'today': {
            const todayStr = toYMD(now);
            return { from: todayStr, to: todayStr };
        }
        case 'yesterday': {
            const yest = new Date(y, m, d - 1);
            const yestStr = toYMD(yest);
            return { from: yestStr, to: yestStr };
        }
        case 'this_week': {
            const day = now.getDay();
            const diffToMonday = (day + 6) % 7;
            const monday = new Date(y, m, d - diffToMonday);
            return { from: toYMD(monday), to: toYMD(now) };
        }
        case 'last_week': {
            const day = now.getDay();
            const diffToMonday = (day + 6) % 7;
            const thisMonday = new Date(y, m, d - diffToMonday);
            const lastMonday = new Date(thisMonday);
            lastMonday.setDate(lastMonday.getDate() - 7);
            const lastSunday = new Date(lastMonday);
            lastSunday.setDate(lastMonday.getDate() + 6);
            return { from: toYMD(lastMonday), to: toYMD(lastSunday) };
        }
        case 'this_month': {
            const firstDay = new Date(y, m, 1);
            return { from: toYMD(firstDay), to: toYMD(now) };
        }
        case 'last_month': {
            const firstDayLastMonth = new Date(y, m - 1, 1);
            const lastDayLastMonth = new Date(y, m, 0);
            return { from: toYMD(firstDayLastMonth), to: toYMD(lastDayLastMonth) };
        }
        case 'last_3_months': {
            const start = new Date(y, m - 2, 1);
            return { from: toYMD(start), to: toYMD(now) };
        }
        case 'last_6_months': {
            const start = new Date(y, m - 5, 1);
            return { from: toYMD(start), to: toYMD(now) };
        }
        case 'this_quarter': {
            const q = Math.floor(m / 3);
            const start = new Date(y, q * 3, 1);
            return { from: toYMD(start), to: toYMD(now) };
        }
        case 'last_quarter': {
            const currentQ = Math.floor(m / 3);
            const lastQ = currentQ === 0 ? 3 : currentQ - 1;
            const lastQYear = currentQ === 0 ? y - 1 : y;
            const start = new Date(lastQYear, lastQ * 3, 1);
            const end = new Date(lastQYear, lastQ * 3 + 3, 0);
            return { from: toYMD(start), to: toYMD(end) };
        }
        case 'this_year': {
            const start = new Date(y, 0, 1);
            return { from: toYMD(start), to: toYMD(now) };
        }
        case 'all_time':
        default:
            return { from: '', to: '' };
    }
}

export default function Page() {
    let [search, setSearch] = useState('')
    let [statusFilter, setStatusFilter] = useState('')
    let [orderTypeFilter, setOrderTypeFilter] = useState('')
    let [paymentStatusFilter, setPaymentStatusFilter] = useState('')
    let [sort, setSort] = useState('newest')
    let [selectedOrder, setSelectedOrder] = useState(null)
    let [page, setPage] = useState(1)
    let [isExporting, setIsExporting] = useState(false)

    // Date Range Intelligence States
    let [datePreset, setDatePreset] = useState('all_time')
    let [dateFrom, setDateFrom] = useState('')
    let [dateTo, setDateTo] = useState('')

    const handleSelectPreset = (key) => {
        setDatePreset(key);
        setPage(1);
        if (key === 'custom') {
            return;
        }
        const range = calculatePresetDates(key);
        setDateFrom(range.from);
        setDateTo(range.to);
    }

    const handleResetFilters = () => {
        setSearch('')
        setStatusFilter('')
        setOrderTypeFilter('')
        setPaymentStatusFilter('')
        setDatePreset('all_time')
        setDateFrom('')
        setDateTo('')
        setPage(1)
    }

    const params = { page, sort }
    if (statusFilter) params.status = statusFilter
    if (orderTypeFilter) params.order_type = orderTypeFilter
    if (paymentStatusFilter) params.payment_status = paymentStatusFilter
    if (search) params.search = search
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo

    let { data, isLoading, error, mutate } = useSWR(['/sales', params], fetcher)

    const handleExport = () => {
        setIsExporting(true)
        const currentPresetObj = DATE_PRESETS.find(p => p.key === datePreset)
        const presetName = currentPresetObj ? currentPresetObj.label : 'Custom'

        getFile(
            `sales_intelligence_${presetName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`,
            '/export/sales',
            { 
                date_from: dateFrom, 
                date_to: dateTo,
                status: statusFilter,
                order_type: orderTypeFilter,
                payment_status: paymentStatusFilter,
                search: search,
                preset: presetName
            }
        )
        setTimeout(() => setIsExporting(false), 2500)
    }

    const { orders, pagination } = useMemo(() => {
        const orders = data?.data || []
        const pagination = data ? { current: data.current_page, last: data.last_page, total: data.total } : null
        return { orders, pagination }
    }, [data])

    const stats = useMemo(() => {
        // True server-compiled preselection totals across all matching records
        if (data?.summary) {
            return {
                total: data.summary.total,
                revenue: data.summary.revenue,
                gross_revenue: data.summary.gross_revenue,
                pending: data.summary.pending,
                completed: data.summary.completed,
                processing: data.summary.processing,
                cancelled: data.summary.cancelled,
                pending_verification: data.summary.pending_verification,
                total_items: data.summary.total_items,
                avg_order_value: data.summary.avg_order_value,
            }
        }
        if (!orders.length) return { total: 0, revenue: 0, gross_revenue: 0, pending: 0, completed: 0, total_items: 0, avg_order_value: 0 }
        return {
            total: pagination?.total || orders.length,
            revenue: orders.filter(o => o.payment_status === 'success').reduce((sum, o) => sum + Number(o.total), 0),
            gross_revenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
            pending: orders.filter(o => (o.status || 'pending') === 'pending').length,
            completed: orders.filter(o => o.status === 'completed').length,
            total_items: orders.reduce((sum, o) => sum + (o.sales?.reduce((s, sale) => s + Number(sale.quantity || 0), 0) || 0), 0),
            avg_order_value: orders.length ? (orders.reduce((sum, o) => sum + Number(o.total), 0) / orders.length) : 0,
        }
    }, [data, orders, pagination])

    const currentPresetLabel = DATE_PRESETS.find(p => p.key === datePreset)?.label || 'Custom Range'
    const hasActiveFilters = Boolean(search || statusFilter || orderTypeFilter || paymentStatusFilter || dateFrom || dateTo || datePreset !== 'all_time')

    return (
        <main className="mx-4 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />
            <div className="flex flex-col md:flex-row mt-8 justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight lowercase capitalize">Sales Intelligence</h2>
                    <p className="text-xs text-gray-400 font-bold tracking-wider uppercase mt-1">
                        Executive Reporting &middot; Compiled Totals &middot; Date Presets
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasActiveFilters && (
                        <button
                            onClick={handleResetFilters}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 px-5 rounded-2xl transition-all flex items-center gap-2 active:scale-95"
                            title="Reset all filters to default"
                        >
                            <span className="icon-[solar--restart-bold] w-4 h-4" />
                            Reset Filters
                        </button>
                    )}
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black uppercase tracking-[0.2em] text-[11px] h-12 px-6 rounded-2xl transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                    >
                        {isExporting ? (
                            <>
                                <span className="icon-[solar--refresh-bold] w-5 h-5 animate-spin" />
                                Compiling Excel...
                            </>
                        ) : (
                            <>
                                <span className="icon-[solar--folder-export-bold-duotone] w-5 h-5" />
                                Export Excel Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Cards - Live Compiled Preselection Totals */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 my-8">
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 luxe-reveal">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preselected Orders</p>
                    <p className="text-2xl font-black mt-2 text-gray-900 italic tracking-tighter">{stats.total}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">{currentPresetLabel}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 luxe-reveal delay-75">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Paid Revenue</p>
                    <p className="text-2xl font-black mt-2 text-primary italic tracking-tighter">KES {Number(stats.revenue || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">Verified Funds</p>
                </div>
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 luxe-reveal delay-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Units Sold (Volume)</p>
                    <p className="text-2xl font-black mt-2 text-indigo-600 italic tracking-tighter">{stats.total_items}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">Total Items</p>
                </div>
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 luxe-reveal delay-150">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Order Value</p>
                    <p className="text-2xl font-black mt-2 text-violet-600 italic tracking-tighter">KES {Number(stats.avg_order_value || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">Per Transaction</p>
                </div>
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 luxe-reveal delay-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting Fulfillment</p>
                    <p className="text-2xl font-black mt-2 text-Warning italic tracking-tighter">{stats.pending}</p>
                    <p className="text-[10px] text-amber-600 font-medium mt-1">Pending Approval</p>
                </div>
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 luxe-reveal delay-300">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Successful Shipments</p>
                    <p className="text-2xl font-black mt-2 text-Success italic tracking-tighter">{stats.completed}</p>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1">Dispatched</p>
                </div>
            </div>

            {/* Filters & Export Panel */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 luxe-reveal space-y-6">
                
                {/* Date Intelligence Presets Bar */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                            Date Intelligence &middot; Quick Filter Presets
                        </label>
                        {dateFrom && dateTo && (
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {dateFrom} &rarr; {dateTo}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {DATE_PRESETS.map((p) => {
                            const isActive = datePreset === p.key;
                            return (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => handleSelectPreset(p.key)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Custom Date Pickers (Shown always if custom, or accessible anytime) */}
                {(datePreset === 'custom' || dateFrom || dateTo) && (
                    <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BeautifulDatePicker 
                            label="Commencement Date"
                            value={dateFrom}
                            onChange={(val) => { setDateFrom(val); setDatePreset('custom'); setPage(1); }}
                        />
                        <BeautifulDatePicker 
                            label="Termination Date"
                            value={dateTo}
                            onChange={(val) => { setDateTo(val); setDatePreset('custom'); setPage(1); }}
                        />
                    </div>
                )}

                {/* Additional Dimension Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search Database</label>
                        <Search search={search} setSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Invoice #, customer, phone..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Order Status</label>
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                            className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 cursor-pointer text-sm"
                        >
                            <option value="">All Transactions</option>
                            <option value="pending">Pending Approval</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed & Shipped</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Order Type</label>
                        <select
                            value={orderTypeFilter}
                            onChange={e => { setOrderTypeFilter(e.target.value); setPage(1) }}
                            className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 cursor-pointer text-sm"
                        >
                            <option value="">All Types (B2C & B2B)</option>
                            <option value="b2c">Retail (B2C)</option>
                            <option value="b2b">Wholesale (B2B)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Payment Status</label>
                        <select
                            value={paymentStatusFilter}
                            onChange={e => { setPaymentStatusFilter(e.target.value); setPage(1) }}
                            className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 cursor-pointer text-sm"
                        >
                            <option value="">All Payments</option>
                            <option value="success">Paid / Success</option>
                            <option value="pending">Pending Verification</option>
                            <option value="pending_verification">⚠️ Underpayment (Needs Review)</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Preselection Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-2 text-gray-600 font-medium flex-wrap">
                        <span className="font-bold text-gray-900">Preselection Active:</span>
                        <span className="bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full">{currentPresetLabel}</span>
                        <span>&middot;</span>
                        <span>Showing <strong className="text-gray-900">{stats.total}</strong> orders</span>
                        <span>&middot;</span>
                        <span>Total Items: <strong className="text-gray-900">{stats.total_items}</strong></span>
                        <span>&middot;</span>
                        <span>Net Paid: <strong className="text-primary">KES {Number(stats.revenue || 0).toLocaleString()}</strong></span>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-black uppercase tracking-wider text-[11px] underline underline-offset-4 cursor-pointer"
                    >
                        <span className="icon-[solar--download-square-bold] w-4 h-4" />
                        Download Filtered Excel
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
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                                order.payment_status === 'success' ? 'bg-green-50 text-green-600 border-green-100' :
                                                order.payment_reference ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm animate-pulse' :
                                                order.payment_status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-yellow-50 text-yellow-600 border-yellow-100'
                                            }`}>
                                                {order.payment_status === 'success' ? 'success' : order.payment_reference ? `Verify: ${order.payment_reference}` : (order.payment_status || 'pending')}
                                            </span>
                                            {order.payment_status !== 'success' && order.payment_reference && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Are you sure you want to approve M-Pesa Payment ${order.payment_reference} for Order #${order.id}?`)) {
                                                            postData(
                                                                () => { mutate(); },
                                                                {},
                                                                `/admin/orders/${order.id}/verify-payment`
                                                            );
                                                        }
                                                    }}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-[0.1em] text-[9px] py-1.5 px-3 rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                        </div>
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
                                        <div className="flex items-center justify-end gap-3">
                                            <span>
                                                {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </span>
                                            {/* DELETE DISABLED — uncomment to re-enable row-level order deletion
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`CAUTION: Are you absolutely sure you want to permanently delete Order #${order.id}?`)) {
                                                        deleteData(
                                                            () => { mutate(); },
                                                            {},
                                                            `/orders/${order.id}`
                                                        );
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-md hover:bg-red-50"
                                                title="Delete Transaction"
                                            >
                                                <span className="icon-[mdi--trash-can-outline] w-5 h-5" />
                                            </button>
                                            */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {orders.length > 0 && (
                        <tfoot className="bg-gray-50/90 border-t-2 border-gray-200 text-gray-800 text-xs font-black">
                            <tr>
                                <td colSpan={4} className="px-8 py-4 uppercase tracking-widest text-[10px] text-gray-500">
                                    Preselection Totals ({stats.total} Orders Total)
                                </td>
                                <td className="px-8 py-4">
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                                        {stats.total_items} Items
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-base font-black text-primary whitespace-nowrap">
                                    KES {Number(stats.revenue || 0).toLocaleString()}
                                    {stats.gross_revenue > stats.revenue && (
                                        <span className="block text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                                            Gross: KES {Number(stats.gross_revenue || 0).toLocaleString()}
                                        </span>
                                    )}
                                </td>
                                <td colSpan={3} className="px-8 py-4 text-right text-gray-500 text-[10px] uppercase tracking-wider">
                                    {currentPresetLabel}
                                </td>
                            </tr>
                        </tfoot>
                    )}
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
                <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} mutate={mutate} />
            )}
        </main>
    )
}
