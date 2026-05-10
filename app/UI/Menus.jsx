'use client'
import { useEffect, useState } from "react";
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation";
import Logo from "@/app/UI/Logo";
import { hide, show, nowYouDont, nowYouSee} from "@/app/lib/controlls";
import useAuth from "@/app/hooks/useAuth";
import useSWR from "swr";
import { fetcher } from "@/app/lib/data";
import { getStoreUrl } from "@/app/lib/urls";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';

export function MobileTopMenu({ menuOpen, setMenuOpen }){
    return(
        <div className="block md:hidden sticky top-0 z-[60] bg-white/95 backdrop-blur-md border-b shadow-sm">
            <div className="flex justify-between items-center px-4 py-3">
                <Logo/>
                <div className="flex items-center gap-4">
                    <button className="relative">
                        <span className="icon-[octicon--bell-16] w-6 h-6 text-gray-700"></span>
                        <div className="absolute -right-2 bottom-0 flex items-center justify-center rounded-full bg-primary text-white w-4 h-4 p-1 text-[10px] font-bold">{0}</div>
                    </button>
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)} 
                        className={`${menuOpen ? 'icon-[material-symbols-light--close]' : 'icon-[solar--hamburger-menu-outline]'} w-8 h-8 text-gray-800 transition-all duration-300`}
                    />
                </div>
            </div>
        </div>
    )
}

