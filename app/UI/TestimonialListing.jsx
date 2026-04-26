'use client'
import Link from "next/link";

export function TestimonialListingSkeleton(){
    return(
        <div className="animate-pulse space-x-4 shadow-lg rounded-md bg-white p-4">
            <div className="flex items-center gap-4 mb-4">
                <div className="bg-slate-300 h-12 w-12 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-2 w-1/3 bg-slate-300 rounded"></div>
                    <div className="h-2 w-1/4 bg-slate-300 rounded"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-2 w-full bg-slate-300 rounded"></div>
                <div className="h-2 w-5/6 bg-slate-300 rounded"></div>
            </div>
        </div>
    )
}

export default function TestimonialListing({data, onDelete}){
    const activeColor = data.is_active ? 'text-Success bg-green-50' : 'text-Error bg-red-50';
    
    return(
        <div className="relative shadow-lg pb-4 bg-white rounded-2xl overflow-hidden border border-gray-100 group p-6">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-md">
                        {data.name[0]}
                    </div>
                    <div>
                        <h4 className="font-bold text-black text-lg truncate max-w-[150px]">{data.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{data.role || 'Customer'}</p>
                    </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${activeColor}`}>
                    {data.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
            
            <div className="flex text-yellow-400 mb-4 space-x-0.5">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3.5 h-3.5 fill-current ${i < (data.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>

            <p className="text-sm text-gray-600 line-clamp-3 mb-6 min-h-[60px]">
                &quot;{data.comment}&quot;
            </p>

            <div className="flex gap-2 pt-4 border-t border-gray-50">
                <Link href={`/admin/testimonials/edit/${data.id}`} className="flex-1 text-center py-2.5 text-xs font-bold rounded-xl bg-gray-50 text-gray-600 hover:bg-primary hover:text-white transition-all">
                    Edit
                </Link>
                <button 
                    onClick={() => onDelete && onDelete(data.id)}
                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                    <span className="icon-[tdesign--delete] w-4 h-4"/>
                </button>
            </div>

        </div>
    )
}
