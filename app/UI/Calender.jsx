'use client'
import { useState } from "react";

export function getDaySuffix (day) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

export function getWeeksOfMonth (year, month) {
    const weeks = [];
    const date = new Date(year, month, 1);
    
    // Find the first Sunday of the month
    while (date.getDay() !== 0) {
        date.setDate(date.getDate() + 1);
    }

    // Iterate through the weeks of the month
    while (date.getMonth() === month) {
        const sunday = new Date(date);
        const saturday = new Date(date);
        saturday.setDate(date.getDate() + 6);
        weeks.push({
            sunday: `${(new Date(year,sunday.getMonth(),1)).toLocaleString('default', {month:'long'}).slice(0,3)},${sunday.getDate()}${getDaySuffix(sunday.getDate())}`,
            saturday: `${(new Date(year,saturday.getMonth(),1)).toLocaleString('default', {month:'long'}).slice(0,3)},${saturday.getDate()}${getDaySuffix(saturday.getDate())}`,
            epoch: sunday
        });
        date.setDate(date.getDate() + 7);
    }
    
    return weeks;
};

export function getDatesOfWeek(epoch){
    let dates = []
    let date = new Date(epoch)
    for(let i=0;i<7;i++){
        dates.push(`${date.getFullYear()}-${(new Date(date.getFullYear(),date.getMonth(),1)).toLocaleString('default', {month:'long'})}-${date.getDate()}`)
        date.setDate(date.getDate()+1)
    }
    return dates
}

export function getDatesInRange(start,end){
    let monthNames = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];

    let startDate = new Date(start[0], start[1], start[2]);
    let endDate = new Date(end[0], end[1], end[2]);

    let dates = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
    let year = currentDate.getFullYear();
    let monthName = monthNames[currentDate.getMonth()];
    let day = currentDate.getDate();
    let dateString = `${year}-${monthName}-${day}`;
    dates.push(dateString);
    currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

export function getMonthName(month){
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][month]
}

import BeautifulDatePicker from "./BeautifulDatePicker";

export function CalenderRange({ control, onApply, currentFrom = '', currentTo = '' }) {
    const [from, setFrom] = useState(currentFrom || '');
    const [to, setTo] = useState(currentTo || '');

    const isValid = from && to && new Date(from) <= new Date(to);

    const submit = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (isValid && onApply) {
            onApply({ from, to });
        }
        
        if (control) {
            control('');
        }
    };

    const cancel = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (control) {
            control('');
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 relative z-[10001]">
            <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="icon-[solar--calendar-date-bold-duotone] w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Custom Date Range</h3>
                        <p className="text-gray-500 text-sm">Select target window for data synchronization</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                    <BeautifulDatePicker 
                        label="Start"
                        value={from}
                        onChange={setFrom}
                    />
                    <BeautifulDatePicker 
                        label="End"
                        value={to}
                        onChange={setTo}
                    />
                </div>

                {from && to && new Date(from) > new Date(to) && (
                    <div className="mb-8 p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                        <span className="icon-[solar--danger-bold] w-5 h-5" />
                        <p className="text-xs font-bold uppercase tracking-wider">Error: End date cannot precede start date</p>
                    </div>
                ) || null}

                <div className="flex flex-col md:flex-row gap-4">
                    <button 
                        type="button"
                        className="flex-[2] bg-primary hover:bg-[#b5952f] text-white font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale active:scale-95" 
                        disabled={!isValid}
                        onClick={submit}
                    >
                        <span className="icon-[solar--check-read-bold] w-5 h-5" />
                        Synchronize Data
                    </button>
                    <button 
                        type="button"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-2xl transition-all active:scale-95 text-center" 
                        onClick={cancel}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Calender({DateState}) {
    let [calender, setCalender] = DateState

    let firstDay = (new Date(calender[0], calender[1])).getDay();//index of first day of month, sunday at index 0
    let daysInMonth = 32 - new Date(calender[0],calender[1],32).getDate();//jan at index 0

    let selectDate = (e)=>{
        e.preventDefault()
        calender[2] = e.target.value;
        setCalender([calender[0],calender[1],calender[2]]);
    }
    let changeMonth = (e,operand)=>{
        e.preventDefault();
        calender[1]+=operand;
        if(calender[1]==-1){
            calender[0]-=1;
            calender[1]=11;
        }
        if(calender[1]==12){
            calender[0]+=1;
            calender[1]=0;
        }
        setCalender([calender[0],calender[1],calender[2]]);
    }

    return (
      <>
      <div class="flex items-center justify-center w-full mx-auto">
        <div class="w-full shadow-lg">
            <div class="md:p-8 p-5 bg-gray-800 rounded-t">
                <div class="px-4 flex items-center justify-between">
                    <span  tabindex="0" class="focus:outline-none  text-base font-bold text-gray-100 ">{(new Date(calender[0],calender[1],1)).toLocaleString('default', {month:'long'})} {calender[0]}</span>
                    <div class="flex items-center">
                    <button onClick={e=>changeMonth(e,-1)} aria-label="calendar backward" class="focus:text-gray-400 hover:text-gray-400  text-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <polyline points="15 6 9 12 15 18" />
                        </svg>
                    </button>
                    <button onClick={e=>changeMonth(e,1)} aria-label="calendar forward" class="focus:text-gray-400 hover:text-gray-400 ml-3  text-gray-100"> 
                          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler  icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <polyline points="9 6 15 12 9 18" />
                        </svg>
                    </button>
                </div>
                </div>
                <div class="flex items-center justify-between pt-12 overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr>
                                {
                                    ['Su','Mo','Tu','We','Th','Fr','Sa'].map((day,dayIndex)=>{
                                        return (
                                            <th key={dayIndex}>
                                                <div class="w-full flex justify-center">
                                                    <p class="text-base font-medium text-center text-gray-100">{day}</p>
                                                </div>
                                            </th>
                                        )
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                           {
                                 [...Array(Math.ceil((firstDay+daysInMonth)/7))].map((week,weekIndex)=>{
                                    return (
                                        <tr key={weekIndex}>
                                            {
                                                [...Array(7)].map((day,dayIndex)=>{
                                                    let dayNumber = (weekIndex*7)+dayIndex-firstDay+1;
                                                    return (
                                                        <td key={dayIndex}>
                                                            <div class="w-full flex justify-center">
                                                                <button onClick={e=>selectDate(e)} value={dayNumber} class={`focus:outline-none rounded-full w-8 h-8 flex items-center justify-center ${dayNumber==calender[2]?"bg-blue-800 text-white":"text-gray-100"}`}>
                                                                    {dayNumber>0&&dayNumber<=daysInMonth?dayNumber:""}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )
                                                })
                                            }
                                        </tr>
                                    )
                                })
                           }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
      </>
    )
}
