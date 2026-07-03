'use client'
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetcher, postData, putData } from "@/app/lib/data"

export default function RecipeForm({ initialData = null, isEdit = false }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        cooking_time: 30,
        servings: 4,
        difficulty: 'medium',
        category: 'breakfast',
        status: 'published',
        image: '',
        video_url: '',
        ingredients: [{ text: '' }],
        instructions: [{ text: '' }],
        product_ids: []
    });

    // Fetch products for multi-select
    const { data: productsData, isLoading: productsLoading } = useSWR(['/products', {}], fetcher);
    const products = productsData?.data?.data || productsData?.data || [];

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                product_ids: initialData.products?.map(p => p.id) || initialData.product_ids || []
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Auto-generate slug from title if not in edit mode or slug is empty
            if (name === 'title' && (!isEdit || !prev.slug)) {
                newData.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            }
            return newData;
        });
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };
    // Dynamic fields handlers
    const handleDynamicChange = (type, index, value) => {
        const newList = [...formData[type]];
        newList[index].text = value;
        setFormData({ ...formData, [type]: newList });
    };

    const addDynamicField = (type) => {
        setFormData({
            ...formData,
            [type]: [...formData[type], { text: '' }]
        });
    };

    const removeDynamicField = (type, index) => {
        if (formData[type].length > 1) {
            const newList = formData[type].filter((_, i) => i !== index);
            setFormData({ ...formData, [type]: newList });
        }
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

        // Validation
        if (formData.ingredients.every(i => !i.text.trim()) || formData.instructions.every(s => !s.text.trim())) {
            setMessage({ type: 'error', text: 'At least one ingredient and one step are required.' });
            setIsSubmitting(false);
            return;
        }

        const endpoint = isEdit ? `/admin/recipes/${initialData.id}` : `/admin/recipes`;
        
        // Use FormData for file upload
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'ingredients' || key === 'instructions') {
                data.append(key, JSON.stringify(formData[key]));
            } else if (key === 'product_ids') {
                formData[key].forEach(id => data.append('product_ids[]', id));
            } else if (key === 'image') {
                return;
            } else {
                data.append(key, formData[key]);
            }
        });

        if (selectedFile) {
            data.append('image', selectedFile);
        } else if (!isEdit && formData.image) {
            data.append('image', formData.image);
        }

        if (isEdit) {
            data.append('_method', 'PUT');
        }

        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST', // Multipart must be POST, use _method=PUT hack for updates
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: data
            });

            const result = await response.json();
            setIsSubmitting(false);

            if (result?.success) {
                setMessage({ type: 'success', text: isEdit ? 'Recipe updated!' : 'Recipe created!' });
                setTimeout(() => router.push('/admin/recipes'), 1500);
            } else {
                setMessage({ type: 'error', text: result?.message || 'Operation failed' });
            }
        } catch (error) {
            setIsSubmitting(false);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'}`}>
                    <span className={`icon-[solara--info-circle-bold] w-5 h-5`} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="icon-[solar--document-text-bold] text-primary w-6 h-6" />
                            Basic Information
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recipe Title</label>
                                <input
                                    name="title" value={formData.title} onChange={handleChange} required
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all text-lg font-semibold"
                                    placeholder="e.g. Grandma's Special Blueberry Oats"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">URL Slug</label>
                                    <input
                                        name="slug" value={formData.slug} onChange={handleChange} required
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-mono text-sm"
                                        placeholder="grandmas-special-blueberry-oats"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        name="category" value={formData.category} onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-semibold"
                                    >
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snack">Snack</option>
                                        <option value="dessert">Dessert</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Short Description</label>
                                <textarea
                                    name="content" value={formData.content} onChange={handleChange}
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all min-h-[120px]"
                                    placeholder="A brief overview of the recipe..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ingredients Repeater */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="icon-[arcticons--reciper] text-primary w-6 h-6" />
                                Ingredients
                            </h3>
                            <button type="button" onClick={() => addDynamicField('ingredients')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-all">
                                + Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.ingredients.map((item, index) => (
                                <div key={index} className="flex gap-2 group">
                                    <input
                                        value={item.text}
                                        onChange={(e) => handleDynamicChange('ingredients', index, e.target.value)}
                                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                                        placeholder={`Ingredient ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeDynamicField('ingredients', index)}
                                        className="text-red-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="icon-[tdesign--delete] w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Steps Repeater */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="icon-[solar--step-forward-bold] text-primary w-6 h-6"/>
                                Preparation Steps
                            </h3>
                            <button type="button" onClick={() => addDynamicField('instructions')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-all">
                                + Add Step
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.instructions.map((step, index) => (
                                <div key={index} className="flex gap-4 group items-start">
                                    <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-2 shadow-md shadow-primary/20">
                                        {index + 1}
                                    </div>
                                    <textarea
                                        value={step.text}
                                        onChange={(e) => handleDynamicChange('instructions', index, e.target.value)}
                                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all min-h-[80px]"
                                        placeholder={`Describe step ${index + 1}...`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeDynamicField('instructions', index)}
                                        className="text-red-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                                    >
                                        <span className="icon-[tdesign--delete] w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Media */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="icon-[solar--camera-bold] text-primary w-5 h-5" />
                            Media
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cover Image</label>
                            <div 
                                onClick={() => document.getElementById('recipe-image-input').click()}
                                className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                            >
                                <input 
                                    id="recipe-image-input"
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                                {previewImage || (typeof formData.image === 'string' && formData.image) ? (
                                    <div className="relative aspect-video rounded-xl overflow-hidden">
                                        <Image src={previewImage || formData.image} width={400} height={225} className="w-full h-full object-cover" alt="Preview" unoptimized={true} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-xs font-bold bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <span className="icon-[solar--upload-minimalistic-bold] w-10 h-10 text-gray-300 group-hover:text-primary mb-2" />
                                        <p className="text-xs font-bold text-gray-400 group-hover:text-primary">Click to upload recipe cover</p>
                                        <p className="text-[10px] text-gray-300 mt-1">Recommended size: 1280x720 (16:9)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Video URL (YouTube/Vimeo)</label>
                            <input
                                name="video_url" value={formData.video_url} onChange={handleChange}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Stats & Meta */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="icon-[solar--settings-bold] text-primary w-5 h-5" />
                            Settings
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cook Time (min)</label>
                                <input
                                    name="cooking_time" type="number" value={formData.cooking_time} onChange={handleChange}
                                    className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Servings</label>
                                <input
                                    name="servings" type="number" value={formData.servings} onChange={handleChange}
                                    className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Difficulty</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                {['easy', 'medium', 'hard'].map(level => (
                                    <button
                                        key={level} type="button"
                                        onClick={() => setFormData({ ...formData, difficulty: level })}
                                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all capitalize ${formData.difficulty === level ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Publication Status</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                {['draft', 'published'].map(s => (
                                    <button
                                        key={s} type="button"
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all capitalize ${formData.status === s ? (s === 'published' ? 'bg-green-500 text-white' : 'bg-primary text-white') : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Linked Products */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span className="icon-[solar--box-bold] text-primary w-5 h-5" />
                                Linked Products
                            </h3>
                            <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                {formData.product_ids.length} Selected
                            </span>
                        </div>

                        {/* Product Search */}
                        <div className="relative group">
                            <span className="icon-[solar--magnifer-linear] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary w-4 h-4 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Filter products..."
                                className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary transition-all"
                                onChange={(e) => {
                                    const term = e.target.value.toLowerCase();
                                    const items = document.querySelectorAll('.product-checkbox-item');
                                    items.forEach(item => {
                                        const name = item.getAttribute('data-name').toLowerCase();
                                        item.style.display = name.includes(term) ? 'flex' : 'none';
                                    });
                                }}
                            />
                        </div>

                        <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scroll">
                            {productsLoading ? (
                                <div className="flex flex-col gap-2 py-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-10 w-full bg-gray-100 animate-pulse rounded-lg" />
                                    ))}
                                    <p className="text-center text-[10px] text-gray-400 animate-pulse mt-2 italic">Awaiting products list...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex flex-col items-center py-8">
                                    <span className="icon-[fluent--box-search-20-regular] w-10 h-10 text-gray-200 mb-2"/>
                                    <p className="text-center text-xs text-gray-400 italic">No products found</p>
                                </div>
                            ) : (
                                products.map(p => (
                                    <label
                                        key={p.id}
                                        data-name={p.name}
                                        className="product-checkbox-item flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group min-w-0 overflow-hidden"
                                    >
                                        <div className="relative flex items-center flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={formData.product_ids.includes(p.id)}
                                                onChange={() => handleProductToggle(p.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                                            />
                                        </div>
                                        <div className="w-8 h-8 bg-white rounded-lg flex-shrink-0 flex items-center justify-center p-1 border border-gray-100 overflow-hidden">
                                            <Image src={p.product_images?.[0]?.url || p.image} width={32} height={32} className="w-full h-full object-contain" alt="product" unoptimized={true} />
                                        </div>
                                        <span className={`text-xs font-medium truncate min-w-0 flex-1 transition-colors ${formData.product_ids.includes(p.id) ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {p.name}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        disabled={isSubmitting}
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
                                <span>{isEdit ? 'Update Recipe' : 'Publish Recipe'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
