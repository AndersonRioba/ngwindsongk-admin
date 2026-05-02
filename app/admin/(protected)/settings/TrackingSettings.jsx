'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'

export default function TrackingSettings() {
    const { data: response, isLoading } = useSWR(['/settings', { group: 'tracking' }], fetcher)
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
                group: 'tracking'
            })

            if (res.success) {
                setMessage({ type: 'success', text: 'Tracking settings updated successfully!' })
                mutate(['/settings', { group: 'tracking' }])
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
                {/* Google Tracking Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="icon-[logos--google-tag-manager] w-6 h-6" />
                        Google Tag (gtag.js)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest text-[10px]">Google Tag ID</label>
                            <input 
                                type="text"
                                value={settings.google_tag_id || ''}
                                onChange={(e) => updateSetting('google_tag_id', e.target.value)}
                                placeholder="e.g. GT-XXXXXXXX or G-XXXXXXXX"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[10px] text-gray-500 mt-2 italic">A single Google Tag ID (starting with GT-, G-, or AW-) can often be used to track both Analytics and Ads. Enter your primary ID here.</p>
                        </div>
                    </div>
                </div>

                {/* Conversion Tracking Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="icon-[fluent--data-usage-24-regular] text-primary" />
                        Conversion Tracking
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest text-[10px]">Purchase Event Snippet</label>
                            <textarea 
                                rows={6}
                                value={settings.purchase_event_snippet || ''}
                                onChange={(e) => updateSetting('purchase_event_snippet', e.target.value)}
                                placeholder="gtag('event', 'conversion', { ... });"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                            />
                            <p className="text-[10px] text-gray-500 mt-2 italic">This code snippet will be executed on the order success page. Do not include &lt;script&gt; tags.</p>
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
                    {isSaving ? <Spinner className="w-5 h-5" /> : 'Save Tracking Settings'}
                </button>
            </div>
        </form>
    )
}
