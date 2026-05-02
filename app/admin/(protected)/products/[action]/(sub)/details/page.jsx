'use client'

import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useContext, useState, useEffect } from "react"
import Image from "next/image"
import { CreateProductContext } from "@/app/lib/providers/CreateProductProvider"
import dynamic from 'next/dynamic'
const Editor = dynamic(() => import("@/app/UI/WYSIWYG/Editor"), { ssr: false })
import FileInput from "@/app/UI/FileInput";
import { postFetcher, postFileFetcher, fetcher } from "@/app/lib/data";

export default function DetailsPage(){
    const {action} = useParams();
    const { Details, CarouselMedia, ExistingMedia, loadProduct } = useContext(CreateProductContext);
    let [details, setDetails] = Details;
    let [media, setMedia] = CarouselMedia;
    let [existingMedia, setExistingMedia] = ExistingMedia;
    let [files, setFiles] = useState([]);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const router = useRouter();

    useEffect(()=>{
        if(action === 'edit'){
            const ident = id || name;
            if(ident && typeof loadProduct === 'function'){
                loadProduct(ident).catch(e=>console.error('loadProduct failed', e));
            }
        }
    },[action,id,name,loadProduct])

    useEffect(()=>{
        setMedia(files);
    }, [files, setMedia]);

    const submit = async (e) => {
        e.preventDefault();
        router.push(`/admin/products/${action}/FAQs${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}`);
    };

    return(
        <div className="space-y-8">
            {/* About Product Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border">
                <h5 className="text-xl font-semibold mb-6 text-gray-800">About Product</h5>
                <Editor 
                    content={details} 
                    setContent={setDetails} 
                    placeholder="Write detailed information about your product..."
                    className={'min-h-96 border border-gray-300 rounded-lg'}
                />
            </section>

            {/* Carousel Media Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border">
                <h5 className="text-xl font-semibold mb-6 text-gray-800">Carousel Media</h5>
                <p className="text-gray-600 text-sm mb-4">Add additional images for product carousel</p>
                
                {/* Existing Media */}
                {existingMedia && existingMedia.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {existingMedia.map((file, index) => (
                            <div key={file.id} className="relative group">
                                <Image 
                                    src={file.url} 
                                    alt="Existing" 
                                    width={300}
                                    height={160}
                                    className="w-full h-40 object-cover rounded-lg border border-primary/50"
                                    unoptimized={true}
                                />
                                <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">Existing</div>
                                <button 
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setExistingMedia(existingMedia.filter(m => m.id !== file.id));
                                    }}
                                >
                                    <span className="icon-[fluent--dismiss-16-filled] w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* New Media */}
                {media.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {media.map((file, index) => (
                            <div key={index} className="relative group">
                                <Image 
                                    src={URL.createObjectURL(file)} 
                                    alt="New" 
                                    width={300}
                                    height={160}
                                    className="w-full h-40 object-cover rounded-lg border border-green-500/50"
                                    unoptimized={true}
                                />
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">New</div>
                                <button 
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFiles(files.filter((_, i) => i !== index));
                                        setMedia(media.filter((_, i) => i !== index));
                                    }}
                                >
                                    <span className="icon-[fluent--dismiss-16-filled] w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="w-full max-w-md">
                    <FileInput files={files} setFiles={setFiles} type={'image'}/>
                </div>
            </section>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <Link 
                    href={`/admin/products/${action}/info${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}`} 
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                    <span className="icon-[fluent--arrow-left-16-filled] w-4 h-4" />
                    Back
                </Link>
                <button 
                    onClick={submit}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    Continue to FAQs
                    <span className="icon-[fluent--arrow-right-16-filled] w-4 h-4" />
                </button>
            </div>
        </div>
    )
}