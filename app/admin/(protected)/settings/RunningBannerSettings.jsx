'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'

export default function RunningBannerSettings() {
    const { data: response, isLoading } = useSWR(['/settings', { group: 'running_banner' }], fetcher)
    const [settings, setSettings] = useState({
        rb_is_active: 'true',
        rb_text: 'Free Delivery on orders over 5,000 Kshs',
        rb_icon_primary: 'icon-[mdi--truck-fast-outline]',
        rb_icon_secondary: 'icon-[solar--scooter-linear]',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (response?.data && Object.keys(response.data).length > 0) {
            setSettings(prev => ({ ...prev, ...response.data }))
        }
    }, [response])

    const handleSave = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const formData = new FormData()
            formData.append('group', 'running_banner')

            // Append standard text settings
            Object.entries(settings).forEach(([key, value]) => {
                formData.append(`settings[${key}]`, value)
            })

            const res = await postRequest('/admin/settings', formData)
            const { popupE } = await import('@/app/lib/trigger')

            if (res.success) {
                popupE('success', 'Running Banner settings updated successfully!')
                mutate(['/settings', { group: 'running_banner' }])
            } else {
                throw new Error(res.message || 'Failed to update settings')
            }
        } catch (err) {
            const { popupE } = await import('@/app/lib/trigger')
            popupE('error', err.response?.data?.message || err.message || 'Failed to connect to the server')
        } finally {
            setIsSaving(false)
        }
    }

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const availableIcons = [
        { class: 'icon-[mdi--truck-fast-outline]', name: 'Speeding Truck' },
        { class: 'icon-[mdi--truck-fast]', name: 'Solid Speed Truck' },
        { class: 'icon-[mdi--bike-fast]', name: 'Fast Delivery Bicycle' },
        { class: 'icon-[solar--scooter-linear]', name: 'Scooter' },
        { class: 'icon-[fluent--vehicle-truck-profile-24-regular]', name: 'Box Truck' },
        { class: 'icon-[fluent--gift-24-regular]', name: 'Gift Box' },
        { class: 'icon-[fluent--tag-24-regular]', name: 'Discount Tag' },
        { class: 'icon-[fluent--clock-24-regular]', name: 'Timer/Clock' },
        { class: 'icon-[fluent--star-24-regular]', name: 'Star' },
        { class: 'icon-[ph--airplane-tilt]', name: 'Airplane' },
    ]

    const renderIconSelector = (title, field) => (
        <div className="bg-gray-50/50 p-4 border rounded-xl w-full">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center justify-between">
                {title}
                <span className={`${settings[field] || availableIcons[0].class} w-6 h-6 text-primary scale-125`}></span>
            </label>
            <div className="grid grid-cols-4 gap-2">
                {availableIcons.map(icon => (
                    <button
                        key={icon.class}
                        type="button"
                        title={icon.name}
                        onClick={() => updateSetting(field, icon.class)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            (settings[field] || availableIcons[0].class) === icon.class 
                            ? 'bg-primary/10 border-primary text-primary shadow-inner shadow-primary/20' 
                            : 'bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <span className={`${icon.class} w-6 h-6`} />
                    </button>
                ))}
            </div>
        </div>
    )

    if (isLoading) return <div className="flex justify-center p-12"><Spinner /></div>

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Running Banner Configuration</h3>
                        <p className="text-xs text-gray-500 mt-1">Manage the scrolling marquee banner shown below the navigation.</p>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <span className="text-sm font-bold text-gray-700">Enable Banner</span>
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={settings.rb_is_active === 'true'}
                                onChange={(e) => updateSetting('rb_is_active', e.target.checked ? 'true' : 'false')}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                    </label>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Banner Text</label>
                        <input 
                            value={settings.rb_text || ''} 
                            onChange={(e) => updateSetting('rb_text', e.target.value)}
                            className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            placeholder="Free Delivery on orders over 5,000 Kshs" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {renderIconSelector('Primary Icon', 'rb_icon_primary')}
                        {renderIconSelector('Secondary Icon', 'rb_icon_secondary')}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
                <button
                    disabled={isSaving}
                    type="submit"
                    className="bg-primary text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Spinner className="w-5 h-5" /> : 'Save Changes'}
                </button>
            </div>
        </form>
    )
}
