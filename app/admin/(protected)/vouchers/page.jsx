'use client'
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, putData, deleteData } from "@/app/lib/data";
import Spinner from "@/app/UI/Spinner";
import Search from "@/app/UI/Search";
import { toast } from "react-hot-toast";

const VoucherStats = ({ vouchers }) => {
    const active = vouchers.filter(v => v.is_active).length;
    const partnerLinked = vouchers.filter(v => v.influencer_id).length;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 group hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <span className="icon-[solar--ticket-sale-bold-duotone] w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Vouchers</span>
                </div>
                <div className="text-4xl font-black text-gray-900 tracking-tighter italic">{vouchers.length}</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 group hover:border-emerald-100 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <span className="icon-[solar--check-circle-bold-duotone] w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Codes</span>
                </div>
                <div className="text-4xl font-black text-gray-900 tracking-tighter italic">{active}</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 group hover:border-amber-100 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <span className="icon-[solar--users-group-two-rounded-bold-duotone] w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Linked</span>
                </div>
                <div className="text-4xl font-black text-gray-900 tracking-tighter italic">{partnerLinked}</div>
            </div>
        </div>
    );
};

export default function VouchersPage() {
    const [search, setSearch] = useState('');
    const [editingVoucher, setEditingVoucher] = useState(null);
    const { data, isLoading } = useSWR('/vouchers', fetcher);

    if (isLoading) return <div className="h-[70vh]"><Spinner /></div>;

    const vouchers = data?.vouchers || [];
    const filteredVouchers = vouchers.filter(v => 
        v.code.toLowerCase().includes(search.toLowerCase()) ||
        v.influencer?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggleStatus = async (voucher) => {
        putData(
            (res) => {
                if (res.success) {
                    toast.success(`Voucher ${voucher.is_active ? 'disabled' : 'enabled'} successfully`);
                    mutate('/vouchers');
                } else {
                    toast.error(res.message || 'Failed to update status');
                }
            },
            { is_active: !voucher.is_active },
            `/vouchers/${voucher.id}`
        );
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this voucher?')) return;
        deleteData(
            (res) => {
                if (res.success) {
                    toast.success('Voucher deleted successfully');
                    mutate('/vouchers');
                } else {
                    toast.error(res.message || 'Failed to delete voucher');
                }
            },
            {},
            `/vouchers/${id}`
        );
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        putData(
            (res) => {
                if (res.success) {
                    toast.success('Voucher updated successfully');
                    mutate('/vouchers');
                    setEditingVoucher(null);
                } else {
                    toast.error(res.message || 'Failed to update voucher');
                }
            },
            { 
                discount_amount: editingVoucher.discount_amount,
                is_active: editingVoucher.is_active
            },
            `/vouchers/${editingVoucher.id}`
        );
    };

    return (
        <main className="px-6 md:px-12 pb-20 bg-[#fafafa] min-h-screen">
            <div className="2xl:w-11/12 2xl:mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 py-10 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Discount Intelligence</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic leading-none">Voucher Terminal</h2>
                        <p className="text-gray-500 text-sm mt-3 max-w-md">Manage promotional codes and partner referral incentives.</p>
                    </div>
                    
                    <div className="w-full md:w-96">
                        <Search setSearch={setSearch} placeholder="Find by code or partner name..." />
                    </div>
                </div>

                <VoucherStats vouchers={vouchers} />

                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/40 overflow-hidden border border-gray-50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0f172a] text-white">
                                <tr>
                                    <th className="px-10 py-8 text-[10px] font-black tracking-[0.2em] uppercase">Voucher Code</th>
                                    <th className="px-10 py-8 text-[10px] font-black tracking-[0.2em] uppercase text-center">Reward Type</th>
                                    <th className="px-10 py-8 text-[10px] font-black tracking-[0.2em] uppercase text-center">Owner / Partner</th>
                                    <th className="px-10 py-8 text-[10px] font-black tracking-[0.2em] uppercase text-center">Status</th>
                                    <th className="px-10 py-8 text-[10px] font-black tracking-[0.2em] uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredVouchers.map((voucher) => (
                                    <tr key={voucher.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-xs tracking-widest">
                                                    %
                                                </div>
                                                <div className="font-black text-gray-900 uppercase tracking-tighter text-lg">{voucher.code}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                {voucher.discount_amount}{voucher.discount_type === 'percentage' ? '%' : ' KES'} OFF
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            {voucher.influencer ? (
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 uppercase tracking-tight italic">{voucher.influencer.name}</div>
                                                    <div className="text-[8px] font-black text-amber-600 uppercase tracking-widest mt-0.5">Partner Linked</div>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Generic Campaign</div>
                                            )}
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(voucher)}
                                                className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                                    voucher.is_active 
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' 
                                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                                                }`}
                                            >
                                                {voucher.is_active ? 'Active' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => setEditingVoucher(voucher)}
                                                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-110 transition-all shadow-sm"
                                                    title="Modify Details"
                                                >
                                                    <span className="icon-[solar--pen-new-square-bold-duotone] w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(voucher.id)}
                                                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 hover:scale-110 transition-all shadow-sm"
                                                    title="Remove Code"
                                                >
                                                    <span className="icon-[solar--trash-bin-trash-bold-duotone] w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Edit Modal */}
            {editingVoucher && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-gray-100">
                        <h3 className="text-2xl font-black text-gray-900 uppercase italic mb-2 tracking-tight">Modify Code</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Refining rules for <span className="text-indigo-600">{editingVoucher.code}</span></p>
                        
                        <form onSubmit={handleSaveEdit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Amount ({editingVoucher.discount_type})</label>
                                <input 
                                    type="number" 
                                    value={editingVoucher.discount_amount}
                                    onChange={e => setEditingVoucher({...editingVoucher, discount_amount: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-black text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-6 rounded-3xl">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Code Status</span>
                                <button 
                                    type="button"
                                    onClick={() => setEditingVoucher({...editingVoucher, is_active: !editingVoucher.is_active})}
                                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                        editingVoucher.is_active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {editingVoucher.is_active ? 'ENABLED' : 'DISABLED'}
                                </button>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setEditingVoucher(null)}
                                    className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:-translate-y-0.5 transition-all"
                                >
                                    Update Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
