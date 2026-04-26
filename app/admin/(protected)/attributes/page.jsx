'use client'
import { useState } from "react"
import useSWR from "swr"
import { fetcher, postFetcher, putData, deleteData } from "@/app/lib/data"
import Search from "@/app/UI/Search"
import Filter from "@/app/UI/Filter"
import BreadCrumbs from "@/app/UI/BreadCrumbs"

export default function Page(){
    let [search, setSearch] = useState('');
    let [filter, setFilter] = useState({});
    let [showCreateForm, setShowCreateForm] = useState(false);
    let [editingAttribute, setEditingAttribute] = useState(null);
    let [newAttributeName, setNewAttributeName] = useState('');
    let [newAttributeValues, setNewAttributeValues] = useState('');
    let [addingValueToAttrId, setAddingValueToAttrId] = useState(null);
    let [newValueText, setNewValueText] = useState('');
    let [editingValueId, setEditingValueId] = useState(null);
    let [tempValueText, setTempValueText] = useState('');
    
    // Fetch attributes from the new API
    let { data, isError, isLoading, mutate } = useSWR(['/attributes',{}], fetcher,{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });

    const handleCreateAttribute = async () => {
        if (!newAttributeName.trim()) return;
        
        const values = newAttributeValues.split(',').map(v => v.trim()).filter(v => v);
        console.log(values);
        
        try {
            // First create the attribute using postFetcher (returns a promise)
            const attributeResponse = await postFetcher(['/attributes', { name: newAttributeName }]);
            if (attributeResponse && attributeResponse.id) {
                const attributeId = attributeResponse.id;
                // Then create attribute values
                const valuePromises = values.map(value => 
                    postFetcher(['/attribute-values', { attribute_id: attributeId, value }])
                );
                await Promise.all(valuePromises);
                mutate();
                setShowCreateForm(false);
                setNewAttributeName('');
                setNewAttributeValues('');
            }
        } catch (error) {
            console.error('Error creating attribute:', error);
        }
    };

    const handleUpdateAttribute = async (attributeId, newName) => {
        try {
            await putData(
                (response) => {
                    mutate();
                    setEditingAttribute(null);
                },
                { name: newName },
                `/attributes/${attributeId}`
            );
        } catch (error) {
            console.error('Error updating attribute:', error);
        }
    };

    const handleDeleteAttribute = async (attributeId) => {
        if (!confirm('Are you sure you want to delete this attribute and all its values?')) return;
        
        try {
            await deleteData(
                (response) => {
                    if (response) {
                        mutate();
                    }
                },
                {},
                `/attributes/${attributeId}`
            );
        } catch (error) {
            console.error('Error deleting attribute:', error);
        }
    };

    const handleAddValue = async (attributeId) => {
        if (!newValueText.trim()) return;
        try {
            await postFetcher(['/attribute-values', { attribute_id: attributeId, value: newValueText.trim() }]);
            mutate();
            setNewValueText('');
            setAddingValueToAttrId(null);
        } catch (error) {
            console.error('Error adding value:', error);
        }
    };

    const handleUpdateValue = async (id) => {
        if (!tempValueText.trim()) return;
        try {
            await putData(
                () => {
                    mutate();
                    setEditingValueId(null);
                },
                { value: tempValueText.trim() },
                `/attribute-values/${id}`
            );
        } catch (error) {
            console.error('Error updating value:', error);
        }
    };

    const handleDeleteValue = async (id) => {
        if (!confirm('Are you sure you want to delete this value? It will be removed from all variations.')) return;
        try {
            await deleteData(
                () => mutate(),
                {},
                `/attribute-values/${id}`
            );
        } catch (error) {
            console.error('Error deleting value:', error);
        }
    };

    return(
        <main className="mx-2 lg:mx-10 2xl:mx-20 ">
            <BreadCrumbs/>
            <div className="flex mt-8 justify-between">
                <h2 className="text-3xl font-semibold">Attributes Management</h2>
                <button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-primary text-white p-2 rounded-md flex items-center hover:scale-105"
                >
                    <span className="icon-[rivet-icons--plus] w-4 h-4 mx-2"/>
                    Create New Attribute
                </button>
            </div>
            
            <div className="flex flex-col gap-y-5 md:flex-row justify-between md:items-center my-6 md:my-12 overflow-x-scroll">
                <div className="flex items-center gap-10">
                    <div className="shadow-lg "><Search search={search} setSearch={setSearch}/></div>
                    <div className="shadow-lg "><Filter filter={filter} setFilter={setFilter}/></div>
                </div>
            </div>
            
            {/* Create Attribute Form */}
            {showCreateForm && (
                <section className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                    <h5 className="text-xl font-semibold mb-6 text-gray-800">Create New Attribute</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Attribute Name</label>
                            <input 
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                                placeholder="e.g., Size, Color, Material" 
                                type="text" 
                                value={newAttributeName} 
                                onChange={e => setNewAttributeName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Attribute Values (comma-separated)</label>
                            <input 
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                                placeholder="e.g., Small, Medium, Large" 
                                type="text" 
                                value={newAttributeValues} 
                                onChange={e => setNewAttributeValues(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={handleCreateAttribute}
                            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Create Attribute
                        </button>
                        <button 
                            onClick={() => {
                                setShowCreateForm(false);
                                setNewAttributeName('');
                                setNewAttributeValues('');
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </section>
            )}
            
            <section className="bg-white md:px-10 py-8 rounded-lg">
                {
                    isLoading || isError?
                    <div className="space-y-4">
                        {[...new Array(5)].map((_,i)=>(
                            <div key={i} className="animate-pulse">
                                <div className="h-20 bg-gray-200 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                    :
                    <div className="space-y-6">
                        {data?.map((attribute,i)=>(
                            <div key={i} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        {editingAttribute === attribute.id ? (
                                            <div className="flex items-center gap-4">
                                                <input 
                                                    className="text-xl font-semibold border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                                                    value={attribute.name}
                                                    onChange={e => {
                                                        const updatedData = [...data];
                                                        updatedData[i].name = e.target.value;
                                                        // Note: This is a temporary UI update, actual save happens on blur
                                                    }}
                                                    onBlur={() => handleUpdateAttribute(attribute.id, attribute.name)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateAttribute(attribute.id, attribute.name)}
                                                />
                                                <button 
                                                    onClick={() => setEditingAttribute(null)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    <span className="icon-[fluent--dismiss-16-filled] w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <h6 className="text-xl font-semibold">{attribute.name}</h6>
                                                <button 
                                                    onClick={() => setEditingAttribute(attribute.id)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    <span className="icon-[fluent--edit-16-regular] w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteAttribute(attribute.id)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded transition-colors"
                                    >
                                        <span className="icon-[fluent--delete-16-filled] w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Defined Values</p>
                                        <button 
                                            onClick={() => setAddingValueToAttrId(attribute.id)}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            <span className="icon-[solar--add-circle-bold] w-3 h-3"/>
                                            Add Value
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        {attribute.attribute_values?.map(val => (
                                            <div key={val.id} className="group/val relative">
                                                {editingValueId === val.id ? (
                                                    <div className="flex items-center gap-1 bg-white border border-primary rounded-full px-3 py-1 shadow-sm">
                                                        <input 
                                                            autoFocus
                                                            className="text-xs font-bold outline-none w-20"
                                                            value={tempValueText}
                                                            onChange={e => setTempValueText(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleUpdateValue(val.id);
                                                                if (e.key === 'Escape') setEditingValueId(null);
                                                            }}
                                                        />
                                                        <button onClick={() => handleUpdateValue(val.id)} className="text-primary hover:text-green-600">
                                                            <span className="icon-[solar--check-circle-bold] w-4 h-4"/>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="group inline-flex items-center gap-2 bg-gray-50 text-gray-700 px-4 py-1.5 rounded-full text-xs font-bold border border-gray-100 hover:border-primary/20 transition-all">
                                                        {val.value}
                                                        <div className="flex items-center gap-1.5 ml-1 border-l pl-2 border-gray-200">
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingValueId(val.id);
                                                                    setTempValueText(val.value);
                                                                }}
                                                                className="text-gray-400 hover:text-primary transition-colors"
                                                            >
                                                                <span className="icon-[fluent--edit-16-regular] w-3 h-3" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteValue(val.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <span className="icon-[solar--trash-bin-trash-bold] w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {addingValueToAttrId === attribute.id && (
                                            <div className="flex items-center gap-1 bg-primary/5 border border-primary/20 rounded-full px-3 py-1 animate-in fade-in zoom-in duration-300">
                                                <input 
                                                    autoFocus
                                                    className="bg-transparent text-xs font-bold outline-none w-24 placeholder:text-primary/30"
                                                    placeholder="New value..."
                                                    value={newValueText}
                                                    onChange={e => setNewValueText(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleAddValue(attribute.id);
                                                        if (e.key === 'Escape') setAddingValueToAttrId(null);
                                                    }}
                                                />
                                                <button onClick={() => handleAddValue(attribute.id)} className="text-primary">
                                                    <span className="icon-[solar--check-circle-bold] w-4 h-4"/>
                                                </button>
                                            </div>
                                        )}

                                        {(!attribute.attribute_values || attribute.attribute_values.length === 0) && !addingValueToAttrId && (
                                            <span className="text-xs text-gray-300 italic">No values defined</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {data?.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No attributes found</p>
                                <p className="text-gray-400 text-sm mt-2">Create your first attribute to get started</p>
                            </div>
                        )}
                    </div>
                }
            </section>
        </main>
    )
} 