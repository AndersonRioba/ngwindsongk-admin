'use client'

import { useState } from 'react'
import AboutSettings from './AboutSettings'
import BannerSettings from './BannerSettings'
import TestimonialSettings from './TestimonialSettings'
import FooterSettings from './FooterSettings'
import ContactSettings from './ContactSettings'
import RunningBannerSettings from './RunningBannerSettings'
import TrackingSettings from './TrackingSettings'
import DeliverySettings from './DeliverySettings'


export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('about')

    const tabs = [
        { id: 'about', name: 'About Us', icon: 'icon-[fluent--info-16-regular]' },
        { id: 'banners', name: 'Banners', icon: 'icon-[fluent--image-16-regular]' },
        { id: 'delivery', name: 'Delivery & Shipping', icon: 'icon-[fluent--truck-24-regular]' },
        { id: 'running_banner', name: 'Running Banner', icon: 'icon-[fluent--text-effects-24-regular]' },
        { id: 'testimonials', name: 'Testimonials', icon: 'icon-[fluent--chat-16-regular]' },
        { id: 'footer', name: 'Footer', icon: 'icon-[fluent--layout-footer-24-regular]' },
        { id: 'contact', name: 'Contact Page', icon: 'icon-[fluent--contact-card-24-regular]' },
        { id: 'tracking', name: 'Tracking & Analytics', icon: 'icon-[fluent--data-usage-24-regular]' },
    ]


    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800">Website Settings</h1>
                <p className="text-gray-500 mt-2">Manage dynamic content and branding for your e-commerce platform.</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 bg-white p-2 rounded-2xl shadow-sm border mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-3 px-6 rounded-xl transition-all duration-300 ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                        }`}
                    >
                        <span className={`${tab.icon} w-5 h-5`} />
                        <span className="font-bold text-sm tracking-tight">{tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-20">
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl">
                    {activeTab === 'about' && <AboutSettings />}
                    {activeTab === 'banners' && <BannerSettings />}
                    {activeTab === 'delivery' && <DeliverySettings />}
                    {activeTab === 'running_banner' && <RunningBannerSettings />}
                    {activeTab === 'testimonials' && <TestimonialSettings />}
                    {activeTab === 'footer' && <FooterSettings />}
                    { activeTab === 'contact' && <ContactSettings /> }
                    { activeTab === 'tracking' && <TrackingSettings /> }

                </div>
            </div>
        </div>
    )
}
