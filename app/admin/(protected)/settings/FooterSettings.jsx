'use client'

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { fetcher, postRequest } from '@/app/lib/data'
import Spinner from '@/app/UI/Spinner'
import Image from 'next/image'

export default function FooterSettings() {
    const { data: response, isLoading } = useSWR(['/settings', { group: 'footer' }], fetcher)
    const [settings, setSettings] = useState({})
    const [menus, setMenus] = useState({ about: [], shop: [] })
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (response?.data) {
            setSettings(response.data)
            
            // Parse menus from settings strings
            try {
                const aboutMenu = response.data.footer_menu_about ? JSON.parse(response.data.footer_menu_about) : []
                const shopMenu = response.data.footer_menu_shop ? JSON.parse(response.data.footer_menu_shop) : []
                setMenus({ about: aboutMenu, shop: shopMenu })
            } catch (e) {
                console.error("Failed to parse menus", e)
            }
        }
    }, [response])

    const handleSave = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const formData = new FormData()
            
            // Prepare settings object
            const finalSettings = {
                ...settings,
                footer_menu_about: JSON.stringify(menus.about),
                footer_menu_shop: JSON.stringify(menus.shop)
            }

            // Append all settings to FormData
            Object.entries(finalSettings).forEach(([key, value]) => {
                formData.append(`settings[${key}]`, value)
            })

            formData.append('group', 'footer')

            const res = await postRequest('/admin/settings', formData)

            if (res.success) {
                setMessage({ type: 'success', text: 'Footer settings updated successfully!' })
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

    const updateMenuItem = (type, index, field, value) => {
        const newMenu = [...menus[type]]
        newMenu[index][field] = value
        setMenus(prev => ({ ...prev, [type]: newMenu }))
    }

    const addMenuItem = (type) => {
        setMenus(prev => ({
            ...prev,
            [type]: [...prev[type], { label: '', link: '' }]
        }))
    }

    const removeMenuItem = (type, index) => {
        const newMenu = menus[type].filter((_, i) => i !== index)
        setMenus(prev => ({ ...prev, [type]: newMenu }))
    }

    const MenuManager = ({ type, title, icon }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`${icon} text-primary w-6 h-6`} />
                    {title}
                </div>
                <button 
                    type="button" 
                    onClick={() => addMenuItem(type)}
                    className="text-xs bg-primary/5 text-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest flex items-center gap-2"
                >
                    <span className="icon-[solar--add-circle-bold] w-4 h-4" /> Add Link
                </button>
            </h3>
            
            <div className="space-y-4">
                {menus[type].length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm font-medium">
                        No custom links defined. Using defaults.
                    </div>
                ) : (
                    menus[type].map((item, index) => (
                        <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Label</label>
                                <input 
                                    className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50/50"
                                    value={item.label}
                                    onChange={(e) => updateMenuItem(type, index, 'label', e.target.value)}
                                    placeholder="e.g. Our Story"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Link (Path)</label>
                                <input 
                                    className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50/50"
                                    value={item.link}
                                    onChange={(e) => updateMenuItem(type, index, 'link', e.target.value)}
                                    placeholder="e.g. /about"
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => removeMenuItem(type, index)}
                                className="p-4 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Remove Link"
                            >
                                <span className="icon-[solar--trash-bin-trash-bold-duotone] w-6 h-6" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )

    if (isLoading) return <div className="flex justify-center p-12"><Spinner /></div>

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

            <div className="grid gap-8">
                {/* Contact Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <span className="icon-[solar--phone-bold-duotone] text-primary w-6 h-6" />
                        Company Contact Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Support Phone</label>
                            <input 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                value={settings.footer_phone || ''}
                                onChange={(e) => updateSetting('footer_phone', e.target.value)}
                                placeholder="+254 700 000 000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Support Email</label>
                            <input 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                value={settings.footer_email || ''}
                                onChange={(e) => updateSetting('footer_email', e.target.value)}
                                placeholder="support@ngwindsongk.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp Number (For Chat)</label>
                            <input 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                value={settings.footer_whatsapp || ''}
                                onChange={(e) => updateSetting('footer_whatsapp', e.target.value)}
                                placeholder="254718156421"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Physical Address</label>
                            <input 
                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                value={settings.footer_address || ''}
                                onChange={(e) => updateSetting('footer_address', e.target.value)}
                                placeholder="Nairobi, Kenya"
                            />
                        </div>
                    </div>
                </div>



                {/* Menu Management */}
                <MenuManager type="about" title="About Column Menu" icon="icon-[solar--notebook-bold-duotone]" />
                <MenuManager type="shop" title="Shop Column Menu" icon="icon-[solar--shop-bold-duotone]" />

                {/* Social Media Links */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <span className="icon-[solar--global-bold-duotone] text-primary w-6 h-6" />
                        Social Media Links
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {['social_facebook', 'social_instagram', 'social_linkedin', 'social_tiktok', 'social_youtube'].map(key => (
                            <div key={key}>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className={`icon-[solar--${key.split('_')[1]}-bold-duotone] w-5 h-5 text-gray-400`} /> 
                                    {key.split('_')[1].charAt(0).toUpperCase() + key.split('_')[1].slice(1)} URL
                                </label>
                                <input 
                                    className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    value={settings[key] || ''}
                                    onChange={(e) => updateSetting(key, e.target.value)}
                                    placeholder={`https://${key.split('_')[1]}.com/...`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    disabled={isSaving}
                    type="submit"
                    className="bg-primary text-white font-black py-5 px-12 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                >
                    {isSaving ? <Spinner className="w-5 h-5 border-white" /> : <><span className="icon-[solar--check-read-bold] w-5 h-5"/> Update Footer Settings</>}
                </button>
            </div>
        </form>
    )
}
