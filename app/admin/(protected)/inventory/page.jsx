'use client'
import { useState, useMemo, Fragment } from "react"
import Image from "next/image"
import useSWR from "swr"
import { fetcher, putData } from "@/app/lib/data"
import Search from "@/app/UI/Search"
import Filter from "@/app/UI/Filter"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

const LOW_STOCK_THRESHOLD = 5;

function StockBadge({ stock }) {
    if (stock === 0) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of stock</span>
    if (stock <= LOW_STOCK_THRESHOLD) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Low stock</span>
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">In stock</span>
}

function EditableCell({ value, type = "number", min = 0, step, onSave, className = "w-20" }) {
    let [local, setLocal] = useState(value)
    let [editing, setEditing] = useState(false)

    const handleBlur = () => {
        setEditing(false)
        const parsed = type === "number" ? (step ? parseFloat(local) : parseInt(local)) : local
        if (parsed !== value && !isNaN(parsed)) onSave(parsed)
    }

    return editing ? (
        <input
            type={type}
            min={min}
            step={step}
            autoFocus
            className={`${className} border border-primary px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20`}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
        />
    ) : (
        <button
            onClick={() => { setLocal(value); setEditing(true) }}
            className={`${className} text-left px-2 py-1 rounded text-sm border border-transparent hover:border-gray-300 hover:bg-gray-50 cursor-text`}
        >
            {type === "number" && step ? Number(value).toLocaleString() : value}
        </button>
    )
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b">
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
        </tr>
    )
}

