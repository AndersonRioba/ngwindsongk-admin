'use client'
import Link from "next/link";
import Image from "next/image";

export function BlogListingSkeleton(){
    return(
        <div className="animate-pulse space-x-4 shadow-lg rounded-md">
            <div className="bg-slate-300 h-44 w-full"></div>
            <div className="flex-1 space-y-6 py-5 px-4">
                <div className="h-2 w-1/3 bg-slate-300 rounded"></div>
                <div className="h-2 w-2/3 bg-slate-300 rounded"></div>
                <div className="h-2 w-1/4 bg-slate-300 rounded"></div>
            </div>
        </div>
    )
}

export default function BlogListing({data, onDelete}){
    const statusColor = data.status === 'published' ? 'text-Success bg-green-50' : 'text-Warning bg-yellow-50';
    
    return(
        <div className="relative shadow-lg pb-4 bg-white rounded-lg overflow-hidden border border-gray-100 group">
            <Link href={`/admin/blogs/edit/${data.id}`} className="bg-slate-50 w-full h-48 flex items-center justify-center overflow-hidden">
                {data.featured_image ? (
                    <Image className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={data.featured_image} alt={data.title} width={400} height={200} unoptimized={true} />
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <span className="icon-[mdi--image-outline] w-12 h-12 mb-2"/>
                        <span className="text-xs italic">No Image</span>
                    </div>
                )}
            </Link>
            
            <div className="mx-4 mt-4">
                <div className="flex mb-3 justify-between items-center">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${statusColor}`}>
                        {data.status}
                    </span>
                    <p className="text-xs text-gray-500">{new Date(data.created_at).toLocaleDateString()}</p>
                </div>
                
                <Link href={`/admin/blogs/edit/${data.id}`} className="block mb-2 text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                    {data.title}
                </Link>
                
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">
                    {data.excerpt || "No excerpt provided."}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1 text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <span className="icon-[mdi--comment-outline] w-3 h-3"/>
                        {data.comments_count || 0} comments
                    </div>
                    {data.youtube_url && (
                        <div className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded">
                            <span className="icon-[mdi--youtube] w-3 h-3"/>
                            Video
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <Link href={`/admin/blogs/edit/${data.id}`} className="flex-1 text-center py-2 text-xs font-bold rounded-md bg-gray-100 hover:bg-primary hover:text-white transition-all">
                        Edit
                    </Link>
                    <button 
                        onClick={() => onDelete && onDelete(data.id)}
                        className="px-3 py-2 text-xs font-bold rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                        <span className="icon-[tdesign--delete] w-4 h-4"/>
                    </button>
                </div>
            </div>
        </div>
    )
}
