'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TestimonialForm({ initialData = null, isEdit = false }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        comment: '',
        rating: 5,
        is_active: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                role: initialData.role || '',
                comment: initialData.comment || '',
                rating: initialData.rating || 5,
                is_active: initialData.is_active ?? true
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const url = isEdit 
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/testimonials/${initialData.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/testimonials`;
            
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: isEdit ? 'Testimonial updated!' : 'Testimonial created!' });
                setTimeout(() => router.push('/admin/testimonials'), 1500);
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
        <form onSubmit={handleSubmit} className="max-w-4xl animate-in fade-in duration-500 pb-20">
            {message.text && (
                <div className={`p-4 mb-6 rounded-2xl text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'}`}>
                    <span className={`icon-[solar--info-circle-bold] w-5 h-5`} />
                    {message.text}
                </div>
            )}

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-100 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Customer Name</label>
                        <input 
                            name="name" value={formData.name} onChange={handleChange} required
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all font-bold text-gray-900"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Role / Subtitle</label>
                        <input 
                            name="role" value={formData.role} onChange={handleChange}
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all font-bold text-gray-900"
                            placeholder="Verified Buyer, Fitness Enthusiast, etc."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Rating</label>
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button 
                                key={star} type="button"
                                onClick={() => setFormData({...formData, rating: star})}
                                className={`flex items-center justify-center p-2 rounded-xl transition-all ${formData.rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200 hover:text-gray-300'}`}
                            >
                                <span className={`icon-[solar--star-bold] w-8 h-8`} />
                            </button>
                        ))}
                        <span className="ml-auto flex items-center pr-4 text-sm font-black text-gray-400">{formData.rating} out of 5 stars</span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Testimonial Comment</label>
                    <textarea 
                        name="comment" value={formData.comment} onChange={handleChange} required
                        className="w-full bg-gray-50 border-none rounded-3xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all min-h-[150px] font-medium text-gray-700 leading-relaxed"
                        placeholder="What did the customer have to say?..."
                    />
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-black/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${formData.is_active ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-400'}`}>
                            <span className="icon-[solar--check-circle-bold] w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900">Active Status</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Visible on the homepage testimonial section</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="pt-4">
                    <button 
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-primary text-white font-black py-5 rounded-2xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-2xl shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="icon-[tabler--loader-2] animate-spin w-6 h-6" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span className={isEdit ? "icon-[solar--pen-bold]" : "icon-[solar--add-circle-bold]"} />
                                <span>{isEdit ? 'Update Testimonial' : 'Save Testimonial'}</span>
                            </>
                        )}
                    </button>
                    <button 
                        type="button"
                        onClick={() => router.push('/admin/testimonials')}
                        className="w-full mt-4 text-gray-400 font-bold py-3 hover:text-gray-600 transition-colors text-sm"
                    >
                        Cancel and Go Back
                    </button>
                </div>
            </div>
        </form>
    );
}
