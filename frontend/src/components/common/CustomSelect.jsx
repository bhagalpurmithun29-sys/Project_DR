import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, X } from 'lucide-react';

const CustomSelect = ({ 
    label, 
    value, 
    onChange, 
    options, 
    icon: Icon, 
    placeholder = 'Select option',
    searchable = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const searchInputId = useId();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = searchable 
        ? options.filter(opt => 
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            {label && (
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {label}
                </span>
            )}
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center gap-3 w-full pl-5 pr-12 py-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm
                    ${isOpen ? 'border-primary/40 bg-white ring-4 ring-primary/5' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}
                `}
            >
                {Icon && (
                    <Icon 
                        size={18} 
                        className={`transition-colors ${isOpen ? 'text-primary' : 'text-slate-300 group-hover:text-slate-400'}`} 
                    />
                )}
                
                <span className={`text-sm font-bold truncate ${value ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300" 
                     style={{ transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})` }}>
                    <ChevronDown size={18} className={isOpen ? 'text-primary' : 'text-slate-300'} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[100] left-0 right-0 mt-2 bg-slate-900 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden backdrop-blur-xl"
                    >
                        {searchable && (
                            <div className="p-4 border-b border-white/5 pb-2">
                                <div className="relative group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary" />
                                    <input
                                        id={searchInputId}
                                        name="custom-select-search"
                                        autoFocus
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 py-3">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`flex items-center justify-between px-5 py-3 rounded-xl transition-all cursor-pointer group/opt
                                            ${opt.value === value ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                                        `}
                                    >
                                        <span className="text-sm font-black tracking-tight">{opt.label}</span>
                                        {opt.value === value && <Check size={16} strokeWidth={3} />}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No regions found</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
