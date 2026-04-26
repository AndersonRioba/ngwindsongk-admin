'use client'

import { useState, useContext } from "react"
import { CreateProductContext } from "@/app/lib/providers/CreateProductProvider"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetcher, deleteData, putData, postData, postFile } from "@/app/lib/data"
import { useParams, useSearchParams } from "next/navigation"

export default function Status(){
    const [status, setStatus] = useState('active')
    const [showAds, setShowAds] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()
    const { Product, Category, Brand, Price, AlternatePrice, Description, Details, FAQ, Media, CarouselMedia, Attributes, Stock, saveDraft, loadDraft } = useContext(CreateProductContext)
    const {action} = useParams()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const name = searchParams.get('name')

    const { data: drafts, mutate } = useSWR(['/drafts', {}], fetcher, {
        revalidateOnFocus: false,
    })

    const handleSaveDraft = async () => {
        setIsSaving(true)
        saveDraft()
            .then((res) => {
                if (res?.success) mutate()
            })
            .catch(() => {})
            .finally(() => setIsSaving(false))
    }

    const handleDeleteDraft = (id) => {
        deleteData(() => mutate(), {}, `/drafts/${id}`)
    }

    const handleLoadDraft = (draft) => {
        loadDraft(draft.id)
    }

    const handleDiscard = () => {
        if (confirm('Are you sure you want to discard all changes? This action cannot be undone.')) {
            router.push('/products')
        }
    }

    const isFormValid = Product[0] && Category[0] && Brand[0] && Price[0]

    const handlePublish = async () => {
        setIsSaving(true)
        try {
            const payload = {
                faqs: FAQ[0],
                attributes: Attributes[0],
                category: Category[0],
                brand: Brand[0],
                name: Product[0],
                about: Description[0],
                price: Price[0],
                discount: AlternatePrice[0] ? parseFloat(AlternatePrice[0]) : 0.0,
                stock: Stock[0] || 0,
            }

            const callback = (res) => {
                const productId = res.product ? res.product.id : res.id
                if (productId) {
                    if (Details[0]) {
                        postData(() => {}, { product_id: productId, description: Details[0] }, '/descriptions')
                    }
                    let allMedia = [...(Media[0] || []), ...(CarouselMedia[0] || [])]
                    if (allMedia.length > 0) {
                        postFile(() => {}, allMedia, 'media', { product_id: productId }, '/product-images')
                    }
                    
                    import("@/app/lib/trigger").then(({popupE}) => {
                        popupE('Success', `Product ${action === 'edit' ? 'updated' : 'created'} successfully`);
                        router.push('/admin/products');
                    });
                }
                setIsSaving(false)
            }

            if (action === 'edit' && id) {
                putData(callback, payload, `/products/${id}`)
            } else {
                postData(callback, payload, `/products`)
            }
        } catch {
            setIsSaving(false)
        }
    }

    const draftList = Array.isArray(drafts) ? drafts : []

    return(
        <div className="bg-white rounded-lg shadow-sm border p-6 h-fit">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Product Status</h3>
                <p className="text-sm text-gray-600">Manage your product&apos;s visibility and settings</p>
            </div>

            {/* Status Section */}
            <section className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                </select>

                <div className={`mt-3 p-3 rounded-lg ${
                    status === 'active'
                        ? 'bg-green-50 border border-green-200'
                        : status === 'inactive'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-yellow-50 border border-yellow-200'
                }`}>
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                            status === 'active' ? 'bg-green-500' : status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <p className={`text-sm font-medium ${
                            status === 'active' ? 'text-green-800' : status === 'inactive' ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                            {status === 'active'
                                ? 'This product will be available for sale on the website.'
                                : status === 'inactive'
                                ? 'This product is currently inactive and not available for sale.'
                                : 'This product is saved as a draft and not visible to customers.'
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Advertising Section */}
            <section className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Advertising</label>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                        type="checkbox"
                        id="showAds"
                        checked={showAds}
                        onChange={(e) => setShowAds(e.target.checked)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="showAds" className="text-sm text-blue-800 font-medium">
                        Promote this product in advertisements
                    </label>
                </div>
                {showAds && (
                    <p className="text-xs text-blue-600 mt-2">
                        This product will be featured in promotional campaigns and recommendations.
                    </p>
                )}
            </section>

            {/* Action Buttons */}
            {
                action=='create'?
                <section className="space-y-3">
                    <div className="flex gap-3">
                        <button
                            onClick={handleDiscard}
                            className="flex-1 bg-red-50 text-red-700 px-4 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="icon-[fluent--delete-16-regular] w-4 h-4" />
                            Discard
                        </button>
                        <button
                        onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <span className="icon-[fluent--spinner-ios-16-regular] w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="icon-[fluent--save-16-regular] w-4 h-4" />
                                    Save Draft
                                </>
                            )}
                        </button>
                    </div>
                </section>
                :
                <section className="space-y-3">
                    <button
                        onClick={handlePublish}
                        disabled={!isFormValid || isSaving}
                        className="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="icon-[fluent--spinner-ios-16-regular] w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="icon-[fluent--send-16-filled] w-4 h-4" />
                                Publish
                            </>
                        )}
                    </button>
                </section>
            }

            {/* Drafts Section */}
            <section className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Recent Drafts</h4>
                    <button className="text-primary text-sm font-medium hover:text-primary/80 transition-colors">
                        View All
                    </button>
                </div>

                <div className="space-y-3">
                    {draftList.length > 0 ? draftList.slice(0, 5).map((draft) => (
                        <div key={draft.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="cursor-pointer" onClick={() => handleLoadDraft(draft)}>
                                    <p className="font-medium text-gray-800">{draft.name || 'Untitled Draft'}</p>
                                    <p className="text-sm text-gray-600">
                                        Last edited {new Date(draft.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleLoadDraft(draft)}
                                        className="text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <span className="icon-[fluent--edit-16-regular] w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDraft(draft.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <span className="icon-[fluent--delete-16-regular] w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-gray-500">
                            <span className="icon-[fluent--document-24-regular] w-12 h-12 mx-auto mb-3 block" />
                            <p>No drafts found</p>
                            <p className="text-sm">Your saved drafts will appear here</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Stats */}
            <QuickStats draftCount={draftList.length} />
        </div>
    )
}

function QuickStats({ draftCount }) {
    const { data: productsData, isLoading } = useSWR(
        ['/products', { per_page: 500 }],
        fetcher,
        { revalidateOnFocus: false }
    )

    const products = Array.isArray(productsData) ? productsData : (productsData?.data || [])

    // Total active / inactive counts
    const totalActive = products.filter(p => (p.status || 'active') === 'active').length
    const totalInactive = products.filter(p => (p.status || 'active') !== 'active').length

    // Per-brand breakdown
    const brandMap = {}
    products.forEach(p => {
        const brand = p.brand?.name || 'No Brand'
        if (!brandMap[brand]) brandMap[brand] = { active: 0, inactive: 0 }
        if ((p.status || 'active') === 'active') {
            brandMap[brand].active++
        } else {
            brandMap[brand].inactive++
        }
    })
    const brandRows = Object.entries(brandMap).sort((a, b) => a[0].localeCompare(b[0]))

    return (
        <section className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>

            {/* Summary tiles */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                        {isLoading ? <span className="inline-block w-6 h-6 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" /> : totalActive}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">Active</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-500">
                        {isLoading ? <span className="inline-block w-6 h-6 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" /> : totalInactive}
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">Inactive</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{draftCount}</p>
                    <p className="text-xs text-blue-700 mt-0.5">Drafts</p>
                </div>
            </div>

            {/* Per-brand breakdown */}
            {!isLoading && brandRows.length > 0 && (
                <div className="rounded-lg border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <span>Brand</span>
                        <span className="text-center text-green-600">Active</span>
                        <span className="text-center text-red-500">Inactive</span>
                    </div>
                    {brandRows.map(([brand, counts]) => (
                        <div key={brand} className="grid grid-cols-3 px-3 py-2 text-xs border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <span className="font-semibold text-gray-700 truncate">{brand}</span>
                            <span className="text-center font-bold text-green-600 flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                {counts.active}
                            </span>
                            <span className="text-center font-bold text-red-400 flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0" />
                                {counts.inactive}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
