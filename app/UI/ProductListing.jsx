'use client'
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export function ProductListingSkeleton(){
    return(
        <div className="animate-pulse flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-slate-200 h-48 w-full"></div>
            <div className="p-4 flex flex-col gap-3">
                <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
                <div className="h-2 w-1/3 bg-slate-200 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded mt-2"></div>
                <div className="flex justify-between mt-2">
                    <div className="h-2 w-1/4 bg-slate-200 rounded"></div>
                    <div className="h-2 w-1/4 bg-slate-200 rounded"></div>
                </div>
            </div>
        </div>
    )
}

export function ProductListingClient({data}){
    let path = usePathname().replaceAll('%20',' ');
    path = path.split('/')
    let category = path[2]?path[2]:data.title;
    
    // Ensure we have a valid image source
    const imageSrc = data.image || "/logo.png";

    return(
        <div className="relative shadow-lg pb-2 h-full flex flex-col bg-white rounded-xl overflow-hidden group">
            {
                data.message && <span className="absolute right-2 top-2 z-10 bg-secondary text-white rounded-full py-1 px-2 text-[10px] font-bold uppercase tracking-wider shadow-sm">{data.message}</span>
            }
            <Link href={`/product/${category}/${data.name}`} className="bg-slate-50 w-full flex items-center justify-center py-6 block overflow-hidden">
                <Image 
                    className="group-hover:scale-105 transition-transform duration-500" 
                    src={imageSrc} 
                    alt={data.name || "Product"} 
                    width={200} 
                    height={200} 
                    unoptimized={true} 
                />
            </Link>
            <div className="p-4 flex flex-col flex-1">
                <Link href={`/product/${category}/${data.name}`} className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">{data.title}</Link>
                <p className="text-sm text-gray-500 line-clamp-1 mt-1">{data.name}</p>
                <div className="flex mt-auto pt-4 justify-between items-center">
                    <p className="text-xl font-bold text-gray-900">
                        Ksh {data.price} 
                        {data.previous && <span className="ml-2 line-through text-sm text-gray-400 font-normal">KSH {data.previous}</span>}
                    </p>
                    <button className="rounded-full flex items-center justify-center border border-primary p-2 w-10 h-10 hover:bg-primary hover:text-white transition-all">
                        <span className="icon-[ri--shopping-cart-line] w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function ProductListing({data}){
    const getDisplayPrice = () => {
        if (data.price) return `Ksh ${Number(data.price).toLocaleString()}`;
        const variations = data.product_variations || data.variations || [];
        if (variations.length > 0) {
            const prices = variations.map(v => parseFloat(v.price)).filter(p => !isNaN(p) && p > 0);
            if (prices.length > 0) {
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return min === max
                    ? `Ksh ${min.toLocaleString()}`
                    : `Ksh ${min.toLocaleString()} – ${max.toLocaleString()}`;
            }
        }
        return 'Price varies';
    };

    const hasVariations = (data.product_variations || data.variations || []).length > 0;
    const totalStock = hasVariations
        ? (data.product_variations || data.variations || []).reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
        : (data.stock || 0);

    return(
        <Link
            href={`/admin/products/edit?id=${data.id}&name=${data.name}`}
            className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full"
        >
            {/* Fixed-height image container — keeps all images the same size */}
            <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {data.image ? (
                    <Image
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={data.image}
                        alt={data.name}
                        width={300}
                        height={200}
                        unoptimized={true}
                    />
                ) : (
                    <span className="icon-[fluent--image-24-regular] w-12 h-12 text-gray-300" />
                )}
                {/* Stock badge top-right */}
                <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                    {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                </div>
            </div>

            {/* Card body */}
            <div className="flex flex-col flex-1 p-4">
                {/* Product name — clamp to 2 lines max */}
                <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-1">
                    {data.name}
                </h3>

                {/* Brand · Category */}
                <p className="text-xs text-gray-400 mb-3 truncate">
                    {[data.brand?.name, data.category?.name].filter(Boolean).join(' · ')}
                </p>

                {/* Push price and footer to the bottom */}
                <div className="flex-1" />

                {/* Price */}
                <p className="text-sm font-bold text-primary mb-3">
                    {getDisplayPrice()}
                    {hasVariations && (
                        <span className="text-xs font-normal text-gray-400 ml-1">per variation</span>
                    )}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                        {new Date(data.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">Active</span>
                </div>
            </div>
        </Link>
    )
}

export function ProductListingRow({data}){
    const getDisplayPrice = () => {
        if (data.price) return `Ksh ${Number(data.price).toLocaleString()}`;
        const variations = data.product_variations || data.variations || [];
        if (variations.length > 0) {
            const prices = variations.map(v => parseFloat(v.price)).filter(p => !isNaN(p) && p > 0);
            if (prices.length > 0) {
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return min === max
                    ? `Ksh ${min.toLocaleString()}`
                    : `Ksh ${min.toLocaleString()} – ${max.toLocaleString()}`;
            }
        }
        return 'Price varies';
    };

    const totalStock = (data.product_variations || data.variations || []).length > 0
        ? (data.product_variations || data.variations || []).reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
        : (data.stock || 0);

    return(
        <Link
            href={`/admin/products/edit?id=${data.id}&name=${data.name}`}
            className="group flex gap-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden my-2"
        >
            {/* Thumbnail */}
            <div className="w-24 h-20 flex-shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden rounded-l-xl">
                {data.image ? (
                    <Image className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={data.image} alt={data.name} width={100} height={80} unoptimized={true} />
                ) : (
                    <span className="icon-[fluent--image-24-regular] w-8 h-8 text-gray-300" />
                )}
            </div>

            {/* Row info */}
            <div className="flex flex-1 items-center gap-6 py-3 pr-4 min-w-0">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{data.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {[data.brand?.name, data.category?.name].filter(Boolean).join(' · ')}
                    </p>
                </div>
                <p className="font-bold text-primary text-sm whitespace-nowrap">{getDisplayPrice()}</p>
                <div className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                    totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                    {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap hidden md:block">
                    {new Date(data.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                </p>
                <span className="icon-[fluent--chevron-right-16-regular] w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
        </Link>
    )
}