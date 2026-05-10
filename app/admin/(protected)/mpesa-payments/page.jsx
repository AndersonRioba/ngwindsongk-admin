'use client'

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/data";

export default function MpesaPaymentsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(20);
    
    const { data, error, isLoading } = useSWR(['/admin/mpesa-payments', { page, search, per_page: perPage }], fetcher);
    
    useEffect(() => {
        setPage(1);
    }, [search, perPage]);

    const payments = data?.data || [];
    const pagination = data || {};

    return (
        <main className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                        <span className="icon-[solar--wallet-money-linear] w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">M-Pesa Payments</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">STK Push Transaction Ledger</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 shadow-sm">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show</span>
                        <select 
                            value={perPage} 
                            onChange={e => setPerPage(parseInt(e.target.value))}
                            className="text-sm font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="relative flex-1 md:flex-none md:w-72">
                        <span className="icon-[solar--magnifer-linear] w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Query by phone, receipt..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                <div className="admin-table-wrapper scrollbar-hide">
                    <table className="admin-table text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b">
                            <tr>
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Transaction Code</th>
                                <th className="px-8 py-5">Amount (KES)</th>
                                <th className="px-8 py-5">Order Reference</th>
                                <th className="px-8 py-5 text-center">Execution Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium italic">Synchronizing payment data...</td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium italic">No transaction records found.</td>
                                </tr>
                            ) : payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-gray-800">
                                            {new Date(payment.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-bold mt-1">
                                            {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm font-black text-primary tracking-widest">{payment.mpesa_receipt_number || 'PENDING'}</span>
                                            <span className="text-[9px] text-gray-400 uppercase font-black mt-1">Request: {payment.checkout_request_id?.slice(-12)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-black text-gray-900 text-lg">
                                        {parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200 shadow-sm">
                                            {payment.account_reference}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            payment.status === 'success' ? 'bg-green-50 text-green-600 border-green-100' :
                                            payment.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse'
                                        }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="px-8 py-6 bg-gray-50/50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Page <span className="text-gray-900">{pagination.current_page}</span> of <span className="text-gray-900">{pagination.last_page}</span>
                            {pagination.total && <span className="ml-3 border-l pl-3 text-gray-400">{pagination.total} Total Ledger Entries</span>}
                        </p>

                        <div className="flex gap-1.5">
                            <button 
                                disabled={pagination.current_page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="w-8 h-8 flex items-center justify-center border rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                            >
                                <span className="icon-[solar--alt-arrow-left-linear] w-4 h-4" />
                            </button>
                            
                            {/* Dynamic Page Numbers */}
                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                let pageNum = i + 1;
                                if (pagination.last_page > 5) {
                                    if (pagination.current_page > 3) {
                                        pageNum = pagination.current_page - 2 + i;
                                        if (pageNum + (4-i) > pagination.last_page) {
                                            pageNum = pagination.last_page - 4 + i;
                                        }
                                    }
                                }
                                if (pageNum < 1) pageNum = i + 1;
                                if (pageNum > pagination.last_page) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                            pagination.current_page === pageNum 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                                            : 'bg-white border text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button 
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="w-8 h-8 flex items-center justify-center border rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                            >
                                <span className="icon-[solar--alt-arrow-right-linear] w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
