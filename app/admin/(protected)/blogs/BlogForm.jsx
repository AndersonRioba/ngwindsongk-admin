'use client'
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import Editor from "@/app/UI/WYSIWYG/Editor"

export default function BlogForm({ initialData = null, isEdit = false }) {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        youtube_url: '',
        status: 'draft',
        allow_comments: true,
        recipe_ids: [],
        brand_ids: [],
        product_ids: []
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Fetch related data for multi-select
    const { data: recipesData, isLoading: recipesLoading } = useSWR(['/admin/recipes', {}], fetcher);
    const { data: brandsData, isLoading: brandsLoading } = useSWR(['/brands', {}], fetcher);
    const { data: productsData, isLoading: productsLoading } = useSWR(['/products', {}], fetcher);

    const recipes = recipesData?.data?.data || recipesData?.data || [];
    const brands = Array.isArray(brandsData) ? brandsData : (brandsData?.data || []);
    const products = productsData?.data?.data || productsData?.data || [];

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                recipe_ids: initialData.recipes?.map(r => r.id) || initialData.recipe_ids || [],
                brand_ids: initialData.brands?.map(b => b.id) || initialData.brand_ids || [],
                product_ids: initialData.products?.map(p => p.id) || initialData.product_ids || []
            }));
            if (initialData.featured_image) {
                setPreviewUrl(initialData.featured_image);
            }
        }
    }, [initialData]);

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (name === 'featured_image' && files && files[0]) {
            handleFile(files[0]);
            return;
        }

        setFormData(prev => {
            const val = type === 'checkbox' ? checked : value;
            const newData = { ...prev, [name]: val };
            
            // Auto-generate slug from title if not in edit mode or slug is empty
            if (name === 'title' && (!isEdit || !prev.slug)) {
                newData.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            }
            return newData;
        });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleRecipeToggle = (recipeId) => {
        setFormData(prev => {
            const ids = [...prev.recipe_ids];
            if (ids.includes(recipeId)) {
                return { ...prev, recipe_ids: ids.filter(id => id !== recipeId) };
            } else {
                return { ...prev, recipe_ids: [...ids, recipeId] };
            }
        });
    };

    const handleBrandToggle = (brandId) => {
        setFormData(prev => {
            const isRemoving = prev.brand_ids.includes(brandId);
            const newBrandIds = isRemoving 
                ? prev.brand_ids.filter(id => id !== brandId) 
                : [...prev.brand_ids, brandId];
            
            // If removing, also remove products associated with this brand
            let newProductIds = [...prev.product_ids];
            if (isRemoving) {
                // Find all products that belong to this brand
                const brandProducts = products.filter(p => p.brand_id === brandId).map(p => p.id);
                // Filter them out of the current selection
                newProductIds = newProductIds.filter(id => !brandProducts.includes(id));
            }

            return { ...prev, brand_ids: newBrandIds, product_ids: newProductIds };
        });
    };

    const handleProductToggle = (productId) => {
        setFormData(prev => {
            const ids = [...prev.product_ids];
            if (ids.includes(productId)) {
                return { ...prev, product_ids: ids.filter(id => id !== productId) };
            } else {
                return { ...prev, product_ids: [...ids, productId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const url = isEdit 
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/blogs/${initialData.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/blogs`;
            
            const payload = new FormData();
            
            // Append basic fields
            Object.keys(formData).forEach(key => {
                if (key === 'featured_image') return; // Handled separately
                if (Array.isArray(formData[key])) {
                    payload.append(key, JSON.stringify(formData[key]));
                } else {
                    payload.append(key, formData[key]);
                }
            });

            // Append file if selected
            if (selectedFile) {
                payload.append('featured_image', selectedFile);
            }

            // Laravel method spoofing for PUT requests with FormData
            if (isEdit) {
                payload.append('_method', 'PUT');
            }

            const response = await fetch(url, {
                method: 'POST', // Always use POST for FormData with file uploads (Laravel handles _method)
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                body: payload
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: isEdit ? 'Blog post updated!' : 'Blog post published!' });
                setTimeout(() => router.push('/admin/blogs'), 1500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Operation failed' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500 pb-20">
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'}`}>
                    <span className={`icon-[solar--info-circle-bold] w-5 h-5`} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="icon-[solar--document-text-bold] text-primary w-6 h-6"/>
                            Editor
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Blog Title</label>
                                <input 
                                    name="title" value={formData.title} onChange={handleChange} required
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all text-lg font-semibold"
                                    placeholder="e.g. 10 Tips for Better Morning Energy"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Excerpt (Brief Summary)</label>
                                <textarea 
                                    name="excerpt" value={formData.excerpt} onChange={handleChange}
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all min-h-[80px]"
                                    placeholder="Write a short teaser for the blog list..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Content</label>
                                <Editor 
                                    content={formData.content} 
                                    setContent={handleContentChange}
                                    placeholder="Start writing your amazing story..."
                                    className="min-h-[400px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Media */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="icon-[solar--camera-bold] text-primary w-5 h-5"/>
                            Media
                        </h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Featured Image</label>
                            
                            <div 
                                className="relative group cursor-pointer"
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file"
                                    name="featured_image"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className={`w-full border-2 border-dashed rounded-xl px-4 py-8 text-center transition-all ${isDragging ? 'border-primary bg-primary/5' : 'bg-gray-50 border-gray-200 group-hover:border-primary'}`}>
                                    <span className={`icon-[solar--camera-add-bold] w-10 h-10 mb-2 mx-auto block ${isDragging ? 'text-primary' : 'text-gray-300 group-hover:text-primary'}`} />
                                    <p className={`text-xs font-bold ${isDragging ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                        {isDragging ? 'Drop Image Here' : (previewUrl ? 'Click to replace image' : 'Click to upload or drag and drop')}
                                    </p>
                                    <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-tight">PNG, JPG or WebP (Max. 5MB)</p>
                                </div>
                            </div>

                            {previewUrl && (
                                <div className="mt-4 space-y-2">
                                    <div className="relative rounded-xl overflow-hidden border border-gray-100 aspect-video shadow-lg group">
                                        <Image src={previewUrl} width={400} height={225} className="w-full h-full object-cover" alt="Preview" unoptimized={true}/>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <p className="text-white text-xs font-bold">Current Image</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl('');
                                            setFormData(prev => ({ ...prev, featured_image: '' }));
                                        }}
                                        className="text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-wider"
                                    >
                                        <span className="icon-[solar--trash-bin-trash-bold] w-3 h-3"/>
                                        Remove Image
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">YouTube URL</label>
                            <input 
                                name="youtube_url" value={formData.youtube_url} onChange={handleChange}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="icon-[solar--settings-bold] text-primary w-5 h-5"/>
                            Settings
                        </h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">URL Slug</label>
                            <input 
                                name="slug" value={formData.slug} onChange={handleChange} required
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary transition-all font-mono text-xs"
                                placeholder="blog-post-slug"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Publication Status</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                {['draft', 'published'].map(s => (
                                    <button 
                                        key={s} type="button"
                                        onClick={() => setFormData({...formData, status: s})}
                                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all capitalize ${formData.status === s ? (s === 'published' ? 'bg-green-500 text-white' : 'bg-primary text-white') : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Allow Comments</label>
                            <input 
                                type="checkbox" name="allow_comments" checked={formData.allow_comments} onChange={handleChange}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Linked Recipes */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="icon-[arcticons--reciper] text-primary w-5 h-5"/>
                            Related Recipes
                        </h3>
                        
                        <div className="space-y-1 max-h-[250px] overflow-y-auto pr-2 custom-scroll">
                            {recipesLoading ? (
                                [...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-50 animate-pulse rounded-xl" />)
                            ) : recipes.length === 0 ? (
                                <p className="text-center py-4 text-[10px] text-gray-400 italic">No recipes available</p>
                            ) : (
                                recipes.map(r => (
                                    <label 
                                        key={r.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group ${formData.recipe_ids.includes(r.id) ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                    >
                                        <input 
                                            type="checkbox"
                                            checked={formData.recipe_ids.includes(r.id)}
                                            onChange={() => handleRecipeToggle(r.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <div className="w-8 h-8 bg-white rounded-lg flex-shrink-0 flex items-center justify-center p-1 border border-gray-100">
                                            {r.image ? (
                                                <Image src={r.image} width={32} height={32} className="w-full h-full object-contain" alt={r.title} unoptimized={true}/>
                                            ) : (
                                                <span className="icon-[arcticons--reciper] w-4 h-4 text-gray-300" />
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 line-clamp-1">{r.title}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Linked Brands */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="icon-[fluent--tag-24-regular] text-primary w-5 h-5"/>
                            Related Brands
                        </h3>
                        
                        <div className="space-y-1 max-h-[250px] overflow-y-auto pr-2 custom-scroll">
                            {brandsLoading ? (
                                [...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-50 animate-pulse rounded-xl" />)
                            ) : brands.map(b => (
                                <label 
                                    key={b.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group ${formData.brand_ids.includes(b.id) ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                >
                                    <input 
                                        type="checkbox"
                                        checked={formData.brand_ids.includes(b.id)}
                                        onChange={() => handleBrandToggle(b.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 line-clamp-1">{b.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Linked Products */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="icon-[solar--box-bold] text-primary w-5 h-5"/>
                            Related Products
                        </h3>
                        
                        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
                            {productsLoading ? (
                                [...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-50 animate-pulse rounded-xl" />)
                            ) : formData.brand_ids.length === 0 ? (
                                <div className="py-8 px-4 text-center space-y-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <span className="icon-[solar--info-circle-bold] w-8 h-8 text-gray-300 mx-auto block" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                        Select at least one brand first<br/>to view available products
                                    </p>
                                </div>
                            ) : (
                                (() => {
                                    const filteredProducts = products.filter(p => formData.brand_ids.includes(p.brand_id));
                                    
                                    if (filteredProducts.length === 0) {
                                        return <p className="text-center py-4 text-[10px] text-gray-400 italic">No products found for selected branding</p>;
                                    }

                                    return filteredProducts.map(p => (
                                        <label 
                                            key={p.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group ${formData.product_ids.includes(p.id) ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={formData.product_ids.includes(p.id)}
                                                onChange={() => handleProductToggle(p.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 line-clamp-1">{p.name}</span>
                                        </label>
                                    ));
                                })()
                            )}
                        </div>
                    </div>

                    <button 
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="icon-[tabler--loader-2] animate-spin w-5 h-5" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span className={isEdit ? "icon-[solar--pen-bold]" : "icon-[solar--cloud-upload-bold]"} />
                                <span>{isEdit ? 'Update Blog' : 'Publish Blog'}</span>
                            </>
                        )}
                    </button>

                </div>
            </div>
        </form>
    );
}
