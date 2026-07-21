'use client'

import { useState } from 'react'
import { load } from '@/app/lib/storage'
import Spinner from '@/app/UI/Spinner'

export default function CacheSettings() {
    const [isClearing, setIsClearing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const handleClearCache = async () => {
        setIsClearing(true)
        setResult(null)
        setError(null)

        try {
            const token = load('adminToken') || load('token')
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

            const data = await res.json()

            if (res.ok && data.success) {
                setResult(data)
            } else {
                throw new Error(data.message || data.error || 'Failed to clear system cache')
            }
        } catch (err) {
            setError(err.message || 'An error occurred while clearing cache')
        } finally {
            setIsClearing(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4 border-b pb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="icon-[fluent--flash-24-regular] w-7 h-7 text-amber-500" />
                            System Cache Management
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Purge server-side Next.js page data caches and Laravel API application caches to immediately reflect price and product updates on the store front-end.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
                        <span className="icon-[fluent--error-circle-24-regular] w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {result && (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-emerald-900 text-base">
                            <span className="icon-[fluent--checkmark-circle-24-filled] w-6 h-6 text-emerald-600" />
                            {result.message}
                        </div>
                        <ul className="text-xs space-y-1.5 pl-8 list-disc text-emerald-700 font-medium">
                            <li>
                                Laravel Database Cache: {' '}
                                <span className="font-bold">
                                    {result.details?.laravel_cache_cleared ? 'Cleared Successfully' : 'Skipped/Error'}
                                </span>
                            </li>
                            <li>
                                Next.js Front-end Pages Revalidation: {' '}
                                <span className="font-bold">
                                    {result.details?.frontend_revalidated ? 'Revalidated Successfully' : 'Failed / Offline'}
                                </span>
                            </li>
                        </ul>
                        {result.details?.frontend_error && (
                            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2">
                                Note: {result.details.frontend_error}
                            </p>
                        )}
                    </div>
                )}

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">When to use this feature</h4>
                    <ul className="text-xs text-gray-600 space-y-2 list-disc pl-5 leading-relaxed">
                        <li>After changing product pricing, discounts, or stock status in the admin dashboard.</li>
                        <li>After updating categories, brand assignments, or product descriptions.</li>
                        <li>Whenever changes made in the backend are not showing immediately on the public website.</li>
                    </ul>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={handleClearCache}
                        disabled={isClearing}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 shadow-lg ${
                            isClearing 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-primary hover:bg-primary/90 shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {isClearing ? (
                            <>
                                <Spinner />
                                <span>Clearing Caches...</span>
                            </>
                        ) : (
                            <>
                                <span className="icon-[fluent--arrow-clockwise-24-regular] w-5 h-5" />
                                <span>Purge &amp; Clear All Caches</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
