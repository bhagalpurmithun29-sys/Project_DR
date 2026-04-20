import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Bot, User, Loader2,
    RefreshCw, ChevronDown, Sparkles, AlertCircle,
    Activity, Heart, Droplets
} from 'lucide-react';
import api from '../services/api';

// ─── Suggested Starter Questions ────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
    "What are early signs of diabetic retinopathy?",
    "How do I manage my blood sugar levels daily?",
    "What foods should diabetics avoid?",
    "What is HbA1c and what's a normal range?",
    "How does insulin resistance develop?",
];

// ─── Message Bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ message, isLast }) => {
    const isUser = message.role === 'user';
    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar */}
            <div className={`shrink-0 size-7 rounded-xl flex items-center justify-center shadow-sm ${
                isUser
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
            }`}>
                {isUser ? <User size={13} strokeWidth={2.5} /> : <Bot size={13} strokeWidth={2.5} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                isUser
                    ? 'bg-emerald-500 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
            }`}>
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`text-[10px] mt-1.5 font-medium ${
                    isUser ? 'text-emerald-100 text-right' : 'text-slate-400 dark:text-slate-500'
                }`}>
                    {message.time}
                </p>
            </div>
        </motion.div>
    );
};

// ─── Typing Indicator ────────────────────────────────────────────────────────
const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-end gap-2.5"
    >
        <div className="shrink-0 size-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Bot size={13} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="size-2 bg-indigo-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                ))}
            </div>
        </div>
    </motion.div>
);

// ─── Main Chatbot Component ──────────────────────────────────────────────────
const DiabetesChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcome = {
                role: 'model',
                text: "👋 Hello! I'm **DiabetesAI**, your specialized diabetes health assistant.\n\nI can help you with questions about blood sugar management, diabetic retinopathy, medications, diet, symptoms, and more.\n\nWhat would you like to know about diabetes today?",
                time: formatTime(new Date()),
                id: 'welcome',
            };
            setMessages([welcome]);
        }
        if (isOpen) {
            setHasUnread(false);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isLoading]);

    // Track scroll position for scroll-to-bottom button
    const handleScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollBtn(distFromBottom > 100);
    };

    const formatTime = (date) =>
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userMsg = {
            role: 'user',
            text: trimmed,
            time: formatTime(new Date()),
            id: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        // Build history for context (exclude welcome msg, max 8 turns)
        const history = messages
            .filter(m => m.id !== 'welcome')
            .slice(-8)
            .map(m => ({ role: m.role, text: m.text }));

        try {
            const res = await api.post('/chat/message', {
                message: trimmed,
                history,
            });

            const botMsg = {
                role: 'model',
                text: res.data.reply,
                time: formatTime(new Date()),
                id: Date.now() + 1,
            };
            setMessages(prev => [...prev, botMsg]);
            if (!isOpen) setHasUnread(true);
        } catch (err) {
            const errText = err.response?.data?.message || 'Something went wrong. Please try again.';
            const errMsg = {
                role: 'model',
                text: `⚠️ ${errText}`,
                time: formatTime(new Date()),
                id: Date.now() + 1,
                isError: true,
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputValue);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setTimeout(() => {
            // Trigger welcome message again
            const welcome = {
                role: 'model',
                text: "Chat cleared! I'm DiabetesAI. How can I help you with your diabetes questions?",
                time: formatTime(new Date()),
                id: 'welcome-new',
            };
            setMessages([welcome]);
        }, 100);
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
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-xl max-w-[200px]"
                        >
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                                🩺 Ask about <span className="text-emerald-600 font-black">diabetes</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    id="diabetes-chatbot-fab"
                    onClick={() => setIsOpen(prev => !prev)}
                    className="relative size-14 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center transition-all"
                    style={{
                        background: isOpen
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : 'linear-gradient(135deg, #059669, #10b981)',
                    }}
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

                    {/* Unread badge */}
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
                        className="fixed bottom-24 right-6 z-[9998] w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 border border-white/10"
                        style={{ height: '560px' }}
                    >
                        {/* Header */}
                        <div
                            className="shrink-0 px-5 py-4 flex items-center gap-3"
                            style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)' }}
                        >
                            <div className="size-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-black text-sm tracking-tight">DiabetesAI</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="size-1.5 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_6px_rgba(110,231,183,0.8)]" />
                                    <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">Specialized Assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearChat}
                                    title="Clear conversation"
                                    className="size-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
                                >
                                    <RefreshCw size={14} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="size-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
                                >
                                    <X size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* Specialty badges */}
                        <div className="shrink-0 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/30 px-4 py-2 flex items-center gap-2 overflow-x-auto">
                            {[
                                { icon: Droplets, label: 'Blood Sugar' },
                                { icon: Activity, label: 'Retinopathy' },
                                { icon: Heart, label: 'Diabetes Care' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="shrink-0 flex items-center gap-1.5 bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/40 rounded-full px-2.5 py-1 shadow-sm">
                                    <Icon size={10} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest whitespace-nowrap">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
                        >
                            {/* Suggested questions (shown before first user message) */}
                            {messages.length <= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-2"
                                >
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Suggested Questions</p>
                                    {SUGGESTED_QUESTIONS.map((q, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.07 }}
                                            onClick={() => sendMessage(q)}
                                            className="w-full text-left text-[12px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all shadow-sm"
                                        >
                                            {q}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}

                            {/* Chat messages */}
                            {messages.map((msg, idx) => (
                                <MessageBubble
                                    key={msg.id || idx}
                                    message={msg}
                                    isLast={idx === messages.length - 1}
                                />
                            ))}

                            {/* Typing indicator */}
                            <AnimatePresence>
                                {isLoading && <TypingIndicator />}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to bottom */}
                        <AnimatePresence>
                            {showScrollBtn && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => scrollToBottom()}
                                    className="absolute right-6 bottom-20 size-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all"
                                >
                                    <ChevronDown size={16} strokeWidth={2.5} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Disclaimer */}
                        <div className="shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-800/20 flex items-start gap-2">
                            <AlertCircle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-tight">
                                AI responses are informational only. Always consult your doctor for medical advice.
                            </p>
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleSubmit}
                            className="shrink-0 px-4 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-end gap-3"
                        >
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    id="diabetes-chatbot-input"
                                    rows={1}
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        // Auto-grow
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about diabetes..."
                                    disabled={isLoading}
                                    className="w-full resize-none bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-300 dark:focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none transition-all leading-relaxed shadow-inner disabled:opacity-60"
                                    style={{ minHeight: '44px', maxHeight: '96px' }}
                                />
                            </div>
                            <motion.button
                                type="submit"
                                id="diabetes-chatbot-send"
                                disabled={!inputValue.trim() || isLoading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="shrink-0 size-11 rounded-xl flex items-center justify-center shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: (!inputValue.trim() || isLoading)
                                        ? '#e2e8f0'
                                        : 'linear-gradient(135deg, #059669, #10b981)',
                                }}
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="text-slate-400 animate-spin" />
                                ) : (
                                    <Send size={17} className={!inputValue.trim() ? 'text-slate-400' : 'text-white'} strokeWidth={2.5} />
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DiabetesChatbot;