export default function Page() {
    let [search, setSearch] = useState('')
    let [stockFilter, setStockFilter] = useState('')
    let [expanded, setExpanded] = useState({})
    let [page, setPage] = useState(1)

    const { data, isLoading, error, mutate } = useSWR(['/products', { page, search }], fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    })

    const products = useMemo(() => {
        let list = data?.data || (Array.isArray(data) ? data : [])

        // Client-side search filtering (as secondary layer)
        if (search) {
            const searchLower = search.toLowerCase();
            list = list.filter(p => 
                p.name?.toLowerCase().includes(searchLower) ||
                p.category?.name?.toLowerCase().includes(searchLower) ||
                p.brand?.name?.toLowerCase().includes(searchLower) ||
                p.product_variations?.some(v => v.sku?.toLowerCase().includes(searchLower))
            );
        }

        if (stockFilter === 'out') list = list.filter(p => getTotalStock(p) === 0)
        else if (stockFilter === 'low') list = list.filter(p => { const s = getTotalStock(p); return s > 0 && s <= LOW_STOCK_THRESHOLD })
        else if (stockFilter === 'in') list = list.filter(p => getTotalStock(p) > LOW_STOCK_THRESHOLD)

        return list
    }, [data, stockFilter, search])

    const stats = useMemo(() => {
        const all = data?.data || (Array.isArray(data) ? data : [])
        let totalItems = data?.total || all.length;
        let totalProducts = all.length
        let totalStockValue = 0
        let outOfStock = 0
        let lowStockCount = 0

        all.forEach(p => {
            const s = getTotalStock(p)
            totalStockValue += s
            if (s === 0) outOfStock++
            else if (s <= LOW_STOCK_THRESHOLD) lowStockCount++
        })

        return { 
            totalProducts: totalItems, 
            totalStock: totalStockValue, 
            outOfStock, 
            lowStock: lowStockCount 
        }
    }, [data])

    function getTotalStock(product) {
        if (product.product_variations?.length > 0) {
            return product.product_variations.reduce((sum, v) => Number(sum) + Number(v.stock || 0), 0)
        }
        return Number(product.stock || 0)
    }

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

    const handleProductUpdate = (productId, field, value) => {
        putData(
            (res) => { if (res.success !== false) mutate() },
            { [field]: value },
            `/products/${productId}`
        )
    }

    const handleVariationUpdate = (variationId, field, value) => {
        putData(
            (res) => { if (res) mutate() },
            { [field]: value },
            `/product-variations/${variationId}`
        )
    }

    const pagination = data ? { current: data.current_page, last: data.last_page, total: data.total } : null

    return (
        <main className="mx-4 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />
            <div className="flex flex-col md:flex-row mt-8 justify-between items-start md:items-center gap-6">
                <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase italic">Inventory</h2>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total Stock</p>
                    <p className="text-2xl font-bold mt-1 text-primary">{stats.totalStock.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Low Stock</p>
                    <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.lowStock}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Out of Stock</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{stats.outOfStock}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-y-4 md:flex-row justify-between md:items-center mb-6">
                <div className="shadow-lg w-64">
                    <Search search={search} setSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search products..." />
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Stock:</span>
                    <select
                        value={stockFilter}
                        onChange={e => setStockFilter(e.target.value)}
                        className="p-2 w-40 rounded-lg border"
                    >
                        <option value="">All</option>
                        <option value="in">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <section className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600 w-8"></th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Product</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Category</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Price (KSH)</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Stock</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Variants</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            [...new Array(8)].map((_, i) => <SkeletonRow key={i} />)
                        ) : error ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <span className="icon-[mdi--alert-circle-outline] w-12 h-12 block mx-auto mb-3 text-red-500" />
                                    <p className="text-gray-900 font-semibold text-lg">Failed to load products</p>
                                    <p className="text-gray-500 text-sm mt-1">{error.message || 'Please check your connection and try again.'}</p>
                                    <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Retry</button>
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-gray-400">
                                    <span className="icon-[mdi--package-variant-closed] w-12 h-12 block mx-auto mb-3" />
                                    No products found
                                </td>
                            </tr>
                        ) : (
                            products.map(product => {
                                const hasVariations = product.product_variations?.length > 0
                                const totalStock = getTotalStock(product)
                                const isExpanded = expanded[product.id]

                                return (
                                    <Fragment key={product.id}>
                                        {/* Product Row */}
                                        <tr className={`border-b hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}>
                                            <td className="p-4">
                                                {hasVariations && (
                                                    <button onClick={() => toggleExpand(product.id)} className="text-gray-400 hover:text-gray-600">
                                                        <span className={`icon-[mdi--chevron-right] w-5 h-5 block transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {product.product_images?.[0]?.url ? (
                                                        <Image src={product.product_images[0].url} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover" unoptimized={true} />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                            <span className="icon-[mdi--package-variant] w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">{product.category?.name || '—'}</td>
                                            <td className="p-4">
                                                {!hasVariations ? (
                                                    <EditableCell
                                                        value={product.price || 0}
                                                        step="0.01"
                                                        onSave={(v) => handleProductUpdate(product.id, 'price', v)}
                                                        className="w-24"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-500">See variants</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {!hasVariations ? (
                                                    <EditableCell
                                                        value={product.stock || 0}
                                                        onSave={(v) => handleProductUpdate(product.id, 'stock', v)}
                                                        className="w-16"
                                                    />
                                                ) : (
                                                    <span className="font-medium">{totalStock}</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {hasVariations ? (
                                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                                        {product.product_variations.length} variants
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <StockBadge stock={totalStock} />
                                            </td>
                                        </tr>

                                        {/* Expanded Variations */}
                                        {isExpanded && hasVariations && product.product_variations.map(variation => (
                                            <tr key={`v-${variation.id}`} className="border-b bg-blue-50/30">
                                                <td className="p-3"></td>
                                                <td className="p-3 pl-14">
                                                    <div className="flex items-center gap-2">
                                                        <span className="icon-[mdi--subdirectory-arrow-right] w-4 h-4 text-gray-400" />
                                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{variation.sku}</span>
                                                        <div className="flex flex-wrap gap-1 ml-2">
                                                            {variation.attribute_name && (
                                                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                                    {variation.attribute_name}: {variation.attribute_value}
                                                                </span>
                                                            )}
                                                            {variation.attribute_values?.map((attr, i) => (
                                                                <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                                    {attr.attribute?.name}: {attr.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3"></td>
                                                <td className="p-3">
                                                    <EditableCell
                                                        value={variation.price || 0}
                                                        step="0.01"
                                                        onSave={(v) => handleVariationUpdate(variation.id, 'price', v)}
                                                        className="w-24"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <EditableCell
                                                        value={variation.stock || 0}
                                                        onSave={(v) => handleVariationUpdate(variation.id, 'stock', v)}
                                                        className="w-16"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    {variation.discount ? (
                                                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{variation.discount}% off</span>
                                                    ) : '—'}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        variation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {variation.status || 'inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </Fragment>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </section>

            {/* Pagination */}
            {pagination && pagination.last > 1 && (
                <div className="flex justify-center items-center gap-2 my-8">
                    <button
                        disabled={pagination.current === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 px-4">
                        Page {pagination.current} of {pagination.last}
                    </span>
                    <button
                        disabled={pagination.current === pagination.last}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </main>
    )
}
