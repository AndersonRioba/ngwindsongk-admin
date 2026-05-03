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
    const [currentZone, setCurrentZone] = useState({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '' })
    const [search, setSearch] = useState('')
    const fileInputRef = useRef(null)

    const { data, mutate } = useSWR(['/admin/locations', { search }], fetcher)

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setLocations(data)
            // Extract counties (locations whose parent_id is 1 - Kenya)
            const c = data.filter(loc => loc.parent_id === 1).sort((a, b) => a.name.localeCompare(b.name))
            setCounties(c)
            
            // Extract delivery zones (locations that belong to a county)
            // Either they have a parent_id > 1, or they have a delivery fee set
            const z = data.filter(loc => loc.parent_id !== 1 && loc.parent_id !== null)
            setZones(z)
        }
    }, [data])

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
        }

        if (currentZone.id) {
            putData(
                (res) => {
                    if (res?.success) {
                        mutate()
                        setIsEditing(false)
                        setCurrentZone({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '' })
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
                        setCurrentZone({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '' })
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
        })
        setIsEditing(true)
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setCurrentZone({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '' })
    }

    return (
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Delivery Zones & Rates</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage delivery locations, SACCO/Rider preferences, and their respective fees.</p>
                </div>
                <div className="flex gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImport} 
                        className="hidden" 
                        accept=".xlsx,.xls,.csv"
                    />
                    <button 
                        onClick={handleDownloadTemplate}
                        className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                        <span className="icon-[fluent--document-search-16-regular] w-4 h-4 text-blue-500" />
                        Sample Template
                    </button>
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                        <span className="icon-[fluent--arrow-upload-16-regular] w-4 h-4 text-primary" />
                        Import Excel
                    </button>
                    <button 
                        onClick={handleExport}
                        className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                        <span className="icon-[fluent--arrow-download-16-regular] w-4 h-4 text-gray-400" />
                        Download Excel
                    </button>
                    <button 
                        onClick={() => {
                            setCurrentZone({ id: null, name: '', parent_id: '', delivery_fee: '', sacco_rider: '' })
                            setIsEditing(true)
                        }}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        + Add New Zone
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-4">{currentZone.id ? 'Edit Zone' : 'Add New Zone'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">County *</label>
                            <select
                                value={currentZone.parent_id}
                                onChange={e => setCurrentZone({...currentZone, parent_id: e.target.value})}
                                className="w-full p-3 border rounded-xl text-sm bg-white"
                            >
                                <option value="">-- Select County --</option>
                                {counties.map(county => (
                                    <option key={county.id} value={county.id}>{county.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Town/Urban Zone *</label>
                            <input 
                                type="text"
                                value={currentZone.name}
                                onChange={e => setCurrentZone({...currentZone, name: e.target.value})}
                                className="w-full p-3 border rounded-xl text-sm bg-white"
                                placeholder="e.g. Ahero, Mwiki"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Fee (KES)</label>
                            <input 
                                type="number"
                                value={currentZone.delivery_fee}
                                onChange={e => setCurrentZone({...currentZone, delivery_fee: e.target.value})}
                                className="w-full p-3 border rounded-xl text-sm bg-white"
                                placeholder="Leave empty for fallback fee"
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
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">Save Zone</button>
                        <button onClick={cancelEdit} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">Cancel</button>
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

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                        <tr>
                            <th className="p-4">County</th>
                            <th className="p-4">Town/Urban Zone</th>
                            <th className="p-4">SACCO/Rider</th>
                            <th className="p-4 text-right">Delivery Fee (KES)</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {zones.map((zone) => (
                            <tr key={zone.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 font-medium text-gray-600">
                                    {zone.parent?.name || 'N/A'}
                                </td>
                                <td className="p-4 font-bold text-gray-800">{zone.name}</td>
                                <td className="p-4 text-gray-500">
                                    {zone.sacco_rider ? (
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{zone.sacco_rider}</span>
                                    ) : '-'}
                                </td>
                                <td className="p-4 text-right">
                                    {zone.delivery_fee !== null ? (
                                        <span className="font-bold text-primary">{Number(zone.delivery_fee).toLocaleString()}</span>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">Fallback (350)</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <button onClick={() => startEdit(zone)} className="text-gray-400 hover:text-blue-500 transition-colors">
                                            <span className="icon-[fluent--edit-16-regular] w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(zone.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <span className="icon-[fluent--delete-16-regular] w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {zones.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400 font-medium">
                                    No delivery zones found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
