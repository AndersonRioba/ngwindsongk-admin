'use client'
import Link from "next/link"
import { useState, useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import BlogListing, { BlogListingSkeleton } from "@/app/UI/BlogListing"
import Search from "@/app/UI/Search"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

export default function BlogsPage() {
    const [search, setSearch] = useState('');
    const [viewType, setViewType] = useState('grid');
    
    const { data: blogsData, error, isLoading, mutate } = useSWR(['/admin/blogs', {}], fetcher, {
        revalidateOnFocus: false,
        revalidateOnMount: true
    });

    const filteredBlogs = useMemo(() => {
        const blogs = blogsData?.blogs || [];
        if (!search) return blogs;
        return blogs.filter(b => 
            b.title.toLowerCase().includes(search.toLowerCase()) || 
            (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase()))
        );
    }, [blogsData, search]);

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this blog post?')) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });
                const result = await response.json();
                if (result.success) {
                    mutate(); // Refresh the list
                } else {
                    alert(result.message || 'Failed to delete blog');
                }
            } catch (err) {
                alert('An error occurred while deleting the blog');
            }
        }
    };

    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20">
            <BreadCrumbs />
            
            <div className="flex mt-8 justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#8b5cf6]">Blog Posts</h2>
                    <p className="text-sm text-gray-400 mt-1">Manage your stories and articles</p>
                </div>
                <Link href={'/admin/blogs/create'} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center hover:scale-105 transition-all shadow-lg shadow-primary/20">
                    <span className="icon-[rivet-icons--plus] w-5 h-5 mr-2" />
                    Create New Blog
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between md:items-center my-8 gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-full md:w-80"><Search search={search} setSearch={setSearch} /></div>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-100">
                    <button 
                        onClick={() => setViewType('grid')}
                        className={`p-2 rounded-md transition-all ${viewType === 'grid' ? 'bg-primary/10 text-primary shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <span className="icon-[fluent--table-simple-24-filled] w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => setViewType('table')}
                        className={`p-2 rounded-md transition-all ${viewType === 'table' ? 'bg-primary/10 text-primary shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <span className="icon-[lucide--table-of-contents] w-6 h-6" />
                    </button>
                </div>
            </div>

            <section className="mb-20">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...new Array(8)].map((_, i) => <BlogListingSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-8 rounded-xl text-center border border-red-100">
                        <span className="icon-[material-symbols--error-outline] w-12 h-12 mb-4 mx-auto block" />
                        <p className="font-bold">Error loading blogs</p>
                        <p className="text-sm opacity-80">{error.message || 'Please try again later'}</p>
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="bg-white p-20 rounded-xl text-center border border-dashed border-gray-200">
                        <span className="icon-[mdi--post-outline] text-gray-200 w-24 h-24 mb-4 mx-auto block" />
                        <h3 className="text-xl font-bold text-gray-400">No Blogs Found</h3>
                        <p className="text-gray-400 text-sm">Create your first blog post to get started!</p>
                    </div>
                ) : (
                    <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                        {filteredBlogs.map((blog) => (
                            <BlogListing 
                                key={blog.id} 
                                data={blog} 
                                onDelete={handleDelete}
                                viewType={viewType}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
