'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest, deleteRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'

export default function TestimonialSettings() {
    const { data: response, isLoading } = useSWR('/admin/testimonials', fetcher)
    const [isSaving, setIsSaving] = useState(false)
    const [editingTestimonial, setEditingTestimonial] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const testimonials = response || []

    const handleSave = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        const data = Object.fromEntries(new FormData(e.target))
        
        try {
            const url = editingTestimonial 
                ? `/admin/testimonials/${editingTestimonial.id}` 
                : '/admin/testimonials'
            
            // For simple JSON data (no images here for now, or use FormData if needed)
            const res = await postRequest(url, {
                ...data,
                _method: editingTestimonial ? 'PUT' : 'POST'
            })
            
            if (res.success || res.id) {
                mutate('/admin/testimonials')
                setIsModalOpen(false)
                setEditingTestimonial(null)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return
        try {
            await deleteRequest(`/admin/testimonials/${id}`)
            mutate('/admin/testimonials')
        } catch (err) {
            console.error(err)
        }
    }

    if (isLoading) return <div className="flex justify-center p-12"><Spinner /></div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Client Testimonials</h3>
                    <p className="text-sm text-gray-500">Manage the &quot;Happy Clients&quot; section on the homepage.</p>
                </div>
                <button 
                    onClick={() => { setEditingTestimonial(null); setIsModalOpen(true); }}
                    className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <span className="icon-[fluent--add-16-filled] w-5 h-5" />
                    Add Review
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {testimonials.map((t) => (
                    <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <span key={i} className="icon-[fluent--star-16-filled] w-4 h-4" />
                                    ))}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingTestimonial(t); setIsModalOpen(true); }} className="text-primary p-1 rounded hover:bg-primary/10">
                                        <span className="icon-[fluent--edit-16-regular] w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} className="text-red-500 p-1 rounded hover:bg-red-50">
                                        <span className="icon-[fluent--delete-16-regular] w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm italic mb-6 leading-relaxed">&quot;{t.comment}&quot;</p>
                        </div>
                        <div className="flex items-center gap-3 border-t pt-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {t.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{t.name}</h4>
                                <p className="text-[11px] text-gray-400 uppercase tracking-wider">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
                            </h3>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Client Name</label>
                                        <input name="name" required defaultValue={editingTestimonial?.name} className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Role/Title</label>
                                        <input name="role" defaultValue={editingTestimonial?.role} className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Happy Mother" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Rating (1-5)</label>
                                    <select name="rating" defaultValue={editingTestimonial?.rating || 5} className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                                        <option value="5">5 stars</option>
                                        <option value="4">4 stars</option>
                                        <option value="3">3 stars</option>
                                        <option value="2">2 stars</option>
                                        <option value="1">1 star</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                                    <textarea name="comment" required defaultValue={editingTestimonial?.comment} className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]" placeholder="What did they say about your products?" />
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                                    <button disabled={isSaving} type="submit" className="flex-1 py-4 font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors flex justify-center items-center">
                                        {isSaving ? <Spinner className="w-5 h-5 text-white" /> : 'Save Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
