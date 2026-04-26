'use client'
import { useParams } from "next/navigation"
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import BreadCrumbs from "@/app/UI/BreadCrumbs"
import TestimonialForm from "../../TestimonialForm"
import Spinner from "@/app/UI/Spinner"

export default function EditTestimonialPage() {
    const { id } = useParams();
    const { data: testimonial, error, isLoading } = useSWR(`/admin/testimonials/${id}`, fetcher);

    if (isLoading) return <Spinner full={true} />;
    
    if (error || !testimonial) {
        return (
            <main className="mx-2 lg:mx-10 2xl:mx-20">
                <BreadCrumbs />
                <div className="bg-red-50 text-red-500 p-8 rounded-[2rem] text-center border border-red-100 mt-8">
                    <span className="icon-[material-symbols--error-outline] w-12 h-12 mb-4 mx-auto block" />
                    <p className="font-bold text-xl">Testimonial Not Found</p>
                    <p className="text-sm opacity-80 mt-2">The testimonial you&apos;re trying to edit doesn&apos;t exist or has been removed.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20">
            <BreadCrumbs />
            
            <div className="flex mt-8 justify-between items-center bg-white p-8 rounded-[2rem] shadow-xl shadow-black/[0.02] border border-gray-100 mb-8">
                <div>
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#8b5cf6] tracking-tighter">Edit Testimonial</h2>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Update the experience shared by {testimonial.name}</p>
                </div>
            </div>

            <TestimonialForm initialData={testimonial} isEdit={true} />
        </main>
    )
}
