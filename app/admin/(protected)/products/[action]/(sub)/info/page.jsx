'use client'

import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useContext, useState, useEffect } from "react"
import Image from "next/image"
import { CreateProductContext } from "@/app/lib/providers/CreateProductProvider"
import FileInput from "@/app/UI/FileInput"
import AttributeManager, { ProductVariations } from "../../AttributeManager"
import { fetcher, postFetcher, postFileFetcher, blobFetcher } from "@/app/lib/data"
import useSWR from "swr"

export default function Page(){
    const {action} = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const {data, isLoading:productLoading, error:productError} = useSWR(id?[`/products/${id}`, {}]:null, fetcher);

    const {
        Category, Brand, Product, Price, AlternatePrice, Perks, Description,
        Media, ExistingMedia, Stock, loadProduct
    } = useContext(CreateProductContext);
    
    let [category, setCategory] = Category;
    let [brand, setBrand] = Brand;
    let [product, setProduct] = Product;
    let [price, setPrice] = Price;
    let [discount, setDiscount] = AlternatePrice;
    let [description, setDescription] = Description;
    let [media, setMedia] = Media;
    let [existingMedia, setExistingMedia] = ExistingMedia;
    let [files, setFiles] = useState([]);
    const { Attributes } = useContext(CreateProductContext);
    let [attributes, setAttributes] = Attributes;
    let [stock, setStock] = Stock;
    
    const { data: categoriesData, isLoading: categoriesLoading } = useSWR(['/categories', {}], fetcher);
    const { data: brandsData, isLoading: brandsLoading } = useSWR(['/brands', {}], fetcher);

    // Filter categories based on selected brand
    const filteredCategories = (() => {
        if (!brand || !brandsData) return [];
        const selectedBrandData = brandsData.find(b => b.name === brand);
        if (!selectedBrandData || !selectedBrandData.categories) return [];
        return selectedBrandData.categories;
    })();

    // Auto-select category if brand has only one category
    useEffect(() => {
        if (brand && brandsData) {
            const selectedBrandData = brandsData.find(b => b.name === brand);
            if (selectedBrandData && selectedBrandData.categories && selectedBrandData.categories.length === 1) {
                const autoCat = selectedBrandData.categories[0].name;
                if (category !== autoCat) {
                    setCategory(autoCat);
                }
            }
        }
    }, [brand, brandsData, category, setCategory]);

    useEffect(()=>{
        setMedia(files);
    }, [files, setMedia]);

    // If editing, load the product into the provider state (including media files)
    useEffect(()=>{
        if(action === 'edit'){
            const ident = id || name;
            if(ident && typeof loadProduct === 'function'){
                loadProduct(ident).catch(e=>console.error('loadProduct failed',e));
            }
        }
    },[action,id,name,loadProduct])

    const submit = async (e) => {
        e.preventDefault();
        
        const hasVariations = attributes && Object.keys(attributes).length > 0;
        const hasExistingImages = existingMedia && existingMedia.length > 0;
        if (!category || !brand || !product || (!price && !hasVariations) || (files.length === 0 && !hasExistingImages)) {
            alert("Please fill in all required basic information and upload at least one image.");
            return;
        }

        router.push(
            `/admin/products/${action}/details${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}`
        );
    };
    
    return(
        <div className="space-y-8">
            {/* Basic Information Section */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="icon-[solar--info-square-bold-duotone] w-6 h-6" />
                    </div>
                    <div>
                        <h5 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Basic Product Identity</h5>
                        <p className="text-gray-500 text-xs">Core information that defines this product line</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Affiliated Brand</label>
                        <div className="relative group">
                            <select 
                                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 appearance-none cursor-pointer" 
                                value={brand} 
                                onChange={e=>{
                                    setBrand(e.target.value);
                                    setCategory(''); // Reset category when brand changes to force re-selection or auto-select
                                }}
                            >
                                <option value="" disabled>{brandsLoading ? 'Awaiting brands list...' : 'Identify Brand Entity'}</option>
                                {brandsData && Array.isArray(brandsData) && brandsData.map(b => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 icon-[solar--alt-arrow-down-bold-duotone] text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Product Category</label>
                        <div className="relative group">
                            <select 
                                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 appearance-none cursor-pointer" 
                                value={category} 
                                onChange={e=>setCategory(e.target.value)}
                                disabled={!brand}
                            >
                                <option value="" disabled>
                                    {!brand ? 'Select Brand First' : (categoriesLoading ? 'Syncing catalogs...' : 'Select Catalog Category')}
                                </option>
                                {filteredCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 icon-[solar--alt-arrow-down-bold-duotone] text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Product Canonical Name</label>
                        <input 
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300" 
                            placeholder="Enter unique product identifier..." 
                            type="text" 
                            value={product} 
                            onChange={e=>setProduct(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none" 
                        placeholder="Describe your product..." 
                        rows={4}
                        value={description} 
                        onChange={e=>setDescription(e.target.value)}
                    />
                </div>
            </section>
            
            {/* Media Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border">
                <h5 className="text-xl font-semibold mb-6 text-gray-800">
                    Product Media
                    <span className="text-sm font-normal text-gray-500 ml-2">(Image, video, or 3D model)</span>
                </h5>
                <p className="text-gray-600 text-sm mb-4">Upload a media file to showcase your product</p>
                
                {existingMedia && existingMedia.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {existingMedia.map((file, index) => (
                            <div key={file.id} className="relative group">
                                <Image 
                                    src={file.url} 
                                    alt="Existing" 
                                    width={400}
                                    height={200}
                                    className="w-full h-48 object-cover rounded-lg border border-primary/50"
                                    unoptimized={true}
                                />
                                <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">Existing</div>
                                <button 
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setExistingMedia(existingMedia.filter(m => m.id !== file.id))
                                    }}
                                >
                                    <span className="icon-[fluent--dismiss-16-filled] w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {media.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {media.map((file, index) => (
                            <div key={index} className="relative group">
                                <Image 
                                    src={URL.createObjectURL(file)} 
                                    alt="New" 
                                    width={400}
                                    height={200}
                                    className="w-full h-48 object-cover rounded-lg border border-green-500/50"
                                    unoptimized={true}
                                />
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">New</div>
                                <button 
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFiles(files.filter((_, i) => i !== index));
                                        setMedia(media.filter((_, i) => i !== index));
                                    }}
                                >
                                    <span className="icon-[fluent--dismiss-16-filled] w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="w-full max-w-md">
                    <FileInput files={files} setFiles={setFiles} type={'image'}/>
                </div>
            </section>

            {/* Product Attributes Section */}
            <AttributeManager 
                attributes={attributes}
                setAttributes={setAttributes}
            />

            {/* Sales Information Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border">
                <h5 className="text-xl font-semibold mb-6 text-gray-800">Sales Information</h5>
                
                {Object.keys(attributes).length === 0 ? (
                    // Show general pricing when no attributes are selected
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Price (KSH)</label>
                            <input 
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                                placeholder="0.00" 
                                type="number" 
                                min="0"
                                step="0.01"
                                value={price} 
                                onChange={e=>setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (Ksh)</label>
                            <input 
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                                placeholder="0" 
                                type="number" 
                                min="0"
                                value={discount} 
                                onChange={e=>setDiscount(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                            <input 
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                                placeholder="0" 
                                type="number"
                                value={stock} 
                                onChange={e=>setStock(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-600">
                            Pricing is managed per variation above. Each variation can have its own price, stock, and discount.
                        </p>
                    </div>
                )}
            </section>

            {
                Object.keys(attributes).length > 0 &&
                <ProductVariations 
                    attributes={attributes}
                    setAttributes={setAttributes}
                    allMedia={[...existingMedia, ...media]}
                />
            }


{/* Navigation */}
            <div className="flex justify-end">
                <button 
                    onClick={submit}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    Continue to Details
                    <span className="icon-[fluent--arrow-right-16-filled] w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
