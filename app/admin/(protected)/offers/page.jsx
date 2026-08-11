'use client'
import { useState, useEffect, useRef } from "react";

import Image from "next/image";
import useSWR, { mutate } from "swr";
import { fetcher, postData, postFile, putData, deleteData } from "@/app/lib/data";
import Spinner from "@/app/UI/Spinner";
import Search from "@/app/UI/Search";
import { toast } from "react-hot-toast";

function SearchableProductSelect({ value, onChange, products }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const selectedProduct = products.find(p => String(p.id) === String(value));

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase()))
    );

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-left flex items-center justify-between gap-2 focus:outline-primary hover:border-primary/50 transition-all shadow-sm"
            >
                <span className={`truncate ${selectedProduct ? 'text-gray-900 font-extrabold' : 'text-gray-400 font-semibold'}`}>
                    {selectedProduct
                        ? `${selectedProduct.name} (KES ${Number(selectedProduct.price || 0).toLocaleString()})`
                        : '-- Select Product --'}
                </span>
                <span className="icon-[heroicons--chevron-down-20-solid] w-4 h-4 text-gray-400 shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-[120] top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden min-w-[260px]">
                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <span className="icon-[solar--magnifer-bold] w-4 h-4 text-gray-400 shrink-0 ml-1" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Type product name..."
                            className="w-full py-1.5 px-2 bg-transparent text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="text-gray-400 hover:text-gray-600 text-xs px-1 font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1 divide-y divide-gray-50 custom-scrollbar">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                                setSearch('');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-50 rounded-xl"
                        >
                            -- Select Product --
                        </button>
                        {filteredProducts.length === 0 ? (
                            <div className="px-3 py-4 text-xs font-semibold text-center text-gray-400">
                                No products found matching &quot;{search}&quot;
                            </div>
                        ) : (
                            filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(p.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl flex items-center justify-between gap-2 transition-colors ${
                                        String(p.id) === String(value)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-800 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="truncate">{p.name}</span>
                                    <span className="shrink-0 text-[11px] font-bold text-gray-500">
                                        KES {Number(p.price || 0).toLocaleString()}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    {filteredProducts.length > 0 && (
                        <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-400 border-t border-gray-100 text-right">
                            Showing {filteredProducts.length} of {products.length} products
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const OfferStats = ({ offers }) => {
    const active = offers.filter(o => o.is_active).length;
    const totalItems = offers.reduce((acc, curr) => acc + (curr.items?.length || 0), 0);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="icon-[solar--gallery-wide-bold-duotone] w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Offer Slides</span>
                </div>
                <div className="text-4xl font-black text-gray-900 tracking-tighter italic">{offers.length}</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 group hover:border-emerald-100 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <span className="icon-[solar--check-circle-bold-duotone] w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Banners</span>
                </div>
                <div className="text-4xl font-black text-gray-900 tracking-tighter italic">{active}</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 group hover:border-amber-100 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <span className="icon-[solar--box-minimalistic-bold-duotone] w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bundled Products</span>
                </div>
                <div className="text-4xl font-black text-gray-900 tracking-tighter italic">{totalItems}</div>
            </div>
        </div>
    );
};

export default function OffersPage() {
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);

    const { data: offersData, isLoading: offersLoading } = useSWR(['/admin/offers', {}], fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 60000,
    });
    const { data: productsData } = useSWR(['/products', { per_page: 1000, all_statuses: 1 }], fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 60000,
    });

    const offers = offersData?.data || [];
    const rawProducts = productsData?.data?.data || productsData?.data || (Array.isArray(productsData) ? productsData : []);
    const products = Array.isArray(rawProducts) ? rawProducts : [];


    const filteredOffers = offers.filter(o => 
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.subtitle?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id) => {
        if (!confirm("Are you sure you want to delete this offer slide?")) return;
        deleteData(
            (res) => {
                if (res?.success !== false) {
                    toast.success("Offer slide deleted");
                    mutate(['/admin/offers', {}]);
                } else {
                    toast.error(res.message || "Failed to delete offer");
                }
            },
            {},
            `/admin/offers/${id}`
        );
    };

    const handleToggleActive = (offer) => {
        putData(
            (res) => {
                if (res?.success !== false) {
                    toast.success(`Offer ${!offer.is_active ? 'Activated' : 'Deactivated'}`);
                    mutate(['/admin/offers', {}]);
                } else {
                    toast.error(res.message || "Failed to update status");
                }
            },
            {
                ...offer,
                is_active: !offer.is_active,
                items: offer.items.map(item => ({
                    product_id: item.product_id,
                    product_variation_id: item.product_variation_id,
                    quantity: item.quantity,
                    override_price: item.override_price,
                }))
            },
            `/admin/offers/${offer.id}`
        );
    };

    if (offersLoading) return <div className="h-[70vh] flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="icon-[solar--gallery-wide-bold-duotone] text-primary w-8 h-8" />
                        Offer Slideshows & Combos
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Create promotional popup slideshow banners and bundle product deals.
                    </p>
                </div>

                <button
                    onClick={() => { setEditingOffer(null); setModalOpen(true); }}
                    className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 text-sm"
                >
                    <span className="icon-[solar--add-circle-bold] w-5 h-5" />
                    Create New Combo Offer
                </button>
            </div>

            <OfferStats offers={offers} />

            {/* Filter & Search */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-50 mb-8 flex items-center justify-between gap-4">
                <Search value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search offers by title..." />
            </div>

            {/* Offer List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOffers.map((offer) => (
                    <div key={offer.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col group hover:shadow-2xl transition-all duration-300">
                        {/* Banner Image */}
                        <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                            {offer.banner_image ? (
                                <Image 
                                    src={offer.banner_image} 
                                    alt={offer.title} 
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="icon-[solar--gallery-wide-linear] w-12 h-12" />
                                </div>
                            )}

                            {/* Status Badge */}
                            <button
                                onClick={() => handleToggleActive(offer)}
                                className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-md ${
                                    offer.is_active 
                                        ? 'bg-emerald-500/90 text-white hover:bg-emerald-600' 
                                        : 'bg-gray-800/80 text-gray-200 hover:bg-gray-900'
                                }`}
                            >
                                {offer.is_active ? 'Active' : 'Inactive'}
                            </button>

                            {/* Order Tag */}
                            <span className="absolute bottom-4 left-4 bg-black/60 text-white backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold">
                                Order: #{offer.display_order}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 line-clamp-1 mb-1">{offer.title}</h3>
                                {offer.subtitle && <p className="text-xs font-semibold text-primary mb-3">{offer.subtitle}</p>}

                                {/* Pricing */}
                                <div className="flex items-baseline gap-3 my-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <span className="text-2xl font-black text-gray-900">KES {Number(offer.bundle_price).toLocaleString()}</span>
                                    {offer.original_price && (
                                        <span className="text-sm font-bold text-gray-400 line-through">
                                            KES {Number(offer.original_price).toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Bundled Products List */}
                                <div className="mt-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        Included Products ({offer.items?.length || 0}):
                                    </span>
                                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                        {offer.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50/80 px-3 py-2 rounded-xl text-xs font-bold text-gray-700">
                                                <span className="truncate max-w-[180px]">{item.product?.name || 'Product'}</span>
                                                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-lg">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => { setEditingOffer(offer); setModalOpen(true); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-all"
                                >
                                    <span className="icon-[solar--pen-bold] w-4 h-4" />
                                    Edit Offer
                                </button>
                                <button
                                    onClick={() => handleDelete(offer.id)}
                                    className="p-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all"
                                    title="Delete Offer"
                                >
                                    <span className="icon-[solar--trash-bin-trash-bold] w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredOffers.length === 0 && (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-sm mt-8">
                    <span className="icon-[solar--gallery-wide-linear] w-16 h-16 text-gray-300 mb-4 block mx-auto" />
                    <h3 className="text-xl font-bold text-gray-800">No Offer Slides Found</h3>
                    <p className="text-gray-500 text-sm mt-1">Create your first offer combo slideshow to display on storefront popups.</p>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <OfferFormModal
                    offer={editingOffer}
                    products={products}
                    onClose={() => setModalOpen(false)}
                    onSaved={() => {
                        setModalOpen(false);
                        mutate(['/admin/offers', {}]);
                    }}
                />
            )}
        </div>
    );
}

function OfferFormModal({ offer, products, onClose, onSaved }) {
    const [title, setTitle] = useState(offer?.title || '');
    const [subtitle, setSubtitle] = useState(offer?.subtitle || '');
    const [bannerImage, setBannerImage] = useState(offer?.banner_image || '');
    const [bundlePrice, setBundlePrice] = useState(offer?.bundle_price || '');
    const [originalPrice, setOriginalPrice] = useState(offer?.original_price || '');
    const [displayOrder, setDisplayOrder] = useState(offer?.display_order || 0);
    const [isActive, setIsActive] = useState(offer?.is_active ?? true);
    
    // Items array: [{ product_id, quantity, override_price, choice_group, is_required }]
    const [items, setItems] = useState(
        offer?.items?.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
            override_price: i.override_price || '',
            choice_group: i.choice_group || '',
            is_required: i.is_required ?? true
        })) || [{ product_id: products[0]?.id || '', quantity: 1, override_price: '', choice_group: '', is_required: true }]
    );

    // Auto-select first product when products finish loading if initial state was empty
    useEffect(() => {
        if (products.length > 0 && items.length > 0 && !items[0].product_id && !offer) {
            setItems([{ product_id: products[0].id, quantity: 1, override_price: '', choice_group: '', is_required: true }]);
        }
    }, [products, items, offer]);


    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        postFile(
            (res) => {
                setUploading(false);
                if (res?.url) {
                    setBannerImage(res.url);
                    toast.success("Banner image uploaded!");
                } else if (res?.success === false) {
                    toast.error(res.message || "Failed to upload image");
                }
            },
            file,
            'image',
            { purpose: 'offer_banner' },
            '/admin/media/upload'
        );
    };

    const handleAddItem = () => {
        setItems([...items, { product_id: products[0]?.id || '', quantity: 1, override_price: '', choice_group: '', is_required: true }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length <= 1) {
            toast.error("At least one product is required in a combo offer");
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        if (field === 'choice_group') {
            updated[index].is_required = !value;
        }
        setItems(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !bannerImage || !bundlePrice) {
            toast.error("Please complete title, banner image, and bundle price");
            return;
        }

        const payload = {
            title,
            subtitle,
            banner_image: bannerImage,
            bundle_price: parseFloat(bundlePrice),
            original_price: originalPrice ? parseFloat(originalPrice) : null,
            display_order: parseInt(displayOrder) || 0,
            is_active: isActive,
            items: items.map(item => ({
                product_id: parseInt(item.product_id),
                quantity: parseInt(item.quantity) || 1,
                override_price: item.override_price ? parseFloat(item.override_price) : null,
                choice_group: item.choice_group ? parseInt(item.choice_group) : null,
                is_required: !item.choice_group
            }))
        };

        setSubmitting(true);
        const callback = (res) => {
            setSubmitting(false);
            if (res?.success !== false) {
                onSaved();
            }
        };

        if (offer) {
            putData(callback, payload, `/admin/offers/${offer.id}`);
        } else {
            postData(callback, payload, '/admin/offers');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {offer ? 'Edit Offer Combo' : 'Create New Offer Combo'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200">
                        <span className="icon-[material-symbols-light--close] w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Offer Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. MID-YEAR SALE"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Subtitle / Tagline</label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={e => setSubtitle(e.target.value)}
                                placeholder="e.g. All You Need, All in One Combo!"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-primary"
                            />
                        </div>
                    </div>

                    {/* Banner Image Upload */}
                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase mb-2">Banner Image *</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="banner-upload"
                            />
                            <label
                                htmlFor="banner-upload"
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-2"
                            >
                                <span className="icon-[solar--upload-bold] w-4 h-4" />
                                {uploading ? 'Uploading...' : 'Choose Banner File'}
                            </label>
                            <input
                                type="text"
                                value={bannerImage}
                                onChange={e => setBannerImage(e.target.value)}
                                placeholder="Or paste image URL"
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold"
                            />
                        </div>
                        {bannerImage && (
                            <div className="mt-3 relative h-40 w-full rounded-2xl overflow-hidden border border-gray-200">
                                <Image src={bannerImage} alt="Preview" fill unoptimized className="object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Pricing & Order */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Bundle Price (KES) *</label>
                            <input
                                type="number"
                                value={bundlePrice}
                                onChange={e => setBundlePrice(e.target.value)}
                                placeholder="2350"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Original Price (KES)</label>
                            <input
                                type="number"
                                value={originalPrice}
                                onChange={e => setOriginalPrice(e.target.value)}
                                placeholder="3500"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Display Order</label>
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={e => setDisplayOrder(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-primary"
                            />
                        </div>
                    </div>

                    {/* Included Combo Products */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <label className="text-sm font-black text-gray-900 uppercase block">Combo Included Products</label>
                                <p className="text-xs text-gray-500 font-medium">Select products from shop catalog. Optionally set custom offer price per item.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-1.5"
                            >
                                <span className="icon-[solar--add-circle-bold] w-4 h-4" />
                                Add Product to Combo
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Column Labels */}
                            <div className="flex items-center gap-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                <span className="flex-1">Select Product</span>
                                <span className="w-44">Requirement / Choice</span>
                                <span className="w-16 text-center">Qty</span>
                                <span className="w-28 text-center">Custom Price</span>
                                <span className="w-8"></span>
                            </div>

                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                                    <div className="flex-1">
                                        <SearchableProductSelect
                                            value={item.product_id}
                                            onChange={val => handleItemChange(idx, 'product_id', val)}
                                            products={products}
                                        />
                                    </div>
                                    <div className="w-44">
                                        <select
                                            value={item.choice_group || ''}
                                            onChange={e => handleItemChange(idx, 'choice_group', e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 focus:outline-primary cursor-pointer"
                                        >
                                            <option value="">Required (Fixed)</option>
                                            <option value="1">Choice Group 1 (Either/Or)</option>
                                            <option value="2">Choice Group 2 (Either/Or)</option>
                                        </select>
                                    </div>
                                    <div className="w-16">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                            placeholder="Qty"
                                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-center focus:outline-primary"
                                        />
                                    </div>
                                    <div className="w-28">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.override_price}
                                            onChange={e => handleItemChange(idx, 'override_price', e.target.value)}
                                            placeholder="Price"
                                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-center focus:outline-primary"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(idx)}
                                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"
                                        title="Remove from combo"
                                    >
                                        <span className="icon-[solar--trash-bin-trash-bold] w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Active toggle */}
                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="is_active_check"
                            checked={isActive}
                            onChange={e => setIsActive(e.target.checked)}
                            className="w-5 h-5 rounded-md text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="is_active_check" className="text-sm font-bold text-gray-800">
                            Active in Storefront Popup Slideshow
                        </label>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Offer Combo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
