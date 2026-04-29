'use client'
import Link from "next/link"
import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { fetcher, putData } from "@/app/lib/data"
import { popupE } from "@/app/lib/trigger"
import ProductListing, {ProductListingSkeleton, ProductListingRow} from "@/app/UI/ProductListing"
import Search from "@/app/UI/Search"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

export default function Page(){
    const searchParams = useSearchParams();
    // Brand filter driven by sidebar sub-link (?brand=Grainmill)
    const activeBrand = searchParams.get('brand') || '';

    let [search, setSearch] = useState('');
    let [type, setType] = useState('grid');
    let [groupBy] = useState('brand');
    let [editingBrandId, setEditingBrandId] = useState(null);
    let [tempBrandName, setTempBrandName] = useState('');

    // Build API params — always request up to 500 so no products are hidden by pagination
    const apiParams = useMemo(() => {
        const p = { per_page: 500 };
        if (search) p.search = search;
        if (activeBrand) p.brand = activeBrand;
        return p;
    }, [search, activeBrand]);

    // Fetch products
    let { data: productsData, error: productsError, isLoading: productsLoading, mutate: mutateProducts } = useSWR(
        ['/products', apiParams],
        fetcher,
        { keepPreviousData: true }
    );

    // Fetch brands to seed empty groups and drive the sidebar
    let { data: brandsData, mutate: mutateBrands } = useSWR(['/brands', {}], fetcher);

    const isLoading = productsLoading;
    const data = productsData;

    const handleUpdateBrand = async (brandId, newName) => {
        if (!newName.trim()) return;
        try {
            await putData(
                () => {
                    mutateBrands();
                    mutateProducts();
                    setEditingBrandId(null);
                    popupE('success', 'Brand renamed successfully');
                },
                { name: newName },
                `/brands/${brandId}`
            );
        } catch (error) {
            popupE('error', 'Failed to rename brand');
        }
    };

    // Transform & group data
    const transformProductData = useMemo(() => {
        if (!data) return [];

        const productsList = Array.isArray(data) ? data : (data.data || []);

        // Client-side search filter (supplements server-side search)
        const filteredProducts = productsList.filter(product => {
            if (!search) return true;
            const searchLower = search.toLowerCase();
            return (
                product.name?.toLowerCase().includes(searchLower) ||
                product.category?.name?.toLowerCase().includes(searchLower) ||
                product.brand?.name?.toLowerCase().includes(searchLower)
            );
        });

        // Seed brand groups — only seed the active brand if filtering, else all brands
        const groups = {};
        if (brandsData) {
            const brandsArray = Array.isArray(brandsData) ? brandsData : (brandsData?.data || []);
            brandsArray
                .filter(b => !activeBrand || b.name === activeBrand)
                .forEach(brand => {
                    groups[brand.name] = { id: brand.id, name: brand.name, count: 0, stock: 0, products: [] };
                });
        }

        // Slot products into groups
        filteredProducts.forEach(product => {
            const groupName = product.brand?.name || 'No Brand';
            if (!groups[groupName]) {
                groups[groupName] = { id: null, name: groupName, count: 0, stock: 0, products: [] };
            }
            const transformedProduct = {
                ...product,
                stock: product.stock,
                variations: product.productVariations || [],
                image: product.product_images?.filter(img => img.is_primary)[0]?.url || ""
            };
            groups[groupName].products.push(transformedProduct);
            groups[groupName].count += 1;

            const variationStock = product.product_variations?.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0) || 0;
            const productStock = parseInt(product.stock) || 0;
            groups[groupName].stock += variationStock > 0 ? variationStock : productStock;
        });

        const result = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
        return search ? result.filter(g => g.products.length > 0) : result;
    }, [data, brandsData, search, activeBrand]);

    return(
        <main className="mx-2 lg:mx-10 2xl:mx-20 ">
            <BreadCrumbs/>
            <div className="flex mt-8 justify-between items-start gap-4 flex-wrap">
                <div>
                    <h2 className="text-3xl font-semibold">
                        {activeBrand ? activeBrand : 'Products'}
                    </h2>
                    {activeBrand && (
                        <Link
                            href="/admin/products"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                            <span className="icon-[fluent--arrow-left-16-filled] w-3 h-3"/>
                            All Brands
                        </Link>
                    )}
                </div>
                <Link href={'/admin/products/create'} className="bg-primary text-white p-2 rounded-md flex items-center hover:scale-105 shrink-0">
                    <span className="icon-[rivet-icons--plus] w-4 h-4 mx-2"/>Create New Product
                </Link>
            </div>
            <div className="flex flex-col gap-y-5 md:flex-row justify-between md:items-center my-6 md:my-10">
                <div className="flex items-center gap-6 flex-1 max-w-2xl">
                    <div className="flex-1 h-12"><Search search={search} setSearch={setSearch}/></div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setType('grid')}
                            className={`p-2 rounded-lg transition-all ${type === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <span className="icon-[fluent--table-simple-24-filled] w-6 h-6 block"/>
                        </button>
                        <button
                            onClick={() => setType('table')}
                            className={`p-2 rounded-lg transition-all ${type === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <span className="icon-[lucide--table-of-contents] w-6 h-6 block"/>
                        </button>
                    </div>
                </div>
            </div>
             <section className="bg-white md:px-10 py-8 rounded-lg">
                {
                    isLoading ?
                    [...new Array(16)].map((_,i)=><div key={i}><ProductListingSkeleton/></div>)
                    : productsError ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                            <span className="icon-[mdi--alert-circle-outline] w-16 h-16 text-red-100 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">Unable to load products</h3>
                            <p className="text-gray-500 mt-2 max-w-sm">We encountered an issue while fetching the product list. Please try again soon.</p>
                            <button onClick={() => mutateProducts()} className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
                                Refresh Data
                            </button>
                        </div>
                    )
                    : transformProductData.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                            <span className="icon-[fluent--box-24-regular] w-16 h-16 text-gray-100 mb-4 opacity-40" />
                            <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                            <button onClick={() => setSearch('')} className="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
                        </div>
                    )
                    : transformProductData.map((group,i)=>(
                        <div key={i} className={group.products.length === 0 ? "opacity-60" : ""}>
                            <div className="flex flex-col md:flex-row gap-y-2 gap-x-8 md:items-center mb-8">
                                <div className="flex items-center">
                                    <span className="icon-[fluent--layer-20-regular] w-10 h-10 text-primary opacity-80"/>
                                    {groupBy === 'brand' && editingBrandId === group.id ? (
                                        <div className="flex items-center gap-2 ml-2">
                                            <input
                                                autoFocus
                                                className="font-bold text-xl border border-primary px-3 py-1 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none w-64"
                                                value={tempBrandName}
                                                onChange={e => setTempBrandName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdateBrand(group.id, tempBrandName);
                                                    if (e.key === 'Escape') setEditingBrandId(null);
                                                }}
                                            />
                                            <button onClick={() => handleUpdateBrand(group.id, tempBrandName)} className="text-xs font-bold text-primary">Save</button>
                                            <button onClick={() => setEditingBrandId(null)} className="text-xs font-bold text-gray-400">Cancel</button>
                                        </div>
                                    ) : (
                                        <div
                                            className={`flex items-center gap-2 ml-2 ${groupBy === 'brand' ? 'cursor-pointer group/header' : ''}`}
                                            onClick={() => {
                                                if (groupBy === 'brand' && group.id) {
                                                    setEditingBrandId(group.id);
                                                    setTempBrandName(group.name);
                                                }
                                            }}
                                        >
                                            <h6 className={`text-xl font-bold text-gray-800 ${groupBy === 'brand' ? 'group-hover/header:text-primary transition-colors' : ''}`}>
                                                {group.name}
                                            </h6>
                                            {groupBy === 'brand' && (
                                                <span className="icon-[fluent--edit-16-regular] w-4 h-4 text-gray-400 opacity-0 group-hover/header:opacity-100 transition-all" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="rounded-full bg-blue-50 text-blue-700 flex text-xs font-semibold px-3 py-1.5 w-fit border border-blue-100">
                                    <span className="pr-3 border-r border-blue-200">{group.count} products</span>
                                    <span className="pl-3">{group.stock} stock</span>
                                </div>
                            </div>

                            {group.products.length > 0 ? (
                                <div className={`${type=='grid'?'grid':''} gap-x-5 gap-y-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-stretch mb-16`}>
                                    {
                                        group.products.map((product,j)=>(
                                        <div key={j} className="h-full">
                                            {type=='grid' && <ProductListing data={product}/>}
                                            {type=='table' && <ProductListingRow data={product}/>}
                                        </div>))
                                    }
                                </div>
                            ) : (
                                <div className="mb-16 p-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center bg-gray-50/30 text-gray-400">
                                    <span className="icon-[fluent--box-24-regular] w-12 h-12 mb-2 opacity-20"/>
                                    <p className="text-sm">No products in this brand yet</p>
                                    <Link href={`/admin/products/create`} className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                        <span className="icon-[rivet-icons--plus] w-3 h-3"/>
                                        Add first product
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))
                }
             </section>
        </main>
    )
}