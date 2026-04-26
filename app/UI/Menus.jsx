'use client'
import { useEffect, useState } from "react";
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation";
import Logo from "@/app/UI/Logo";
import { hide, show} from "@/app/lib/controlls";
import useAuth from "@/app/hooks/useAuth";
import useSWR from "swr";
import { fetcher } from "@/app/lib/data";

export function MobileTopMenu(){
    return(
        <div className="block md:hidden">
            <div className="flex justify-between items-center px-3 py-3  mb-1">
                <Logo/>
                <div className="flex items-center gap-3">
                    <button className="relative">
                        <span className="icon-[octicon--bell-16] w-6 h-6"></span>
                        <div className="absolute -right-2 md:-right-3 bottom-0 md:-bottom-1 flex items-center justify-center rounded-full bg-primary text-white w-4 md:w-5 h-4 md:h-5 p-1 text-xs">{0}</div>
                    </button>
                    <button onClick={e=>show('mobile_side_menu')} className="icon-[solar--hamburger-menu-outline] w-8 h-8"/>
                </div>
            </div>
        </div>
    )
}

export function MobileSideMenu(){
    const {isLoading, user, logout, token } = useAuth();
    let pathname = usePathname();
    useEffect(()=>{
        hide('mobile_side_menu');
    },[pathname])

    return(
        <>
        <div id="mobile_side_menu" className="block fixed z-40 top-0 md:top-10 2xl:top-24 right-0 w-[60vw] translate-x-[60vw] md:w-[20vw] md:h-[80vh] md:overflow-y-scroll md:rounded-lg pt-4 h-[100vh] bg-gray-50 md:hidden px-2 md:px-4 md:large-scroll">
            <button onClick={e=>hide('mobile_side_menu')} className="w-full text-right pr-4 mt-2 absolute"><span className="icon-[material-symbols-light--close] w-8 h-8"/></button>
            <div className="my-12"></div>
            {
                token && !isLoading &&
                <div className="px-4 mb-4">
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 uppercase">{user?.role}</p>
                </div>
            } 
            <div>
                <Link href={'/admin/dashboard'} className={`flex items-center my-4 ${pathname==='/admin/dashboard'?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[carbon--dashboard] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Dashboard</span>
                </Link>
                <a target="blank" href={`${process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}/`} className={`flex items-center my-4 ${pathname==='/'?'text-primary-light':''} `}>
                    <div className="mx-3"><span className={`icon-[ic--baseline-shopify] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Shop</span>
                </a>
                <MobileBrandSubMenu pathname={pathname} />
                <Link href={'/admin/sales'} className={`flex items-center my-4 ${pathname==='/admin/sales'?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[carbon--sales-ops] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Sales</span>
                </Link>
                <Link href={'/admin/partners'} className={`flex items-center my-4 ${pathname==='/admin/partners'?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[solar--users-group-two-rounded-bold-duotone] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Partners</span>
                </Link>
                <Link href={'/admin/deliveries'} className={`flex items-center my-4 ${pathname==='/admin/deliveries'?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[mdi--delivery-dining] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Deliveries</span>
                </Link>
                <Link href={'/admin/users'} className={`flex items-center my-4 ${pathname==='/admin/users'?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[heroicons--users-16-solid] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Users</span>
                </Link>
                <Link href={'/admin/access-control'} className={`flex items-center my-4 ${pathname==='/admin/access-control'?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[solar--shield-keyhole-bold-duotone] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Access Control</span>
                </Link>
                <Link href={'/admin/inventory'} className={`flex items-center my-4 ${pathname==='/admin/inventory'?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[material-symbols--inventory-rounded] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Inventory</span>
                </Link>
                <Link href={'/admin/recipes'} className={`flex items-center my-4 ${pathname.includes('/admin/recipes')?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[arcticons--reciper] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Recipes</span>
                </Link>
                <Link href={'/admin/blogs'} className={`flex items-center my-4 ${pathname.includes('/admin/blogs')?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[mdi--post-outline] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Blogs</span>
                </Link>
                <Link href={'/admin/comments'} className={`flex items-center my-4 ${pathname.includes('/admin/comments')?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[mdi--comment-outline] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Comments</span>
                </Link>
                <Link href={'/admin/reviews'} className={`flex items-center my-4 ${pathname.includes('/admin/reviews')?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[solar--chat-dots-bold-duotone] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Testimonials</span>
                </Link>
                <Link href={'/admin/reviews'} className={`flex items-center my-4 ${pathname.includes('/admin/reviews')?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[solar--star-bold-duotone] w-8 h-8`}/></div>
                    <span className="truncate text-xs font-bold text-center">Reviews</span>
                </Link>
                <Link href={'/admin/brands'} className={`flex items-center my-4 ${pathname.includes('/admin/brands')?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[fluent--tag-24-regular] w-8 h-8`}/></div >
                    <span className="truncate text-xs font-bold text-center">Brands</span>
                </Link>
                <Link href={'/admin/vouchers'} className={`flex items-center my-4 ${pathname.includes('/admin/vouchers')?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[solar--ticket-sale-bold-duotone] w-8 h-8`}/></div >
                    <span className="truncate text-xs font-bold text-center">Vouchers</span>
                </Link>
                <Link href={'/admin/settings'} className={`flex items-center my-4 ${pathname.includes('/admin/settings')?'text-primary':''} `}>
                    <div className="mx-3"><span className={`icon-[carbon--settings] w-8 h-8`}/></div >
                    <span className="truncate text-xs font-bold text-center">Settings</span>
                </Link>
            </div>
            
            
            {
                (token && !isLoading) ?
                <div className="border-t-[1px] border-Grey p-2 w-full">
                    <button onClick={e=>logout()} className="text-Error font-semibold flex items-center mt-3"><span className="icon-[material-symbols-light--logout] w-7 h-7"/>Logout</button>
                </div>
                :
                <div className="flex justify-around border-t-[1px] border-Grey p-2 absolute md:relative md:bottom-0 bottom-20 w-full">
                    <Link href={'/login'} className="w-24  py-3 text-center rounded-lg font-semibold hover:scale-105 border-2 border-primary" >Log In</Link>
                </div>
                
            }
        </div>
        </>
    )
}

export function SidebarItem({href, icon, label, pathname, isExternal=false}){
    const active = isExternal ? false : pathname.includes(href);
    const content = (
        <div className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
            <span className={`${icon} w-6 h-6 transition-transform group-hover:scale-110 ${active ? 'text-primary' : ''}`} />
            <span className={`ml-3 text-sm font-bold truncate`}>{label}</span>
        </div>
    );

    if (isExternal) return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
    return <Link href={href}>{content}</Link>;
}

/** Collapsible Products accordion with per-brand sub-links */
function ProductsAccordion({ pathname }) {
    const searchParams = useSearchParams();
    const activeBrand = searchParams.get('brand') || '';
    const isProductsActive = pathname.includes('/admin/products');
    const [open, setOpen] = useState(isProductsActive);
    const { data: brandsData } = useSWR(['/brands', {}], fetcher, { revalidateOnFocus: false });
    const brands = (Array.isArray(brandsData) ? brandsData : brandsData?.data || []).filter(b => b.is_active !== false);

    // Auto-open when navigating into products
    useEffect(() => { if (isProductsActive) setOpen(true); }, [isProductsActive]);

    return (
        <div>
            {/* Parent row */}
            <div
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
                    ${isProductsActive ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                onClick={() => setOpen(o => !o)}
            >
                <div className="flex items-center gap-3">
                    <span className={`icon-[material-symbols--production-quantity-limits-sharp] w-6 h-6 transition-transform group-hover:scale-110 ${isProductsActive ? 'text-primary' : ''}`} />
                    <span className="text-sm font-bold">Products</span>
                </div>
                <span className={`icon-[fluent--chevron-right-16-filled] w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
            </div>

            {/* Sub-links */}
            {open && (
                <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-primary/20 pl-3">
                    {/* All Products */}
                    <Link
                        href="/admin/products"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all
                            ${isProductsActive && !activeBrand ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                    >
                        <span className="icon-[fluent--grid-24-regular] w-4 h-4" />
                        All Products
                    </Link>

                    {/* Per-brand links */}
                    {brands.map(brand => (
                        <Link
                            key={brand.id}
                            href={`/admin/products?brand=${encodeURIComponent(brand.name)}`}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all
                                ${activeBrand === brand.name ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                            <span className="icon-[fluent--tag-16-regular] w-4 h-4" />
                            {brand.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

/** Mobile version — simpler, inline brand links */
function MobileBrandSubMenu({ pathname }) {
    const searchParams = useSearchParams();
    const activeBrand = searchParams.get('brand') || '';
    const isProductsActive = pathname.includes('/admin/products');
    const [open, setOpen] = useState(isProductsActive);
    const { data: brandsData } = useSWR(['/brands', {}], fetcher, { revalidateOnFocus: false });
    const brands = (Array.isArray(brandsData) ? brandsData : brandsData?.data || []).filter(b => b.is_active !== false);

    return (
        <div className="my-2">
            <div
                className={`flex items-center justify-between my-2 ${isProductsActive ? 'text-primary' : ''}`}
                onClick={() => setOpen(o => !o)}
            >
                <div className="flex items-center">
                    <div className="mx-3"><span className="icon-[material-symbols--production-quantity-limits-sharp] w-8 h-8"/></div>
                    <span className="truncate text-xs font-bold">Products</span>
                </div>
                <span className={`icon-[fluent--chevron-right-16-filled] w-4 h-4 mr-2 transition-transform ${open ? 'rotate-90' : ''}`} />
            </div>
            {open && (
                <div className="ml-14 space-y-1 border-l-2 border-primary/20 pl-3">
                    <Link href="/admin/products" className={`block text-xs font-bold py-1.5 ${isProductsActive && !activeBrand ? 'text-primary' : 'text-gray-500'}`}>All Products</Link>
                    {brands.map(brand => (
                        <Link key={brand.id} href={`/admin/products?brand=${encodeURIComponent(brand.name)}`}
                            className={`block text-xs font-bold py-1.5 ${activeBrand === brand.name ? 'text-primary' : 'text-gray-500'}`}>
                            {brand.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export function DesktopSidebar(){
    const pathname = usePathname();
    const {isLoading, user, token } = useAuth();

    if (!token || isLoading) return null;

    const navItems = [
        { href: '/admin/sales', icon: 'icon-[carbon--sales-ops]', label: 'Sales' },
        { href: '/admin/partners', icon: 'icon-[solar--users-group-two-rounded-bold-duotone]', label: 'Partners' },
        { href: '/admin/brands', icon: 'icon-[fluent--tag-24-regular]', label: 'Brands' },
        { href: '/admin/vouchers', icon: 'icon-[solar--ticket-sale-bold-duotone]', label: 'Vouchers' },
        { href: '/admin/navigation', icon: 'icon-[material-symbols--map-outline]', label: 'Navigation' },
        { href: '/admin/recipes', icon: 'icon-[arcticons--reciper]', label: 'Recipes' },
        { href: '/admin/blogs', icon: 'icon-[mdi--post-outline]', label: 'Blogs' },
        { href: '/admin/comments', icon: 'icon-[mdi--comment-outline]', label: 'Comments' },
        { href: '/admin/reviews', icon: 'icon-[solar--chat-dots-bold-duotone]', label: 'Testimonials' },
        { href: '/admin/reviews', icon: 'icon-[solar--star-bold-duotone]', label: 'Reviews' },
        { href: '/admin/users', icon: 'icon-[heroicons--users-16-solid]', label: 'Users' },
        { href: '/admin/access-control', icon: 'icon-[solar--shield-keyhole-bold-duotone]', label: 'Access Control' },
        { href: '/admin/inventory', icon: 'icon-[material-symbols--inventory-rounded]', label: 'Inventory' },
        { href: '/admin/settings', icon: 'icon-[carbon--settings]', label: 'Settings' },
    ];

    return (
        <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r flex-col z-40 pt-28">
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto large-scroll">
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-4 mb-4">Catalog &amp; Content</div>
                {/* Products accordion with brand sub-links */}
                <ProductsAccordion pathname={pathname} />
                {navItems.map((item) => (
                    <SidebarItem key={item.href+item.label} {...item} pathname={pathname} />
                ))}
            </div>
            
            <div className="p-4 border-t">
                <a target="_blank" href={`${process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}/`} className="flex items-center px-4 py-3 text-gray-500 hover:text-primary transition-colors font-bold text-sm bg-gray-50 rounded-xl group">
                    <span className="icon-[ic--baseline-shopify] w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    View Live Shop
                </a>
            </div>
        </aside>
    )
}

export function TopMenu(){
    let pathname = usePathname();
    const {isLoading, user, logout, token } = useAuth();
    
    return(
        <div className="hidden md:block bg-white/80 backdrop-blur-md z-50 py-4 px-8 fixed w-full top-0 border-b">
            <div className="flex justify-between items-center max-w-[1700px] mx-auto">
                <div className="flex items-center gap-12">
                    <Logo/>
                    <div className="flex gap-8">
                        <Link className={`${pathname==='/admin/dashboard'?'text-primary font-bold':'text-gray-600 font-semibold hover:text-primary'} transition-colors`} href="/admin/dashboard">Dashboard</Link>
                        <Link className={`${pathname.includes('/admin/sales')?'text-primary font-bold':'text-gray-600 font-semibold hover:text-primary'} transition-colors`} href="/admin/sales">Sales</Link>
                        <Link className={`${pathname.includes('/admin/deliveries')?'text-primary font-bold':'text-gray-600 font-semibold hover:text-primary'} transition-colors`} href="/admin/deliveries">Deliveries</Link>
                        <Link className={`${pathname.includes('/admin/users')?'text-primary font-bold':'text-gray-600 font-semibold hover:text-primary'} transition-colors`} href="/admin/users">Users</Link>
                        <Link className={`${pathname.includes('/admin/inventory')?'text-primary font-bold':'text-gray-600 font-semibold hover:text-primary'} transition-colors`} href="/admin/inventory">Inventory</Link>
                    </div>
                </div>

                {
                    token && !isLoading ?
                    <div className="flex items-center gap-6 bg-gray-50 p-1.5 pr-4 rounded-full border">
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                            <span className="icon-[octicon--bell-16] w-6 h-6 text-gray-600"></span>
                            <div className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-primary text-white w-4 h-4 text-[10px] font-bold border-2 border-white">0</div>
                        </button>
                        <div className="h-8 w-[1px] bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                                <button onClick={e=>logout()} className="text-[11px] text-Error font-bold hover:underline">Sign Out</button>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                    :
                    <div className="flex items-center gap-7">
                         <Link href={'/login'} className="w-28 2xl:w-32 py-3 text-center rounded-xl font-bold transition-all bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5" >Log In</Link>
                    </div>
                }
            </div>
        </div>
    )
}

export default function Header(){
    return (
        <header className="">
            <TopMenu/>
            <DesktopSidebar/>
            <MobileTopMenu/>
            <MobileSideMenu/>
        </header>
    )
}
