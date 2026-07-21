'use client'

import { useState } from 'react'
import { load } from '@/app/lib/storage'

const REVALIDATE_SECRET = process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'super_secure_revalidation_secret_token_2026'

async function clearLaravelCache(token) {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const res = await fetch(`${baseURL}/admin/clear-cache`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        credentials: 'include',
    })
    if (!res.ok) throw new Error(`Laravel returned HTTP ${res.status}`)
    return res.json()
}

async function revalidateNextJs() {
    const storeUrl = (process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000').replace(/\/$/, '')
    const res = await fetch(`${storeUrl}/api/revalidate?secret=${REVALIDATE_SECRET}`, {
        method: 'POST',
    })
    if (!res.ok) throw new Error(`Next.js returned HTTP ${res.status}`)
    return res.json()
}

export default function CacheSettings() {
    const [isClearing, setIsClearing] = useState(false)
    const [result, setResult] = useState(null)

    const handleClearCache = async () => {
        setIsClearing(true)
        setResult(null)

        const token = load('adminToken') || load('token')
        let laravelCleared = false
        let laravelError = null
        let frontendRevalidated = false
        let frontendError = null

        // Step 1: Clear Laravel cache
        try {
            const data = await clearLaravelCache(token)
            laravelCleared = !!data.success
            if (!laravelCleared) laravelError = data.message || 'Unknown error'
        } catch (err) {
            laravelError = err.message
        }

        // Step 2: Revalidate Next.js shop directly from browser
        try {
            await revalidateNextJs()
            frontendRevalidated = true
        } catch (err) {
            frontendError = err.message
        }

        setResult({ laravelCleared, laravelError, frontendRevalidated, frontendError })
        setIsClearing(false)
    }

    const allOk = result?.laravelCleared && result?.frontendRevalidated
    const anyOk = result?.laravelCleared || result?.frontendRevalidated

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
                {/* Header */}
                <div className="border-b pb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="icon-[fluent--flash-24-regular] w-7 h-7 text-amber-500" />
                        System Cache Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                        Purge the server-side caches and force the store front-end to immediately reflect any
                        price, product, or content changes you have made in the admin.
                    </p>
                </div>

                {/* Result banner */}
                {result && (
                    <div className={`p-5 rounded-2xl border space-y-3 ${
                        allOk
                            ? 'bg-emerald-50 border-emerald-200'
                            : anyOk
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-red-50 border-red-200'
                    }`}>
                        <div className={`flex items-center gap-2 font-bold text-base ${
                            allOk ? 'text-emerald-800' : anyOk ? 'text-amber-800' : 'text-red-800'
                        }`}>
                            <span className={`w-5 h-5 ${
                                allOk
                                    ? 'icon-[fluent--checkmark-circle-24-filled] text-emerald-600'
                                    : 'icon-[fluent--warning-24-filled] text-amber-500'
                            }`} />
                            {allOk ? 'All caches cleared successfully!' : 'Completed with some issues'}
                        </div>

                        <div className="space-y-2 pl-7">
                            {/* Laravel */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className={`w-4 h-4 flex-shrink-0 ${
                                    result.laravelCleared
                                        ? 'icon-[fluent--checkmark-16-filled] text-emerald-500'
                                        : 'icon-[fluent--dismiss-16-filled] text-red-400'
                                }`} />
                                <span className={result.laravelCleared ? 'text-emerald-800 font-semibold' : 'text-red-700'}>
                                    Laravel Database Cache: {result.laravelCleared ? 'Cleared' : `Failed — ${result.laravelError}`}
                                </span>
                            </div>
                            {/* Next.js */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className={`w-4 h-4 flex-shrink-0 ${
                                    result.frontendRevalidated
                                        ? 'icon-[fluent--checkmark-16-filled] text-emerald-500'
                                        : 'icon-[fluent--dismiss-16-filled] text-red-400'
                                }`} />
                                <span className={result.frontendRevalidated ? 'text-emerald-800 font-semibold' : 'text-red-700'}>
                                    Next.js Store Pages: {result.frontendRevalidated ? 'Revalidated' : `Failed — ${result.frontendError}`}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info box */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                        <span className="icon-[fluent--info-16-regular] w-4 h-4 text-blue-400" />
                        When to use this
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>After changing product pricing, discounts, or stock status.</li>
                        <li>After updating categories, brand assignments, or descriptions.</li>
                        <li>Whenever edits made in the backend are not showing on the public store.</li>
                    </ul>
                </div>

                {/* Action */}
                <div className="pt-2 flex justify-end">
                    <button
                        type="button"
                        onClick={handleClearCache}
                        disabled={isClearing}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 shadow-lg ${
                            isClearing
                                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-primary hover:bg-primary/90 shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        <span className={`icon-[fluent--arrow-clockwise-24-regular] w-5 h-5 ${isClearing ? 'animate-spin' : ''}`} />
                        {isClearing ? 'Clearing Caches...' : 'Purge & Clear All Caches'}
                    </button>
                </div>
            </div>
        </div>
    )
}
