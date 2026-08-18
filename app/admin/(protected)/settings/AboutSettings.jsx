'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getImageUrl } from '@/app/lib/utils/image'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'
import dynamic from 'next/dynamic'
const Editor = dynamic(() => import('@/app/UI/WYSIWYG/Editor'), { ssr: false })

import SeoPanel from '@/app/UI/SeoPanel'

export default function AboutSettings() {
    const { data: response, isLoading } = useSWR(['/settings', { group: 'about' }], fetcher)
    const [settings, setSettings] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [ogImageFile, setOgImageFile] = useState(null)
    const [ogImagePreview, setOgImagePreview] = useState('')
    const ogImageInputRef = useRef(null)

    useEffect(() => {
        if (response?.data) {
            setSettings(response.data)
            // Set existing OG image preview from saved URL
            if (response.data.about_og_image && !ogImageFile) {
                setOgImagePreview(getImageUrl(response.data.about_og_image))
            }
        }
    }, [response, ogImageFile])

    const handleOgImageChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setOgImageFile(file)
            setOgImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage({ type: '', text: '' })

        try {
            let payload

            if (ogImageFile) {
                // Use FormData so we can send the image file
                payload = new FormData()
                payload.append('group', 'about')
                // Append all settings as individual fields
                Object.entries(settings).forEach(([key, val]) => {
                    if (val !== null && val !== undefined) {
                        payload.append(`settings[${key}]`, val)
                    }
                })
                payload.append('settings[about_og_image]', ogImageFile)
            } else {
                payload = { settings, group: 'about' }
            }

            const res = await postRequest('/admin/settings', payload)

            if (res.success) {
                setMessage({ type: 'success', text: 'About Us settings updated successfully!' })
                setOgImageFile(null) // Reset file selection after save
                mutate(['/settings', { group: 'about' }])
            } else {
                throw new Error(res.message || 'Failed to update settings')
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setIsSaving(false)
        }
    }

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    if (isLoading) return <div className="flex justify-center p-12"><Spinner /></div>

    // Strip HTML tags for clean fallback description
    const plainStory = settings.about_story ? settings.about_story.replace(/<[^>]*>?/gm, '').trim() : ''

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
            {message.text && (
                <div className={`p-4 rounded-xl border ${
                    message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-8">
                {/* Story Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="icon-[fluent--book-24-regular] text-primary" />
                        Our Story
                    </h3>
                    <div className="min-h-[200px] border rounded-xl overflow-hidden">
                        <Editor 
                            content={settings.about_story || ''} 
                            setContent={(val) => updateSetting('about_story', val)} 
                        />
                    </div>
                </div>

                {/* Mission Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="icon-[fluent--target-24-regular] text-primary" />
                        Our Mission
                    </h3>
                    <div className="min-h-[160px] border rounded-xl overflow-hidden">
                        <Editor 
                            content={settings.about_mission || ''} 
                            setContent={(val) => updateSetting('about_mission', val)} 
                        />
                    </div>
                </div>

                {/* Product Lines */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="icon-[fluent--box-24-regular] text-primary" />
                        Product Line Descriptions
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 font-mono uppercase tracking-widest text-[10px]">Grainmill (Oats)</label>
                            <div className="min-h-[160px] border rounded-xl overflow-hidden bg-gray-50/10">
                                <Editor 
                                    content={settings.about_oats_desc || ''} 
                                    setContent={(val) => updateSetting('about_oats_desc', val)} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 font-mono uppercase tracking-widest text-[10px]">Nanacare</label>
                            <div className="min-h-[160px] border rounded-xl overflow-hidden bg-gray-50/10">
                                <Editor 
                                    content={settings.about_nanacare_desc || ''} 
                                    setContent={(val) => updateSetting('about_nanacare_desc', val)} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 font-mono uppercase tracking-widest text-[10px]">Nutmill (Nuts & Seeds)</label>
                            <div className="min-h-[160px] border rounded-xl overflow-hidden bg-gray-50/10">
                                <Editor 
                                    content={settings.about_nutmill_desc || ''} 
                                    setContent={(val) => updateSetting('about_nutmill_desc', val)} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Founder Message */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="icon-[fluent--person-24-regular] text-primary" />
                        Founder&apos;s Message
                    </h3>
                    <div className="min-h-[160px] border rounded-xl overflow-hidden">
                        <Editor 
                            content={settings.about_founder_message || ''} 
                            setContent={(val) => updateSetting('about_founder_message', val)} 
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-[10px] font-black text-gray-500 font-mono uppercase tracking-widest mb-1">Founder Name</label>
                        <input
                            type="text"
                            value={settings.about_founder_name || ''}
                            onChange={(e) => updateSetting('about_founder_name', e.target.value)}
                            placeholder="e.g. Jennifer"
                            className="w-full sm:w-72 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                    </div>
                </div>

                {/* Our Values */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="icon-[fluent--shield-checkmark-24-regular] text-primary" />
                        Our Values
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Value 1 */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-purple-600 font-mono uppercase tracking-widest">Value 1 — Title</label>
                            <input
                                type="text"
                                value={settings.about_value1_title || ''}
                                onChange={(e) => updateSetting('about_value1_title', e.target.value)}
                                placeholder="e.g. Quality"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                            />
                            <label className="block text-[10px] font-black text-gray-500 font-mono uppercase tracking-widest">Description</label>
                            <textarea
                                value={settings.about_value1_desc || ''}
                                onChange={(e) => updateSetting('about_value1_desc', e.target.value)}
                                placeholder="Describe this value..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                            />
                        </div>
                        {/* Value 2 */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-blue-600 font-mono uppercase tracking-widest">Value 2 — Title</label>
                            <input
                                type="text"
                                value={settings.about_value2_title || ''}
                                onChange={(e) => updateSetting('about_value2_title', e.target.value)}
                                placeholder="e.g. Care"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition"
                            />
                            <label className="block text-[10px] font-black text-gray-500 font-mono uppercase tracking-widest">Description</label>
                            <textarea
                                value={settings.about_value2_desc || ''}
                                onChange={(e) => updateSetting('about_value2_desc', e.target.value)}
                                placeholder="Describe this value..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition"
                            />
                        </div>
                        {/* Value 3 */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-indigo-600 font-mono uppercase tracking-widest">Value 3 — Title</label>
                            <input
                                type="text"
                                value={settings.about_value3_title || ''}
                                onChange={(e) => updateSetting('about_value3_title', e.target.value)}
                                placeholder="e.g. Innovation"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition"
                            />
                            <label className="block text-[10px] font-black text-gray-500 font-mono uppercase tracking-widest">Description</label>
                            <textarea
                                value={settings.about_value3_desc || ''}
                                onChange={(e) => updateSetting('about_value3_desc', e.target.value)}
                                placeholder="Describe this value..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Featured / OG Image */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <span className="icon-[fluent--image-24-regular] text-primary" />
                        Featured Image (OG / Social Share)
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">This image appears when the About page is shared on social media (Facebook, Twitter, WhatsApp, etc.) and in Google rich results.</p>

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Preview */}
                        <div
                            className="relative w-full sm:w-72 h-44 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer group hover:border-primary/50 transition"
                            onClick={() => ogImageInputRef.current?.click()}
                        >
                            {ogImagePreview ? (
                                <>
                                    <Image
                                        src={ogImagePreview}
                                        alt="OG Image Preview"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">Click to change</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-2 pointer-events-none">
                                    <span className="icon-[fluent--image-add-24-regular] w-10 h-10 text-gray-300 mx-auto block" />
                                    <p className="text-xs text-gray-400 font-medium">Click to upload image</p>
                                    <p className="text-[10px] text-gray-300">Recommended: 1200 × 630 px</p>
                                </div>
                            )}
                        </div>

                        {/* Upload Controls */}
                        <div className="flex flex-col gap-3 justify-center">
                            <input
                                ref={ogImageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleOgImageChange(e.target.files[0])}
                            />
                            <button
                                type="button"
                                onClick={() => ogImageInputRef.current?.click()}
                                className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm px-5 py-2.5 rounded-xl transition"
                            >
                                <span className="icon-[fluent--arrow-upload-24-regular] w-4 h-4" />
                                {ogImagePreview ? 'Replace Image' : 'Upload Image'}
                            </button>
                            {ogImagePreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOgImageFile(null)
                                        setOgImagePreview('')
                                        updateSetting('about_og_image', '')
                                    }}
                                    className="inline-flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold text-sm px-5 py-2.5 rounded-xl border border-red-100 hover:bg-red-50 transition"
                                >
                                    <span className="icon-[fluent--delete-24-regular] w-4 h-4" />
                                    Remove Image
                                </button>
                            )}
                            {ogImageFile && (
                                <p className="text-[11px] text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                                    ⚠️ New image staged — click <strong>Save Changes</strong> to upload.
                                </p>
                            )}
                            {!ogImageFile && ogImagePreview && (
                                <p className="text-[11px] text-green-600 font-medium bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                                    ✓ Image saved and active.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEO & Social Optimization */}
                <div>
                    <SeoPanel
                        contentType="page"
                        slug="about"
                        title={settings.about_seo_title || "About Us - Our Story & Mission"}
                        excerpt={plainStory || "Learn about ngwindsong Kenya. Discover our mission to provide premium healthy oats and Nanacare products supporting healthy living and new mothers."}
                        featuredImage={ogImagePreview || ''}
                        seoData={{
                            seo_title: settings.about_seo_title || '',
                            seo_description: settings.about_seo_description || '',
                            seo_keywords: settings.about_seo_keywords || '',
                            canonical_url: settings.about_canonical_url || '',
                            noindex: !!settings.about_noindex,
                        }}
                        onChange={(field, val) => updateSetting(`about_${field}`, val)}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
                <button
                    disabled={isSaving}
                    type="submit"
                    className="bg-primary text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Spinner className="w-5 h-5" /> : 'Save Changes'}
                </button>
            </div>
        </form>
    )
}
