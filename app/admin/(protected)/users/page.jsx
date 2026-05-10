'use client'
import { useState } from "react";
import useSWR from "swr";
import { fetcher, postData, putData, deleteData } from "@/app/lib/data";
import Spinner from "@/app/UI/Spinner";
import { popupE } from "@/app/lib/trigger";
import Search from "@/app/UI/Search";

// --- New Role Assignment Modal ---
const RoleAssignmentModal = ({ user, onClose, onSuccess }) => {
    const { data: rolesData } = useSWR(['/admin/roles', {}], fetcher);
    const [selectedRoles, setSelectedRoles] = useState(user.role_names || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roles = rolesData?.roles || [];

    const toggleRole = (roleName) => {
        setSelectedRoles(prev => 
            prev.includes(roleName) ? prev.filter(r => r !== roleName) : [roleName]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        postData((res) => {
            setIsSubmitting(false);
            if (res.success) {
                popupE('Authority Updated', `Roles for ${user.name} have been synchronized.`);
                onSuccess();
                onClose();
            }
        }, { roles: selectedRoles }, `/admin/users/${user.id}/assign-role`);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <span className="icon-[solar--shield-user-bold-duotone] w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase italic">Assign Authority</h3>
                            <p className="text-gray-500 text-xs">Defining access for <span className="text-gray-900 font-bold">{user.name}</span></p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => toggleRole(role.name)}
                                    className={`flex items-center justify-between p-4 rounded-xl text-left transition-all border-2 ${
                                        selectedRoles.includes(role.name)
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{role.name.replace(/_/g, ' ')}</span>
                                    {selectedRoles.includes(role.name) && <span className="icon-[solar--check-circle-bold] w-4 h-4" />}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <span className="icon-[tabler--loader-2] animate-spin w-4 h-4" /> : 'Apply Authority'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- New Admin Password Modal ---
const AdminPasswordModal = ({ admin, onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        putData((res) => {
            setIsSubmitting(false);
            if (res.success) {
                popupE('Success', 'Password updated successfully');
                onSuccess();
                onClose();
            }
        }, { password }, `/admin/admins/${admin.id}/password`);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                            <span className="icon-[solar--key-bold-duotone] w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase italic">Reset Security Cipher</h3>
                            <p className="text-gray-500 text-xs">Updating access for <span className="text-gray-900 font-bold">{admin.name}</span></p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Terminal Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="w-full bg-gray-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-amber-200 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                placeholder="Minimum 8 characters..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <span className="icon-[tabler--loader-2] animate-spin w-4 h-4" /> : <><span className="icon-[solar--shield-keyhole-bold] w-4 h-4" /> Authorize Update</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);
    const [adminFormData, setAdminFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'admin'
    });
    const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
    const [editingAdminPassword, setEditingAdminPassword] = useState(null);
    const [managingUserRoles, setManagingUserRoles] = useState(null);

    const {
        data: usersData,
        error: usersError,
        isLoading: isLoadingUsers,
        mutate: mutateUsers
    } = useSWR(['/admin/users', { search }], fetcher);

    const {
        data: adminsData,
        error: adminsError,
        isLoading: isLoadingAdmins,
        mutate: mutateAdmins
    } = useSWR(['/admin/admins', {}], fetcher);

    // Fetch roles for the admin creation select
    const { data: rolesData } = useSWR(['/admin/roles', {}], fetcher);
    const roles = rolesData?.roles || [];

    const toggleStatus = (id, currentStatus) => {
        const action = currentStatus === 'active' ? 'deactivate' : 'reactivate';
        postData((response) => {
            if (response.success) {
                mutateUsers();
                popupE('Success', response.message);
            }
        }, {}, `/admin/users/${id}/${action}`);
    };

    const handleAdminSubmit = (e) => {
        e.preventDefault();
        setIsSubmittingAdmin(true);
        postData((response) => {
            setIsSubmittingAdmin(false);
            if (response.success) {
                mutateAdmins();
                setIsAddingAdmin(false);
                setAdminFormData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'admin'
                });
                popupE('Success', 'Admin added successfully');
            }
        }, adminFormData, '/admin/admins');
    };

    const handleDeleteAdmin = (id) => {
        if (confirm('Are you certain you wish to revoke administrative access permanently?')) {
            deleteData((res) => {
                if (res.success) {
                    mutateAdmins();
                    popupE('Revoked', 'Administrative access has been terminated.');
                }
            }, {}, `/admin/admins/${id}`);
        }
    };

    if (isLoadingUsers || isLoadingAdmins) {
        return <div className="h-[70vh]"><Spinner /></div>;
    }

    if (usersError || adminsError) {
        return <div className="text-center py-10 text-Error">Error loading account management data</div>;
    }

    const users = usersData?.users?.data || [];
    const admins = adminsData?.admins || [];

    return (
        <main className="mx-4 lg:mx-10 2xl:mx-20 pb-20 bg-[#fcfcfc] min-h-screen">
            <div className="2xl:w-10/12 2xl:mx-auto">
                {/* Modals */}
                {editingAdminPassword && (
                    <AdminPasswordModal 
                        admin={editingAdminPassword} 
                        onClose={() => setEditingAdminPassword(null)}
                        onSuccess={() => mutateAdmins()}
                    />
                )}

                {managingUserRoles && (
                    <RoleAssignmentModal 
                        user={managingUserRoles}
                        onClose={() => setManagingUserRoles(null)}
                        onSuccess={() => { mutateUsers(); mutateAdmins(); }}
                    />
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 py-10 border-b border-gray-100">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic leading-none">User Management</h2>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Accounts & Administrative Access Console</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 md:items-center">
                        <div className="w-full md:w-96">
                            <Search setSearch={setSearch} placeholder="Filter by identity..." />
                        </div>
                        <button
                            onClick={() => setIsAddingAdmin(!isAddingAdmin)}
                            className={`w-full md:w-auto font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${
                                isAddingAdmin
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-primary text-white shadow-primary/20'
                            }`}
                        >
                            <span className={`icon-[ph--${isAddingAdmin ? 'x-bold' : 'plus-bold'}] w-4 h-4`} />
                            {isAddingAdmin ? 'Dismiss' : 'New Admin'}
                        </button>
                    </div>
                </div>

                {isAddingAdmin && (
                    <section className="bg-white p-10 rounded-[2.5rem] shadow-2xl mb-12 border border-primary/10 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="icon-[ri--admin-fill] w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Create Admin Account</h3>
                                <p className="text-gray-500 text-xs">Add a team member with administrative access</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdminSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Identity</label>
                                <input
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                                    required
                                    value={adminFormData.name}
                                    onChange={e => setAdminFormData({ ...adminFormData, name: e.target.value })}
                                    placeholder="e.g. Alexander Pierce"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Communication Email</label>
                                <input
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                                    type="email"
                                    required
                                    value={adminFormData.email}
                                    onChange={e => setAdminFormData({ ...adminFormData, email: e.target.value })}
                                    placeholder="admin@ngwindsongk.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Access Terminal (Phone)</label>
                                <input
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                                    required
                                    value={adminFormData.phone}
                                    onChange={e => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                                    placeholder="07XX XXX XXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Security Cipher (Password)</label>
                                <input
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={adminFormData.password}
                                    onChange={e => setAdminFormData({ ...adminFormData, password: e.target.value })}
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Authority Level</label>
                                <select
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 cursor-pointer appearance-none"
                                    value={adminFormData.role}
                                    onChange={e => setAdminFormData({ ...adminFormData, role: e.target.value })}
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.name}>{r.name.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    disabled={isSubmittingAdmin}
                                    className="w-full bg-primary hover:bg-[#b5952f] text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95"
                                >
                                    {isSubmittingAdmin ? (
                                        <>
                                            <span className="icon-[tabler--loader-2] animate-spin w-4 h-4" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="icon-[solar--shield-user-bold] w-4 h-4" />
                                            Authorize Admin
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Customer Accounts</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">Users</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                        <div className="admin-table-wrapper scrollbar-hide">
                            <table className="admin-table text-left">
                                <thead className="bg-[#0a0a0a] text-primary uppercase text-[10px] font-black tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-6">Identity</th>
                                        <th className="px-8 py-6">Communication</th>
                                        <th className="px-8 py-6 text-center italic">Authorization</th>
                                        <th className="px-8 py-6">Joined</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-gray-900 uppercase tracking-tight italic">{user.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest">{user.email || 'No email attached'}</div>
                                                </td>
                                                <td className="px-8 py-6 text-gray-600 font-bold text-sm tracking-widest">{user.phone}</td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-wrap justify-center gap-1">
                                                        {user.role_names?.length > 0 ? (
                                                            user.role_names.map(rn => (
                                                                <span key={rn} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-[10px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100 shadow-sm">
                                                                    {rn}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[9px] text-gray-300 italic">No roles</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-gray-500 text-xs font-bold uppercase tracking-widest">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                        user.status === 'active'
                                                            ? 'bg-green-100 text-green-700 border-green-200'
                                                            : 'bg-red-100 text-red-700 border-red-200'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => setManagingUserRoles(user)}
                                                            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                                                            title="Assign Roles"
                                                        >
                                                            <span className="icon-[solar--shield-user-bold] w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleStatus(user.id, user.status)}
                                                            className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-sm ${
                                                                user.status === 'active'
                                                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                            }`}
                                                        >
                                                            {user.status === 'active' ? 'Disable' : 'Enable'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Administrative Accounts</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">Admins</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                        <div className="admin-table-wrapper scrollbar-hide">
                            <table className="admin-table text-left">
                                <thead className="bg-[#0a0a0a] text-white">
                                    <tr>
                                        <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px]">Administrative Identity</th>
                                        <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px]">Contact Channel</th>
                                        <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-center italic">Roles</th>
                                        <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-right">Commissioned</th>
                                        <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-50">
                                    {admins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs group-hover:bg-primary/10 group-hover:text-primary transition-all uppercase border border-gray-100 shadow-sm">
                                                        {admin.name.charAt(0)}
                                                    </div>
                                                    <span className="font-black text-gray-900 uppercase tracking-tight italic">{admin.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 text-sm font-black tracking-tight">{admin.email}</span>
                                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{admin.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {admin.role_names?.map(rn => (
                                                        <span key={rn} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                            rn.includes('admin') ? 'bg-primary text-white border-primary/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                        }`}>
                                                            {rn}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                    {new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setManagingUserRoles(admin)}
                                                        className="p-3 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group/btn"
                                                        title="Manage Authority"
                                                    >
                                                        <span className="icon-[solar--shield-user-bold] w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingAdminPassword(admin)}
                                                        className="p-3 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all group/btn"
                                                        title="Reset Password"
                                                    >
                                                        <span className="icon-[solar--key-bold-duotone] w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin.id)}
                                                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group/btn"
                                                        title="Revoke Access"
                                                    >
                                                        <span className="icon-[solar--trash-bin-trash-bold] w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-20">
                                                    <span className="icon-[solar--users-group-two-rounded-bold] w-16 h-16" />
                                                    <p className="font-black uppercase tracking-widest text-sm italic">No administrative personnel found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {usersData?.users?.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                    </div>
                )}
            </div>
        </main>
    );
}
