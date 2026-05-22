'use client'

import { useState } from 'react'
import Image from 'next/image'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest, deleteRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'
import FileInput from '@/app/UI/FileInput'
import ConfirmModal from '@/app/UI/ConfirmModal'

export default function BannerSettings() {
    const [selectedPage, setSelectedPage] = useState('homepage')
    const { data: response, isLoading: bannersLoading } = useSWR(['/admin/banners', { page: selectedPage }], fetcher)
    const { data: brandsResponse, isLoading: brandsLoading } = useSWR(['/admin/brands', {}], fetcher)
    const [isSaving, setIsSaving] = useState(false)
    const [editingBanner, setEditingBanner] = useState(null) // null for new, banner object for edit
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [idToDelete, setIdToDelete] = useState(null)
    const [files, setFiles] = useState([])

    const banners = response || []

    const staticPages = [
        { id: 'homepage', name: 'Homepage', icon: 'icon-[fluent--home-16-regular]' },
        { id: 'about', name: 'About Us', icon: 'icon-[fluent--info-16-regular]' },
        { id: 'recipes', name: 'Recipes', icon: 'icon-[fluent--food-16-regular]' },
    ]

    const brandPages = (brandsResponse?.data || brandsResponse || [])
        .map(brand => ({
            id: brand.slug || brand.name.toLowerCase().trim().replaceAll(' ', '-'),
            name: `${brand.name} Category`,
            icon: 'icon-[fluent--drink-coffee-16-regular]'
        }))

    const pages = [...staticPages, ...brandPages]

    const handleSave = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.target)
        formData.append('page', selectedPage) // Ensure current page is saved
        
        // Add files manually from state
        if (files && files.length > 0) {
            formData.append('image', files[0])
        }
        
        try {
            const url = editingBanner 
                ? `/admin/banners/${editingBanner.id}` 
                : '/admin/banners'
            
            // If editing, use _method: PUT for Laravel multipart
            if (editingBanner) formData.append('_method', 'PUT')

            const { popupE } = await import('@/app/lib/trigger')
            const res = await postRequest(url, formData)
            
            if (res.success || res.id) {
                mutate(['/admin/banners', { page: selectedPage }])
                setIsModalOpen(false)
                setEditingBanner(null)
                setFiles([])
                popupE('success', 'Banner saved successfully')
            } else {
                popupE('error', res.message || 'Failed to save banner')
            }
        } catch (err) {
            console.error(err)
            const { popupE } = await import('@/app/lib/trigger')
            popupE('error', err.response?.data?.message || err.message || 'An error occurred during upload')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!idToDelete) return
        const { popupE } = await import('@/app/lib/trigger')
        try {
            await deleteRequest(`/admin/banners/${idToDelete}`)
            mutate(['/admin/banners', { page: selectedPage }])
            popupE('success', 'Banner removed successfully')
        } catch (err) {
            console.error(err)
            popupE('error', 'Critical failure during banner disposal')
        } finally {
            setIdToDelete(null)
        }
    }

    if (bannersLoading || brandsLoading) return <div className="flex justify-center p-12"><Spinner /></div>

    const currentPageName = pages.find(p => p.id === selectedPage)?.name

    return (
        <div className="space-y-6">
            {/* Page Selection Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded-2xl border">
                {pages.map((page) => (
                    <button
                        key={page.id}
                        onClick={() => setSelectedPage(page.id)}
                        className={`flex items-center space-x-2 py-2 px-4 rounded-xl transition-all ${
                            selectedPage === page.id
                                ? 'bg-white text-primary shadow-sm border font-bold'
                                : 'text-gray-500 hover:text-primary'
                        }`}
                    >
                        <span className={`${page.icon} w-4 h-4`} />
                        <span className="text-xs uppercase tracking-wider">{page.name}</span>
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{currentPageName} Banners</h3>
                    <p className="text-sm text-gray-500">Manage banners specifically for the {currentPageName} page.</p>
                </div>
                <button 
                    onClick={() => { setEditingBanner(null); setFiles([]); setIsModalOpen(true); }}
                    className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <span className="icon-[fluent--add-16-filled] w-5 h-5" />
                    Add Banner
                </button>
            </div>

            {banners.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed p-20 text-center">
                    <span className="icon-[fluent--image-off-24-regular] w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No banners found for this section.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6 pb-12">
                    {banners.map((banner) => (
                        <div key={banner.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden group">
                            <div className="relative bg-gray-100 italic">
                                <Image 
                                    src={banner.image.startsWith('http') ? banner.image : `${process.env.NEXT_PUBLIC_BASE_URL}/storage/${banner.image}`} 
                                    alt={banner.title} 
                                    width={1050}
                                    height={450}
                                    className="w-full h-auto block" 
                                    unoptimized={true}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button 
                                        onClick={() => { setEditingBanner(banner); setFiles([]); setIsModalOpen(true); }}
                                        className="p-3 bg-white rounded-full text-primary hover:scale-110 transition-transform"
                                    >
                                        <span className="icon-[fluent--edit-16-regular] w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => setIdToDelete(banner.id)}
                                        className="p-3 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                                    >
                                        <span className="icon-[fluent--delete-16-regular] w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h4 className="font-bold text-gray-800 truncate">{banner.title || 'Untitled Banner'}</h4>
                                <p className="text-xs text-gray-500 mt-1 truncate">{banner.link_url || 'No link'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm Deletion Modal */}
            <ConfirmModal 
                show={idToDelete !== null}
                title="Delete Banner"
                message="Are you sure you want to delete this banner? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setIdToDelete(null)}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {editingBanner ? 'Edit Banner' : `Add to ${currentPageName}`}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="icon-[fluent--dismiss-24-regular] w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image</label>
                                    <FileInput files={files} setFiles={setFiles} type="image" />
                                    {!editingBanner && files.length === 0 && <p className="text-xs text-red-500 mt-1">Image is required for new banners</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                    <input name="title" defaultValue={editingBanner?.title} className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" placeholder="Hero header text..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Link Text</label>
                                    <input name="link_text" defaultValue={editingBanner?.link_text} className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" placeholder="Shop Now, etc." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Link URL</label>
                                    <input name="link_url" defaultValue={editingBanner?.link_url} className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" placeholder="/products/oats" />
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                                    <button disabled={isSaving} type="submit" className="flex-1 py-4 font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors flex justify-center items-center">
                                        {isSaving ? <Spinner className="w-5 h-5 text-white" /> : 'Save Banner'}
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
