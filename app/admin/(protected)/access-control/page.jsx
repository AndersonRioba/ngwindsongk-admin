'use client'
import { useState } from "react";
import useSWR from "swr";
import { fetcher, postData, deleteData } from "@/app/lib/data";
import Spinner from "@/app/UI/Spinner";
import { popupE } from "@/app/lib/trigger";

const PermissionsMatrix = ({ roles, allPermissions, onUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(null); // {roleId, permName}

    const handleToggle = (role, permName) => {
        // Prevent editing super_admin core permissions for safety
        if (role.name === 'super_admin' && ['manage-access'].includes(permName)) {
            popupE('Protected', 'Core Super Admin permits cannot be revoked.');
            return;
        }

        const currentPerms = role.permissions.map(p => p.name);
        const newPerms = currentPerms.includes(permName)
            ? currentPerms.filter(p => p !== permName)
            : [...currentPerms, permName];

        setIsUpdating({ roleId: role.id, permName });
        postData((res) => {
            setIsUpdating(null);
            if (res.success) {
                popupE('Synchronized', `Authority for '${role.name}' updated.`);
                onUpdate();
            }
        }, { permissions: newPerms }, `/admin/roles/${role.id}/sync-permissions`);
    };

    return (
        <div className="bg-white rounded-[3.5rem] shadow-2xl p-10 border border-gray-100 overflow-hidden relative group mt-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Live Provisioning</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight italic">Authority Matrix</h3>
                    <p className="text-gray-500 text-sm mt-2">Manage operational permits across all administrative tiers in real-time.</p>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar relative z-10 pb-4">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 bg-white/80 backdrop-blur-md px-6 py-8 border-b border-gray-100 min-w-[200px]">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Administrative Tiers</span>
                            </th>
                            {allPermissions.map(perm => (
                                <th key={perm.id} className="px-6 py-8 border-b border-gray-100 text-center min-w-[150px] group/th">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest whitespace-nowrap group-hover/th:text-indigo-500 transition-colors">
                                            {perm.name.replace(/-/g, ' ')}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-gray-200 group-hover/th:w-4 group-hover/th:bg-indigo-500 transition-all"></div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {roles.map(role => (
                            <tr key={role.id} className="group/row hover:bg-gray-50/50 transition-colors">
                                <td className="sticky left-0 z-20 bg-white group-hover/row:bg-gray-50/50 px-6 py-8 border-r border-gray-50 shadow-[rgba(0,0,0,0.02)_5px_0px_10px]">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${role.name === 'super_admin' ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' : 'bg-gray-300'}`}></div>
                                        <span className="text-xs font-black text-gray-700 uppercase tracking-tight group-hover/row:text-indigo-600 transition-colors">
                                            {role.name.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </td>
                                {allPermissions.map(perm => {
                                    const isActive = role.permissions.some(p => p.name === perm.name);
                                    const loading = isUpdating?.roleId === role.id && isUpdating?.permName === perm.name;
                                    
                                    return (
                                        <td key={`${role.id}-${perm.id}`} className="px-6 py-8 text-center relative overflow-hidden">
                                            <button
                                                onClick={() => handleToggle(role, perm.name)}
                                                disabled={loading}
                                                className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center p-1 relative ${
                                                    isActive ? 'bg-indigo-500' : 'bg-gray-200'
                                                } ${loading ? 'opacity-50 grayscale' : 'hover:scale-110 active:scale-95'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 transform ${
                                                    isActive ? 'translate-x-6' : 'translate-x-0'
                                                } flex items-center justify-center`}>
                                                    {loading ? (
                                                        <span className="icon-[tabler--loader-2] animate-spin w-3 h-3 text-indigo-500" />
                                                    ) : isActive ? (
                                                        <span className="icon-[solar--check-read-bold] w-3 h-3 text-indigo-500" />
                                                    ) : null}
                                                </div>
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const RoleCreationModal = ({ onClose, onSuccess, allPermissions }) => {
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const togglePermission = (perm) => {
        setSelectedPermissions(prev => 
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        postData((res) => {
            setIsSubmitting(false);
            if (res.success) {
                popupE('Role Initiated', 'New administrative authority created.');
                onSuccess();
                onClose();
            }
        }, { name, permissions: selectedPermissions }, '/admin/roles');
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="p-12">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <span className="icon-[solar--shield-plus-bold-duotone] w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Forge New Role</h3>
                            <p className="text-gray-500 text-sm">Define a new tier of administrative authority</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Authority Designation</label>
                            <input
                                required
                                className="w-full bg-gray-50 border-none rounded-3xl p-6 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-300 text-lg shadow-inner"
                                placeholder="e.g. Regional Manager"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Grantable Permits</label>
                            <div className="grid grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                {allPermissions.length > 0 ? (
                                    allPermissions.map((perm) => (
                                        <button
                                            key={perm.id}
                                            type="button"
                                            onClick={() => togglePermission(perm.name)}
                                            className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 border-2 ${
                                                selectedPermissions.includes(perm.name)
                                                ? 'bg-indigo-50 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className={`icon-[solar--${selectedPermissions.includes(perm.name) ? 'check-read-bold' : 'shield-warning-bold'}] w-4 h-4`} />
                                            {perm.name.replace(/-/g, ' ')}
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-10 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <span className="icon-[tabler--loader-2] animate-spin w-6 h-6 text-indigo-500 mb-3" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Master Permits...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <span className="icon-[tabler--loader-2] animate-spin w-5 h-5" />
                                ) : (
                                    <>
                                        <span className="icon-[solar--magic-stick-3-bold] w-5 h-5" />
                                        Initialize Authority
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function AccessControlPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [lastSync, setLastSync] = useState(null);

    // Explicit Fetcher Pattern to ensure defaults (baseURL/token) are handled correctly
    const { data, isLoading, mutate, isValidating, error } = useSWR(
        [`/admin/roles`, { v: refreshKey }], 
        (args) => fetcher(args),
        {
            onSuccess: () => setLastSync(new Date().toLocaleTimeString()),
            onError: (err) => {
                popupE('Terminal Error', `Sync failed: ${err.message}`);
            },
            revalidateOnFocus: true
        }
    );

    const handleForceSync = () => {
        setRefreshKey(prev => prev + 1);
        mutate();
        popupE('Synchronizing', 'Initiating direct security terminal refresh...');
    };

    const roles = data?.roles || [];
    const allPermissions = data?.all_permissions || [];

    if (isLoading && roles.length === 0) return <div className="h-[70vh]"><Spinner /></div>;

    return (
        <main className="px-6 md:px-12 pb-20 bg-[#fafafa] min-h-screen">
            <div className="2xl:w-11/12 2xl:mx-auto">
                {isCreating && (
                    <RoleCreationModal 
                        allPermissions = {allPermissions} 
                        onClose={() => setIsCreating(false)}
                        onSuccess={() => mutate()}
                    />
                )}

                {/* Security Terminal Status Banner */}
                <div className="flex flex-wrap gap-4 mb-10 pt-8 animate-in slide-in-from-top duration-700">
                    <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isValidating ? 'bg-indigo-500 animate-pulse' : 'bg-green-500'} text-white`}>
                            <span className={`icon-[solar--shield-check-bold] w-6 h-6`} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Terminal Link</p>
                            <p className={`text-sm font-black uppercase italic leading-none ${error ? 'text-red-500' : 'text-gray-900'}`}>
                                {isValidating ? 'Syncing...' : error ? 'Signal Lost' : 'Connected'}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                            <span className="icon-[solar--high-definition-bold] w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Operational Permits</p>
                            <p className="text-sm font-black text-gray-900 uppercase italic leading-none">{allPermissions.length} Active</p>
                        </div>
                    </div>

                    <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                            <span className="icon-[solar--history-bold] w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Last Synchronization</p>
                            <p className="text-sm font-bold text-gray-900 uppercase italic leading-none">{lastSync || 'Initializing...'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 py-10 border-b border-gray-200">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-2 h-2 rounded-full ${isValidating ? 'bg-indigo-500 animate-ping' : 'bg-green-500'}`}></div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Administrative Oversight</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic leading-none">Access Control</h2>
                        <p className="text-gray-500 text-sm mt-3 max-w-md">Manage hierarchies and operational permits across the ecosystem.</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={handleForceSync}
                            className="bg-white text-gray-900 border border-gray-200 font-extrabold uppercase tracking-widest text-[9px] py-5 px-6 rounded-[2rem] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                            title="Force Refresh Terminals"
                        >
                            <span className={`icon-[solar--restart-bold] w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                            Force Sync
                        </button>
                        
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-[#0f172a] text-white font-black uppercase tracking-widest text-[9px] py-5 px-10 rounded-[2rem] hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/10 active:scale-95 group"
                        >
                            <span className="icon-[solar--shield-plus-bold] w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            Provision New Role
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {roles.map((role) => (
                        <div key={role.id} className="bg-white rounded-[3.5rem] p-10 shadow-xl shadow-gray-200/40 border border-gray-50 hover:border-indigo-100 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
                            
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${
                                        role.name === 'super_admin' ? 'bg-indigo-600' : 'bg-gray-900'
                                    } shadow-lg shadow-gray-200`}>
                                        <span className={`icon-[solar--${role.name === 'super_admin' ? 'star-shield-bold-duotone' : 'shield-keyhole-bold-duotone'}] w-7 h-7`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{role.name.replace(/_/g, ' ')}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Tier</p>
                                        </div>
                                    </div>
                                </div>

                                {!['super_admin', 'admin', 'buyer', 'distributor', 'influencer'].includes(role.name) && (
                                    <button 
                                        onClick={() => handleDeleteRole(role.id, role.name)}
                                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                    >
                                        <span className="icon-[solar--trash-bin-trash-bold] w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] font-serif italic">Permit Matrix</h4>
                                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase italic">{role.permissions.length} Active Permits</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.length > 0 ? (
                                        role.permissions.map((perm) => (
                                            <span key={perm.id} className="px-5 py-2.5 rounded-2xl bg-gray-50 text-[9px] font-black text-gray-600 uppercase tracking-widest border border-gray-100/50 group-hover:bg-white transition-colors">
                                                {perm.name.replace(/-/g, ' ')}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-gray-400 italic py-4">This role possesses no specialized operational permits.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <PermissionsMatrix 
                    roles={roles} 
                    allPermissions={allPermissions} 
                    onUpdate={() => mutate()} 
                />
            </div>
        </main>
    );
}
