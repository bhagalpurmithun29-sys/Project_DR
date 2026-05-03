import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import api, { normalizeUrl } from "../services/api";
import {
  Activity,
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  BookOpen,
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Heart,
  Droplets,
  Search,
  ChevronDown,
  Info,
  ShieldCheck,
  Mic,
  MicOff,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientPreferencesModal from './PatientPreferencesModal';

// --- Message Bubble Component ---
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 size-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${isUser
          ? 'bg-primary text-white shadow-primary/20'
          : 'bg-white dark:bg-slate-800 text-primary border border-primary/10 shadow-slate-200'
        }`}>
        {isUser ? <User size={20} strokeWidth={2.5} /> : <Bot size={20} strokeWidth={2.5} />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`relative rounded-[2rem] px-6 py-4 shadow-2xl transition-all ${isUser
            ? 'bg-primary text-white rounded-tr-none shadow-primary/10'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-slate-200/50'
          }`}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium">
            {message.text}
          </p>
        </div>
        <div className={`flex items-center gap-2 mt-2 px-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {message.time}
          </p>
          <div className="size-1 bg-slate-300 rounded-full" />
          <p className={`text-[10px] font-black uppercase tracking-widest ${isUser ? 'text-primary' : 'text-slate-500'
            }`}>
            {isUser ? 'Patient' : 'AI Assistant'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// --- Typing Indicator ---
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex items-start gap-4"
  >
    <div className="shrink-0 size-10 rounded-2xl bg-white dark:bg-slate-800 text-primary border border-primary/10 flex items-center justify-center shadow-lg">
      <Bot size={20} strokeWidth={2.5} />
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] rounded-tl-none px-8 py-5 shadow-xl">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="size-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

const AiAssistant = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const autoSendTimeoutRef = useRef(null);
  const inputValRef = useRef('');

  // Keep inputValRef in sync with inputValue state
  useEffect(() => {
    inputValRef.current = inputValue;
  }, [inputValue]);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await patientService.getMyProfile();
        if (res.success) {
          setPatient(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    void loadProfile();
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Initial welcome message
  useEffect(() => {
    const welcome = {
      role: 'model',
      text: `👋 Hello ${user?.name || 'Patient'}! I'm your RetinaAI Diabetes Assistant.\n\nI can help you understand your diagnostic reports, explain the different stages of Diabetic Retinopathy, and provide evidence-based guidance on blood sugar management and eye health.\n\nWhat would you like to know today?`,
      time: formatTime(new Date()),
      id: 'welcome',
    };
    setMessages((prev) => (prev.length === 0 ? [welcome] : prev));
  }, [user?.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 150);
  };

  const sendMessage = async (text) => {
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
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

    // Build history for context
    const history = messages
      .filter(m => m.id !== 'welcome')
      .slice(-10)
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

  const toggleListening = () => {
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Start 3s auto-send timer if there is content
        if (inputValRef.current.trim()) {
          autoSendTimeoutRef.current = setTimeout(() => {
            sendMessage(inputValRef.current);
          }, 3000);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SUGGESTED_QUESTIONS = [
    { text: "What is NPDR?", category: "Education", icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
    { text: "How do I prevent vision loss?", category: "Prevention", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { text: "Explain HbA1c levels", category: "Vitals", icon: Droplets, color: "text-rose-500", bg: "bg-rose-50" },
    { text: "Symptoms of PDR stage", category: "Symptoms", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
    { text: "Diabetic diet tips", category: "Lifestyle", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" }
  ];

  return (
    <div className="h-screen bg-main font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-72 flex-shrink-0 bg-sidebar border-r border-white/5 hidden lg:flex flex-col z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white italic uppercase leading-none">RetinaAI</h1>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mt-1">Patients Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 mt-6 custom-scrollbar">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <LayoutDashboard size={18} />
            <span className="text-sm">Patient Dashboard</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <Activity size={18} />
            <span className="text-sm">Health Analytics</span>
          </Link>
          <Link to="/reports" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <History size={18} />
            <span className="text-sm">Reports</span>
          </Link>
          <Link to="/appointments" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <Calendar size={18} />
            <span className="text-sm">Appointments</span>
          </Link>
          <Link to="/ai-assistant" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/25 transition-all">
            <MessageCircle size={18} strokeWidth={2.5} />
            <span className="text-sm">AI Assistant</span>
          </Link>

          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account</p>
            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group text-left"
            >
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5 text-left">
            <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm flex-shrink-0" style={{ backgroundImage: `url(${normalizeUrl(patient?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Patient')}&background=059669&color=fff&bold=true`})` }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-white">{user?.name || 'Patient'}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">Patient</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-500/10 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
            <LogOut size={16} strokeWidth={2.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content (Chat Area) */}
      <main className="flex-1 flex flex-col bg-white lg:ml-72 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(5,150,105,0.05),transparent)] pointer-events-none" />

        {/* Header */}
        <header className="shrink-0 h-24 border-b border-slate-100 flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl z-20">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">AI <span className="text-primary not-italic">Assistant</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/50">
              <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Diabetes AI Active</span>
            </div>
            <button
              onClick={() => setMessages([messages[0]])}
              className="size-12 rounded-2xl bg-white text-slate-400 hover:text-primary hover:border-primary/30 border border-slate-100 shadow-sm transition-all flex items-center justify-center group"
              title="Reset Chat"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </header>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 md:px-10 py-10 space-y-10 custom-scrollbar bg-slate-50/20 relative"
        >
          <div className="max-w-4xl mx-auto w-full space-y-10">
            {/* Suggested Questions Grid */}
            {messages.length <= 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    className="group p-6 bg-white border border-slate-100 rounded-[2.5rem] text-left hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <q.icon size={48} />
                    </div>
                    <div className={`size-10 rounded-xl ${q.bg} ${q.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <q.icon size={20} strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{q.category}</p>
                    <p className="text-sm font-bold text-slate-700 italic group-hover:text-slate-900 transition-colors leading-snug">{q.text}</p>
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, idx) => (
              <MessageBubble key={msg.id || idx} message={msg} />
            ))}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} className="h-8" />
          </div>
        </div>

        {/* Floating Scroll Down Button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onClick={() => scrollToBottom()}
              className="absolute right-12 bottom-40 size-14 bg-white border border-slate-100 rounded-full shadow-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-30"
            >
              <ChevronDown size={24} strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="shrink-0 p-6 md:p-10 pt-0 bg-transparent relative z-20">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Disclaimer */}
            <div className="flex items-center justify-center gap-3 py-3 px-6 bg-amber-50/50 backdrop-blur-sm rounded-full border border-amber-100/50 mx-auto w-fit shadow-sm shadow-amber-100/20">
              <AlertCircle size={14} className="text-amber-500" />
              <p className="text-[10px] md:text-xs font-black text-amber-700/80 uppercase tracking-widest text-center">
                Informational only • Consult your doctor for medical advice
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}
              className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] p-3 flex items-end gap-3 transition-all focus-within:shadow-primary/5 focus-within:border-primary/20"
            >
              <textarea
                ref={inputRef}
                id="ai-assistant-input"
                name="ai_assistant_message"
                rows={1}
                value={inputValue}
                onChange={(e) => {
                  if (autoSendTimeoutRef.current) {
                    clearTimeout(autoSendTimeoutRef.current);
                    autoSendTimeoutRef.current = null;
                  }
                  setInputValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputValue);
                  }
                }}
                placeholder="Ask about reports, stages, or health tips..."
                className="flex-1 bg-slate-50/50 border-none rounded-[2.5rem] px-8 py-5 text-base font-medium placeholder-slate-400 outline-none focus:ring-0 focus:bg-white transition-all resize-none overflow-hidden"
                style={{ maxHeight: '150px', minHeight: '64px' }}
              />
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  title={isListening ? "Stop Listening" : "Start Voice Input"}
                >
                  {isListening ? <MicOff size={22} strokeWidth={2.5} /> : <Mic size={22} strokeWidth={2.5} />}
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="size-16 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none shrink-0"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} strokeWidth={2.5} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <PatientPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        patient={patient}
        user={user}
        onProfileUpdate={(updated) => setPatient(prev => {
          const merged = { ...prev, ...updated };
          if (updated.phone !== undefined) {
            merged.phoneNumber = updated.phone;
            delete merged.phone;
          }
          return merged;
        })}
      />
    </div>
  );
};

export default AiAssistant;
