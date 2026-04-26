'use client'

import Link from "next/link"
import { usePathname, useParams, useSearchParams } from "next/navigation"
import { useContext, useState, useEffect } from "react"
import { CreateProductContext } from "@/app/lib/providers/CreateProductProvider"

export default function Navigation(){
    let path = usePathname().replaceAll('%20',' ');
    const { action } = useParams();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const { Category, Brand, Product, Price, Media, Details, FAQ, IsPublished } = useContext(CreateProductContext);
    const [isPublished, setIsPublished] = IsPublished || [false, () => {}];
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        if (isPublished) {
            setShowBanner(true);
            const timer = setTimeout(() => setShowBanner(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isPublished]);
    
    const paths = [
        {
            link: '/info',
            name: 'Basic Information',
            icon: 'icon-[fluent--info-16-regular]',
            activeIcon: 'icon-[fluent--info-16-filled]',
            validate: () => Category[0] && Brand[0] && Product[0] && Price[0] && Media[0].length > 0
        },
        {
            link: '/details',
            name: 'Details',
            icon: 'icon-[fluent--document-text-16-regular]',
            activeIcon: 'icon-[fluent--document-text-16-filled]',
            validate: () => Details[0] && Details[0].trim().length > 0
        },
        {
            link: '/FAQs',
            name: 'FAQs',
            icon: 'icon-[fluent--question-circle-16-regular]',
            activeIcon: 'icon-[fluent--question-circle-16-filled]',
            validate: () => FAQ[0] && FAQ[0].length > 0
        },
        {
            link: '/preview',
            name: 'Publishing',
            icon: 'icon-[fluent--send-16-regular]',
            activeIcon: 'icon-[fluent--send-16-filled]',
            validate: () => isPublished // Mark as completed only after successful publish
        },
    ];

    const isEditMode = action && action !== 'create';

    const getStepStatus = (pathItem, index) => {
        const isCurrentPath = path.endsWith(pathItem.link);
        const isCompleted = pathItem.validate();
        const isAccessible = isEditMode || index === 0 || paths.slice(0, index).every(p => p.validate());

        if (isCurrentPath) return 'current';
        if (isCompleted) return 'completed';
        if (isAccessible) return 'accessible';
        return 'locked';
    };

    return (
        <div>
            {/* Success notification banner */}
            {showBanner && (
                <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-sm animate-pulse">
                    <span className="icon-[teenyicons--tick-circle-solid] w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Product Published!</p>
                        <p className="text-xs text-green-600">Your product is now live and visible to customers.</p>
                    </div>
                    <button onClick={() => setShowBanner(false)} className="text-green-500 hover:text-green-700">
                        <span className="icon-[fluent--dismiss-16-filled] w-4 h-4" />
                    </button>
                </div>
            )}
        <nav className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Product Setup</h3>
            <div className="space-y-4">
                {paths.map((p, i) => {
                    const status = getStepStatus(p, i);
                    const isCurrent = status === 'current';
                    const isCompleted = status === 'completed';
                    const isAccessible = status === 'accessible' || isCurrent || isCompleted;
                    
                    return (
                        <div key={i} className="relative">
                            {/* Progress line */}
                             {i < paths.length - 1 && (
                                 <div className={`absolute left-9 top-14 w-0.5 h-6 ${
                                     isCompleted ? 'bg-green-200' : 'bg-gray-100'
                                 }`} />
                             )}
                            
                            <Link 
                                href={isAccessible ? `/admin/products/${action || 'create'}${p.link}${id ? `?id=${id}${name ? `&name=${name}` : ''}` : ''}` : '#'} 
                                className={`flex items-center p-3 rounded-xl transition-all duration-300 shadow-sm ${
                                    isCurrent 
                                        ? 'bg-primary/5 text-primary ring-1 ring-primary/20 shadow-md' 
                                        : isCompleted 
                                        ? 'bg-green-50 text-green-700 hover:shadow-md hover:bg-green-100' 
                                        : isAccessible 
                                        ? 'hover:bg-white hover:shadow-md text-gray-700 border border-transparent hover:border-gray-100' 
                                        : 'text-gray-400 cursor-not-allowed opacity-60'
                                }`}
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4 transition-all duration-200">
                                    {isCompleted ? (
                                        <span className="w-6 h-6 icon-[teenyicons--tick-circle-solid] text-green-500" />
                                    ) : isCurrent ? (
                                        <span className={`w-6 h-6 ${p.activeIcon} text-primary`} />
                                    ) : (
                                        <span className={`w-6 h-6 ${p.icon} ${isAccessible ? 'text-gray-600' : 'text-gray-400'}`} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                                        {p.name}
                                    </p>
                                    {isCompleted && (
                                        <p className="text-xs text-green-600 mt-1">✓ Completed</p>
                                    )}
                                    {isCurrent && (
                                        <p className="text-xs text-primary mt-1">Current step</p>
                                    )}
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
            
            {/* Progress summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className="text-sm font-semibold text-primary">
                        {paths.filter(p => p.validate()).length}/{paths.length} steps
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${(paths.filter(p => p.validate()).length / paths.length) * 100}%` 
                        }}
                    />
                </div>
            </div>
        </nav>
        </div>
    )
}