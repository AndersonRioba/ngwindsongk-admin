'use client'
import Link from "next/link"
export default function Logo(){
    return <Link href={'/'}><h3 className="font-semibold text-3xl flex items-center gap-x-2"><span className="icon-[fa-solid--box-open] w-11 h-11 text-primary"/>inventory</h3></Link>
}