'use client'
import React, { useState, useRef, useEffect } from "react"
import { getMonthName } from "@/app/lib/dates"

export default function BeautifulDatePicker({ value, onChange, label }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse initial date or default to today
    const initialDate = value ? new Date(value) : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const formatDate = (day, month, year) => {
        const d = String(day).padStart(2, '0');
        const m = String(month + 1).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    const handleDateClick = (day) => {
        const dateStr = formatDate(day, currentMonth, currentYear);
        onChange(dateStr);
        setIsOpen(false);
    };

    const nextMonth = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const prevMonth = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const days = [];
    const firstDay = firstDayOfMonth(currentMonth, currentYear);
    const totalDays = daysInMonth(currentMonth, currentYear);

    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`pad-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
        const isSelected = value === formatDate(d, currentMonth, currentYear);
        const isToday = formatDate(new Date().getDate(), new Date().getMonth(), new Date().getFullYear()) === formatDate(d, currentMonth, currentYear);
        
        days.push(
            <button
                key={d}
                type="button"
                onClick={() => handleDateClick(d)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 
                    isToday ? 'bg-primary/10 text-primary hover:bg-primary/20' : 
                    'text-gray-600 hover:bg-gray-100'
                }`}
            >
                {d}
            </button>
        );
    }

    return (
        <div className="relative group" ref={containerRef}>
            {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">{label}</label>}
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-50 hover:bg-gray-100 focus-within:bg-white border-2 border-transparent focus-within:border-primary/20 rounded-2xl py-4 pl-12 pr-10 transition-all font-bold text-gray-900 cursor-pointer flex items-center justify-between overflow-hidden"
            >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 icon-[solar--calendar-minimalistic-bold] text-gray-400 group-focus-within:text-primary transition-colors text-xl" />
                <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-400 italic font-medium'}`}>
                    {value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date...'}
                </span>
                <span className="icon-[solar--alt-arrow-down-bold-duotone] text-gray-400 shrink-0 ml-2" />
            </div>

            {isOpen && (
                <div className="absolute top-full mt-3 left-0 w-80 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-6 z-[100] animate-in zoom-in-95 duration-200 origin-top-left">
                    <div className="flex items-center justify-between mb-6 gap-2">
                        <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors shrink-0">
                            <span className="icon-[solar--alt-arrow-left-bold] w-5 h-5" />
                        </button>
                        <h4 className="font-extrabold text-gray-800 tracking-tight lowercase capitalize text-base text-center flex-1 truncate">
                            {getMonthName(currentMonth)} {currentYear}
                        </h4>
                        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors shrink-0">
                            <span className="icon-[solar--alt-arrow-right-bold] w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-y-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</div>
                        ))}
                        {days}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <button 
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                onChange(formatDate(today.getDate(), today.getMonth(), today.getFullYear()));
                                setIsOpen(false);
                            }}
                            className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 rounded-xl transition-colors"
                        >
                            Select Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
