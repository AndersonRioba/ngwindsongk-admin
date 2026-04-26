'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest } from '@/app/lib/data'
import Editor from '@/app/UI/WYSIWYG/Editor'
import Spinner from '@/app/UI/Spinner'

export default function AboutSettings() {
    const { data: response, isLoading } = useSWR(['/settings', { group: 'about' }], fetcher)
    const [settings, setSettings] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (response?.data) {
            setSettings(response.data)
        }
    }, [response])

    const handleSave = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await postRequest('/admin/settings', {
                settings: settings,
                group: 'about'
            })

            if (res.success) {
                setMessage({ type: 'success', text: 'About Us settings updated successfully!' })
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
                    <div className="grid md:grid-cols-2 gap-6">
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
