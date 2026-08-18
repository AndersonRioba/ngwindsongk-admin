'use client'

import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useContext } from "react"
import { CreateProductContext } from "@/app/lib/providers/CreateProductProvider"
import SeoPanel from "@/app/UI/SeoPanel"
import { getImageUrl } from "@/app/lib/utils/image"

export default function SeoPage() {
    const { action } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    const {
        Product,
        Description,
        Media,
        ExistingMedia,
        SeoState
    } = useContext(CreateProductContext);

    const [seoData, setSeoData] = SeoState || [{
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        canonical_url: '',
        noindex: false
    }, () => {}];

    const featuredImage = (ExistingMedia && ExistingMedia[0] && ExistingMedia[0][0])
        ? getImageUrl(ExistingMedia[0][0].url)
        : (Media && Media[0] && Media[0][0])
        ? URL.createObjectURL(Media[0][0])
        : '';

    const handleSeoChange = (field, val) => {
        setSeoData(prev => ({
            ...prev,
            [field]: val
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        router.push(
            `/admin/products/${action}/preview${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}`
        );
    };

    return (
        <div className="space-y-8">
            <SeoPanel
                contentType="product"
                slug={Product[0] ? Product[0].toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : ''}
                title={Product[0] || ''}
                excerpt={Description[0] || ''}
                featuredImage={featuredImage}
                seoData={seoData}
                onChange={handleSeoChange}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
                <Link
                    href={`/admin/products/${action}/FAQs${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}`}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                    <span className="icon-[fluent--arrow-left-16-filled] w-4 h-4" />
                    Back
                </Link>
                <button
                    onClick={submit}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    Continue to Publishing
                    <span className="icon-[fluent--arrow-right-16-filled] w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
