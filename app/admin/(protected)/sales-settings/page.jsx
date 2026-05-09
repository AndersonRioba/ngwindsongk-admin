'use client'

import { useState, useEffect } from 'react'
import { fetcher, postData } from '@/app/lib/data'
import { popupE } from '@/app/lib/trigger'

export default function SalesSettings() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [settings, setSettings] = useState({
        free_delivery_threshold_amount: '',
        free_delivery_threshold_bulk_kg: '',
        wholesale_moq_kg: '',
        default_partner_discount: '',
        influencer_commission_rate: ''
    })

    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Fetch settings for both delivery and sales group
                // Passing parameters in the second element of the fetcher array to avoid double question marks
                const deliveryRes = await fetcher(['/settings', { group: 'delivery' }]);
                const salesRes = await fetcher(['/settings', { group: 'sales' }]);
                
                setSettings({
                    free_delivery_threshold_amount: deliveryRes.data?.free_delivery_threshold_amount || '5000',
                    free_delivery_threshold_bulk_kg: deliveryRes.data?.free_delivery_threshold_bulk_kg || '250',
                    wholesale_moq_kg: salesRes.data?.wholesale_moq_kg || '25',
                    default_partner_discount: salesRes.data?.default_partner_discount || '5',
                    influencer_commission_rate: salesRes.data?.influencer_commission_rate || '5'
                });
            } catch (error) {
                console.error("Failed to load sales settings", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (group) => {
        setIsSaving(true);
        try {
            let payload = {};
            if (group === 'delivery') {
                payload = {
                    group: 'delivery',
                    settings: {
                        free_delivery_threshold_amount: settings.free_delivery_threshold_amount,
                        free_delivery_threshold_bulk_kg: settings.free_delivery_threshold_bulk_kg
                    }
                };
            } else if (group === 'sales') {
                payload = {
                    group: 'sales',
                    settings: {
                        wholesale_moq_kg: settings.wholesale_moq_kg,
                        default_partner_discount: settings.default_partner_discount,
                        influencer_commission_rate: settings.influencer_commission_rate
                    }
                };
            }

            await new Promise((resolve, reject) => {
                postData((res) => {
                    if (res.success) {
                        popupE('success', `${group} settings updated successfully`);
                        resolve(res);
                    } else {
                        reject(new Error(res.message || 'Failed to sync settings'));
                    }
                }, payload, '/admin/settings');
            });
        } catch (error) {
            popupE('error', `Failed to update ${group} settings`);
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading settings...</div>
    }

    return (
        <div className="p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery & Sales Constraints</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Delivery Settings */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="icon-[fluent--vehicle-truck-24-regular] w-5 h-5 text-primary" />
                        Delivery Constraints
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Standard Free Delivery Threshold (KES)</label>
                            <input
                                type="number"
                                name="free_delivery_threshold_amount"
                                value={settings.free_delivery_threshold_amount}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Orders above this amount qualify for standard free delivery (e.g. 5000).</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bulk Free Delivery Threshold (KG)</label>
                            <input
                                type="number"
                                name="free_delivery_threshold_bulk_kg"
                                value={settings.free_delivery_threshold_bulk_kg}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Total weight required for bulk items to qualify for free delivery (e.g. 250).</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleSave('delivery')}
                        disabled={isSaving}
                        className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors w-full flex items-center justify-center gap-2"
                    >
                        {isSaving ? <span className="icon-[fluent--spinner-ios-16-regular] animate-spin" /> : <span className="icon-[fluent--save-16-filled]" />}
                        Save Delivery Settings
                    </button>
                </div>

                {/* Sales Settings */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="icon-[fluent--shopping-bag-24-regular] w-5 h-5 text-primary" />
                        Wholesale Limits
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wholesale Minimum Order Qty (KG)</label>
                            <input
                                type="number"
                                name="wholesale_moq_kg"
                                value={settings.wholesale_moq_kg}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Minimum quantity required for products marked as wholesale/bulk (e.g. 25).</p>
                        </div>
                        <div className="pt-4 border-t border-gray-200 mt-2">
                            <h4 className="text-xs font-bold text-gray-900 mb-2">Brand Order Maximums</h4>
                            <p className="text-[10px] text-gray-500 mb-3">To set the maximum order limits for specific brands (like Nanacare or Grainmill), go to the Brands management page.</p>
                            <a href="/admin/brands" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                Go to Brands <span className="icon-[fluent--arrow-right-16-filled] w-3 h-3"/>
                            </a>
                        </div>
                    </div>
                    <button
                        onClick={() => handleSave('sales')}
                        disabled={isSaving}
                        className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors w-full flex items-center justify-center gap-2"
                    >
                        {isSaving ? <span className="icon-[fluent--spinner-ios-16-regular] animate-spin" /> : <span className="icon-[fluent--save-16-filled]" />}
                        Save Wholesale Limits
                    </button>
                </div>
            </div>

            {/* Partner Program Settings */}
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 max-w-2xl">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 italic uppercase tracking-tight">
                    <span className="icon-[solar--users-group-two-rounded-bold-duotone] w-7 h-7 text-primary" />
                    Partner Program Logic
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Default Voucher Discount (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="default_partner_discount"
                                value={settings.default_partner_discount}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-black text-gray-900"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold leading-relaxed px-1">Applied automatically to new vouchers when a partner is approved.</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Influencer Commission (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="influencer_commission_rate"
                                value={settings.influencer_commission_rate}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-black text-gray-900"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold leading-relaxed px-1">Percentage of order total earned by influencers on attributed sales.</p>
                    </div>
                </div>
                <button
                    onClick={() => handleSave('sales')}
                    disabled={isSaving}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                >
                    {isSaving ? <span className="icon-[fluent--spinner-ios-16-regular] animate-spin w-5 h-5" /> : <span className="icon-[fluent--save-16-filled] w-5 h-5" />}
                    Update Partner Program Logic
                </button>
            </div>
        </div>
    )
}
