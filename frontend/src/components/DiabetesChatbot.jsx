import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Bot, User, Loader2,
    RefreshCw, ChevronDown, Sparkles, AlertCircle,
    Activity, Heart, Droplets, Mic, MicOff,
    Info, ShieldCheck
} from 'lucide-react';
import api from '../services/api';

// ─── Suggested Starter Questions ────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
    { text: "What is NPDR?",                 category: "Education",   icon: Info,        color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-100"   },
    { text: "How to prevent vision loss?",   category: "Prevention",  icon: ShieldCheck, color: "text-emerald-500",bg: "bg-emerald-50",border: "border-emerald-100"},
    { text: "Explain HbA1c levels",          category: "Vitals",      icon: Droplets,    color: "text-rose-500",   bg: "bg-rose-50",   border: "border-rose-100"   },
    { text: "Symptoms of PDR stage",         category: "Symptoms",    icon: AlertCircle, color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-100"  },
    { text: "Diabetic diet tips",            category: "Lifestyle",   icon: Heart,       color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
    { text: "Signs of high blood sugar",     category: "Awareness",   icon: Activity,    color: "text-primary",    bg: "bg-primary/5", border: "border-primary/10" },
];

// ─── Message Bubble (matches Ai Assistant style) ─────────────────────────────
const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar */}
            <div className={`shrink-0 size-8 rounded-xl flex items-center justify-center shadow-md ${
                isUser
                    ? 'bg-primary text-white shadow-primary/20'
                    : 'bg-white text-primary border border-primary/10 shadow-slate-200'
            }`}>
                {isUser ? <User size={14} strokeWidth={2.5} /> : <Bot size={14} strokeWidth={2.5} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`relative rounded-[1.5rem] px-4 py-3 shadow-lg transition-all ${
                    isUser
                        ? 'bg-primary text-white rounded-tr-none shadow-primary/10'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-slate-200/50'
                }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                        {message.text}
                    </p>
                </div>
                <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{message.time}</p>
                    <div className="size-1 bg-slate-300 rounded-full" />
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isUser ? 'text-primary' : 'text-slate-500'}`}>
                        {isUser ? 'You' : 'AI Assistant'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Typing Indicator (matches Ai Assistant style) ───────────────────────────
const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-start gap-3"
    >
        <div className="shrink-0 size-8 rounded-xl bg-white text-primary border border-primary/10 flex items-center justify-center shadow-md">
            <Bot size={14} strokeWidth={2.5} />
        </div>
        <div className="bg-white border border-slate-100 rounded-[1.5rem] rounded-tl-none px-5 py-3 shadow-lg">
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="size-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                    />
                ))}
            </div>
        </div>
    </motion.div>
);

