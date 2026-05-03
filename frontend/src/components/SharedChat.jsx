import React, { useRef, useEffect, useCallback } from "react";
import api, { normalizeUrl } from "../services/api";
import { useChat } from "../context/ChatContext";
import {
  Send, Bot, User, Loader2, RefreshCw, AlertCircle,
  Activity, Droplets, Info, ShieldCheck, Mic, MicOff,
  Sparkles, AlertTriangle, ChevronDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shared Constants ---
const SUGGESTED_QUESTIONS = [
  { text: "What is NPDR?", category: "Education", icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
  { text: "How do I prevent vision loss?", category: "Prevention", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
  { text: "Explain HbA1c levels", category: "Vitals", icon: Droplets, color: "text-rose-500", bg: "bg-rose-50" },
  { text: "Signs of high blood pressure", category: "Awareness", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  { text: "Symptoms of PDR stage", category: "Symptoms", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  { text: "Diabetic diet tips", category: "Lifestyle", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" }
];

// --- Sub-components ---
const MessageBubble = ({ message, isCompact, index, isHistory }) => {
  const isUser = message.role === 'user';
  const { patient } = useChat();
  
  return (
    <motion.div
      initial={isHistory ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: isHistory ? 0 : 0.4, ease: "easeOut" }}
      className={`flex items-start ${isCompact ? 'gap-3' : 'gap-4'} ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`shrink-0 ${isCompact ? 'size-6 rounded-md' : 'size-7 rounded-md'} flex items-center justify-center shadow-sm overflow-hidden ${
          isUser ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-primary border border-slate-100 dark:border-slate-700'
        }`}>
        {isUser ? (
          patient?.photo ? (
            <div 
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${normalizeUrl(patient.photo)})` }}
            />
          ) : (
            <User size={isCompact ? 16 : 20} strokeWidth={2.5} />
          )
        ) : (
          <Bot size={isCompact ? 16 : 20} strokeWidth={2.5} />
        )}
      </div>

      <div className={`${isCompact ? 'max-w-[82%]' : 'max-w-[85%] sm:max-w-[80%]'} flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`relative ${isCompact ? 'rounded-md px-2 py-0.5' : 'rounded-lg px-3 py-1'} shadow-sm transition-all ${
            isUser ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-50 dark:border-slate-700 rounded-tl-none'
          }`}>
          <p className={`${isCompact ? 'text-[10px]' : 'text-[12px]'} leading-tight whitespace-pre-wrap break-words font-medium`}>
            {message.text}
          </p>
        </div>
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{message.time}</p>
          <div className="size-0.5 bg-slate-300 rounded-full" />
          <p className={`text-[9px] font-bold uppercase tracking-widest ${isUser ? 'text-primary' : 'text-slate-500'}`}>
            {isUser ? 'Patient' : 'Assistant'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const TypingIndicator = ({ isCompact }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex items-start ${isCompact ? 'gap-3' : 'gap-4'}`}>
    <div className={`shrink-0 ${isCompact ? 'size-8 rounded-xl' : 'size-10 rounded-xl'} bg-white dark:bg-slate-800 text-primary border border-primary/10 flex items-center justify-center shadow-md`}>
      <Bot size={isCompact ? 16 : 20} strokeWidth={2.5} />
    </div>
    <div className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 ${isCompact ? 'rounded-2xl px-5 py-3' : 'rounded-[2rem] px-8 py-5'} shadow-lg`}>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="size-2 bg-primary rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }} />
        ))}
      </div>
    </div>
  </motion.div>
);

// --- Main Shared Component ---
const SharedChat = ({ variant = 'full', onClose }) => {
  const isCompact = variant === 'floating';
  const { 
    messages, setMessages, isLoading, setIsLoading, 
    isListening, setIsListening, inputValue, setInputValue,
    clearChat 
  } = useChat();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const autoSendTimeoutRef = useRef(null);
  const inputValRef = useRef('');

  useEffect(() => { inputValRef.current = inputValue; }, [inputValue]);

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Auto-scroll logic
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  const historyLoadedRef = useRef(false);

  // Scroll logic
  useEffect(() => {
    if (messages.length > 0) {
      const scroll = (behavior = 'auto') => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
        }
      };

      if (!historyLoadedRef.current) {
        // Force multiple attempts to scroll for initial history
        scroll('auto');
        const timers = [50, 150, 300].map(ms => setTimeout(() => scroll('auto'), ms));
        historyLoadedRef.current = true;
        return () => timers.forEach(clearTimeout);
      } else {
        // Smooth scroll for new messages
        const timer = setTimeout(() => scroll('smooth'), 100);
        return () => clearTimeout(timer);
      }
    }
  }, [messages.length]);

  // Handle Loading state scroll
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => scrollToBottom('smooth'), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    // We could potentially show scroll btn here if needed
  };

  const sendMessage = async (text) => {
    if (autoSendTimeoutRef.current) { clearTimeout(autoSendTimeoutRef.current); autoSendTimeoutRef.current = null; }
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', text: trimmed, time: formatTime(new Date()), id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const history = messages.filter(m => m.id !== 'welcome').slice(-10).map(m => ({ role: m.role, text: m.text }));

    try {
      const res = await api.post('/chat/message', { message: trimmed, history });
      setMessages(prev => [...prev, { role: 'model', text: res.data.reply, time: formatTime(new Date()), id: Date.now() + 1 }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${err.response?.data?.message || 'Something went wrong.'}`, time: formatTime(new Date()), id: Date.now() + 1, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };



  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e) => setInputValue(prev => (prev ? prev + " " + e.results[0][0].transcript : e.results[0][0].transcript));
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        if (inputValRef.current.trim()) {
          autoSendTimeoutRef.current = setTimeout(() => sendMessage(inputValRef.current), 3000);
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const renderHeader = () => (
    <header className={`shrink-0 ${isCompact ? 'h-16 border-b border-slate-50' : 'h-20 border-b border-slate-100'} flex items-center justify-between ${isCompact ? 'px-5' : 'px-6 md:px-10'} bg-white/95 backdrop-blur-xl z-20`}>
      <div className="flex items-center gap-3">
        <h3 className={`${isCompact ? 'text-base' : 'text-xl'} font-black text-slate-900 tracking-tight italic uppercase`}>
          AI <span className="text-primary not-italic">Assistant</span>
        </h3>
        <div className={`flex items-center gap-1.5 ${isCompact ? 'px-2.5 py-1' : 'px-4 py-2'} bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm`}>
          <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black text-emerald-600 uppercase tracking-widest`}>Active</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={clearChat} title="Reset Chat" className={`${isCompact ? 'size-9' : 'size-10'} rounded-xl bg-white text-slate-400 hover:text-primary hover:border-primary/30 border border-slate-100 shadow-sm transition-all flex items-center justify-center group`}>
          <RefreshCw size={isCompact ? 14 : 18} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
        {isCompact && (
          <button onClick={onClose} className="size-9 rounded-xl bg-white text-slate-400 hover:text-rose-500 border border-slate-100 shadow-sm transition-all flex items-center justify-center">
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </header>
  );

  return (
    <div className={`grid grid-rows-[auto_1fr_auto] bg-white relative h-full w-full min-h-0 overflow-hidden ${isCompact ? 'h-[580px] w-[400px] max-w-[calc(100vw-2rem)] rounded-[2rem] shadow-2xl border border-slate-100' : ''}`}>
      {!isCompact && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(5,150,105,0.05),transparent)] pointer-events-none" />}
      
      <div className="shrink-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-50">
        {renderHeader()}
      </div>

      <div 
        ref={messagesContainerRef} 
        onScroll={handleScroll} 
        className={`w-full overflow-y-auto overflow-x-hidden ${isCompact ? 'px-2 py-2 space-y-2' : 'px-3 md:px-6 py-3 space-y-3'} bg-slate-50/10`}
        style={{ height: isCompact ? '400px' : 'calc(100vh - 140px)', minHeight: '0' }}
      >
        <div className={`max-w-md mx-auto w-full ${isCompact ? 'space-y-1' : 'space-y-2'}`}>
          {messages.map((msg, idx) => (
            <MessageBubble 
              key={msg.id || msg._id || idx} 
              message={msg} 
              isCompact={isCompact} 
              isHistory={idx < messages.length - 1 || messages.length > 5} 
            />
          ))}

          {/* Suggested Questions Grid - Only show if only 1 message exists */}
          {messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`grid ${isCompact ? 'grid-cols-1 xs:grid-cols-3 gap-2 mb-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4'}`}
            >
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.text)} className={`group relative bg-white border border-slate-50 rounded-xl text-left hover:border-primary/20 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between h-full ${isCompact ? 'p-2.5 h-[95px]' : 'p-3 min-h-[90px]'}`}>
                  <div className="absolute -bottom-2 -right-2 p-1 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                    <q.icon size={isCompact ? 50 : 70} />
                  </div>
                  <div className="relative z-10">
                    <div className={`${isCompact ? 'size-6 rounded-lg mb-1.5' : 'size-7 rounded-lg mb-2'} ${q.bg} ${q.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                      <q.icon size={isCompact ? 12 : 14} strokeWidth={2.5} />
                    </div>
                    <p className={`${isCompact ? 'text-[7px]' : 'text-[8px]'} font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-primary transition-colors`}>{q.category}</p>
                    <p className={`${isCompact ? 'text-[10px]' : 'text-[11px]'} font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-tight line-clamp-2`}>{q.text}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {isLoading && <TypingIndicator isCompact={isCompact} />}
          <div ref={messagesEndRef} className={isCompact ? "h-2" : "h-4"} />
        </div>
      </div>

      <div className={`shrink-0 ${isCompact ? 'px-2 py-1 border-t border-slate-50' : 'px-3 py-1.5 md:px-6 md:pb-3 pt-0'} bg-white relative z-20`}>
        <div className="max-w-md mx-auto space-y-2">
          <div className={`flex items-center justify-center gap-2 ${isCompact ? 'py-1.5 px-4 bg-amber-50/50 border-amber-100/30' : 'py-2.5 px-6 bg-[#FFF9E7] border-amber-100/50'} rounded-full border mx-auto w-fit`}>
            <AlertCircle size={isCompact ? 11 : 14} className="text-amber-500" />
            <p className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} font-bold text-amber-700 uppercase tracking-widest text-center`}>Informational only • Consult your doctor</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className={`bg-white border border-slate-50 shadow-[0_10px_50px_rgba(0,0,0,0.03)] rounded-[2.5rem] p-1.5 flex items-center gap-2 transition-all focus-within:border-primary/10`}>
            <textarea 
              ref={inputRef}
              id="chat-input"
              name="chat_message"
              value={inputValue} 
              onChange={(e) => { setInputValue(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'; }} 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); } }} 
              placeholder={isCompact ? "Ask about reports..." : "Ask about reports, stages, or health tips..."} 
              className="flex-1 bg-transparent border-none px-5 py-3 text-sm font-medium placeholder-slate-400 outline-none focus:ring-0 transition-all resize-none overflow-hidden" 
              style={{ maxHeight: isCompact ? '96px' : '150px', minHeight: isCompact ? '40px' : '56px' }} 
            />
            <div className="flex items-center gap-1.5 pr-1">
              <button type="button" onClick={toggleListening} className={`${isCompact ? 'size-9' : 'size-12'} rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                {isListening ? <MicOff size={isCompact ? 16 : 22} strokeWidth={2} /> : <Mic size={isCompact ? 16 : 22} strokeWidth={2} />}
              </button>
              <button type="submit" disabled={!inputValue.trim() || isLoading} className={`${isCompact ? 'size-9' : 'size-12'} rounded-xl flex items-center justify-center transition-all shadow-sm ${!inputValue.trim() || isLoading ? 'bg-slate-100 text-slate-300' : 'bg-[#C6E2D9] text-primary hover:bg-primary hover:text-white'}`}>
                {isLoading ? <Loader2 className="animate-spin" size={isCompact ? 16 : 22} /> : <Send size={isCompact ? 16 : 22} strokeWidth={2} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SharedChat;
