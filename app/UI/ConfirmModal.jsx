'use client'
import Overlay from "./Overlay"

export default function ConfirmModal({ 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Yes, Proceed", 
    cancelText = "Cancel", 
    onConfirm, 
    onCancel, 
    show = false,
    danger = true
}) {
    if (!show) return null;

    return (
        <Overlay id="confirm-modal-overlay" control={onCancel} className="animate-in fade-in duration-500 z-[999]">
            <div className="bg-white/90 backdrop-blur-xl rounded-[3.5rem] shadow-[0_35px_100px_rgba(0,0,0,0.2)] w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/50 flex flex-col relative mx-auto">
                <div className="p-12 text-center flex flex-col items-center">
                    <div className={`w-24 h-24 rounded-[2rem] mx-auto mb-8 flex items-center justify-center relative ${danger ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                        <div className={`absolute inset-0 rounded-[2rem] animate-ping opacity-20 ${danger ? 'bg-rose-400' : 'bg-indigo-400'}`} />
                        <span className={`${danger ? 'icon-[solar--danger-bold-duotone]' : 'icon-[solar--question-square-bold-duotone]'} w-12 h-12 relative z-10`} />
                    </div>
                    
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-4 uppercase italic leading-none">{title}</h3>
                    <p className="text-gray-500 font-bold leading-relaxed px-2">{message}</p>
                </div>

                <div className="flex flex-col gap-3 px-12 pb-12">
                    <button 
                        onClick={onConfirm}
                        className={`w-full ${danger ? 'bg-rose-500 shadow-rose-200' : 'bg-indigo-600 shadow-indigo-200'} hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-[0.2em] text-[12px] py-6 rounded-3xl transition-all shadow-2xl`}
                    >
                        {confirmText}
                    </button>
                    <button 
                        onClick={onCancel}
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-400 font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-3xl transition-all active:scale-[0.95]"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </Overlay>
    )
}