// ─── Main Chatbot Component ──────────────────────────────────────────────────
const DiabetesChatbot = () => {
    const [isOpen, setIsOpen]           = useState(false);
    const [inputValue, setInputValue]   = useState('');
    const [messages, setMessages]       = useState([]);
    const [isLoading, setIsLoading]     = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [hasUnread, setHasUnread]     = useState(false);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef        = useRef(null);
    const messagesContainerRef  = useRef(null);
    const inputRef              = useRef(null);
    const recognitionRef        = useRef(null);

    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'model',
                text: `👋 Hello! I'm your RetinaAI Diabetes Assistant.\n\nI can help you understand your diagnostic reports, explain the different stages of Diabetic Retinopathy, and provide evidence-based guidance on blood sugar management and eye health.\n\nWhat would you like to know today?`,
                time: formatTime(new Date()),
                id: 'welcome',
            }]);
        }
        if (isOpen) {
            setHasUnread(false);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Auto-scroll
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isLoading]);

    const handleScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    };

    // Voice recognition (matches Ai Assistant)
    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
        };
        recognition.onend  = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userMsg = { role: 'user', text: trimmed, time: formatTime(new Date()), id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const history = messages
            .filter(m => m.id !== 'welcome')
            .slice(-8)
            .map(m => ({ role: m.role, text: m.text }));

        try {
            const res = await api.post('/chat/message', { message: trimmed, history });
            setMessages(prev => [...prev, {
                role: 'model',
                text: res.data.reply,
                time: formatTime(new Date()),
                id: Date.now() + 1,
            }]);
            if (!isOpen) setHasUnread(true);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: `⚠️ ${err.response?.data?.message || 'Something went wrong. Please try again.'}`,
                time: formatTime(new Date()),
                id: Date.now() + 1,
                isError: true,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'model',
            text: "Chat cleared! I'm your RetinaAI Diabetes Assistant. How can I help you today?",
            time: formatTime(new Date()),
            id: 'welcome-new',
        }]);
    };

    return (
        <>
            {/* ── FAB Trigger Button ──────────────────────────────────────── */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xl max-w-[200px]"
                        >
                            <p className="text-[11px] font-bold text-slate-500 leading-tight">
                                🩺 Ask about <span className="text-primary font-black">diabetes</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    id="diabetes-chatbot-fab"
                    onClick={() => setIsOpen(prev => !prev)}
                    className="relative size-14 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center transition-all"
                    style={{ background: isOpen ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#059669,#10b981)' }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                <X size={22} className="text-white" strokeWidth={2.5} />
                            </motion.div>
                        ) : (
                            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                <MessageCircle size={22} className="text-white" strokeWidth={2.5} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {hasUnread && !isOpen && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 size-4 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white"
                        >
                            <span className="text-[8px] text-white font-black">1</span>
                        </motion.div>
                    )}
                </motion.button>
            </div>

            {/* ── Chat Window ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="diabetes-chatbot-window"
                        initial={{ opacity: 0, scale: 0.9, y: 20, originX: 1, originY: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                        className="fixed bottom-24 right-6 z-[9998] w-[400px] max-w-[calc(100vw-2rem)] flex flex-col rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 border border-slate-100 bg-white"
                        style={{ height: '580px' }}
                    >
                        {/* ── Header (matches Ai Assistant header style) ── */}
                        <div className="shrink-0 h-16 border-b border-slate-100 flex items-center justify-between px-5 bg-white/90 backdrop-blur-xl">
                            <div className="flex flex-col justify-center">
                                <h3 className="text-base font-black text-slate-900 tracking-tight italic leading-tight">
                                    AI <span className="text-primary not-italic">Assistant</span>
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Diabetes AI</span>
                                </div>
                                <button
                                    onClick={clearChat}
                                    title="Reset Chat"
                                    className="size-8 rounded-xl bg-white text-slate-400 hover:text-primary hover:border-primary/30 border border-slate-100 shadow-sm transition-all flex items-center justify-center group"
                                >
                                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="size-8 rounded-xl bg-white text-slate-400 hover:text-rose-500 border border-slate-100 shadow-sm transition-all flex items-center justify-center"
                                >
                                    <X size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* ── Messages Area ── */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-5 py-5 space-y-6 bg-slate-50/20"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
                        >
                            <div className="space-y-6">
                                {/* Suggested questions — 3-col icon card grid */}
                                {messages.length <= 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mb-2"
                                    >
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Suggested Questions</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                                <motion.button
                                                    key={i}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.35 + i * 0.06 }}
                                                    onClick={() => sendMessage(q.text)}
                                                    className={`group flex flex-col items-start p-3 bg-white border ${q.border} rounded-2xl text-left hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all h-[90px]`}
                                                >
                                                    <div className={`size-7 rounded-lg ${q.bg} ${q.color} flex items-center justify-center mb-2 shrink-0 group-hover:scale-110 transition-transform`}>
                                                        <q.icon size={13} strokeWidth={2.5} />
                                                    </div>
                                                    <p className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${q.color}`}>{q.category}</p>
                                                    <p className="text-[10px] font-bold text-slate-700 italic group-hover:text-slate-900 transition-colors leading-tight line-clamp-2">{q.text}</p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {messages.map((msg, idx) => (
                                    <MessageBubble key={msg.id || idx} message={msg} />
                                ))}

                                <AnimatePresence>
                                    {isLoading && <TypingIndicator />}
                                </AnimatePresence>

                                <div ref={messagesEndRef} className="h-2" />
                            </div>
                        </div>

                        {/* ── Scroll to Bottom ── */}
                        <AnimatePresence>
                            {showScrollBtn && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => scrollToBottom()}
                                    className="absolute right-5 bottom-28 size-10 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-30"
                                >
                                    <ChevronDown size={18} strokeWidth={3} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* ── Disclaimer (matches Ai Assistant style) ── */}
                        <div className="shrink-0 px-5 py-2.5 bg-amber-50/50 border-t border-amber-100/50 flex items-center justify-center gap-2">
                            <AlertCircle size={11} className="text-amber-500 shrink-0" />
                            <p className="text-[9px] font-black text-amber-700/80 uppercase tracking-widest text-center">
                                Informational only • Consult your doctor for medical advice
                            </p>
                        </div>

                        {/* ── Input Area (matches Ai Assistant pill style) ── */}
                        <div className="shrink-0 px-4 py-3 bg-white border-t border-slate-50">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}
                                className="bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] p-2 flex items-end gap-2 transition-all focus-within:shadow-primary/5 focus-within:border-primary/20"
                            >
                                <textarea
                                    ref={inputRef}
                                    id="diabetes-chatbot-input"
                                    rows={1}
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
                                    }}
                                    placeholder="Ask about reports, stages, or health tips..."
                                    disabled={isLoading}
                                    className="flex-1 bg-slate-50/50 border-none rounded-[1.8rem] px-5 py-3 text-sm font-medium placeholder-slate-400 outline-none focus:ring-0 focus:bg-white transition-all resize-none overflow-hidden disabled:opacity-60"
                                    style={{ maxHeight: '96px', minHeight: '44px' }}
                                />
                                {/* Mic button */}
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`shrink-0 size-11 rounded-[1.4rem] flex items-center justify-center transition-all ${
                                        isListening
                                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                                    }`}
                                    title={isListening ? 'Stop listening' : 'Voice input'}
                                >
                                    {isListening ? <MicOff size={16} strokeWidth={2.5} /> : <Mic size={16} strokeWidth={2.5} />}
                                </button>
                                {/* Send button */}
                                <motion.button
                                    type="submit"
                                    id="diabetes-chatbot-send"
                                    disabled={!inputValue.trim() || isLoading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="shrink-0 size-11 bg-primary text-white rounded-[1.4rem] flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DiabetesChatbot;
