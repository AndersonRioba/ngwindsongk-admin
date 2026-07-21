'use client'

import { useState } from 'react'
import { load } from '@/app/lib/storage'

export default function CacheSettings() {
    const [isClearing, setIsClearing] = useState(false)
    const [result, setResult] = useState(null)

    const handleClearCache = async () => {
        setIsClearing(true)
        setResult(null)

        try {
            const token = load('adminToken') || load('token')
            const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

            const res = await fetch(`${baseURL}/admin/clear-cache`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            })

            const data = await res.json()
            setResult(data)
        } catch (err) {
            setResult({ success: false, message: err.message || 'Network error — could not reach the API.' })
        } finally {
            setIsClearing(false)
        }
    }

    const laravelOk   = result?.details?.laravel_cache_cleared
    const frontendOk  = result?.details?.frontend_revalidated
    const frontendErr = result?.details?.frontend_error
    const hasDetails  = result?.details !== undefined
    const allOk       = result?.success

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
                        Purges the server-side Laravel cache and forces the store front-end to immediately reflect
                        any price, product, or content changes made in the admin.
                    </p>
                </div>

                {/* Result banner */}
                {result && (
                    <div className={`p-5 rounded-2xl border space-y-4 ${
                        allOk
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-amber-50 border-amber-200'
                    }`}>
                        {/* Main status line */}
                        <div className={`flex items-center gap-2 font-bold text-base ${
                            allOk ? 'text-emerald-800' : 'text-amber-800'
                        }`}>
                            <span className={`w-5 h-5 flex-shrink-0 ${
                                allOk
                                    ? 'icon-[fluent--checkmark-circle-24-filled] text-emerald-600'
                                    : 'icon-[fluent--warning-24-filled] text-amber-500'
                            }`} />
                            {result.message}
                        </div>

                        {/* Per-step details */}
                        {hasDetails && (
                            <div className="space-y-2 pl-7">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className={`w-4 h-4 flex-shrink-0 ${
                                        laravelOk
                                            ? 'icon-[fluent--checkmark-16-filled] text-emerald-500'
                                            : 'icon-[fluent--dismiss-16-filled] text-red-400'
                                    }`} />
                                    <span className={laravelOk ? 'text-emerald-800 font-semibold' : 'text-red-700 font-semibold'}>
                                        Laravel Database Cache: {laravelOk ? 'Cleared ✓' : 'Failed'}
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <span className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                        frontendOk
                                            ? 'icon-[fluent--checkmark-16-filled] text-emerald-500'
                                            : 'icon-[fluent--dismiss-16-filled] text-red-400'
                                    }`} />
                                    <div>
                                        <span className={frontendOk ? 'text-emerald-800 font-semibold' : 'text-red-700 font-semibold'}>
                                            Next.js Store Pages: {frontendOk ? 'Revalidated ✓' : 'Failed'}
                                        </span>
                                        {!frontendOk && frontendErr && (
                                            <p className="text-xs text-red-600 mt-1 font-normal break-all">{frontendErr}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No details — raw error */}
                        {!hasDetails && !result.success && (
                            <p className="text-sm text-red-700 pl-7">{result.message}</p>
                        )}
                    </div>
                )}

                {/* Info box */}
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-3">
                    <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                        <span className="icon-[fluent--info-16-regular] w-4 h-4" />
                        When to use this
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>After changing product pricing, discounts, or availability.</li>
                        <li>After updating categories, brands, banners, or descriptions.</li>
                        <li>Whenever edits made in the backend are not yet visible on the live store.</li>
                    </ul>
                </div>

                {/* Action button */}
                <div className="pt-2 flex justify-end">
                    <button
                        type="button"
                        id="btn-clear-all-caches"
                        onClick={handleClearCache}
                        disabled={isClearing}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 shadow-lg ${
                            isClearing
                                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-primary hover:bg-primary/90 shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        <span className={`icon-[fluent--arrow-clockwise-24-regular] w-5 h-5 ${isClearing ? 'animate-spin' : ''}`} />
                        {isClearing ? 'Clearing Caches…' : 'Purge & Clear All Caches'}
                    </button>
                </div>
            </div>
        </div>
    )
}
