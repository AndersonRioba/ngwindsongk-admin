'use client'
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, putData } from "@/app/lib/data";
import Spinner from "@/app/UI/Spinner";
import Search from "@/app/UI/Search";
import ConfirmModal from "@/app/UI/ConfirmModal";
import { popupE } from "@/app/lib/trigger";

const PartnerDetails = ({ partner }) => {
    const details = partner.profile_details || {};
    const isInfluencer = partner.role_names.includes('influencer');

    return (
        <div className="bg-white/60 p-10 rounded-[2.5rem] border border-gray-100 mt-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {/* Section 1: Business / Identity */}
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Entity</p>
                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
                            {details.business_name || partner.name}
                        </h4>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location & Reach</p>
                        <p className="font-bold text-gray-600">{details.location || 'Not Specified'}</p>
                    </div>
                    {details.tax_id && (
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tax ID / KRA PIN</p>
                            <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-indigo-600">{details.tax_id}</span>
                        </div>
                    )}
                </div>

                {/* Section 2: Socials & Niche (Influencer) or Scale (Distributor) */}
                <div className="space-y-6">
                    {isInfluencer ? (
                        <>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Digital Presence</p>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(details.social_handles || {}).map(([platform, handle]) => (
                                        <div key={platform} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <span className="icon-[solar--link-bold] w-4 h-4 text-purple-500" />
                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{platform}:</span>
                                            <span className="text-[10px] font-bold text-purple-600">{handle}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Focus Niches</p>
                                <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(details.niche) ? details.niche : [details.niche]).filter(Boolean).map(n => (
                                        <span key={n} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{n}</span>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Commercial Scale</p>
                            <p className="text-sm font-bold text-gray-600 leading-relaxed italic">
                                {details.estimated_quantity || 'Regular wholesale distribution tier.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Section 3: Product & Brand Interests */}
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Brand Alignment</p>
                        <div className="flex flex-wrap gap-2">
                            {details.brands_interested?.map(brand => (
                                <span key={brand} className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-lg shadow-indigo-100">{brand}</span>
                            ))}
                            {(!details.brands_interested || details.brands_interested.length === 0) && <span className="text-xs text-gray-400 italic">No specific brands selected.</span>}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Product Line Focus</p>
                        <div className="flex flex-wrap gap-2">
                            {details.products_interested?.map(product => (
                                <span key={product} className="px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-lg text-[9px] font-bold uppercase tracking-tight">{product}</span>
                            ))}
                            {(!details.products_interested || details.products_interested.length === 0) && <span className="text-xs text-gray-400 italic">Open to entire catalog.</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function PartnersPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [statusTab, setStatusTab] = useState('active');
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null, status: null });
    const [expandedPartner, setExpandedPartner] = useState(null);

    const fetchKey = [`/admin/partners`, { status: statusTab }];
    const { data, isLoading } = useSWR(fetchKey, fetcher);

    const handleStatusUpdate = async () => {
        const { id, status: newStatus } = confirmModal;
        putData(
            (res) => {
                if (res.success) {
                    popupE('success', `Partner successfully marked as ${newStatus}`);
                    mutate(fetchKey);
                } else {
                    popupE('error', res.message || 'Failed to update status');
                }
                setConfirmModal({ show: false, id: null, status: null });
            },
            { status: newStatus },
            `/admin/partners/${id}/status`
        );
    };

    if (isLoading) return <div className="h-[70vh]"><Spinner /></div>;

    const allPartners = data?.partners || [];
    const summary = data?.summary;

    const filteredPartners = allPartners.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.email?.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search);
        const matchesTab = activeTab === 'all' || p.role_names.includes(activeTab);
        return matchesSearch && matchesTab;
    });

    const statItems = [
        { label: 'Total Partners', value: summary?.total_partners || 0, icon: 'icon-[solar--users-group-rounded-bold-duotone]', color: 'text-white', bg: 'bg-white/10' },
        { label: 'Influencers', value: summary?.influencers || 0, icon: 'icon-[solar--ranking-bold-duotone]', color: 'text-amber-300', bg: 'bg-amber-400/10' },
        { label: 'Distributors', value: summary?.distributors || 0, icon: 'icon-[solar--box-bold-duotone]', color: 'text-emerald-300', bg: 'bg-emerald-400/10' },
        { label: 'Pending Payouts', value: `KSh ${parseInt(summary?.total_payouts_pending || 0).toLocaleString()}`, icon: 'icon-[solar--wallet-money-bold-duotone]', color: 'text-rose-300', bg: 'bg-rose-400/10' },
    ];

    return (
        <main className="pb-20 bg-[#fafafa] min-h-screen">
            <ConfirmModal
                show={confirmModal.show}
                title="Change Partner Status?"
                message={`Are you sure you want to mark this partner as ${confirmModal.status}?`}
                confirmText={`Yes, mark as ${confirmModal.status}`}
                cancelText="Keep as is"
                danger={confirmModal.status === 'rejected'}
                onConfirm={handleStatusUpdate}
                onCancel={() => setConfirmModal({ show: false, id: null, status: null })}
            />

            {/* ── Hero Header ────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] px-6 md:px-12 pt-12 pb-20 overflow-hidden">
                {/* decorative orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-500/10 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />

                <div className="2xl:w-11/12 2xl:mx-auto relative z-10">
                    {/* Title row */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Ecosystem Oversight</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight uppercase italic leading-none">
                                Partners Hub
                            </h1>
                            <p className="text-indigo-200/60 text-sm mt-3 font-medium">
                                Consolidated view of your Influencer and Distributor networks.
                            </p>
                        </div>

                        {/* Search */}
                        <div className="w-full md:w-80">
                            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                                <span className="icon-[solar--magnifer-bold] w-4 h-4 text-white/40 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search by name or contact..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="bg-transparent flex-1 text-sm text-white placeholder:text-white/30 outline-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statItems.map((s, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-[1.75rem] p-6 backdrop-blur-sm hover:bg-white/10 transition-all group">
                                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                                    <span className={`${s.icon} w-5 h-5 ${s.color}`} />
                                </div>
                                <div className="text-3xl font-black text-white tracking-tighter italic">{s.value}</div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Controls ────────────────────────────────────── */}
            <div className="px-6 md:px-12 2xl:w-11/12 2xl:mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-6 mb-8 relative z-20">
                    {/* Status toggle */}
                    <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100">
                        {[
                            { id: 'active', label: 'Active', icon: 'solar--check-read-bold-duotone' },
                            { id: 'pending', label: 'Pending Approvals', icon: 'solar--bell-bing-bold-duotone' }
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => { setStatusTab(s.id); setExpandedPartner(null); }}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${statusTab === s.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <span className={`icon-[${s.icon}] w-4 h-4`} />
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Role filter */}
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100">
                        {['all', 'influencer', 'distributor'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setExpandedPartner(null); }}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ───────────────────────────────────── */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 overflow-hidden border border-gray-50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0f172a] text-white">
                                <tr>
                                    <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase">Partner Profile</th>
                                    <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase">Tier</th>
                                    {statusTab === 'active' ? (
                                        <>
                                            <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase text-center">Conversions</th>
                                            <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase text-right">Commission</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase text-center">Applied On</th>
                                            <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase text-right">Entity</th>
                                        </>
                                    )}
                                    <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase text-center">{statusTab === 'active' ? 'Actions' : 'Decision'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPartners.map((partner) => {
                                    const isInfluencer = partner.role_names.includes('influencer');
                                    return (
                                        <>
                                            <tr
                                                key={partner.id}
                                                className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${expandedPartner === partner.id ? 'bg-indigo-50/20' : ''}`}
                                                onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}
                                            >
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                            {partner.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-gray-900 uppercase tracking-tight text-sm flex items-center gap-2">
                                                                {partner.name}
                                                                <span className={`icon-[solar--alt-arrow-${expandedPartner === partner.id ? 'up' : 'down'}-linear] w-3 h-3 text-gray-300`} />
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 font-bold mt-0.5">{partner.email || partner.phone}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    {partner.role_names.map(role => (
                                                        <span key={role} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${role === 'influencer' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {role}
                                                        </span>
                                                    ))}
                                                </td>

                                                {statusTab === 'active' ? (
                                                    <>
                                                        <td className="px-10 py-7 text-center">
                                                            <div className="text-xl font-black text-gray-900 italic">{partner.conversions_count || 0}</div>
                                                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Orders via voucher</div>
                                                        </td>
                                                        <td className="px-10 py-7 text-right">
                                                            {isInfluencer ? (
                                                                <>
                                                                    <div className="text-sm font-black text-gray-900">KSh {parseInt(partner.total_commissions || 0).toLocaleString()}</div>
                                                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                                                        <span className="w-1 h-1 rounded-full bg-amber-400" />
                                                                        <span className="text-[9px] font-bold text-amber-600 italic">KSh {parseInt(partner.pending_commissions || 0).toLocaleString()} pending</span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic">N/A</span>
                                                            )}
                                                        </td>
                                                        <td className="px-10 py-7 text-center" onClick={e => e.stopPropagation()}>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-110 transition-all" title="Performance">
                                                                    <span className="icon-[solar--chart-bold-duotone] w-4 h-4" />
                                                                </button>
                                                                {isInfluencer && (
                                                                    <button className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-110 transition-all" title="Settle Commissions">
                                                                        <span className="icon-[solar--wallet-money-bold-duotone] w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-10 py-7 text-center">
                                                            <div className="text-sm font-black text-gray-900 italic">
                                                                {partner.profile_details?.applied_at ? new Date(partner.profile_details.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                            </div>
                                                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Application Date</div>
                                                        </td>
                                                        <td className="px-10 py-7 text-right">
                                                            <div className="text-xs font-black text-gray-900 uppercase">{partner.profile_details?.business_name || 'Individual'}</div>
                                                            <div className="text-[9px] text-gray-400 font-bold mt-0.5">{partner.profile_details?.location || '—'}</div>
                                                        </td>
                                                        <td className="px-10 py-7 text-center" onClick={e => e.stopPropagation()}>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => setConfirmModal({ show: true, id: partner.id, status: 'active' })}
                                                                    className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
                                                                >
                                                                    <span className="icon-[solar--check-circle-bold-duotone] w-4 h-4" /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmModal({ show: true, id: partner.id, status: 'rejected' })}
                                                                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5"
                                                                >
                                                                    <span className="icon-[solar--close-circle-bold-duotone] w-4 h-4" /> Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                            {expandedPartner === partner.id && (
                                                <tr key={`${partner.id}-detail`}>
                                                    <td colSpan="5" className="px-10 pb-10 bg-indigo-50/20">
                                                        <PartnerDetails partner={partner} />
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                                {filteredPartners.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center text-gray-400 text-sm italic">
                                            No partners found in this tier.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
