'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'

export default function DeliverySettings() {
    const { data: response, isLoading } = useSWR(['/settings', { group: 'delivery' }], fetcher)
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
                group: 'delivery'
            })

            if (res.success) {
                setMessage({ type: 'success', text: 'Delivery settings updated successfully!' })
                mutate(['/settings', { group: 'delivery' }])
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
                {/* Shipping Cutoff Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <span className="icon-[fluent--clock-24-regular] text-2xl text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Shipping Cutoff Logic</h3>
                            <p className="text-gray-500 text-sm">Define the daily cutoff for same-day shipping.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Cutoff Hour (24h format)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={settings.shipping_cutoff_hour || '10'}
                                    onChange={(e) => updateSetting('shipping_cutoff_hour', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                                    placeholder="e.g. 10"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-medium">:00 EAT</span>
                            </div>
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    <strong>Current Logic:</strong> Orders made before <strong>{settings.shipping_cutoff_hour || '10'}:00 AM</strong> will be shipped the <strong>same day</strong>. Orders after this time will ship the following day.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Thresholds */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <span className="icon-[fluent--money-24-regular] text-2xl text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Free Delivery Thresholds</h3>
                            <p className="text-gray-500 text-sm">Manage when customers qualify for free shipping.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Free Delivery Threshold (KES)</label>
                            <input
                                type="number"
                                value={settings.free_delivery_threshold_amount || ''}
                                onChange={(e) => updateSetting('free_delivery_threshold_amount', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                                placeholder="e.g. 5000"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Bulk Free Delivery (KG)</label>
                            <input
                                type="number"
                                value={settings.free_delivery_threshold_bulk_kg || ''}
                                onChange={(e) => updateSetting('free_delivery_threshold_bulk_kg', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                                placeholder="e.g. 250"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
                <button
                    disabled={isSaving}
                    type="submit"
                    className="bg-primary text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Spinner className="w-5 h-5" /> : 'Save Delivery Settings'}
                </button>
            </div>
        </form>
    )
}
