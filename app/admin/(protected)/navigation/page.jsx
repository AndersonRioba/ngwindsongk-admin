'use client'
import { useState } from "react"
import useSWR from "swr"
import { fetcher, postData, putData, deleteData } from "@/app/lib/data"
import { popupE } from "@/app/lib/trigger"
import BreadCrumbs from "@/app/UI/BreadCrumbs"
import Spinner from "@/app/UI/Spinner"

export default function Page() {
    const { data, error, isLoading, mutate } = useSWR(['/admin/nav-menus', {}], fetcher)
    const [isSaving, setIsSaving] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({
        label: '',
        url: '',
        order_position: 0,
        is_active: true,
        is_external: false
    })

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                label: item.label,
                url: item.url,
                order_position: item.order_position,
                is_active: !!item.is_active,
                is_external: !!item.is_external
            })
        } else {
            setEditingItem(null)
            setFormData({
                label: '',
                url: '',
                order_position: (data?.menus?.length || 0) + 1,
                is_active: true,
                is_external: false
            })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        const callback = (res) => {
            setIsSaving(false)
            if (res.success) {
                mutate()
                setModalOpen(false)
                popupE('success', editingItem ? 'Menu updated' : 'Menu created')
            } else {
                popupE('error', res.message || 'Operation failed')
            }
        }

        if (editingItem) {
            await putData(callback, formData, `/admin/nav-menus/${editingItem.id}`)
        } else {
            await postData(callback, formData, '/admin/nav-menus')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return
        
        await deleteData((res) => {
            if (res.success) {
                mutate()
                popupE('success', 'Menu item deleted')
            } else {
                popupE('error', res.message || 'Deletion failed')
            }
        }, `/admin/nav-menus/${id}`)
    }

    const handleToggleActive = async (item) => {
        await putData(() => mutate(), { is_active: !item.is_active }, `/admin/nav-menus/${item.id}`)
    }

    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20">
            <BreadCrumbs />
            <div className="flex mt-8 justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Navigation</h2>
                    <p className="text-gray-500 mt-1">Manage your shop&apos;s top-level menu links</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-primary text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="icon-[rivet-icons--plus] w-5 h-5"/>
                    Add New Link
                </button>
            </div>

            <section className="mt-10 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Spinner /></div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500 font-medium">Failed to load navigation data</div>
                ) : data?.menus?.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <span className="icon-[solar--map-outline] w-16 h-16 text-gray-200 mb-4" />
                        <p className="text-gray-500">No navigation links found. Click &quot;Add New Link&quot; to start.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Order</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Label</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">URL</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.menus.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs ring-1 ring-gray-200">
                                                {item.order_position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-800">{item.label}</span>
                                            {item.is_external ? <span className="ml-2 text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase">External</span> : null}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.url}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleToggleActive(item)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                {item.is_active ? 'Active' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <span className="icon-[fluent--edit-20-regular] w-5 h-5"/>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <span className="icon-[fluent--delete-20-regular] w-5 h-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Edit/Create Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Link' : 'Add New Link'}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Label</label>
                                <input 
                                    required
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-sm transition-all"
                                    placeholder="e.g. Products"
                                    value={formData.label}
                                    onChange={e => setFormData({...formData, label: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target URL</label>
                                <input 
                                    required
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-sm transition-all font-mono"
                                    placeholder="e.g. /products"
                                    value={formData.url}
                                    onChange={e => setFormData({...formData, url: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Order Position</label>
                                    <input 
                                        type="number"
                                        required
                                        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-sm transition-all"
                                        value={formData.order_position}
                                        onChange={e => setFormData({...formData, order_position: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-3 cursor-pointer group px-4 h-12 bg-gray-50 border border-gray-200 rounded-xl">
                                        <input 
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={formData.is_external}
                                            onChange={e => setFormData({...formData, is_external: e.target.checked})}
                                        />
                                        <span className="text-sm font-bold text-gray-600">External Tab</span>
                                    </label>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 h-12 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={isSaving}
                                    type="submit"
                                    className="flex-[2] h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20 flex items-center justify-center"
                                >
                                    {isSaving ? <Spinner /> : (editingItem ? 'Update Link' : 'Create Link')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
