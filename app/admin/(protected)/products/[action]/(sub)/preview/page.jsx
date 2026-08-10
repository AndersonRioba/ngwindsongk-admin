
'use client'

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useContext, useEffect } from "react";
import Image from "next/image";
import { CreateProductContext } from "@/app/lib/providers/CreateProductProvider";
import { Question } from "../FAQs/page";
import { postFile, postData, putData } from "@/app/lib/data";
import { popupE } from "@/app/lib/trigger";
import Overlay from "@/app/UI/Overlay";
import { getImageUrl } from "@/app/lib/utils/image";

export function DetailsSection() {
    const { Details, CarouselMedia, ExistingMedia } = useContext(CreateProductContext);
    let [details, _] = Details;

    return (
        <section id="details" className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Product Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: details }}
                    />
                </div>
                <div className="flex flex-wrap gap-2 justify-center items-start">
                    {ExistingMedia?.[0]?.length > 0 && ExistingMedia[0].map((media, i) => (
                        <Image key={`ext-${i}`} width={128} height={96} className="max-h-24 max-w-32 rounded-lg border border-primary/50 object-cover" src={getImageUrl(media.url)} alt="" unoptimized={true} />
                    ))}
                    {CarouselMedia[0].length > 0 && CarouselMedia[0].map((media, i) => (
                        <Image key={`new-${i}`} width={128} height={96} className="max-h-24 max-w-32 rounded-lg border border-green-500/50 object-cover" src={URL.createObjectURL(media)} alt="" unoptimized={true} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export function Faqs() {
    const { FAQ } = useContext(CreateProductContext);
    let [faqs, _] = FAQ;

    return (
        <section id="faqs" className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Frequently Asked Questions</h3>
            {faqs.length > 0 ? (
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <Question key={i} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">No FAQs added</p>
            )}
        </section>
    )
}

export default function PublishPage() {
    const { Category, Brand, Product, Price, AlternatePrice, Perks, Description, Variations, FAQ, Media, Details, CarouselMedia, ExistingMedia, Attributes, Stock, IsPublished, ProductVariations, StatusState, ShowAdsState } = useContext(CreateProductContext);
    const { action } = useParams();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const [isPublished, setIsPublished] = IsPublished || [false, () => { }];
    const [mainImage, setMainImage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [overlay, setOverlay] = useState(''); // State for modal

    // State for selected variation specs
    const [specs, setSpecs] = useState({});

    // Helper to find the matching variation based on current specs
    const selectedVariation = (ProductVariations[0] || []).find(v =>
        specs[v.attribute_name] === v.attribute_value
    );

    // Dynamic price and discount display
    const displayPrice = selectedVariation?.price ?? Price[0];
    const displayDiscount = selectedVariation?.discount ?? AlternatePrice[0];

    useEffect(() => {
        if (ExistingMedia?.[0]?.length > 0) {
            const primary = ExistingMedia[0].find(m => m.is_primary) || ExistingMedia[0][0];
            setMainImage(primary.url);
        } else if (Media[0].length > 0) {
            setMainImage(URL.createObjectURL(Media[0][0]));
        }
    }, [ExistingMedia, Media])

    const submit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                faqs: FAQ[0],
                attributes: Attributes[0],
                category: Category[0],
                brand: Brand[0],
                name: Product[0],
                about: Description[0],
                price: Price[0],
                discount: AlternatePrice[0] ? parseFloat(AlternatePrice[0]) : 0.0,
                stock: Stock[0] || 0,
                status: StatusState ? StatusState[0] : 'active',
                is_promoted: ShowAdsState ? ShowAdsState[0] : false,
            };

            // Step 1: Save the product (create or update), capture the productId synchronously
            let capturedProductId = null;
            const callback = (res) => {
                capturedProductId = res?.product ? res.product.id : res?.id;
            };

            if (action === 'edit' && id) {
                await putData(callback, payload, `/products/${id}`);
            } else {
                await postData(callback, payload, `/products`);
            }

            const productId = capturedProductId;
            if (!productId) {
                // putData/postData already showed the error popup
                return;
            }

            // Step 2: Upload description text
            if (Details && Details[0]) {
                await postData(() => {}, { product_id: productId, description: Details[0] }, '/descriptions');
            }

            // Step 3: Upload media files
            let allMedia = [...(Media && Media[0] ? Media[0] : []), ...(CarouselMedia && CarouselMedia[0] ? CarouselMedia[0] : [])];
            let keptMediaIds = (ExistingMedia && ExistingMedia[0] ? ExistingMedia[0] : []).map(m => m.id);
            console.log('[Preview] allMedia count:', allMedia.length, '| keptMediaIds:', keptMediaIds, '| action:', action);

            const hasNewMedia = allMedia.length > 0;
            const hasExistingMediaToPreserve = action === 'edit' && keptMediaIds.length > 0;
            if (hasNewMedia || hasExistingMediaToPreserve) {
                console.log('[Preview] Uploading media files...');
                try {
                    await postFile(() => {}, allMedia, 'media', { product_id: productId, kept_media_ids: JSON.stringify(keptMediaIds) }, '/product-images');
                    console.log('[Preview] Media upload complete.');
                } catch (mediaErr) {
                    console.error('[Preview] Media upload failed:', mediaErr);
                }
            }

            // Step 4: Revalidate the shop cache so image changes are immediately visible
            try {
                const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'http://localhost:3000';
                const revalSecret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'super_secure_revalidation_secret_token_2026';
                await fetch(`${shopUrl}/api/revalidate?secret=${revalSecret}`, { method: 'POST' });
            } catch (_) { /* non-critical */ }

            setIsPublished(true);
            popupE('Hide', '');
            setOverlay('success');
        } catch (error) {
            popupE('Error', error?.message || 'Failed to publish product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* Product Preview */}
            <section className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Product Preview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Media Gallery */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Thumbnail Navigation */}
                            {(ExistingMedia?.[0]?.length > 0 || Media[0].length >= 1) && (
                                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto">
                                    {ExistingMedia?.[0]?.map((media, i) => (
                                        <button
                                            key={`ext-${i}`}
                                            onClick={() => setMainImage(media.url)}
                                            className="flex-shrink-0 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
                                        >
                                            <Image
                                                className="w-16 h-16 object-cover rounded"
                                                src={getImageUrl(media.url)}
                                                alt=""
                                                width={64}
                                                height={64}
                                                unoptimized={true}
                                            />
                                        </button>
                                    ))}
                                    {Media[0].map((media, i) => (
                                        <button
                                            key={`new-${i}`}
                                            onClick={() => setMainImage(URL.createObjectURL(media))}
                                            className="flex-shrink-0 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
                                        >
                                            <Image
                                                className="w-16 h-16 object-cover rounded"
                                                src={URL.createObjectURL(media)}
                                                alt=""
                                                width={64}
                                                height={64}
                                                unoptimized={true}
                                            />
                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Image */}
                            <div className="flex-1 flex justify-center">
                                {mainImage ? (
                                    <Image
                                        src={getImageUrl(mainImage)}
                                        width={600}
                                        height={400}
                                        className="max-w-full max-h-96 object-contain rounded-lg border"
                                        alt="Product preview"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 p-6 bg-gray-50">
                                        <span className="icon-[solar--gallery-minimalistic-linear] w-16 h-16 mb-2 text-gray-300" />
                                        <p className="text-sm font-medium">No image selected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{Product[0]}</h2>
                            <p className="text-gray-600">{Category[0]}, {Brand[0]}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">KSH {displayPrice}</span>
                            {Number(displayDiscount) > 0 && (
                                <span className="text-lg text-gray-400 line-through">KSH {Price[0]}</span>
                            )}
                        </div>

                        <p className="text-gray-700">{Description[0]}</p>

                        {Perks[0].length > 0 && (
                            <div className="space-y-2">
                                {Perks[0].map((perk, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="icon-[teenyicons--tick-circle-solid] text-green-500 w-5 h-5" />
                                        <span className="text-gray-700">{perk}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {Variations[0].length > 0 && (
                            <div className="space-y-3">
                                {Variations[0].map((option, i) => (
                                    <div key={i}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Choose {option.name}
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            value={specs[option.name] || ""}
                                            onChange={e => {
                                                const newSpecs = { ...specs, [option.name]: e.target.value };
                                                setSpecs(newSpecs);

                                                // If this variation has a specific image, switch to it
                                                const match = (ProductVariations[0] || []).find(v =>
                                                    v.attribute_name === option.name && v.attribute_value === e.target.value
                                                );
                                                if (match?.image) setMainImage(match.image);
                                            }}
                                        >
                                            <option value="">Select {option.name}</option>
                                            {option.options.map((category, i) => (
                                                <option key={i} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content Navigation */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="flex border-b border-gray-200">
                    <a
                        href="#details"
                        className="px-6 py-3 text-primary border-b-2 border-primary font-medium"
                    >
                        Details
                    </a>
                    <a
                        href="#faqs"
                        className="px-6 py-3 text-gray-600 hover:text-primary font-medium"
                    >
                        FAQs
                    </a>
                </div>
                <div className="p-6 space-y-6">
                    <DetailsSection />
                    <Faqs />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
                <Link
                    href={`/admin/products/${action}/FAQs${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}`}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                    <span className="icon-[fluent--arrow-left-16-filled] w-4 h-4" />
                    Back
                </Link>
                <button
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={submit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="icon-[fluent--spinner-ios-16-regular] w-4 h-4 animate-spin" />
                            Publishing...
                        </>
                    ) : (
                        <>
                            <span className="icon-[fluent--send-16-filled] w-4 h-4" />
                            Publish Product
                        </>
                    )}
                </button>
            </div>

            {/* Success Modal */}
            <Overlay
                id="success-modal"
                control={setOverlay}
                className={overlay === 'success' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            >
                <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-lg shadow-green-500/10">
                        <span className="icon-[solar--check-circle-bold] w-14 h-14" />
                    </div>

                    <h3 className="text-3xl font-black text-gray-800 mb-2 tracking-tight">Success!</h3>
                    <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                        The product <span className="text-gray-800 font-bold">&quot;{Product[0]}&quot;</span> has been successfully {action === 'edit' ? 'updated' : 'published'} and is now live.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link
                            href="/admin/products"
                            className="bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            <span className="icon-[solar--box-bold] w-5 h-5" />
                            View All Products
                        </Link>
                        <button
                            onClick={() => setOverlay('')}
                            className="text-gray-400 font-bold py-2 hover:text-gray-600 transition-colors"
                        >
                            Return to Preview
                        </button>
                    </div>
                </div>
            </Overlay>
        </div>
    )
}