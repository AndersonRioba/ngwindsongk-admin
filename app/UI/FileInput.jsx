'use client'
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

export default function FileInput({ files = [], setFiles, type }) {
    const [dragging, setDragging] = useState(false);
    let [image, setImage] = useState(null);
    let [title, setTitle] = useState('');

    const createURL = useCallback(() => {
        if (type != 'image') return;
        if (files.length===0) {
            setImage(null);
            return;
        }
        let file = files[files.length-1]
        if (file && file.type.startsWith('image/')){
            let url = URL.createObjectURL(file);
            setImage(url);
        } else {
            alert ('File uploaded not image')
        }
    }, [files, type]);

    useEffect(() => {
        createURL();
    }, [createURL]);

    const handleFileChange = (event) => {
        setFiles([...files, ...event.target.files]);
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        setFiles([...files, ...event.dataTransfer.files]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((file, i) => i !== index));
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-2 py-12 ${(image || type != 'image')?'':'py-12'} flex flex-col items-center justify-center bg-white ${dragging ? "border-2 border-primary" : "border-2 border-black"} rounded-xl`}
        >
            {
                type === 'image' ?
                    image?
                    <Image
                        loading="lazy"
                        src={image}
                        alt=""
                        width={352}
                        height={288}
                        className="object-cover rounded-xl inset-0 w-72 h-72 lg:w-60 lg:h-64 2xl:h-72 2xl:w-[22rem]"
                        unoptimized={true}
                    />
                    :
                    <span className='icon-[fluent--image-28-regular] text-gray-800 w-12 h-12 2xl:w-16 2xl:h-16'/>
                :
                <span className="w-12 h-12 2xl:w-16 2xl:h-16 icon-[gala--file]" alt="" />
            }
            <input 
                type="file"
                id={`profile-${type}`} 
                {...
                    type === 'image' ?
                    {accept: 'image/*'}
                    :
                    {accept: '*'}
                }
                multiple onChange={handleFileChange} 
                className="
                    text-sm text-black
                    file:bg-white file:border-none file:outline-none
                    file:font-medium
                    file:text-secondary file:text-lg
                    hover:file:cursor-pointer hover:file:text-xl
                    file:hidden text-center
                " 
            />
            <label htmlFor={`profile-${type}`}  className='py-4'>
                Drag or <span className="text-primary hover:cursor-pointer">select</span> image to upload
            </label>
            {files.map((file, index) => (
                <div className="text-sm md:text-base grid grid-cols-3 gap-x-2 auto-rows-max mb-2" key={index}>
                    <span className="col-span-2 text-left max-w-1/3 truncate">{file.name}</span>
                    <button className=" text-red-500 w-fit" onClick={() => removeFile(index)}>Remove</button>
                </div>
            ))}
        </div>
    );
}