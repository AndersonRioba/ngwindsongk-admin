'use client'
import { useState, useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import { load } from "@/app/lib/storage"
import { popupE } from "@/app/lib/trigger"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

export default function ContactMessagesPage() {
    const [search, setSearch] = useState('')
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [messageToDelete, setMessageToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const { data: messages, error, isLoading, mutate } = useSWR(['/admin/messages', {}], fetcher)

    const filteredMessages = useMemo(() => {
        if (!Array.isArray(messages)) return []
        if (!search.trim()) return messages
        const q = search.toLowerCase()
        return messages.filter(m =>
            (m.first_name && m.first_name.toLowerCase().includes(q)) ||
            (m.last_name && m.last_name.toLowerCase().includes(q)) ||
            (m.email && m.email.toLowerCase().includes(q)) ||
            (m.message && m.message.toLowerCase().includes(q))
        )
    }, [messages, search])

    const handleDelete = async () => {
        if (!messageToDelete) return
        setIsDeleting(true)
        try {
            const token = load('adminToken') || load('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
            const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
            const res = await fetch(`${baseURL}/admin/messages/${messageToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            const data = await res.json()
            if (res.ok && data.success) {
                popupE('Success', 'Message deleted successfully')
                mutate()
                setMessageToDelete(null)
                if (selectedMessage?.id === messageToDelete.id) {
                    setSelectedMessage(null)
                }
            } else {
                popupE('Error', data.message || 'Failed to delete message')
            }
        } catch (err) {
            console.error(err)
            popupE('Error', 'An error occurred while deleting message')
        } finally {
            setIsDeleting(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateString
        }
    }

    return (
        <main className="mx-4 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />

            {/* Header */}
            <div className="flex flex-col md:flex-row mt-8 justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 gap-6">
                <div>
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#8b5cf6] tracking-tight uppercase italic">
                        Contact Messages
                    </h2>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-[0.2em]">
                        Inquiries &amp; Customer Submissions Received
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-primary/10 text-primary rounded-xl">
                        {Array.isArray(messages) ? `${messages.length} Total Messages` : 'Loading...'}
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="my-8">
                <div className="relative w-full md:w-96">
                    <span className="icon-[solar--magnifer-linear] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or message..."
                        className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all shadow-sm font-medium text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <div className="admin-table-wrapper scrollbar-hide overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sender</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Preview</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date Received</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                                        <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-40" /></td>
                                        <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-64" /></td>
                                        <td className="px-6 py-5 text-center"><div className="h-4 bg-gray-100 rounded w-24 mx-auto" /></td>
                                        <td className="px-6 py-5 text-right"><div className="h-4 bg-gray-100 rounded w-16 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredMessages.length > 0 ? (
                                filteredMessages.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase">
                                                    {(item.first_name?.[0] || 'U') + (item.last_name?.[0] || '')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">
                                                        {item.first_name} {item.last_name}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 font-mono">ID #{item.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <a
                                                href={`mailto:${item.email}`}
                                                className="text-xs font-semibold text-gray-700 hover:text-primary transition-colors flex items-center gap-1.5"
                                            >
                                                <span className="icon-[solar--letter-bold-duotone] text-primary w-4 h-4 shrink-0" />
                                                <span className="truncate max-w-[200px]">{item.email}</span>
                                            </a>
                                        </td>
                                        <td className="px-6 py-5 max-w-xs md:max-w-md">
                                            <p
                                                onClick={() => setSelectedMessage(item)}
                                                className="text-xs text-gray-600 truncate cursor-pointer hover:text-primary font-medium transition-colors"
                                                title="Click to view full message"
                                            >
                                                {item.message}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-center text-xs font-mono text-gray-500 whitespace-nowrap">
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td className="px-6 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedMessage(item)}
                                                    className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                    title="Read message"
                                                >
                                                    <span className="icon-[solar--eye-bold-duotone] w-4 h-4" />
                                                </button>
                                                <a
                                                    href={`mailto:${item.email}?subject=${encodeURIComponent('Regarding your inquiry on Ngwindsong')}`}
                                                    className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                    title="Reply via Email"
                                                >
                                                    <span className="icon-[solar--reply-bold-duotone] w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => setMessageToDelete(item)}
                                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete message"
                                                >
                                                    <span className="icon-[solar--trash-bin-trash-bold-duotone] w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <span className="icon-[solar--inbox-line-bold-duotone] w-12 h-12 mb-3 text-gray-300" />
                                            <p className="text-sm font-bold text-gray-700">No contact messages found</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {search ? "No inquiries match your search filter." : "Submissions through the website contact form will appear here."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Read Message Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                    Message Details
                                </span>
                                <h3 className="text-xl font-black text-gray-900 mt-2">
                                    {selectedMessage.first_name} {selectedMessage.last_name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">{formatDate(selectedMessage.created_at)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                            >
                                <span className="icon-[solar--close-circle-bold] w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100/70">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Sender Email
                                </label>
                                <a
                                    href={`mailto:${selectedMessage.email}`}
                                    className="text-sm font-bold text-primary hover:underline flex items-center gap-2"
                                >
                                    <span className="icon-[solar--letter-bold-duotone] w-4 h-4" />
                                    {selectedMessage.email}
                                </a>
                            </div>

                            <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100/70">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                    Message Content
                                </label>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setMessageToDelete(selectedMessage)}
                                className="px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2"
                            >
                                <span className="icon-[solar--trash-bin-trash-bold-duotone] w-4 h-4" />
                                Delete
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    Close
                                </button>
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent('Regarding your inquiry on Ngwindsong')}`}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <span className="icon-[solar--reply-bold-duotone] w-4 h-4" />
                                    Reply via Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {messageToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="icon-[solar--trash-bin-trash-bold-duotone] w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900">Delete Message?</h4>
                        <p className="text-xs text-gray-500 mt-2">
                            Are you sure you want to delete the message from <span className="font-bold text-gray-700">{messageToDelete.first_name} {messageToDelete.last_name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                disabled={isDeleting}
                                onClick={() => setMessageToDelete(null)}
                                className="flex-1 py-3 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="flex-1 py-3 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
