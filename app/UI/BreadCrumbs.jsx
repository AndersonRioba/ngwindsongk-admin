'use client'
import Link from "next/link";
import { usePathname} from "next/navigation";

export default function BreadCrumbs(){
    let path = usePathname().replaceAll('%20',' ');
    path = path.split('/')
    return (
        <div className="flex text-gray-500">
            <Link href={'/'} className="hover:text-primary">Home </Link>
            {
                path.slice(1,).map((link, i)=>{
                    return <Link className="flex" key={i} href={`/${path.slice(1,i+2).join('/')}`}> <span className="mx-1">/</span> <span className={`capitalize ${i==path.length-2?'font-semibold text-gray-950':'hover:text-primary'}`}>{link}</span> </Link>
                })
            }
        </div>
    )
}