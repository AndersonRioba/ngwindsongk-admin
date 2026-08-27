'use client'

import { useState, useEffect, useRef } from 'react'
import { fetcher, postData, putData, deleteData } from '@/app/lib/data'
import { popupE } from '@/app/lib/trigger'
import useSWR from 'swr'

export default function DeliveryZonesSettings() {
    const [locations, setLocations] = useState([])
    const [counties, setCounties] = useState([])
    const [zones, setZones] = useState([])
    const [isEditing, setIsEditing] = useState(false)
    const [currentZone, setCurrentZone] = useState({ 
        id: null, 
        name: '', 
        parent_id: '', 
        delivery_fee: '', 
        sacco_rider: '',
        rider_fee: '',
        rider_name: '',
        sacco_fee: '',
        sacco_name: '',
    })
    const [search, setSearch] = useState('')
    const fileInputRef = useRef(null)
    const formRef = useRef(null)

    // Fetch all counties using the dedicated counties endpoint
    const { data: countiesData } = useSWR(['/locations/counties', {}], fetcher)
    // Fetch filtered zones for the table
    const { data, mutate } = useSWR(['/admin/locations', { search }], fetcher)

    useEffect(() => {
        if (countiesData?.data && Array.isArray(countiesData.data)) {
            setCounties(countiesData.data)
        } else if (Array.isArray(countiesData)) {
            setCounties(countiesData)
        }
    }, [countiesData])

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setLocations(data)
            // Extract delivery zones (locations that belong to a county)
            const z = data.filter(loc => loc.parent_id !== 1 && loc.parent_id !== null)
            setZones(z)
        }
    }, [data])

    const selectedCountyObj = counties.find(c => c.id === parseInt(currentZone.parent_id))
    const isNairobi = selectedCountyObj?.name?.toLowerCase().includes('nairobi')

    const handleSave = () => {
        if (!currentZone.name) {
            popupE('Error', 'Town/Urban Zone name is required.')
            return
        }
        if (!currentZone.parent_id) {
            popupE('Error', 'Please select a County.')
            return
        }

        const payload = {
            name: currentZone.name,
            parent_id: currentZone.parent_id,
            delivery_fee: currentZone.delivery_fee === '' ? null : currentZone.delivery_fee,
            sacco_rider: currentZone.sacco_rider || null,
            rider_fee: currentZone.rider_fee === '' ? null : currentZone.rider_fee,
            rider_name: currentZone.rider_name || null,
            sacco_fee: currentZone.sacco_fee === '' ? null : currentZone.sacco_fee,
            sacco_name: currentZone.sacco_name || null,
        }

        if (currentZone.id) {
            putData(
                (res) => {
                    if (res?.success) {
                        mutate()
                        setIsEditing(false)
                        setCurrentZone({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '', rider_fee: '', rider_name: '', sacco_fee: '', sacco_name: '' })
                    }
                },
                payload,
                `/admin/locations/${currentZone.id}`
            )
        } else {
            postData(
                (res) => {
                    if (res?.success) {
                        mutate()
                        setIsEditing(false)
                        setCurrentZone({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '', rider_fee: '', rider_name: '', sacco_fee: '', sacco_name: '' })
                    }
                },
                payload,
                '/admin/locations'
            )
        }
    }

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this delivery zone?")) {
            deleteData(
                (res) => {
                    if (res?.success) {
                        mutate()
                    }
                },
                {},
                `/admin/locations/${id}`
            )
        }
    }

    const handleExport = () => {
        const token = localStorage.getItem('token')
        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/locations/export?token=${token}`
        window.open(url, '_blank')
    }

    const handleDownloadTemplate = () => {
        const token = localStorage.getItem('token')
        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/locations/template?token=${token}`
        window.open(url, '_blank')
    }

    const handleImport = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        const token = localStorage.getItem('token')
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/locations/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            })
            
            const result = await response.json()
            if (result.success) {
                popupE('Success', result.message)
                mutate()
            } else {
                popupE('Error', result.message || 'Import failed')
            }
        } catch (err) {
            popupE('Error', 'An error occurred during import')
        }
        
        // Clear the input
        e.target.value = null
    }

    const startEdit = (zone) => {
        setCurrentZone({
            id: zone.id,
            name: zone.name || '',
            parent_id: zone.parent_id || '',
            delivery_fee: zone.delivery_fee === null ? '' : zone.delivery_fee,
            sacco_rider: zone.sacco_rider || '',
            rider_fee: zone.rider_fee === null ? '' : zone.rider_fee,
            rider_name: zone.rider_name || '',
            sacco_fee: zone.sacco_fee === null ? '' : zone.sacco_fee,
            sacco_name: zone.sacco_name || '',
        })
        setIsEditing(true)
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }, 50)
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setCurrentZone({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '', rider_fee: '', rider_name: '', sacco_fee: '', sacco_name: '' })
    }

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic leading-none">Delivery Zones & Rates</h2>
                    <p className="text-[10px] text-gray-500 mt-2 font-black uppercase tracking-widest">Manage delivery locations, Bike Rider and Matatu SACCO preferences & fees.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImport} 
                        className="hidden" 
                        accept=".xlsx,.xls,.csv"
                    />
                    <button 
                        onClick={handleDownloadTemplate}
                        className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <span className="icon-[fluent--document-search-16-regular] w-4 h-4 text-blue-500" />
                        Sample Template
                    </button>
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <span className="icon-[fluent--arrow-upload-16-regular] w-4 h-4 text-primary" />
                        Import Excel
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <span className="icon-[fluent--arrow-download-16-regular] w-4 h-4 text-gray-400" />
                        Download Excel
                    </button>
                    <button 
                        onClick={() => {
                            setCurrentZone({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '', rider_fee: '', rider_name: '', sacco_fee: '', sacco_name: '' })
                            setIsEditing(true)
                        }}
                        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                    >
                        + Add New Zone
                    </button>
                </div>
            </div>

            {isEditing && (
                <div ref={formRef} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="font-bold text-gray-800 text-base">{currentZone.id ? `Edit Delivery Zone: ${currentZone.name || ''}` : 'Add New Delivery Zone'}</h3>
                        {isNairobi && (
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                📍 Nairobi County (Separate Rider & Sacco Rates Active)
                            </span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">County *</label>
                            <select
                                value={currentZone.parent_id}
                                onChange={e => setCurrentZone({...currentZone, parent_id: e.target.value})}
                                className="w-full p-3 border rounded-xl text-sm bg-white font-medium"
                            >
                                <option value="">-- Select County --</option>
                                {counties.map(county => (
                                    <option key={county.id} value={county.id}>{county.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Town / Urban Zone *</label>
                            <input 
                                type="text"
                                value={currentZone.name}
                                onChange={e => setCurrentZone({...currentZone, name: e.target.value})}
                                className="w-full p-3 border rounded-xl text-sm bg-white"
                                placeholder="e.g. Kilimani, Westlands, Ahero"
                            />
                        </div>
                    </div>

                    {isNairobi ? (
                        /* Nairobi County: 2 Separate Options */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Rider Option */}
                            <div className="p-4 bg-white rounded-2xl border-2 border-primary/20 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                    <span className="text-lg">🛵</span>
                                    <span>Option 1: Bike Rider (Direct Delivery)</span>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Rider Delivery Fee (KES)</label>
                                    <input 
                                        type="number"
                                        value={currentZone.rider_fee}
                                        onChange={e => setCurrentZone({...currentZone, rider_fee: e.target.value})}
                                        className="w-full p-3 border rounded-xl text-sm bg-gray-50/50"
                                        placeholder="e.g. 350"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Rider Name / Contact (Optional)</label>
                                    <input 
                                        type="text"
                                        value={currentZone.rider_name}
                                        onChange={e => setCurrentZone({...currentZone, rider_name: e.target.value})}
                                        className="w-full p-3 border rounded-xl text-sm bg-gray-50/50"
                                        placeholder="e.g. Rider Joe (0712345678)"
                                    />
                                </div>
                            </div>

                            {/* Sacco Option */}
                            <div className="p-4 bg-white rounded-2xl border-2 border-blue-200 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                                    <span className="text-lg">🚐</span>
                                    <span>Option 2: Matatu SACCO (Parcel / Stage Delivery)</span>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">SACCO Delivery Fee (KES)</label>
                                    <input 
                                        type="number"
                                        value={currentZone.sacco_fee}
                                        onChange={e => setCurrentZone({...currentZone, sacco_fee: e.target.value})}
                                        className="w-full p-3 border rounded-xl text-sm bg-gray-50/50"
                                        placeholder="e.g. 250"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">SACCO Name / Stage (Optional)</label>
                                    <input 
                                        type="text"
                                        value={currentZone.sacco_name}
                                        onChange={e => setCurrentZone({...currentZone, sacco_name: e.target.value})}
                                        className="w-full p-3 border rounded-xl text-sm bg-gray-50/50"
                                        placeholder="e.g. Super Metro / CBD Stage"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Other Counties: Standard Single Rate */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Fee (KES)</label>
                                <input 
                                    type="number"
                                    value={currentZone.delivery_fee}
                                    onChange={e => setCurrentZone({...currentZone, delivery_fee: e.target.value})}
                                    className="w-full p-3 border rounded-xl text-sm bg-white"
                                    placeholder="Leave empty for county fallback fee"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SACCO preference / Rider (Optional)</label>
                                <input 
                                    type="text"
                                    value={currentZone.sacco_rider}
                                    onChange={e => setCurrentZone({...currentZone, sacco_rider: e.target.value})}
                                    className="w-full p-3 border rounded-xl text-sm bg-white"
                                    placeholder="e.g. 2NK Sacco, Rider John"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-primary/20 transition-all">
                            Save Zone
                        </button>
                        <button onClick={cancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <input 
                    type="text" 
                    placeholder="Search zones..." 
                    className="w-full md:w-1/3 p-3 border rounded-xl text-sm bg-white"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                <div className="admin-table-wrapper scrollbar-hide">
                    <table className="admin-table text-left text-sm">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b">
                            <tr>
                                <th className="px-6 py-5">County</th>
                                <th className="px-6 py-5">Town / Urban Zone</th>
                                <th className="px-6 py-5">Logistics & Rates</th>
                                <th className="px-6 py-5 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {zones.map((zone) => {
                                const isZoneNairobi = zone.parent?.name?.toLowerCase().includes('nairobi')
                                return (
                                    <tr key={zone.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5 font-medium text-gray-600">
                                            {zone.parent?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-800">{zone.name}</td>
                                        <td className="px-6 py-5">
                                            {isZoneNairobi ? (
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-xl border border-purple-100 text-xs">
                                                        <span>🛵 Rider:</span>
                                                        <span className="font-black text-primary">
                                                            {zone.rider_fee !== null ? `KES ${Number(zone.rider_fee).toLocaleString()}` : (zone.delivery_fee !== null ? `KES ${Number(zone.delivery_fee).toLocaleString()}` : 'Default')}
                                                        </span>
                                                        {zone.rider_name && <span className="text-[10px] text-gray-500 font-medium">({zone.rider_name})</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-100 text-xs">
                                                        <span>🚐 SACCO:</span>
                                                        <span className="font-black text-blue-700">
                                                            {zone.sacco_fee !== null ? `KES ${Number(zone.sacco_fee).toLocaleString()}` : (zone.delivery_fee !== null ? `KES ${Number(zone.delivery_fee).toLocaleString()}` : 'Default')}
                                                        </span>
                                                        {zone.sacco_name && <span className="text-[10px] text-gray-500 font-medium">({zone.sacco_name})</span>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-primary text-sm">
                                                        {zone.delivery_fee !== null ? `KES ${Number(zone.delivery_fee).toLocaleString()}` : <span className="text-gray-400 italic text-[10px] font-bold">County Fallback</span>}
                                                    </span>
                                                    {zone.sacco_rider && (
                                                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                                                            {zone.sacco_rider}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => startEdit(zone)} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                                    <span className="icon-[solar--pen-new-square-bold-duotone] w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(zone.id)} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
                                                    <span className="icon-[solar--trash-bin-trash-bold-duotone] w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {zones.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">
                                        No delivery zones found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
