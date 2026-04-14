import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Settings, Shield, Moon, MonitorSmartphone, Palette,
    Globe, Database, Key, CheckCircle2, Sun, Check,
    Download, Loader2, ChevronDown, Eye, EyeOff, Lock
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { useContext, useEffect } from 'react';
import { SECURITY_QUESTIONS } from '../constants/securityQuestions';
import DeleteAccountSection from './DeleteAccountSection';

const NodeSettingsModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('general');

    // General tab state
    const { language, setLanguage } = useLanguage();
    const [showLangDropdown, setShowLangDropdown] = useState(false);

    // Appearance tab state
    const { theme, setTheme } = useTheme();

    // Security tab state
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);

    // Security Questions state
    const [sqForm, setSqForm] = useState([
        { question: '', answer: '' },
        { question: '', answer: '' }
    ]);
    const [sqConfirmPw, setSqConfirmPw] = useState('');
    const [sqLoading, setSqLoading] = useState(false);
    const [sqError, setSqError] = useState('');
    const [sqSuccess, setSqSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && user?.securityQuestions?.length === 2) {
            setSqForm(user.securityQuestions.map(sq => ({
                question: sq.question,
                answer: ''
            })));
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: t('settings.tabs.general'), icon: Settings },
        { id: 'appearance', label: t('settings.tabs.appearance'), icon: Palette },
        { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    ];

    const languages = [
        { code: 'en-IN', label: 'English (India)' },
        { code: 'hi-IN', label: 'Hindi' },
    ];

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess(false);

        if (pwForm.newPw.length < 8) {
            setPwError('New password must be at least 8 characters.');
            return;
        }
        if (pwForm.newPw !== pwForm.confirm) {
            setPwError('New passwords do not match.');
            return;
        }

        setPwLoading(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: pwForm.current,
                newPassword: pwForm.newPw,
            });
            setPwSuccess(true);
            setPwForm({ current: '', newPw: '', confirm: '' });
            setTimeout(() => setPwSuccess(false), 4000);
        } catch (err) {
            setPwError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setPwLoading(false);
        }
    };

    const handleUpdateSQ = async (e) => {
        e.preventDefault();
        setSqError('');
        setSqSuccess(false);

        if (sqForm.some(sq => !sq.question || !sq.answer)) {
            setSqError('All questions and answers are required.');
            return;
        }

        setSqLoading(true);
        try {
            await api.put('/auth/security-questions', {
                securityQuestions: sqForm,
                password: sqConfirmPw
            });
            setSqSuccess(true);
            setSqConfirmPw('');
            setTimeout(() => setSqSuccess(false), 4000);
        } catch (err) {
            setSqError(err.response?.data?.message || 'Failed to update security questions.');
        } finally {
            setSqLoading(false);
        }
    };

    const Toggle = ({ value, onChange }) => (
        <button
            onClick={() => onChange(!value)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${value ? 'bg-primary' : 'bg-slate-200'}`}
        >
            <motion.div
                layout
                className="absolute top-1 size-4 bg-white rounded-full shadow-sm"
                animate={{ left: value ? 28 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-sidebar/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px] border border-transparent dark:border-slate-800"
                >
                    {/* Sidebar Nav */}
                    <div className="w-full md:w-56 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{t('settings.title')}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('settings.subtitle')}</p>
                        </div>

                        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-white dark:bg-slate-900 text-primary shadow-sm dark:shadow-primary/10 ring-1 ring-primary/20 dark:ring-slate-800'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col max-h-[70vh] md:max-h-full">
                        <div className="px-8 py-5 flex items-center justify-end sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20 border-b md:border-b-0 border-slate-100 dark:border-slate-800">
                            <button
                                onClick={onClose}
                                className="size-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-8 pt-2 overflow-y-auto flex-1 custom-scrollbar">

                            {/* ── GENERAL TAB ── */}
                            {activeTab === 'general' && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">

                                    {/* Localization */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">{t('settings.localization.title')}</h4>
                                        <div className="relative">
                                            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 bg-white dark:bg-slate-800 shadow-sm rounded-xl flex items-center justify-center text-primary">
                                                        <Globe size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.localization.systemLanguage')}</p>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            {languages.find(l => l.code === language)?.label}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setShowLangDropdown(prev => !prev)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    {t('settings.localization.change')}
                                                    <ChevronDown size={12} className={`transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {showLangDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl z-30 overflow-hidden"
                                                    >
                                                        {languages.map(lang => (
                                                            <button
                                                                key={lang.code}
                                                                onClick={() => { setLanguage(lang.code); setShowLangDropdown(false); }}
                                                                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-bold transition-colors ${language === lang.code ? 'bg-primary/5 dark:bg-primary/10 text-primary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                            >
                                                                {lang.label}
                                                                {language === lang.code && <Check size={14} />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>



                                </motion.div>
                            )}

                            {/* ── APPEARANCE TAB ── */}
                            {activeTab === 'appearance' && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">{t('settings.theme.title')}</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'system', label: t('settings.theme.system'), Icon: MonitorSmartphone },
                                                { id: 'light', label: t('settings.theme.light'), Icon: Sun },
                                                { id: 'dark', label: t('settings.theme.dark'), Icon: Moon },
                                            ].map(({ id, label, Icon }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setTheme(id)}
                                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 relative transition-all ${theme === id
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {theme === id && (
                                                        <div className="absolute top-2.5 right-2.5 size-4 bg-primary text-white rounded-full flex items-center justify-center">
                                                            <CheckCircle2 size={10} />
                                                        </div>
                                                    )}
                                                    <div className={`size-10 rounded-xl shadow-sm flex items-center justify-center ${id === 'dark' ? 'bg-slate-900 dark:bg-slate-700 text-slate-300' : 'bg-white dark:bg-slate-800 text-primary'
                                                        }`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <span className={`text-xs font-bold ${theme === id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── SECURITY TAB ── */}
                            {activeTab === 'security' && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">

                                    {/* Change Password */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">{t('settings.security.changePassword')}</h4>
                                        <form onSubmit={handleChangePassword} className="space-y-3">
                                            {/* Current Password */}
                                            {[{ id: 'current', label: t('settings.security.currentPassword') }, { id: 'newPw', label: t('settings.security.newPassword') }, { id: 'confirm', label: t('settings.security.confirmPassword') }].map(({ id, label }) => (
                                                <div key={id} className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                        <Lock size={14} />
                                                    </div>
                                                    <input
                                                        type={showPw[id] ? 'text' : 'password'}
                                                        placeholder={label}
                                                        value={pwForm[id]}
                                                        onChange={e => setPwForm(prev => ({ ...prev, [id]: e.target.value }))}
                                                        required
                                                        className="w-full h-11 bg-slate-50 dark:bg-slate-950/30 rounded-xl pl-10 pr-10 text-xs font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPw(prev => ({ ...prev, [id]: !prev[id] }))}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                                    >
                                                        {showPw[id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Strength hint */}
                                            {pwForm.newPw && (
                                                <div className="flex items-center gap-2 px-1">
                                                    {[1, 2, 3, 4].map(lvl => (
                                                        <div key={lvl} className={`h-1 flex-1 rounded-full transition-all ${pwForm.newPw.length >= lvl * 3
                                                            ? lvl <= 1 ? 'bg-rose-400' : lvl === 2 ? 'bg-amber-400' : lvl === 3 ? 'bg-teal-400' : 'bg-primary'
                                                            : 'bg-slate-100 dark:bg-slate-800'
                                                            }`} />
                                                    ))}
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                                        {pwForm.newPw.length < 4 ? t('settings.security.weak') : pwForm.newPw.length < 7 ? t('settings.security.fair') : pwForm.newPw.length < 10 ? t('settings.security.good') : t('settings.security.strong')}
                                                    </span>
                                                </div>
                                            )}

                                            <AnimatePresence>
                                                {pwError && (
                                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-bold text-rose-500 px-1 flex items-center gap-1.5">
                                                        <span className="size-3 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-[8px]">!</span>
                                                        {pwError}
                                                    </motion.p>
                                                )}
                                                {pwSuccess && (
                                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-bold text-primary px-1 flex items-center gap-1.5">
                                                        <Check size={12} /> Password updated successfully!
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>

                                            <button
                                                type="submit"
                                                disabled={pwLoading}
                                                className="w-full h-11 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                            >
                                                {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <><Lock size={13} /> {t('settings.security.updateBtn')}</>}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Update Security Questions */}
                                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white pb-1">Security Questions</h4>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-2">Update your identity verification fallback.</p>
                                        <form onSubmit={handleUpdateSQ} className="space-y-4">
                                            {sqForm.map((sq, i) => (
                                                <div key={i} className="space-y-2.5 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-black">{i + 1}</span>
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Question {i + 1}</span>
                                                    </div>
                                                    <div className="relative group">
                                                        <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none" size={14} />
                                                        <select
                                                            value={sq.question}
                                                            onChange={e => {
                                                                const newSq = [...sqForm];
                                                                newSq[i].question = e.target.value;
                                                                setSqForm(newSq);
                                                            }}
                                                            className="w-full h-11 bg-white dark:bg-slate-900 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 focus:border-primary/20 outline-none transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="" disabled>Select a security question</option>
                                                            {SECURITY_QUESTIONS.map((q, idx) => (
                                                                <option key={idx} value={q}>{q}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                            <ChevronDown size={14} />
                                                        </div>
                                                    </div>
                                                    <div className="relative group">
                                                        <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={14} />
                                                        <input
                                                            type="text"
                                                            placeholder="Enter answer"
                                                            value={sq.answer}
                                                            onChange={e => {
                                                                const newSq = [...sqForm];
                                                                newSq[i].answer = e.target.value;
                                                                setSqForm(newSq);
                                                            }}
                                                            className="w-full h-11 bg-white dark:bg-slate-900 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 focus:border-primary/20 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="relative group">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                                <input
                                                    type="password"
                                                    placeholder="Confirm account password"
                                                    value={sqConfirmPw}
                                                    onChange={e => setSqConfirmPw(e.target.value)}
                                                    required
                                                    className="w-full h-11 bg-slate-50 dark:bg-slate-950/30 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-200 border border-transparent focus:border-primary/20 outline-none transition-all ring-1 ring-slate-100 dark:ring-slate-800"
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {sqError && (
                                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-bold text-rose-500 px-1 flex items-center gap-1.5">
                                                        <X size={12} className="size-3 rounded-full bg-rose-100 flex items-center justify-center p-0.5" />
                                                        {sqError}
                                                    </motion.p>
                                                )}
                                                {sqSuccess && (
                                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-bold text-primary px-1 flex items-center gap-1.5">
                                                        <Check size={12} /> Questions updated!
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>

                                            <button
                                                type="submit"
                                                disabled={sqLoading}
                                                className="w-full h-11 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                            >
                                                {sqLoading ? <Loader2 size={14} className="animate-spin" /> : <><Shield size={13} /> Update Questions</>}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Danger Zone: Delete Account */}
                                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <DeleteAccountSection />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NodeSettingsModal;
