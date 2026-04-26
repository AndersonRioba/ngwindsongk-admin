'use client'
import { useState, useMemo } from "react"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

export default function CommentModerationPage() {
    const [search, setSearch] = useState('');
    const { data: commentsData, error, isLoading, mutate } = useSWR(['/admin/comments', {}], fetcher);
    
    const filteredComments = useMemo(() => {
        const comments = commentsData?.comments || [];
        if (!search) return comments;
        return comments.filter(c => 
            c.comment.toLowerCase().includes(search.toLowerCase()) || 
            (c.user?.name && c.user.name.toLowerCase().includes(search.toLowerCase())) ||
            (c.blog?.title && c.blog.title.toLowerCase().includes(search.toLowerCase()))
        );
    }, [commentsData, search]);

    const handleApprove = async (id) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/comments/${id}/approve`, {
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
                alert(result.message || 'Failed to update comment');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/comments/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });
                const result = await response.json();
                if (result.success) {
                    mutate();
                } else {
                    alert(result.message || 'Failed to delete comment');
                }
            } catch (err) {
                alert('An error occurred');
            }
        }
    };

    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20">
            <BreadCrumbs />
            
            <div className="flex mt-8 justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#8b5cf6]">Comment Moderation</h2>
                    <p className="text-sm text-gray-400 mt-1">Manage feedback on your blog posts</p>
                </div>
            </div>

            <div className="my-8">
                <div className="relative w-full md:w-96">
                    <span className="icon-[solar--magnifer-linear] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search comments, users, or blogs..."
                        className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                    />
                </div>
            </div>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-20">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Comment</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Blog Post</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            [...new Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-gray-50">
                                    <td colSpan="5" className="px-6 py-8">
                                        <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto"></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredComments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center text-gray-400">
                                    <span className="icon-[mdi--comment-off-outline] w-12 h-12 mb-4 block mx-auto opacity-20" />
                                    No comments found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredComments.map((comment) => (
                                <tr key={comment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm text-gray-700">{comment.user?.name || 'Unknown User'}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 line-clamp-2 max-w-md">{comment.comment}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/blogs/edit/${comment.blog?.id}`} className="text-xs font-bold text-primary hover:underline line-clamp-1">
                                            {comment.blog?.title || 'Unknown Blog'}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${comment.is_approved ? 'bg-green-50 text-green-500' : 'bg-yellow-50 text-yellow-500'}`}>
                                            {comment.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleApprove(comment.id)}
                                                className={`p-2 rounded-lg transition-all ${comment.is_approved ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                                title={comment.is_approved ? 'Unapprove' : 'Approve'}
                                            >
                                                <span className={comment.is_approved ? "icon-[tabler--x]" : "icon-[tabler--check]"} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                title="Delete"
                                            >
                                                <span className="icon-[tdesign--delete]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </main>
    )
}
