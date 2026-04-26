'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'

export default function ContactSettings() {
    const { data: response, isLoading } = useSWR(['/settings', { group: 'contact' }], fetcher)
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
                group: 'contact'
            })

            if (res.success) {
                setMessage({ type: 'success', text: 'Contact settings updated successfully!' })
                mutate(['/settings', { group: 'contact' }])
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
                {/* Intro Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="icon-[fluent--text-description-24-regular] text-primary" />
                        Page Introduction
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Intro Headline</label>
                            <input 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                value={settings.contact_headline || ''}
                                onChange={(e) => updateSetting('contact_headline', e.target.value)}
                                placeholder="Get in touch"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Intro Description</label>
                            <textarea 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 h-24"
                                value={settings.contact_description || ''}
                                onChange={(e) => updateSetting('contact_description', e.target.value)}
                                placeholder="Have a question about our products..."
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Points */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="icon-[fluent--phone-24-regular] text-primary" />
                        Contact Detail (Direct)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone numbers (one per line)</label>
                            <textarea 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 h-32"
                                value={settings.contact_phones || ''}
                                onChange={(e) => updateSetting('contact_phones', e.target.value)}
                                placeholder="0718156421&#10;0795666840"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">Enter multiple numbers separated by new lines.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email addresses (one per line)</label>
                            <textarea 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 h-32"
                                value={settings.contact_emails || ''}
                                onChange={(e) => updateSetting('contact_emails', e.target.value)}
                                placeholder="sales@ngwindsongk.com&#10;info@ngwindsongk.com"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">Enter multiple emails separated by new lines.</p>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="icon-[fluent--location-24-regular] text-primary" />
                        Location Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Physical Address (HTML possible)</label>
                            <textarea 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 h-24"
                                value={settings.contact_address || ''}
                                onChange={(e) => updateSetting('contact_address', e.target.value)}
                                placeholder="Rashali GoDown, No. 2..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Google Maps URL</label>
                            <input 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                value={settings.contact_maps_url || ''}
                                onChange={(e) => updateSetting('contact_maps_url', e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
                <button
                    disabled={isSaving}
                    type="submit"
                    className="bg-primary text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Spinner className="w-5 h-5" /> : 'Update Contact Info'}
                </button>
            </div>
        </form>
    )
}
