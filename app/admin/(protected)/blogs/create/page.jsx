'use client'
import BlogForm from "../BlogForm"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

export default function CreateBlogPage() {
    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20">
            <BreadCrumbs />
            
            <div className="my-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#8b5cf6]">Create New Blog Post</h2>
                <p className="text-sm text-gray-400 mt-1">Share your thoughts with the world</p>
            </div>

            <BlogForm />
        </main>
    )
}
