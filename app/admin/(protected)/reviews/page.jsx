'use client'
import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

export default function ReviewManagementPage() {
    const [search, setSearch] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: reviews, error, isLoading, mutate } = useSWR(['/admin/reviews', {}], fetcher);
    const { data: products } = useSWR(['/admin/listing', {}], fetcher);
    
    const filteredReviews = useMemo(() => {
        if (!reviews) return [];
        if (!search) return reviews;
        return reviews.filter(r => 
            r.review?.toLowerCase().includes(search.toLowerCase()) || 
            r.reviewer_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.product?.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [reviews, search]);

    const handleApprove = async (id) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                mutate();
            } else {
                alert(result.message || 'Failed to approve review');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews/${editingReview.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    product_id: editingReview.product_id,
                    reviewer_name: editingReview.reviewer_name,
                    role: editingReview.role,
                    rate: editingReview.rate,
                    review: editingReview.review,
                    status: editingReview.status
                })
            });
            const result = await response.json();
            if (result.success) {
                mutate();
                setIsEditModalOpen(false);
                setEditingReview(null);
            } else {
                alert(result.message || 'Failed to update review');
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews/${reviewToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                mutate();
                setIsDeleteModalOpen(false);
                setReviewToDelete(null);
            } else {
                alert(result.message || 'Failed to delete review');
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <main className="mx-4 lg:mx-10 2xl:mx-20 pb-20">
            <BreadCrumbs />
            
            <div className="flex flex-col md:flex-row mt-8 justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 gap-6">
                <div>
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#8b5cf6] tracking-tight uppercase italic">Reviews & Testimonials</h2>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-[0.2em]">Collective Customer Feedback Ledger</p>
                </div>
            </div>

            <div className="my-8">
                <div className="relative w-full md:w-96">
                    <span className="icon-[solar--magnifer-linear] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reviewer, product..."
                        className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all shadow-sm font-medium text-sm"
                    />
                </div>
            </div>

            <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reviewer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rating</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commentary</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>

                    <tbody>
                        {isLoading ? (
                            [...new Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-gray-50">
                                    <td colSpan="6" className="px-6 py-8">
                                        <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto"></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredReviews.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center text-gray-400">
                                    <span className="icon-[solar--star-bold-duotone] w-12 h-12 mb-4 block mx-auto opacity-20" />
                                    No reviews yet.
                                </td>
                            </tr>
                        ) : (
                            filteredReviews.map((review) => (
                                <tr key={review.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                                     <td className="px-8 py-5">
                                         <div className="font-bold text-gray-900">{review.reviewer_name || 'Anonymous'}</div>
                                         <div className="text-[10px] text-primary font-black uppercase tracking-tight mt-1">{review.role || 'Verified Customer'}</div>
                                         <div className="text-[10px] text-gray-400 font-medium mt-0.5">{new Date(review.created_at).toLocaleDateString()}</div>
                                     </td>
                                     <td className="px-8 py-5">
                                         <div className="flex items-center gap-3">
                                             {review.product_id ? (
                                                 <>
                                                     {review.product?.image && (
                                                         <Image src={review.product.image} width={32} height={32} className="w-8 h-8 rounded-lg object-cover bg-gray-50 shadow-sm border border-black/5" alt={review.product.name} unoptimized={true} />
                                                     )}
                                                     <Link href={`/admin/products/edit/${review.product?.id}`} className="font-bold text-gray-700 hover:text-primary transition-colors line-clamp-1">
                                                         {review.product?.name || 'Unknown Product'}
                                                     </Link>
                                                 </>
                                             ) : (
                                                 <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                                                     <span className="icon-[solar--star-rainbow-bold-duotone] w-4 h-4" />
                                                     General Testimonial
                                                 </div>
                                             )}
                                         </div>
                                     </td>
                                     <td className="px-8 py-5 text-center">
                                         <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                             review.status === 'approved' 
                                             ? 'bg-green-50 text-green-600' 
                                             : 'bg-yellow-50 text-yellow-600'
                                         }`}>
                                             {review.status || 'pending'}
                                         </span>
                                     </td>
                                     <td className="px-8 py-5 text-center">
                                         <div className="flex items-center justify-center gap-1">
                                             <span className="font-bold text-gray-900">{review.rate}</span>
                                             <span className="icon-[solar--star-bold] text-yellow-400 w-4 h-4" />
                                         </div>
                                     </td>
                                     <td className="px-8 py-5">
                                         <div className="text-gray-600 line-clamp-2 max-w-xs italic font-medium">&quot;{review.review}&quot;</div>
                                     </td>
                                     <td className="px-8 py-5 text-right">
                                         <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingReview({...review});
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Edit Review"
                                            >
                                                <span className="icon-[solar--pen-bold-duotone] w-5 h-5" />
                                            </button>
                                            {review.status !== 'approved' && (
                                                <button 
                                                    onClick={() => handleApprove(review.id)}
                                                    className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Approve Review"
                                                >
                                                    <span className="icon-[fluent--checkmark-16-filled] w-5 h-5" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    setReviewToDelete(review);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Delete Review"
                                            >
                                                <span className="icon-[solar--trash-bin-trash-bold-duotone] w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            </section>

            {/* Edit Modal */}
            {isEditModalOpen && editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-black/5 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Edit Review</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Refine Customer Feedback</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-colors shadow-sm ring-1 ring-black/5">
                                <span className="icon-[solar--close-circle-bold] w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Assigned Product</label>
                                <select 
                                    value={editingReview.product_id || ''}
                                    onChange={(e) => setEditingReview({...editingReview, product_id: e.target.value === '' ? null : parseInt(e.target.value)})}
                                    className="w-full bg-gray-50 p-4 rounded-2xl border border-black/5 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-gray-800"
                                >
                                    <option value="">General Testimonial (No Product)</option>
                                    {(products || []).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reviewer Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={editingReview.reviewer_name || ''}
                                        onChange={(e) => setEditingReview({...editingReview, reviewer_name: e.target.value})}
                                        className="w-full bg-gray-50 p-4 rounded-2xl border border-black/5 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-gray-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Role / Tag</label>
                                    <input 
                                        type="text" 
                                        value={editingReview.role || ''}
                                        onChange={(e) => setEditingReview({...editingReview, role: e.target.value})}
                                        placeholder="e.g. Verified Buyer"
                                        className="w-full bg-gray-50 p-4 rounded-2xl border border-black/5 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-gray-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map((star) => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setEditingReview({...editingReview, rate: star})}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                editingReview.rate >= star ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-gray-50 text-gray-300'
                                            }`}
                                        >
                                            <span className="icon-[solar--star-bold] w-6 h-6" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Review Content</label>
                                <textarea 
                                    required
                                    rows="4"
                                    value={editingReview.review || ''}
                                    onChange={(e) => setEditingReview({...editingReview, review: e.target.value})}
                                    className="w-full bg-gray-50 p-4 rounded-2xl border border-black/5 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all font-medium text-gray-800 italic"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Discard Changes
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? 'Saving Changes...' : 'Save Updates'}
                                    {!isSaving && <span className="icon-[solar--check-read-linear] w-5 h-5" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && reviewToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
                                <span className="icon-[solar--trash-bin-trash-bold-duotone] w-12 h-12 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Delete Review?</h3>
                            <p className="text-gray-500 font-medium px-4">
                                You are about to remove <span className="text-gray-900 font-bold">{reviewToDelete.reviewer_name}&apos;s</span> feedback. This action is permanent and cannot be undone.
                            </p>
                        </div>
                        
                        <div className="p-8 bg-gray-50/50 flex gap-4 border-t border-gray-100">
                            <button 
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setReviewToDelete(null);
                                }}
                                className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-2xl border border-gray-100 shadow-sm outline-none"
                            >
                                Not Now
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? 'Removing...' : 'Yes, Delete'}
                                {!isDeleting && <span className="icon-[solar--trash-bin-2-linear] w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
