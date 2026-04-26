'use client'

export default function Overlay({ children, className, id, control }) {
    const handleBackgroundClick = (e) => {
        if (e.target.id === id) {
            control('');
        }
    };

    return (
        <div 
            id={id} 
            onClick={handleBackgroundClick}
            className={`fixed flex items-center justify-center z-[9999] w-screen h-screen top-0 left-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${className}`}
        >
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
    )
}