export function MobileSideMenu({ menuOpen, setMenuOpen }){
    const {isLoading, user, logout, token } = useAuth();
    let pathname = usePathname();

    // Close menu on navigation
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Body scroll lock
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [menuOpen]);

    return(
        <>
        <div 
            id="mobile_menu_backdrop" 
            onClick={() => setMenuOpen(false)} 
            className={`fixed inset-0 bg-black/60 z-[70] md:hidden backdrop-blur-sm transition-all duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        ></div>
        
        <div 
            id="mobile_side_menu" 
            className={`fixed z-[80] top-0 right-0 w-[85vw] h-full bg-white md:hidden shadow-2xl border-l flex flex-col transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ height: '100dvh' }}
        >
            <div className="flex justify-between items-center p-6 border-b border-gray-50 flex-shrink-0">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Administrative Terminal</span>
                    <Logo />
                </div>
                <button onClick={() => setMenuOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
                    <span className="icon-[material-symbols-light--close] w-6 h-6"/>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
                {
                    token && !isLoading &&
                    <div className="mb-10 px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex flex-col">
                                <p className="text-base font-black text-gray-900 truncate tracking-tight">{user?.name}</p>
                                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                } 
                
                <div className="space-y-1" onClick={() => setMenuOpen(false)}>
                    <SidebarItem href="/admin/dashboard" icon="icon-[carbon--dashboard]" label="Dashboard" pathname={pathname} />
                    <SidebarItem href="/admin/analytics" icon="icon-[solar--chart-bold-duotone]" label="Analytics" pathname={pathname} />
                    
                    <a href={`${getStoreUrl()}/`} className="flex items-center px-4 py-4 text-gray-500 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] bg-gray-50/50 rounded-2xl group my-4 border border-gray-100/50 shadow-sm">
                        <span className="icon-[ic--baseline-shopify] w-6 h-6 mr-3 text-primary" />
                        View Live Shop
                    </a>

                    <MobileBrandSubMenu pathname={pathname} setMenuOpen={setMenuOpen} />

                    <div className="pt-4 pb-2">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black px-4 mb-4 font-serif italic">Operational Matrix</div>
                        <SidebarItem href="/admin/sales" icon="icon-[carbon--sales-ops]" label="Sales Intelligence" pathname={pathname} />
                        <SidebarItem href="/admin/partners" icon="icon-[solar--users-group-two-rounded-bold-duotone]" label="Partners Hub" pathname={pathname} />
                        <SidebarItem href="/admin/deliveries" icon="icon-[mdi--delivery-dining]" label="Fulfillment Manifest" pathname={pathname} />
                        <SidebarItem href="/admin/inventory" icon="icon-[material-symbols--inventory-rounded]" label="Inventory Engine" pathname={pathname} />
                    </div>

                    <div className="pt-4 pb-2">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black px-4 mb-4 font-serif italic">Management Terminal</div>
                        <SidebarItem href="/admin/users" icon="icon-[heroicons--users-16-solid]" label="User Accounts" pathname={pathname} />
                        <SidebarItem href="/admin/access-control" icon="icon-[solar--shield-keyhole-bold-duotone]" label="Security & Roles" pathname={pathname} />
                        <SidebarItem href="/admin/delivery-zones" icon="icon-[fluent--vehicle-truck-24-regular]" label="Logistics Zones" pathname={pathname} />
                        <SidebarItem href="/admin/mpesa-payments" icon="icon-[solar--wallet-money-linear]" label="Payment Records" pathname={pathname} />
                        <SidebarItem href="/admin/vouchers" icon="icon-[solar--ticket-sale-bold-duotone]" label="Discount Ciphers" pathname={pathname} />
                    </div>

                    <div className="pt-4 pb-2">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black px-4 mb-4 font-serif italic">Content Architecture</div>
                        <SidebarItem href="/admin/recipes" icon="icon-[arcticons--reciper]" label="Recipe Lab" pathname={pathname} />
                        <SidebarItem href="/admin/blogs" icon="icon-[mdi--post-outline]" label="Editorial Blogs" pathname={pathname} />
                        <SidebarItem href="/admin/reviews" icon="icon-[solar--chat-dots-bold-duotone]" label="Client Testimonials" pathname={pathname} />
                    </div>

                    <div className="pt-4 pb-2 border-t border-gray-50 mt-4">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black px-4 mb-4 font-serif italic">System Pulse</div>
                        <SidebarItem href="/admin/monitoring/pulse" icon="icon-[solar--pulse-bold-duotone]" label="Terminal Pulse" pathname={pathname} />
                        <SidebarItem href="/admin/monitoring/telescope" icon="icon-[solar--telescope-bold-duotone]" label="Deep Telescope" pathname={pathname} />
                        <SidebarItem href="/admin/settings" icon="icon-[carbon--settings]" label="Core Settings" pathname={pathname} />
                    </div>

                    {/* Moved Sign Out inside scrollable area for better mobile reliability */}
                    <div className="pt-8 pb-12">
                        {
                            (token && !isLoading) ?
                            <button onClick={e=>{ logout(); setMenuOpen(false); }} className="w-full flex items-center justify-center gap-3 py-5 text-Error font-black uppercase tracking-widest text-[10px] bg-red-50/50 rounded-2xl border border-Error/10 hover:bg-Error hover:text-white transition-all active:scale-95">
                                <span className="icon-[solar--logout-bold-duotone] w-6 h-6"/>
                                Sign Out Terminal
                            </button>
                            :
                            <Link href={'/login'} className="w-full flex items-center justify-center py-5 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" >
                                Log In
                            </Link>
                        }
                    </div>
                </div>
            </div>
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

    if (isExternal) return <a href={href}>{content}</a>;
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
function MobileBrandSubMenu({ pathname, setMenuOpen }) {
    const searchParams = useSearchParams();
    const activeBrand = searchParams.get('brand') || '';
    const isProductsActive = pathname.includes('/admin/products');
    const [open, setOpen] = useState(isProductsActive);
    const { data: brandsData } = useSWR(['/brands', {}], fetcher, { revalidateOnFocus: false });
    const brands = (Array.isArray(brandsData) ? brandsData : brandsData?.data || []).filter(b => b.is_active !== false);

    return (
        <div className="my-2">
            <div
                className={`flex items-center justify-between my-2 px-4 py-3 rounded-xl transition-all ${isProductsActive ? 'text-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setOpen(o => !o)}
            >
                <div className="flex items-center">
                    <span className="icon-[material-symbols--production-quantity-limits-sharp] w-6 h-6 mr-3"/>
                    <span className="truncate text-sm font-bold uppercase tracking-widest text-[10px]">Products Hub</span>
                </div>
                <span className={`icon-[fluent--chevron-right-16-filled] w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`} />
            </div>
            {open && (
                <div className="ml-10 space-y-1 border-l-2 border-primary/20 pl-4 mt-2">
                    <Link 
                        onClick={() => setMenuOpen(false)}
                        href="/admin/products" 
                        className={`block text-[10px] font-black uppercase tracking-[0.2em] py-3 ${isProductsActive && !activeBrand ? 'text-primary' : 'text-gray-400'}`}
                    >
                        All Products
                    </Link>
                    {brands.map(brand => (
                        <Link 
                            key={brand.id} 
                            onClick={() => setMenuOpen(false)}
                            href={`/admin/products?brand=${encodeURIComponent(brand.name)}`}
                            className={`block text-[10px] font-black uppercase tracking-[0.2em] py-3 ${activeBrand === brand.name ? 'text-primary' : 'text-gray-400'}`}
                        >
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
        { href: '/admin/dashboard', icon: 'icon-[carbon--dashboard]', label: 'Dashboard' },
        { href: '/admin/analytics', icon: 'icon-[solar--chart-bold-duotone]', label: 'Analytics' },

        { href: '/admin/sales', icon: 'icon-[carbon--sales-ops]', label: 'Sales Intelligence' },
        { href: '/admin/partners', icon: 'icon-[solar--users-group-two-rounded-bold-duotone]', label: 'Partners Hub' },
        { href: '/admin/brands', icon: 'icon-[fluent--tag-24-regular]', label: 'Brands Engine' },
        { href: '/admin/vouchers', icon: 'icon-[solar--ticket-sale-bold-duotone]', label: 'Discount Ciphers' },
        { href: '/admin/navigation', icon: 'icon-[material-symbols--map-outline]', label: 'Navigation' },
        { href: '/admin/delivery-zones', icon: 'icon-[fluent--vehicle-truck-24-regular]', label: 'Logistics Zones' },
        { href: '/admin/mpesa-payments', icon: 'icon-[solar--wallet-money-linear]', label: 'Payment Records' },
        { href: '/admin/sales-settings', icon: 'icon-[fluent--shopping-bag-24-regular]', label: 'Sales Settings' },
        { href: '/admin/recipes', icon: 'icon-[arcticons--reciper]', label: 'Recipe Lab' },
        { href: '/admin/blogs', icon: 'icon-[mdi--post-outline]', label: 'Editorial Blogs' },
        { href: '/admin/comments', icon: 'icon-[mdi--comment-outline]', label: 'Comments' },
        { href: '/admin/reviews', icon: 'icon-[solar--chat-dots-bold-duotone]', label: 'Client Testimonials' },
        { href: '/admin/users', icon: 'icon-[heroicons--users-16-solid]', label: 'User Accounts' },
        { href: '/admin/access-control', icon: 'icon-[solar--shield-keyhole-bold-duotone]', label: 'Security & Roles' },
        { href: '/admin/inventory', icon: 'icon-[material-symbols--inventory-rounded]', label: 'Inventory Engine' },
        { href: '/admin/settings', icon: 'icon-[carbon--settings]', label: 'Core Settings' },
        { href: '/admin/monitoring/pulse', icon: 'icon-[solar--pulse-bold-duotone]', label: 'Terminal Pulse' },
        { href: '/admin/monitoring/telescope', icon: 'icon-[solar--telescope-bold-duotone]', label: 'Deep Telescope' },
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
                <a href={`${getStoreUrl()}/`} className="flex items-center px-4 py-3 text-gray-500 hover:text-primary transition-colors font-bold text-sm bg-gray-50 rounded-xl group">
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
                        <Link className={`${pathname.includes('/admin/analytics')?'text-primary font-bold':'text-gray-600 font-semibold hover:text-primary'} transition-colors`} href="/admin/analytics">Analytics</Link>
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
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="">
            <TopMenu/>
            <DesktopSidebar/>
            <MobileTopMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <MobileSideMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </header>
    )
}
