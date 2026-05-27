'use client'
import Link from "next/link"
import { useState, useMemo } from "react"
import useSWR from "swr"
import Image from "next/image"
import { fetcher, postFetcher, putData, deleteData } from "@/app/lib/data"
import Search from "@/app/UI/Search"
import BreadCrumbs from "@/app/UI/BreadCrumbs"
import { popupE } from "@/app/lib/trigger"

export default function Page(){
    let [search, setSearch] = useState('');
    let [showCreateForm, setShowCreateForm] = useState(false);
    let [editingBrand, setEditingBrand] = useState(null);
    let [newBrandName, setNewBrandName] = useState('');
    let [newBrandLogo, setNewBrandLogo] = useState(null);
    let [newBrandDescription, setNewBrandDescription] = useState('');
    let [newBrandColor, setNewBrandColor] = useState('#111111');
    let [newBrandIsActive, setNewBrandIsActive] = useState(true);
    let [newBrandFacebook, setNewBrandFacebook] = useState('');
    let [newBrandInstagram, setNewBrandInstagram] = useState('');
    let [newBrandTiktok, setNewBrandTiktok] = useState('');
    let [newBrandMinOrder, setNewBrandMinOrder] = useState(0);
    let [newBrandMaxOrder, setNewBrandMaxOrder] = useState('');
    let [newBrandTrackingSnippet, setNewBrandTrackingSnippet] = useState('');
    let [newBrandPurchaseSnippet, setNewBrandPurchaseSnippet] = useState('');
    let [newBrandSortOrder, setNewBrandSortOrder] = useState(0);
    let [newBrandSlug, setNewBrandSlug] = useState('');



    // Edit states
    let [editBrandLogo, setEditBrandLogo] = useState(null);

    let [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    let [newCategoryName, setNewCategoryName] = useState('');
    let [showCategoryCreator, setShowCategoryCreator] = useState(false);
    let [targetBrandId, setTargetBrandId] = useState(null);
    let [editingCategoryId, setEditingCategoryId] = useState(null);
    let [tempCategoryName, setTempCategoryName] = useState('');
    
    // Fetch brands
    let { data: brands, isError: brandsError, isLoading: brandsLoading, mutate: mutateBrands } = useSWR(['/brands',{}], fetcher);

    // Fetch categories for the dropdown
    let { data: categories, mutate: mutateCategories } = useSWR(['/categories', {}], fetcher);

    const filteredBrands = useMemo(() => {
        return brands?.filter(brand => 
            brand.name.toLowerCase().includes(search.toLowerCase())
        ) || [];
    }, [brands, search]);

    const handleCreateCategory = async (brandId = null) => {
        const bid = brandId || targetBrandId;
        if (!newCategoryName.trim() || !bid) return;
        try {
            await postFetcher(['/categories', { name: newCategoryName, brand_id: bid }]);
            mutateCategories();
            setNewCategoryName('');
            setShowCategoryCreator(false);
            setTargetBrandId(null);
            popupE('success', 'Category created for brand');
        } catch (error) {
            console.error('Category creation failed', error);
            const msg = error.response?.data?.message || error.message || 'Failed to create category';
            popupE('error', msg);
        }
    };

    const handleUpdateCategory = async (id) => {
        if (!tempCategoryName.trim()) return;
        try {
            await putData(
                () => {
                    mutateCategories();
                    setEditingCategoryId(null);
                    popupE('success', 'Category renamed');
                },
                { name: tempCategoryName },
                `/categories/${id}`
            );
        } catch (error) {
            popupE('error', 'Rename failed');
        }
    };

    const handleDeleteCategory = async (id, name) => {
        if (!confirm(`Are you absolutely sure you want to delete the "${name}" category? This will remove it from all brands and products!`)) return;
        try {
            await deleteData(
                (response) => {
                    mutateCategories();
                    popupE('success', 'Category entity deleted');
                },
                {},
                `/categories/${id}`
            );
        } catch (error) {
            console.error('Category deletion failed', error);
            popupE('error', 'Failed to delete category');
        }
    };

    const handleCategoryToggle = (id) => {
        if (selectedCategoryIds.includes(id)) {
            setSelectedCategoryIds(selectedCategoryIds.filter(itemId => itemId !== id));
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, id]);
        }
    };
    const handleCreateBrand = async () => {
        if (!newBrandName.trim()) {
            popupE('error', 'Brand name is required');
            return;
        }
        
        try {
            const payload = { 
                name: newBrandName,
                description: newBrandDescription,
                color_hex: newBrandColor,
                is_active: newBrandIsActive ? 1 : 0,
                facebook_url: newBrandFacebook,
                instagram_url: newBrandInstagram,
                tiktok_url: newBrandTiktok,
                min_order_amount: newBrandMinOrder,
                max_order_amount: newBrandMaxOrder,
                tracking_snippet: newBrandTrackingSnippet,
                purchase_snippet: newBrandPurchaseSnippet,
                sort_order: newBrandSortOrder,
                slug: newBrandSlug
            };


            
            const { postFile } = await import('@/app/lib/data');
            
            postFile(
                (response) => {
                    if (response.success) {
                        mutateBrands();
                        setShowCreateForm(false);
                        setNewBrandName('');
                        setNewBrandLogo(null);
                        setNewBrandDescription('');
                        setNewBrandColor('#111111');
                        setNewBrandIsActive(true);
                        setNewBrandInstagram('');
                        setNewBrandTiktok('');
                        setNewBrandMinOrder(0);
                        setNewBrandMaxOrder('');
                        setNewBrandTrackingSnippet('');
                        setNewBrandPurchaseSnippet('');
                        setNewBrandSortOrder(0);
                        setNewBrandSlug('');
                        popupE('success', 'Brand created successfully');


                    }
                },
                newBrandLogo,
                'logo',
                payload,
                '/brands'
            );
        } catch (error) {
            console.error('Error creating brand:', error);
            popupE('error', 'Failed to create brand');
        }
    };

    const handleUpdateBrand = async (brand) => {
        try {
            const payload = { 
                _method: 'PUT',
                name: brand.name,
                description: brand.description,
                color_hex: brand.color_hex,
                is_active: brand.is_active ? 1 : 0,
                facebook_url: brand.facebook_url,
                instagram_url: brand.instagram_url,
                tiktok_url: brand.tiktok_url,
                min_order_amount: brand.min_order_amount,
                max_order_amount: brand.max_order_amount,
                tracking_snippet: brand.tracking_snippet,
                purchase_snippet: brand.purchase_snippet,
                sort_order: brand.sort_order,
                slug: brand.slug
            };


            
            const { postFile } = await import('@/app/lib/data');

            postFile(
                (response) => {
                    if (response.success) {
                        mutateBrands();
                        setEditingBrand(null);
                        setEditBrandLogo(null);
                        popupE('success', 'Brand updated successfully');
                    }
                },
                editBrandLogo,
                'logo',
                payload,
                `/brands/${brand.id}`
            );
        } catch (error) {
            console.error('Error updating brand:', error);
        }
    };

    const handleDeleteBrand = async (brandId) => {
        if (!confirm('Are you sure you want to delete this brand? This might affect products associated with it.')) return;
        
        try {
            await deleteData(
                (response) => {
                    mutateBrands();
                    popupE('success', 'Brand deleted successfully');
                },
                {},
                `/brands/${brandId}`
            );
        } catch (error) {
            console.error('Error deleting brand:', error);
        }
    };

    return(
        <main className="mx-2 lg:mx-10 2xl:mx-20 ">
            <BreadCrumbs/>
            <div className="flex mt-8 justify-between items-center">
                <h2 className="text-3xl font-semibold">Brand Management</h2>
                <button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:scale-105 transition-all shadow-md"
                >
                    <span className="icon-[rivet-icons--plus] w-4 h-4 mr-2"/>
                    Add New Brand
                </button>
            </div>
            
            <div className="my-8 flex max-w-md h-12">
                <Search search={search} setSearch={setSearch} placeholder="Search brands..."/>
            </div>
            
            {/* Create Brand Form */}
            {showCreateForm && (
                <section className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-primary/10 mb-12 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="icon-[solar--tag-bold-duotone] w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Initialize New Brand</h3>
                            <p className="text-gray-500 text-xs">Define a new brand entity within your ecosystem</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Brand Name Identity</label>
                                <input 
                                    className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-inner text-sm" 
                                    placeholder="e.g., Grainmill" 
                                    type="text" 
                                    value={newBrandName} 
                                    onChange={e => setNewBrandName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">URL Slug (Optional)</label>
                                <input 
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-800 placeholder:text-gray-300 shadow-inner text-xs" 
                                    placeholder="e.g., grainmill-premium" 
                                    type="text" 
                                    value={newBrandSlug} 
                                    onChange={e => setNewBrandSlug(e.target.value)}
                                />
                                <p className="text-[9px] text-gray-400 italic ml-1">Leave empty to auto-generate from brand name.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Marketing Description</label>
                                <textarea 
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-800 placeholder:text-gray-300 shadow-inner text-xs min-h-[100px]" 
                                    placeholder="Short tagline (e.g. Hearty oats & nourishing staples)" 
                                    value={newBrandDescription} 
                                    onChange={e => setNewBrandDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Signature Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {newBrandLogo ? (
                                            <Image 
                                                src={URL.createObjectURL(newBrandLogo)} 
                                                alt="New brand logo preview" 
                                                width={80} 
                                                height={80} 
                                                className="w-full h-full object-contain p-2" 
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <span className="icon-[solar--gallery-bold-duotone] w-8 h-8 text-gray-200" />
                                        )}
                                    </div>
                                    <label className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors">
                                        Upload Image
                                        <input type="file" className="hidden" accept="image/*" onChange={e => setNewBrandLogo(e.target.files[0])} />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Brand Theme Color</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="color" 
                                        className="w-20 h-10 rounded-xl cursor-pointer bg-white border border-gray-200 p-1"
                                        value={newBrandColor}
                                        onChange={e => setNewBrandColor(e.target.value)}
                                    />
                                    <span className="text-xs font-mono font-bold text-gray-500">{newBrandColor}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <input 
                                    type="checkbox" 
                                    id="is_active_new"
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={newBrandIsActive}
                                    onChange={e => setNewBrandIsActive(e.target.checked)}
                                />
                                <label htmlFor="is_active_new" className="text-xs font-bold text-gray-600">Active on Storefront</label>
                            </div>

                            <div className="pt-4 grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Facebook URL (Optional)</label>
                                    <input 
                                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-inner text-xs" 
                                        placeholder="https://facebook.com/..." 
                                        type="url" 
                                        value={newBrandFacebook} 
                                        onChange={e => setNewBrandFacebook(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Instagram URL (Optional)</label>
                                    <input 
                                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-inner text-xs" 
                                        placeholder="https://instagram.com/..." 
                                        type="url" 
                                        value={newBrandInstagram} 
                                        onChange={e => setNewBrandInstagram(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">TikTok URL (Optional)</label>
                                    <input 
                                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-inner text-xs" 
                                        placeholder="https://tiktok.com/@..." 
                                        type="url" 
                                        value={newBrandTiktok} 
                                        onChange={e => setNewBrandTiktok(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Min Order Amount (KES)</label>
                                    <input 
                                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-inner text-xs" 
                                        placeholder="0" 
                                        type="number" 
                                        value={newBrandMinOrder} 
                                        onChange={e => setNewBrandMinOrder(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Max Order Amount (KES)</label>
                                    <input 
                                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-inner text-xs" 
                                        placeholder="No limit" 
                                        type="number" 
                                        value={newBrandMaxOrder} 
                                        onChange={e => setNewBrandMaxOrder(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Sort Order (Rank)</label>
                                    <input 
                                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-inner text-xs" 
                                        placeholder="0" 
                                        type="number" 
                                        value={newBrandSortOrder} 
                                        onChange={e => setNewBrandSortOrder(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Page View Snippet</label>
                                    <textarea 
                                        className="w-full bg-gray-50 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-gray-800 placeholder:text-gray-300 shadow-inner text-xs min-h-[120px]" 
                                        placeholder="gtag('event', 'page_view', ...);" 
                                        value={newBrandTrackingSnippet} 
                                        onChange={e => setNewBrandTrackingSnippet(e.target.value)}
                                    />
                                    <p className="text-[9px] text-gray-400 italic">Executed when viewing this brand&apos;s products.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Purchase Snippet</label>
                                    <textarea 
                                        className="w-full bg-gray-50 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-gray-800 text-xs min-h-[120px] placeholder:text-gray-300 shadow-inner" 
                                        placeholder="gtag('event', 'conversion', ...);" 
                                        value={newBrandPurchaseSnippet} 
                                        onChange={e => setNewBrandPurchaseSnippet(e.target.value)}
                                    />
                                    <p className="text-[9px] text-gray-400 italic">Executed on order success page.</p>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div className="flex gap-4 mt-12 pt-8 border-t border-gray-100">
                        <button 
                            onClick={handleCreateBrand}
                            className="bg-primary hover:bg-[#b5952f] text-white font-black uppercase tracking-widest text-[10px] py-4 px-10 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-2"
                        >
                            <span className="icon-[solar--cloud-upload-bold] w-4 h-4"/>
                            Initialize Brand Identity
                        </button>
                        <button 
                            onClick={() => {
                                setShowCreateForm(false);
                                setNewBrandName('');
                                setNewBrandLogo(null);
                                setNewBrandDescription('');
                                setNewBrandColor('#111111');
                            }}
                            className="bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px] py-4 px-10 rounded-2xl transition-all hover:bg-gray-200"
                        >
                            Dismiss
                        </button>
                    </div>
                </section>
            )}
            
            <section className="bg-white p-2 md:p-8 rounded-2xl border border-gray-100 min-h-[400px]">
                {
                    brandsLoading ?
                    <div className="space-y-4">
                        {[...new Array(5)].map((_,i)=>(
                            <div key={i} className="animate-pulse bg-gray-50 h-24 rounded-2xl"></div>
                        ))}
                    </div>
                    :
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBrands.map((brand,i)=>(
                            <div key={i} className="group border border-gray-100 rounded-2xl p-6 transition-all hover:shadow-md hover:border-primary/20 bg-white flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex-1">
                                            {editingBrand === brand.id ? (
                                                <div className="flex flex-col gap-4 p-4 bg-primary/5 rounded-2xl animate-in fade-in slide-in-from-top-1">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase">Brand Name</label>
                                                        <input 
                                                            autoFocus
                                                            className="w-full font-bold text-sm bg-white border border-primary/20 px-3 py-2 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none" 
                                                            value={brand.name}
                                                            onChange={e => {
                                                                const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], name: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase">URL Slug</label>
                                                        <input 
                                                            className="w-full text-xs font-mono text-gray-600 bg-white border border-primary/20 px-3 py-2 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none" 
                                                            value={brand.slug || ''}
                                                            onChange={e => {
                                                                const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], slug: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                            }}
                                                        />
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase">Description</label>
                                                        <textarea 
                                                            className="w-full text-xs bg-white border border-primary/20 px-3 py-2 rounded-xl outline-none min-h-[60px]" 
                                                            value={brand.description || ''}
                                                            onChange={e => {
                                                                const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], description: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Color</label>
                                                            <input 
                                                                type="color"
                                                                className="w-10 h-8 rounded-lg cursor-pointer bg-white border border-gray-200 p-0.5"
                                                                value={brand.color_hex || '#111111'}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], color_hex: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 flex flex-col items-end">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Logo</label>
                                                            <label className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase cursor-pointer">
                                                                Change
                                                                <input type="file" className="hidden" accept="image/*" onChange={e => setEditBrandLogo(e.target.files[0])} />
                                                            </label>
                                                        </div>
                                                        <div className="space-y-1 flex flex-col items-end">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Active</label>
                                                            <input 
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded text-primary"
                                                                checked={Boolean(brand.is_active)}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], is_active: e.target.checked };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Facebook (Optional)</label>
                                                            <input 
                                                                className="w-full text-[10px] bg-white border border-primary/20 px-3 py-1.5 rounded-lg outline-none" 
                                                                value={brand.facebook_url || ''}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], facebook_url: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Instagram (Optional)</label>
                                                            <input 
                                                                className="w-full text-[10px] bg-white border border-primary/20 px-3 py-1.5 rounded-lg outline-none" 
                                                                value={brand.instagram_url || ''}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], instagram_url: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">TikTok (Optional)</label>
                                                            <input 
                                                                className="w-full text-[10px] bg-white border border-primary/20 px-3 py-1.5 rounded-lg outline-none" 
                                                                placeholder="https://tiktok.com/@..."
                                                                value={brand.tiktok_url || ''}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], tiktok_url: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Min Order</label>
                                                            <input 
                                                                className="w-full text-[10px] bg-white border border-primary/20 px-3 py-1.5 rounded-lg outline-none" 
                                                                type="number"
                                                                value={brand.min_order_amount || 0}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], min_order_amount: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Max Order</label>
                                                            <input 
                                                                className="w-full text-[10px] bg-white border border-primary/20 px-3 py-1.5 rounded-lg outline-none" 
                                                                type="number"
                                                                value={brand.max_order_amount || ''}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], max_order_amount: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Sort Order</label>
                                                            <input 
                                                                className="w-full text-[10px] bg-white border border-primary/20 px-3 py-1.5 rounded-lg outline-none" 
                                                                type="number"
                                                                value={brand.sort_order || 0}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], sort_order: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">View Snippet</label>
                                                            <textarea 
                                                                className="w-full text-xs font-mono text-gray-800 bg-white border border-primary/20 px-3 py-1.5 rounded-lg outline-none min-h-[120px]" 
                                                                value={brand.tracking_snippet || ''}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], tracking_snippet: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Purchase Snippet</label>
                                                            <textarea 
                                                                className="w-full text-xs font-mono text-gray-800 bg-white border border-primary/20 px-3 py-1.5 rounded-lg outline-none min-h-[120px]" 
                                                                value={brand.purchase_snippet || ''}
                                                                onChange={e => {
                                                                    const updated = [...brands];
                                                                    const bIdx = brands.findIndex(b => b.id === brand.id);
                                                                    if (bIdx !== -1) {
                                                                        updated[bIdx] = { ...updated[bIdx], purchase_snippet: e.target.value };
                                                                        mutateBrands(updated, false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>



                                                    {editBrandLogo && (
                                                        <p className="text-[8px] text-primary font-bold">New logo ready: {editBrandLogo.name}</p>
                                                    )}

                                                    <div className="flex gap-2 pt-2 border-t border-primary/10">
                                                        <button 
                                                            onClick={() => handleUpdateBrand(brand)} 
                                                            className="flex-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-xl"
                                                        >
                                                            Update Brand
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingBrand(null)} 
                                                            className="px-4 bg-gray-100 text-gray-400 text-[9px] font-black uppercase py-2 rounded-xl"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="flex items-center gap-4 cursor-pointer group/name"
                                                    onClick={() => setEditingBrand(brand.id)}
                                                >
                                                    <div 
                                                        className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover/name:border-primary/30 transition-all"
                                                        style={{ borderColor: brand.color_hex ? brand.color_hex + '33' : '#f3f4f6' }}
                                                    >
                                                        {brand.logo ? (
                                                            <Image 
                                                                src={brand.logo} 
                                                                alt={`${brand.name} logo`} 
                                                                width={56} 
                                                                height={56} 
                                                                className="w-full h-full object-contain p-2" 
                                                                unoptimized={true}
                                                            />
                                                        ) : (
                                                            <span className="icon-[solar--tag-bold-duotone] w-6 h-6 text-gray-200" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h6 className="text-xl font-bold text-gray-800 group-hover/name:text-primary transition-colors leading-none">{brand.name}</h6>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.color_hex || '#111111' }} />
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter line-clamp-1">{brand.description || 'No description set'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteBrand(brand.id)}
                                            className="text-gray-300 hover:text-red-500 p-2 rounded-xl transition-colors"
                                        >
                                            <span className="icon-[fluent--delete-16-filled] w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Exclusive Categories Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Specialized Categories</label>
                                            <button 
                                                onClick={() => {
                                                    setShowCategoryCreator(!showCategoryCreator);
                                                    setTargetBrandId(brand.id);
                                                }}
                                                className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                                            >
                                                <span className="icon-[solar--add-folder-bold] w-3 h-3"/>
                                                Create New
                                            </button>
                                        </div>

                                        {showCategoryCreator && targetBrandId === brand.id && (
                                            <div className="flex gap-2 p-2 bg-primary/5 rounded-2xl animate-in fade-in slide-in-from-top-1">
                                                <input 
                                                    autoFocus
                                                    className="flex-1 bg-white border-none rounded-xl py-2 px-4 text-xs font-bold text-gray-900 focus:ring-1 focus:ring-primary/20" 
                                                    placeholder="Category name..." 
                                                    type="text" 
                                                    value={newCategoryName}
                                                    onChange={e => setNewCategoryName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleCreateCategory(brand.id)}
                                                />
                                                <button onClick={() => handleCreateCategory(brand.id)} className="bg-primary text-white p-2 rounded-xl">
                                                    <span className="icon-[solar--check-circle-bold] w-4 h-4"/>
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {categories?.filter(c => c.brand_id == brand.id).map(cat => (
                                                <div key={cat.id} className="group/cat relative">
                                                    {editingCategoryId === cat.id ? (
                                                        <div className="flex items-center gap-1 bg-white border border-primary rounded-full px-2 py-0.5 shadow-sm">
                                                            <input 
                                                                autoFocus
                                                                className="text-[9px] font-black uppercase tracking-widest outline-none w-24"
                                                                value={tempCategoryName}
                                                                onChange={e => setTempCategoryName(e.target.value)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') handleUpdateCategory(cat.id);
                                                                    if (e.key === 'Escape') setEditingCategoryId(null);
                                                                }}
                                                            />
                                                            <button onClick={() => handleUpdateCategory(cat.id)} className="text-primary hover:text-green-600">
                                                                <span className="icon-[solar--check-circle-bold] w-3 h-3"/>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] px-3 py-1 bg-gray-50 text-gray-700 rounded-full font-black uppercase tracking-widest border border-gray-100 flex items-center gap-2 group-hover/cat:border-primary/20 transition-all">
                                                            {cat.name}
                                                            <div className="flex items-center gap-1 ml-1 border-l pl-2 border-gray-200">
                                                                <button 
                                                                    onClick={() => {
                                                                        setEditingCategoryId(cat.id);
                                                                        setTempCategoryName(cat.name);
                                                                    }}
                                                                    className="text-gray-400 hover:text-primary transition-colors"
                                                                >
                                                                    <span className="icon-[fluent--edit-16-regular] w-3 h-3" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <span className="icon-[solar--trash-bin-trash-bold] w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {categories?.filter(c => c.brand_id == brand.id).length === 0 && (
                                                <span className="text-[9px] text-gray-300 uppercase tracking-widest font-bold italic">No specialized categories</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="icon-[fluent--box-20-regular] w-4 h-4 text-gray-400"/>
                                        <span className="text-xs text-gray-500 font-medium">{brand.products_count || 0} Items</span>
                                    </div>
                                    <Link 
                                        href={`/admin/products?brand=${brand.name}`}
                                        className="text-xs font-bold text-primary hover:underline uppercase tracking-tighter"
                                    >
                                        Inspect Store
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                }

                {!brandsLoading && filteredBrands.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="icon-[fluent--search-info-24-regular] w-16 h-16 mb-4 opacity-20"/>
                        <p className="text-lg font-medium">No brands found</p>
                        <p className="text-sm">Try a different search or add a new brand</p>
                    </div>
                )}
            </section>
        </main>
    )
} 
