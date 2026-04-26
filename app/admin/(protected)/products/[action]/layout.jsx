import Link from "next/link"
import Navigation from "./Navigation"
import Status from "./Status"
import BreadCrumbs from "@/app/UI/BreadCrumbs"
import CreateProductProvider from "@/app/lib/providers/CreateProductProvider"

export default function CreateLayout({children}){
    return(
        <main className="mx-2 lg:mx-10 2xl:mx-20 ">
            <div className="flex justify-between">
                <BreadCrumbs/>
            </div>
            <div className="flex gap-4 mt-8">
                <CreateProductProvider>
                    <div className="w-1/4"><Navigation/></div>
                    <div className="w-2/3 max-h-[81vh] overflow-y-scroll p-5">{children}</div>
                    <Status/>
                </CreateProductProvider>
            </div>
        </main>
    )
}