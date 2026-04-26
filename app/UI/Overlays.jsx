'use client'
import { useState, useEffect } from "react"
import Overlay from "./Overlay"

export default function Overlays(){
    let [page, setPage] = useState('')
    useEffect(()=>{
        window.addEventListener('overlay', e=>handler(e))
        return ()=>window.removeEventListener('overlay', e=>handler(e))
    },[])
    let handler = e => {
        setPage(e.detail.page)
    }

    return(
        <Overlay control={setPage} id={'alpha-overlay'} className={`${page==''?'hidden':'block'}`}>
            {/* {page=='/signup' && <Signup control={setPage}/>} */}
        </Overlay>
    )
}