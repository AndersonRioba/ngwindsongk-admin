'use client'
export default function Search({search, setSearch, placeholder = 'Search products...'}){
    return(
        <div className="w-full h-full relative group">
            <span className="icon-[heroicons--magnifying-glass] absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5 group-focus-within:scale-110 transition-transform z-10" />
            <input
                type="search"
                placeholder={placeholder}
                name="search"
                id="admin-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-full pl-12 pr-4 py-3 bg-white border border-primary rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none placeholder:text-gray-400 shadow-sm"
            />
        </div>
    )
}