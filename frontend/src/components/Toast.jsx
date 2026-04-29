import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border min-w-[320px] ${
                type === 'success' 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-red-600 text-white border-red-500'
            }`}
        >
            <div className="size-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            <div className="flex-1">
                <p className="font-black text-sm tracking-tight leading-tight">{message}</p>
            </div>
            <button onClick={onClose} className="size-8 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default Toast;
