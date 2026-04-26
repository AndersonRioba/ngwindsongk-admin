'use client'
import { useState } from "react";
import { createContext } from "react";
import useSWR from "swr";
import { fetcher } from "./data";
import Spinner from "@/app/UI/Spinner";

export let Context = createContext();

export default function ContextProvider({ children }) {
    let [isLogged, setIsLogged] = useState(false);
    return(
        <Context.Provider value={{isLogged, setIsLogged}}>
        {children}
        </Context.Provider>
    )
}