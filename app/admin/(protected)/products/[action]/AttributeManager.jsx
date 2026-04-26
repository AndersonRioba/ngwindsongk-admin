'use client'

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"

function VariationImageSelector({attribute, item, attributes, setAttributes, allMedia = []}){
    const [isOpen, setIsOpen] = useState(false);
    const selectedImage = attributes[attribute]?.[item]?.['image'];

    const handleSelect = (url, isFile = false) => {
        setAttributes(prev => {
            const newAttributes = { ...prev };
            if (!newAttributes[attribute]) newAttributes[attribute] = {};
            newAttributes[attribute][item] = {
                ...(newAttributes[attribute][item] || {}),
                image: url,
                is_new_image: isFile
            };
            return newAttributes;
        });
        setIsOpen(false);
    };

    const previewUrl = useMemo(() => {
        if (!selectedImage) return null;
        if (selectedImage.startsWith('http') || selectedImage.startsWith('/')) return selectedImage;
        const file = allMedia.find(m => m instanceof File && m.name === selectedImage);
        return file ? URL.createObjectURL(file) : null;
    }, [selectedImage, allMedia]);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-10 border border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-primary transition-colors overflow-hidden bg-gray-50 text-xs text-gray-400"
            >
                {previewUrl ? (
                    <Image src={previewUrl} alt="Selected" width={40} height={40} className="w-full h-full object-cover" unoptimized={true} />
                ) : (
                    <span className="icon-[fluent--image-add-24-regular] w-5 h-5" />
                )}
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-2 p-3 bg-white border rounded-lg shadow-xl w-64 -left-10 md:left-0">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-gray-500 uppercase">Select Image</p>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">
                            <span className="icon-[fluent--dismiss-16-regular] w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                        {allMedia.map((media, idx) => {
                            const url = media.url || (media instanceof File ? URL.createObjectURL(media) : null);
                            if (!url) return null;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSelect(media instanceof File ? media.name : media.url, media instanceof File);
                                    }}
                                    className={`relative aspect-square rounded-lg border-2 transition-all group/img ${
                                        selectedImage === (media instanceof File ? media.name : media.url) 
                                        ? 'border-primary ring-2 ring-primary/20' 
                                        : 'border-transparent hover:border-gray-300 bg-gray-50'
                                    }`}
                                >
                                    <Image 
                                        src={media instanceof File ? URL.createObjectURL(media) : media.url} 
                                        width={100}
                                        height={100}
                                        className="w-full h-full object-cover rounded-md" 
                                        alt="" 
                                        unoptimized={true}
                                    />
                                    {selectedImage === (media instanceof File ? media.name : media.url) && (
                                        <div className="absolute inset-0 bg-primary/10 rounded-md flex items-center justify-center">
                                            <div className="bg-primary text-white p-0.5 rounded-full shadow-lg">
                                                <span className="icon-[fluent--checkmark-16-filled] w-4 h-4" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 py-1 bg-black/40 text-[8px] text-white opacity-0 group-hover/img:opacity-100 transition-opacity rounded-b-md">
                                        Click to link
                                    </div>
                                </button>
                            );
                        })}
                        {allMedia.length === 0 && (
                            <p className="col-span-3 text-[10px] text-center text-gray-400 py-4">No images uploaded yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function CustomInput({placeholder, type, attribute, item, name, attributes, setAttributes}){
    const value = attributes[attribute]?.[item]?.[name] ?? '';

    const handleChange = (e) => {
        const val = e.target.value;
        setAttributes(prev => ({
            ...prev,
            [attribute]: {
                ...prev[attribute],
                [item]: {
                    ...(prev[attribute]?.[item] || {}),
                    [name]: val
                }
            }
        }));
    };

    return (
        <input
            type={type}
            placeholder={placeholder}
            className="w-full bg-white border border-gray-300 text-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            value={value}
            onChange={handleChange}
        />
    )
}

export function ProductVariations({attributes, setAttributes, allMedia}){
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-xl font-bold mb-6 text-gray-800">Product Variations</h1>
            <div>
                {
                    Object.keys(attributes).map((attribute, index)=>(
                        <div key={index} className="w-full mb-6 last:mb-0">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{attribute}</h2>
                            <div className="flex flex-col gap-4 w-full">
                                {
                                    Object.keys(attributes[attribute]).map((item, index)=>(
                                        <div key={index} className="bg-gray-50/80 border border-gray-200 p-4 rounded-lg w-full transition-all hover:bg-gray-50">
                                            <div className="flex items-center mb-3">
                                                <span className="bg-gray-200/70 text-gray-800 px-3 py-1 rounded-md text-sm font-medium">{item}</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-1">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">IMAGE</label>
                                                    <VariationImageSelector 
                                                        attribute={attribute} 
                                                        item={item} 
                                                        attributes={attributes} 
                                                        setAttributes={setAttributes}
                                                        allMedia={allMedia}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">STOCK</label>
                                                    <CustomInput placeholder="0" type="number" name={'stock'} attribute={attribute} item={item} attributes={attributes} setAttributes={setAttributes}/>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">PRICE</label>
                                                    <CustomInput placeholder="0.00" type="number" name={'price'} attribute={attribute} item={item} attributes={attributes} setAttributes={setAttributes}/>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">DISCOUNT (KSH)</label>
                                                    <CustomInput placeholder="0.00" type="number" name={'discount'} attribute={attribute} item={item} attributes={attributes} setAttributes={setAttributes}/>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">WEIGHT (KG)</label>
                                                    <CustomInput placeholder="0.00" type="number" name={'weight_kg'} attribute={attribute} item={item} attributes={attributes} setAttributes={setAttributes}/>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">MIN QTY</label>
                                                    <CustomInput placeholder="0" type="number" name={'min_order_quantity'} attribute={attribute} item={item} attributes={attributes} setAttributes={setAttributes}/>
                                                </div>
                                                <div className="flex items-center gap-2 pt-6">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-primary rounded"
                                                        checked={!!attributes[attribute]?.[item]?.['is_bulk']}
                                                        onChange={e => {
                                                            setAttributes(prev => {
                                                                const newAttrs = { ...prev };
                                                                newAttrs[attribute][item] = {
                                                                    ...newAttrs[attribute][item],
                                                                    is_bulk: e.target.checked
                                                                };
                                                                return newAttrs;
                                                            });
                                                        }}
                                                    />
                                                    <label className="text-xs font-medium text-gray-500 uppercase">IS BULK</label>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default function AttributeManager({attributes, setAttributes }) {
    const [newAttribute, setNewAttribute] = useState('');
    const [showNewAttribute, setShowNewAttribute] = useState(false);

    // Rename an attribute key (e.g. "Quantity" → "Size")
    const handleRenameAttribute = (oldKey, newKey) => {
        if (!newKey.trim() || newKey === oldKey) return;
        const entries = Object.entries(attributes);
        const rebuilt = {};
        entries.forEach(([k, v]) => {
            rebuilt[k === oldKey ? newKey.trim() : k] = v;
        });
        setAttributes(rebuilt);
    };

    // Delete an entire attribute group
    const handleDeleteAttribute = (key) => {
        const copy = { ...attributes };
        delete copy[key];
        setAttributes(copy);
    };

    // Rename a value chip (e.g. "250g" → "250 grams")
    const handleRenameValue = (attribute, oldVal, newVal) => {
        if (!newVal.trim() || newVal === oldVal) return;
        const values = { ...attributes[attribute] };
        const data = values[oldVal];
        delete values[oldVal];
        values[newVal.trim()] = data;
        setAttributes(prev => ({ ...prev, [attribute]: values }));
    };

    // Delete a single value chip
    const handleDeleteValue = (attribute, val) => {
        const values = { ...attributes[attribute] };
        delete values[val];
        setAttributes(prev => ({ ...prev, [attribute]: values }));
    };

    // Add a new value to an attribute
    const handleAddValue = (attribute, val) => {
        if (!val.trim()) return;
        setAttributes(prev => ({
            ...prev,
            [attribute]: { ...prev[attribute], [val.trim()]: { stock: 0, discount: null, price: null, weight_kg: 0, min_order_quantity: 0, is_bulk: false } }
        }));
    };

    // Create a new attribute group
    const handleCreateAttribute = () => {
        if (!newAttribute.trim()) return;
        setAttributes({ ...attributes, [newAttribute.trim()]: {} });
        setNewAttribute('');
        setShowNewAttribute(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h1 className="text-xl font-semibold mb-6 text-gray-800">Attribute Manager</h1>

            {Object.keys(attributes).map((attributeKey) => (
                <AttributeGroup
                    key={attributeKey}
                    attributeKey={attributeKey}
                    attributes={attributes}
                    onRenameAttribute={handleRenameAttribute}
                    onDeleteAttribute={handleDeleteAttribute}
                    onRenameValue={handleRenameValue}
                    onDeleteValue={handleDeleteValue}
                    onAddValue={handleAddValue}
                />
            ))}

            {/* Create new attribute */}
            <div className="flex gap-3 mt-2 items-center flex-wrap">
                {showNewAttribute && (
                    <input
                        autoFocus
                        type="text"
                        placeholder="Attribute name (e.g. Size)"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={newAttribute}
                        onChange={e => setNewAttribute(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleCreateAttribute();
                            if (e.key === 'Escape') { setShowNewAttribute(false); setNewAttribute(''); }
                        }}
                    />
                )}
                <button
                    onClick={() => {
                        if (showNewAttribute) {
                            handleCreateAttribute();
                        } else {
                            setShowNewAttribute(true);
                        }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
                >
                    <span className="icon-[rivet-icons--plus] w-4 h-4" />
                    {showNewAttribute ? 'Confirm Attribute' : 'Create Attribute'}
                </button>
                {showNewAttribute && (
                    <button
                        onClick={() => { setShowNewAttribute(false); setNewAttribute(''); }}
                        className="text-sm text-gray-400 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

/** Individual attribute group with inline-editable name + value chips */
function AttributeGroup({ attributeKey, attributes, onRenameAttribute, onDeleteAttribute, onRenameValue, onDeleteValue, onAddValue }) {
    const [editingName, setEditingName] = useState(false);
    const [draftName, setDraftName] = useState(attributeKey);
    const [newValue, setNewValue] = useState('');

    // Keep draftName in sync if parent renames propagate
    useEffect(() => { setDraftName(attributeKey); }, [attributeKey]);

    const commitName = () => {
        onRenameAttribute(attributeKey, draftName);
        setEditingName(false);
    };

    return (
        <div className="bg-gray-100 p-5 mb-3 rounded-lg group/attr">
            {/* Attribute name row */}
            <div className="flex items-center gap-2 mb-3">
                {editingName ? (
                    <input
                        autoFocus
                        className="font-bold text-base border border-primary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
                        value={draftName}
                        onChange={e => setDraftName(e.target.value)}
                        onBlur={commitName}
                        onKeyDown={e => {
                            if (e.key === 'Enter') commitName();
                            if (e.key === 'Escape') { setDraftName(attributeKey); setEditingName(false); }
                        }}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        className="flex items-center gap-1.5 group/name"
                        title="Click to rename attribute"
                    >
                        <h2 className="font-bold text-base text-gray-800 group-hover/name:text-primary transition-colors">{attributeKey}</h2>
                        <span className="icon-[fluent--edit-16-regular] w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/name:opacity-100 transition-all" />
                    </button>
                )}
                {/* Delete entire attribute */}
                <button
                    type="button"
                    onClick={() => onDeleteAttribute(attributeKey)}
                    className="ml-auto opacity-0 group-hover/attr:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded"
                    title="Remove attribute"
                >
                    <span className="icon-[fluent--delete-16-regular] w-4 h-4" />
                </button>
            </div>

            {/* Value chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(attributes[attributeKey]).map((val) => (
                    <ValueChip
                        key={val}
                        val={val}
                        attributeKey={attributeKey}
                        onRename={onRenameValue}
                        onDelete={onDeleteValue}
                    />
                ))}
                {Object.keys(attributes[attributeKey]).length === 0 && (
                    <p className="text-xs text-gray-400 italic">No values yet — add one below</p>
                )}
            </div>

            {/* Add new value */}
            <div className="flex gap-2 items-center">
                <input
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && newValue.trim()) {
                            onAddValue(attributeKey, newValue);
                            setNewValue('');
                        }
                    }}
                    type="text"
                    placeholder="value"
                    className="bg-white p-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-40"
                />
                <button
                    type="button"
                    onClick={() => { onAddValue(attributeKey, newValue); setNewValue(''); }}
                    className="bg-secondary text-white rounded-full flex items-center justify-center text-lg w-7 h-7 hover:bg-secondary/80 transition-colors shrink-0"
                >+</button>
            </div>
        </div>
    );
}

/** Single editable value chip */
function ValueChip({ val, attributeKey, onRename, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(val);

    useEffect(() => { setDraft(val); }, [val]);

    const commit = () => {
        onRename(attributeKey, val, draft);
        setEditing(false);
    };

    if (editing) {
        return (
            <input
                autoFocus
                className="border border-primary rounded-md px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 w-24"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') { setDraft(val); setEditing(false); }
                }}
            />
        );
    }

    return (
        <span className="group/chip inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-md text-sm font-medium text-gray-700 hover:border-primary/50 transition-colors">
            <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 group/label"
                title="Click to edit value"
            >
                <span className="group-hover/label:text-primary transition-colors">{val}</span>
                <span className="icon-[fluent--edit-16-regular] w-3 h-3 text-gray-400 opacity-0 group-hover/chip:opacity-100 transition-all" />
            </button>
            <button
                type="button"
                onClick={() => onDelete(attributeKey, val)}
                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/chip:opacity-100 ml-0.5"
                title="Remove value"
            >
                <span className="icon-[fluent--dismiss-12-regular] w-3 h-3" />
            </button>
        </span>
    );
}