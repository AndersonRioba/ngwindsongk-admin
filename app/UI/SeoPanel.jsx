'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function SeoPanel({
    contentType = 'blog', // 'blog' | 'recipe' | 'product'
    slug = '',
    title = '',
    excerpt = '',
    featuredImage = '', // URL or preview image passed from parent
    seoData = {
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        canonical_url: '',
        noindex: false
    },
    onChange, // (field, value) => void
    siteUrl = 'https://ngwindsongk.com'
}) {
    const [activeTab, setActiveTab] = useState('preview') // 'preview' | 'social' | 'advanced'

    const seoTitle = seoData.seo_title || ''
    const seoDescription = seoData.seo_description || ''
    const seoKeywords = seoData.seo_keywords || ''
    const canonicalUrl = seoData.canonical_url || ''
    const noindex = !!seoData.noindex

    // Live previews fall back to standard content fields
    const displayTitle = seoTitle.trim() || title.trim() || 'Untitled Content'
    const displayDescription = seoDescription.trim() || excerpt.trim() || 'Provide a description to see how it appears in search results.'
    const displaySlug = slug ? slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : ''
    const pathPrefix = contentType === 'product' ? 'products' : contentType === 'recipe' ? 'recipes' : contentType === 'page' ? '' : 'blog'
    const previewUrl = pathPrefix 
        ? `${siteUrl.replace(/^https?:\/\//, '')} › ${pathPrefix} › ${displaySlug || 'example-slug'}`
        : `${siteUrl.replace(/^https?:\/\//, '')} › ${displaySlug || 'about'}`

    // Character counter metrics
    const titleLength = seoTitle.length
    const descLength = seoDescription.length

    const getTitleColor = () => {
        if (titleLength === 0) return 'text-gray-400'
        if (titleLength <= 60) return 'text-green-600 font-semibold'
        if (titleLength <= 70) return 'text-amber-500 font-semibold'
        return 'text-red-500 font-semibold'
    }

    const getDescColor = () => {
        if (descLength === 0) return 'text-gray-400'
        if (descLength <= 155) return 'text-green-600 font-semibold'
        if (descLength <= 160) return 'text-amber-500 font-semibold'
        return 'text-red-500 font-semibold'
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg">
                        🔍
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-gray-900">SEO & Social Optimization</h4>
                        <p className="text-xs text-gray-500">Fine-tune how this {contentType} ranks on Google and looks when shared</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-gray-50 p-1 rounded-xl gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'preview'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Google Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('social')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'social'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Social Preview
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('advanced')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'advanced'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Advanced
                    </button>
                </div>
            </div>

            {/* TAB 1: GOOGLE PREVIEW & INPUTS */}
            {activeTab === 'preview' && (
                <div className="space-y-6">
                    {/* Google Live Snippet Preview Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 font-sans text-left space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">N</span>
                            <span className="truncate">{previewUrl}</span>
                        </div>
                        <h5 className="text-[#1a0dab] hover:underline text-lg font-medium leading-snug cursor-pointer line-clamp-1">
                            {displayTitle}
                        </h5>
                        <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                            {displayDescription}
                        </p>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        {/* SEO Title */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        SEO Title
                                    </label>
                                    {!seoTitle && title && (
                                        <button
                                            type="button"
                                            onClick={() => onChange('seo_title', title)}
                                            className="text-[11px] text-primary font-semibold hover:underline bg-primary/5 px-2 py-0.5 rounded"
                                        >
                                            Use default title
                                        </button>
                                    )}
                                </div>
                                <span className={`text-xs ${getTitleColor()}`}>
                                    {titleLength} / 60 characters {titleLength > 70 ? '(too long)' : ''}
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={70}
                                placeholder={title || 'Enter SEO title...'}
                                value={seoTitle}
                                onChange={(e) => onChange('seo_title', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                                {seoTitle ? 'Custom SEO title active.' : 'Currently using default main title. Click or type above to customize.'}
                            </p>
                        </div>

                        {/* Meta Description */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Meta Description
                                    </label>
                                    {!seoDescription && excerpt && (
                                        <button
                                            type="button"
                                            onClick={() => onChange('seo_description', excerpt.slice(0, 160))}
                                            className="text-[11px] text-primary font-semibold hover:underline bg-primary/5 px-2 py-0.5 rounded"
                                        >
                                            Use product description
                                        </button>
                                    )}
                                </div>
                                <span className={`text-xs ${getDescColor()}`}>
                                    {descLength} / 160 characters {descLength > 160 ? '(too long)' : ''}
                                </span>
                            </div>
                            <textarea
                                rows={3}
                                maxLength={165}
                                placeholder={excerpt || 'Enter meta description to summarize content for search bots...'}
                                value={seoDescription}
                                onChange={(e) => onChange('seo_description', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none font-medium"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                                {seoDescription ? 'Custom meta description active.' : 'Currently showing the greyed-out default description. Click "Use product description" or type directly to edit.'}
                            </p>
                        </div>

                        {/* Focus Keywords */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Focus Keywords (comma-separated)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. jumbo oats, organic oats kenya, breakfast"
                                value={seoKeywords}
                                onChange={(e) => onChange('seo_keywords', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: SOCIAL PREVIEWS */}
            {activeTab === 'social' && (
                <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                        <span className="icon-[fluent--checkmark-circle-16-filled] w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Social card image automatically reuses the primary/featured image.</span>
                    </div>

                    {/* Facebook Card Mockup */}
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Facebook Share Preview</span>
                        <div className="border border-gray-200 rounded-xl overflow-hidden max-w-md bg-white shadow-sm">
                            <div className="h-44 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                                {featuredImage ? (
                                    <Image
                                        src={featuredImage}
                                        alt="OG Image Preview"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400">No Image Uploaded Yet</span>
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 border-t border-gray-100 space-y-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">NGWINDSONGK.COM</span>
                                <h6 className="font-bold text-gray-900 text-sm line-clamp-1 leading-snug">{displayTitle}</h6>
                                <p className="text-xs text-gray-500 line-clamp-2">{displayDescription}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: ADVANCED */}
            {activeTab === 'advanced' && (
                <div className="space-y-5">
                    {/* Canonical URL */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Canonical URL Override (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder={`Leave blank to default to /${pathPrefix}/${displaySlug}`}
                            value={canonicalUrl}
                            onChange={(e) => onChange('canonical_url', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Only specify if this content was originally published on another URL.</p>
                    </div>

                    {/* Noindex Toggle */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="noindex-toggle"
                            checked={noindex}
                            onChange={(e) => onChange('noindex', e.target.checked)}
                            className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <div className="space-y-1">
                            <label htmlFor="noindex-toggle" className="text-sm font-bold text-gray-900 cursor-pointer">
                                Discourage Search Engines (noindex)
                            </label>
                            <p className="text-xs text-gray-500">
                                When enabled, adds a <code className="bg-gray-200 px-1 py-0.5 rounded text-[11px]">robots: noindex</code> tag and excludes this page from the XML sitemap.
                            </p>
                            {noindex && (
                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 font-medium">
                                    ⚠️ Caution: This page will be hidden from Google search results!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
