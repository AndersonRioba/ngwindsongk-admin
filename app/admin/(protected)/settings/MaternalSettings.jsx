'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'
import FileInput from '@/app/UI/FileInput'
import Image from 'next/image'

export default function MaternalSettings() {
    const { data: response, isLoading } = useSWR(['/settings', { group: 'footer' }], fetcher)
    const [settings, setSettings] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [files, setFiles] = useState([])

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
            const formData = new FormData()
            
            // Only send maternal consultant settings keys to avoid overwriting or bloating other footer sections
            const maternalKeys = [
                'consultant_name',
                'consultant_profile',
                'consultant_phone',
                'consultant_email',
                'consultant_whatsapp'
            ]

            maternalKeys.forEach(key => {
                formData.append(`settings[${key}]`, settings[key] || '')
            })

            // Append consultant image if a new one is selected
            if (files.length > 0) {
                formData.append('settings[consultant_image]', files[0])
            }

            formData.append('group', 'footer')

            const res = await postRequest('/admin/settings', formData)

            if (res.success) {
                setMessage({ type: 'success', text: 'Maternal consultant settings updated successfully!' })
                setFiles([])
                mutate(['/settings', { group: 'footer' }])
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

    const displayImg = settings.consultant_image 
        ? (settings.consultant_image.startsWith('http') 
            ? settings.consultant_image 
            : `${process.env.NEXT_PUBLIC_BASE_URL}${settings.consultant_image.startsWith('/') ? '' : '/'}${settings.consultant_image}`) 
        : null

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-5xl pb-10">
            {message.text && (
                <div className={`p-4 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${
                    message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    <div className="flex items-center gap-2 font-bold">
                        <span className={message.type === 'success' ? 'icon-[solar--check-read-linear]' : 'icon-[solar--danger-triangle-linear]'} />
                        {message.text}
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                    <span className="icon-[solar--heart-bold-duotone] text-primary w-6 h-6" />
                    Maternal & Childcare Consultant Profile
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Consultant Title / Name</label>
                            <input 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                value={settings.consultant_name || ''}
                                onChange={(e) => updateSetting('consultant_name', e.target.value)}
                                placeholder="e.g. Dr. Jane Mutua / Lactation Expert"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Profile Description</label>
                            <textarea 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[140px] leading-relaxed"
                                value={settings.consultant_profile || ''}
                                onChange={(e) => updateSetting('consultant_profile', e.target.value)}
                                placeholder="Brief background, credentials, and maternal childcare support expertise..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                <input 
                                    className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    value={settings.consultant_phone || ''}
                                    onChange={(e) => updateSetting('consultant_phone', e.target.value)}
                                    placeholder="0700 000 000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                <input 
                                    className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    value={settings.consultant_email || ''}
                                    onChange={(e) => updateSetting('consultant_email', e.target.value)}
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp</label>
                                <input 
                                    className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    value={settings.consultant_whatsapp || ''}
                                    onChange={(e) => updateSetting('consultant_whatsapp', e.target.value)}
                                    placeholder="254700000000"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Consultant Portrait / Image</label>
                        <div className="flex-1 flex flex-col justify-between">
                            <FileInput files={files} setFiles={setFiles} type="image" />
                            {displayImg && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-white shadow-md">
                                        <Image 
                                            src={displayImg} 
                                            alt="Current consultant portrait"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Currently Displayed Portrait</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    disabled={isSaving}
                    type="submit"
                    className="bg-primary text-white font-black py-5 px-12 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                >
                    {isSaving ? <Spinner className="w-5 h-5 border-white" /> : <><span className="icon-[solar--check-read-bold] w-5 h-5"/> Update Profile Settings</>}
                </button>
            </div>
        </form>
    )
}
