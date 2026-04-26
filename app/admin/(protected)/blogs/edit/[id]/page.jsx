'use client'
import BlogForm from "../../BlogForm"
import BreadCrumbs from "@/app/UI/BreadCrumbs"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import { useParams } from "next/navigation"

export default function EditBlogPage() {
    const { id } = useParams();
    const { data: blogData, error, isLoading } = useSWR(id ? [`/admin/blogs/${id}`, {}] : null, fetcher);
    
    // Fallback: search by slug if ID not found directly, or the API might return it under 'blog'
    const blog = blogData?.blog || blogData?.data || null;

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <span className="icon-[tabler--loader-2] animate-spin w-10 h-10 text-primary" />
        </div>
    );

    if (error || (!isLoading && !blog)) return (
        <div className="bg-red-50 text-red-500 p-8 rounded-xl text-center border border-red-100 mx-10 mt-10">
            <span className="icon-[material-symbols--error-outline] w-12 h-12 mb-4 mx-auto block" />
            <p className="font-bold">Error loading blog post</p>
            <p className="text-sm opacity-80">{error?.message || 'Blog not found'}</p>
        </div>
    );

    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20">
            <BreadCrumbs />
            
            <div className="my-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#8b5cf6]">Edit Blog Post</h2>
                <p className="text-sm text-gray-400 mt-1">Refine your story</p>
            </div>

            <BlogForm initialData={blog} isEdit={true} />
        </main>
    )
}
