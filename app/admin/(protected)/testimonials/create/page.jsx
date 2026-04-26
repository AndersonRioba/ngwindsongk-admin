'use client'
import BreadCrumbs from "@/app/UI/BreadCrumbs"
import TestimonialForm from "../TestimonialForm"

export default function CreateTestimonialPage() {
    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20">
            <BreadCrumbs />
            
            <div className="flex mt-8 justify-between items-center bg-white p-8 rounded-[2rem] shadow-xl shadow-black/[0.02] border border-gray-100 mb-8">
                <div>
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#8b5cf6] tracking-tighter">Add Testimonial</h2>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Create a new curated customer experience</p>
                </div>
            </div>

            <TestimonialForm />
        </main>
    )
}
