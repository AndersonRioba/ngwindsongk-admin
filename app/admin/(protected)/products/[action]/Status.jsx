'use client'

import { useState, useContext, useEffect } from "react"
import { CreateProductContext } from "@/app/lib/providers/CreateProductProvider"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetcher, deleteData, putData, postData, postFile } from "@/app/lib/data"
import { useParams, useSearchParams } from "next/navigation"

export default function Status({ isOpen = true, onToggle }) {
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()
    const { Product, Category, Brand, Price, AlternatePrice, Description, Details, FAQ, Media, CarouselMedia, ExistingMedia, Attributes, Stock, StatusState, ShowAdsState, SeoState, saveDraft, loadDraft, loadProduct } = useContext(CreateProductContext)
    const { action } = useParams()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const name = searchParams.get('name')

    const status = StatusState ? StatusState[0] : 'active'
    const setStatus = StatusState ? StatusState[1] : () => {}
    const showAds = ShowAdsState ? ShowAdsState[0] : false
    const setShowAds = ShowAdsState ? ShowAdsState[1] : () => {}
    const [seoData] = SeoState || [{
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        canonical_url: '',
        noindex: false
    }]

    useEffect(() => {
        if (action === 'edit') {
            const ident = id || name;
            if (ident && typeof loadProduct === 'function') {
                loadProduct(ident).catch(e => console.error('loadProduct failed', e));
            }
        }
    }, [action, id, name, loadProduct]);

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
            router.push('/admin/products')
        }
    }

    const handleDeleteProduct = () => {
        if (id && confirm('Are you sure you want to delete this product? It will be removed from the store.')) {
            setIsSaving(true)
            deleteData(
                () => {
                    import("@/app/lib/trigger").then(({ popupE }) => {
                        popupE('Success', 'Product deleted successfully');
                        router.push('/admin/products');
                    });
                },
                {},
                `/products/${id}`
            ).finally(() => setIsSaving(false))
        }
    }

    const hasVariations = Attributes[0] && Object.keys(Attributes[0]).length > 0;
    const isFormValid = Product[0] && Category[0] && Brand[0] && (Price[0] || hasVariations)

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
                status: status,
                is_promoted: showAds,
                // SEO fields
                seo_title: seoData.seo_title || null,
                seo_description: seoData.seo_description || null,
                seo_keywords: seoData.seo_keywords || null,
                canonical_url: seoData.canonical_url || null,
                noindex: !!seoData.noindex,
            }

            // Capture productId from PUT/POST response synchronously
            let capturedProductId = null;
            const callback = (res) => {
                capturedProductId = res?.product ? res.product.id : res?.id;
            };

            if (action === 'edit' && id) {
                await putData(callback, payload, `/products/${id}`);
            } else {
                await postData(callback, payload, `/products`);
            }

            const productId = capturedProductId;
            if (!productId) {
                setIsSaving(false);
                return; // putData/postData already showed the error popup
            }
            if (Details[0]) {
                await postData(() => {}, { product_id: productId, description: Details[0] }, '/descriptions');
            }
            let allMedia = [...(Media && Media[0] ? Media[0] : []), ...(CarouselMedia && CarouselMedia[0] ? CarouselMedia[0] : [])];
            let keptMediaIds = (ExistingMedia && ExistingMedia[0] ? ExistingMedia[0] : []).map(m => m.id);
            console.log('[Status] allMedia count:', allMedia.length, '| keptMediaIds:', keptMediaIds, '| action:', action);
            // Only sync media if: new files are being uploaded, OR if we are editing and have existing media to preserve
            const hasNewMedia = allMedia.length > 0;
            const hasExistingMediaToPreserve = action === 'edit' && keptMediaIds.length > 0;
            if (hasNewMedia || hasExistingMediaToPreserve) {
                console.log('[Status] Uploading media files to /product-images...');
                try {
                    await postFile(() => {}, allMedia, 'media', { product_id: productId, kept_media_ids: JSON.stringify(keptMediaIds) }, '/product-images');
                    console.log('[Status] Media upload complete.');
                } catch (mediaErr) {
                    console.error('[Status] Media upload failed:', mediaErr);
                }
            }
            // Revalidate the shop's Next.js cache so image changes appear immediately
            try {
                const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'http://localhost:3000';
                const revalSecret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'super_secure_revalidation_secret_token_2026';
                await fetch(`${shopUrl}/api/revalidate?secret=${revalSecret}`, { method: 'POST' });
            } catch (_) { /* non-critical */ }

            const { popupE } = await import("@/app/lib/trigger");
            popupE('Success', `Product ${action === 'edit' ? 'updated' : 'created'} successfully`);
            router.push('/admin/products');
            setIsSaving(false);
        } catch (err) {
            console.error("Failed to save product:", err);
            setIsSaving(false);
        }
    }

    const draftList = Array.isArray(drafts) ? drafts : []

    // If sidebar is collapsed, show a sleek mini control strip
    if (!isOpen) {
        return (
            <div className="w-14 flex flex-col items-center py-4 bg-white rounded-xl border shadow-sm transition-all duration-300 gap-4 self-start">
                <button
                    type="button"
                    onClick={onToggle}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    title="Expand Status Sidebar"
                >
                    <span className="icon-[fluent--panel-right-expand-16-filled] w-5 h-5 text-primary" />
                </button>

                <div className="w-8 h-[1px] bg-gray-200" />

                {/* Status Indicator Dot */}
                <div
                    className={`w-4 h-4 rounded-full ${
                        status === 'active' ? 'bg-green-500 ring-4 ring-green-100' : status === 'inactive' ? 'bg-red-500 ring-4 ring-red-100' : 'bg-yellow-500 ring-4 ring-yellow-100'
                    }`}
                    title={`Status: ${status}`}
                />

                {/* Quick Save button */}
                <button
                    type="button"
                    onClick={handlePublish}
                    disabled={!isFormValid || isSaving}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors shadow-sm"
                    title="Publish / Save Changes"
                >
                    <span className="icon-[fluent--save-16-filled] w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="w-80 min-w-[300px] max-w-[340px] bg-white rounded-lg shadow-sm border p-6 h-fit transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Product Status</h3>
                    <p className="text-xs text-gray-500">Visibility & quick actions</p>
                </div>
                {onToggle && (
                    <button
                        type="button"
                        onClick={onToggle}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Collapse Sidebar"
                    >
                        <span className="icon-[fluent--chevron-right-16-regular] w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Status Section */}
            <section className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
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
                        <span className={`w-3 h-3 rounded-full shrink-0 ${
                            status === 'active' ? 'bg-green-500' : status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <p className={`text-xs font-medium ${
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Advertising</label>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                        type="checkbox"
                        id="showAds"
                        checked={showAds}
                        onChange={(e) => setShowAds(e.target.checked)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="showAds" className="text-xs text-blue-800 font-medium cursor-pointer">
                        Promote this product in advertisements
                    </label>
                </div>
                {showAds && (
                    <p className="text-[11px] text-blue-600 mt-1.5">
                        This product will be featured in promotional campaigns and recommendations.
                    </p>
                )}
            </section>

            {/* Action Buttons */}
            <section className="space-y-3">
                <div className="flex gap-2">
                    {action === 'create' ? (
                        <>
                            <button
                                onClick={handleDiscard}
                                className="flex-1 bg-red-50 text-red-700 px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <span className="icon-[fluent--delete-16-regular] w-4 h-4" />
                                Discard
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSaving}
                                className="bg-gray-100 text-gray-700 px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                <span className="icon-[fluent--save-16-regular] w-4 h-4" />
                                Draft
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleDeleteProduct}
                            disabled={isSaving}
                            className="bg-red-50 text-red-700 px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                            <span className="icon-[fluent--delete-16-regular] w-4 h-4" />
                            Delete
                        </button>
                    )}
                    <button
                        onClick={handlePublish}
                        disabled={!isFormValid || isSaving}
                        className="flex-1 bg-primary text-white px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
                    >
                        {isSaving ? (
                            <>
                                <span className="icon-[fluent--spinner-ios-16-regular] w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="icon-[fluent--send-16-filled] w-4 h-4" />
                                Save & Publish
                            </>
                        )}
                    </button>
                </div>
            </section>

            {/* Drafts Section */}
            <section className="mt-6 pt-5 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-800">Recent Drafts</h4>
                    <button className="text-primary text-xs font-medium hover:text-primary/80 transition-colors">
                        View All
                    </button>
                </div>

                <div className="space-y-2">
                    {draftList.length > 0 ? draftList.slice(0, 4).map((draft) => (
                        <div key={draft.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                            <div className="flex items-center justify-between">
                                <div className="cursor-pointer truncate mr-2" onClick={() => handleLoadDraft(draft)}>
                                    <p className="font-medium text-gray-800 truncate">{draft.name || 'Untitled Draft'}</p>
                                    <p className="text-[10px] text-gray-500">
                                        {new Date(draft.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleLoadDraft(draft)}
                                        className="text-primary hover:text-primary/80 p-1 transition-colors"
                                    >
                                        <span className="icon-[fluent--edit-16-regular] w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDraft(draft.id)}
                                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                    >
                                        <span className="icon-[fluent--delete-16-regular] w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-4 text-gray-400 text-xs">
                            <span className="icon-[fluent--document-24-regular] w-8 h-8 mx-auto mb-1 block opacity-60" />
                            <p>No drafts found</p>
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
        <section className="mt-5 pt-5 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-2.5">Quick Stats</h4>

            {/* Summary tiles */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">
                        {isLoading ? <span className="inline-block w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" /> : totalActive}
                    </p>
                    <p className="text-[10px] text-green-700">Active</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                    <p className="text-lg font-bold text-red-500">
                        {isLoading ? <span className="inline-block w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" /> : totalInactive}
                    </p>
                    <p className="text-[10px] text-red-600">Inactive</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{draftCount}</p>
                    <p className="text-[10px] text-blue-700">Drafts</p>
                </div>
            </div>

            {/* Per-brand breakdown */}
            {!isLoading && brandRows.length > 0 && (
                <div className="rounded-lg border border-gray-100 overflow-hidden max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-3 bg-gray-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 sticky top-0">
                        <span>Brand</span>
                        <span className="text-center text-green-600">Act</span>
                        <span className="text-center text-red-500">Inact</span>
                    </div>
                    {brandRows.map(([brand, counts]) => (
                        <div key={brand} className="grid grid-cols-3 px-2.5 py-1.5 text-[11px] border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
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
