'use client'

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/data";

export default function MpesaPaymentsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    
    const { data, error, isLoading } = useSWR([`/admin/mpesa-payments?page=${page}&search=${search}`, {}], fetcher);

    const payments = data?.data || [];
    const pagination = data || {};

    return (
        <main className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">M-Pesa Payments</h1>
                    <p className="text-gray-500 text-sm">View all M-Pesa STK push transactions</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="relative">
                        <span className="icon-[solar--magnifer-linear] w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search phone, receipt, or order..." 
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Transaction Code</th>
                            <th className="px-6 py-4">Amount (KES)</th>
                            <th className="px-6 py-4">Order Ref</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-400">Loading payments...</td>
                            </tr>
                        ) : payments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-400">No payments found.</td>
                            </tr>
                        ) : payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-600 font-medium">
                                    {new Date(payment.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-bold text-primary tracking-wider">{payment.mpesa_receipt_number || 'PENDING'}</span>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold mt-1">Ref: {payment.checkout_request_id?.slice(-8)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black text-gray-900">
                                    {parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                                        {payment.account_reference}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                        payment.status === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                                        payment.status === 'failed' ? 'bg-red-100 text-red-700 border border-red-200' :
                                        'bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse'
                                    }`}>
                                        {payment.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Showing page {pagination.current_page} of {pagination.last_page}
                        </p>
                        <div className="flex gap-2">
                            <button 
                                disabled={pagination.current_page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button 
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
