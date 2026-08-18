'use client'

import { useState } from "react"
import Navigation from "./Navigation"
import Status from "./Status"
import BreadCrumbs from "@/app/UI/BreadCrumbs"
import CreateProductProvider from "@/app/lib/providers/CreateProductProvider"

export default function ProductLayoutClient({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    return (
        <main className="mx-2 lg:mx-10 2xl:mx-20">
            <div className="flex justify-between items-center">
                <BreadCrumbs />
                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shadow-sm ${
                        isSidebarOpen
                            ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            : 'bg-primary text-white border-primary hover:bg-primary/90 shadow-md ring-2 ring-primary/20'
                    }`}
                    title={isSidebarOpen ? "Hide product status sidebar" : "Show product status sidebar"}
                >
                    <span className={`w-4 h-4 transition-transform duration-200 ${
                        isSidebarOpen ? 'icon-[fluent--panel-right-contract-16-regular]' : 'icon-[fluent--panel-right-expand-16-filled]'
                    }`} />
                    <span>{isSidebarOpen ? 'Hide Sidebar' : 'Show Status Sidebar'}</span>
                </button>
            </div>

            <div className="flex gap-4 mt-8 items-start relative">
                <CreateProductProvider>
                    <div className="w-1/4 min-w-[220px] max-w-[280px]">
                        <Navigation />
                    </div>

                    <div className={`transition-all duration-300 max-h-[81vh] overflow-y-auto p-5 pr-4 prominent-scrollbar ${
                        isSidebarOpen ? 'flex-1 min-w-0' : 'flex-1 min-w-0'
                    }`}>
                        {children}
                    </div>

                    <Status
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                </CreateProductProvider>
            </div>
        </main>
    )
}
