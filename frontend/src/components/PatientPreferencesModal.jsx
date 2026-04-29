import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Bell, Palette, Shield, ChevronRight,
    CheckCircle2, Loader2, Eye, EyeOff, Moon, Sun, Monitor,
    Save, AlertCircle, Lock, Mail, Calendar, Phone, Camera, Trash2,
    ChevronDown
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { SECURITY_QUESTIONS } from '../constants/securityQuestions';
import DeleteAccountSection from './DeleteAccountSection';

const TABS = [
    { id: 'profile', label: 'Profile', Icon: User },
    { id: 'appearance', label: 'Appearance', Icon: Palette },
    { id: 'security', label: 'Security', Icon: Shield },
];

const PatientPreferencesModal = ({ isOpen, onClose, patient, user, onProfileUpdate }) => {
    // ── Profile tab state ──────────────────────────────────────
    const [profileForm, setProfileForm] = useState({
        name: '', age: '', phone: '', email: ''
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // ── Photo upload state ─────────────────────────────────────
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoMsg, setPhotoMsg] = useState({ type: '', text: '' });



    // ── Appearance tab state ───────────────────────────────────
    const { theme, setTheme } = useTheme();

    // ── Security tab state ─────────────────────────────────────
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

    // ── Security Questions state ───────────────────────────────
    const [sqForm, setSqForm] = useState([
        { question: '', answer: '' },
        { question: '', answer: '' }
    ]);
    const [sqConfirmPw, setSqConfirmPw] = useState('');
    const [sqSaving, setSqSaving] = useState(false);
    const [sqMsg, setSqMsg] = useState({ type: '', text: '' });

    const [activeTab, setActiveTab] = useState('profile');

    // Populate profile form when patient data arrives
    useEffect(() => {
        if (patient || user) {
            setProfileForm({
                name: patient?.name || user?.name || '',
                email: patient?.email || user?.email || '',
                age: patient?.age || '',
                phone: patient?.phoneNumber || '',
            });
            // Set current photo preview
            if (patient?.photo) setPhotoPreview(patient.photo);

            // Populate security questions (questions only, answers are hashed)
            if (user?.securityQuestions?.length === 2) {
                setSqForm(user.securityQuestions.map(sq => ({
                    question: sq.question,
                    answer: ''
                })));
            }
        }
    }, [patient, user]);


    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileMsg({ type: '', text: '' });
        try {
            const res = await api.put('/patients/me/profile', profileForm);
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
            // Pass the real saved data from backend (uses phoneNumber, not phone)
            if (onProfileUpdate) onProfileUpdate(res.data?.data || profileForm);
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save profile.' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Show local preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);

        setPhotoUploading(true);
        setPhotoMsg({ type: '', text: '' });
        try {
            const formData = new FormData();
            formData.append('photo', file);
            const res = await api.put('/patients/me/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPhotoMsg({ type: 'success', text: 'Photo updated!' });
            if (onProfileUpdate) onProfileUpdate({ photo: res.data?.data || photoPreview });
        } catch (err) {
            setPhotoMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        setPhotoPreview(null);
        setPhotoMsg({ type: 'success', text: 'Photo removed.' });
        if (onProfileUpdate) onProfileUpdate({ photo: null });
    };

    const handleChangePw = async (e) => {
        e.preventDefault();
        if (pwForm.newPw !== pwForm.confirm) {
            setPwMsg({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (pwForm.newPw.length < 8) {
            setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
            return;
        }
        setPwSaving(true);
        setPwMsg({ type: '', text: '' });
        try {
            await api.put('/auth/change-password', {
                currentPassword: pwForm.current,
                newPassword: pwForm.newPw,
            });
            setPwMsg({ type: 'success', text: 'Password changed successfully.' });
            setPwForm({ current: '', newPw: '', confirm: '' });
        } catch (err) {
            setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setPwSaving(false);
        }
    };

    const handleUpdateSQ = async (e) => {
        e.preventDefault();
        if (sqForm.some(sq => !sq.question || !sq.answer)) {
            setSqMsg({ type: 'error', text: 'All questions and answers are required.' });
            return;
        }
        setSqSaving(true);
        setSqMsg({ type: '', text: '' });
        try {
            await api.put('/auth/security-questions', {
                securityQuestions: sqForm,
                password: sqConfirmPw
            });
            setSqMsg({ type: 'success', text: 'Security questions updated!' });
            setSqConfirmPw('');
        } catch (err) {
            setSqMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        } finally {
            setSqSaving(false);
        }
    };

    const pwStrength = () => {
        const p = pwForm.newPw;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (p.length >= 12) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    };

    const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const strengthColor = ['', 'bg-rose-500', 'bg-orange-400', 'bg-amber-400', 'bg-primary/60', 'bg-primary'];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-sidebar/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 20 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                    className="relative w-full max-w-2xl h-[750px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <User size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">Settings</h3>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Patient Account Settings</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-9 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Tabs */}
                        <nav className="w-44 bg-slate-50/70 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 flex-shrink-0 p-3 space-y-1">
                            {TABS.map(({ id, label, Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${activeTab === id
                                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm font-black border border-primary/20 dark:border-slate-700'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 font-bold'
                                        }`}
                                >
                                    <Icon size={16} strokeWidth={activeTab === id ? 2.5 : 2} />
                                    <span className="text-xs">{label}</span>
                                    {activeTab === id && <ChevronRight size={12} className="ml-auto text-primary/50" />}
                                </button>
                            ))}
                        </nav>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <AnimatePresence mode="wait">
                                {/* ── PROFILE TAB ── */}
                                {activeTab === 'profile' && (
                                    <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>

                                        {/* ── Photo Upload Section ── */}
                                        <div className="mb-7">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Profile Photo</h4>
                                            <div className="flex items-center gap-6">
                                                {/* Avatar circle */}
                                                <div className="relative group/avatar flex-shrink-0">
                                                    <div
                                                        className="size-24 rounded-[1.5rem] border-4 border-white dark:border-slate-800 shadow-xl bg-cover bg-center"
                                                        style={{ backgroundImage: `url('${photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || user?.name || 'P')}&background=059669&color=fff&bold=true&size=128`}')` }}
                                                    />
                                                    {/* Hover overlay */}
                                                    <label className="absolute inset-0 rounded-[1.5rem] bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-4 border-transparent">
                                                        {photoUploading
                                                            ? <Loader2 size={22} className="text-white animate-spin" />
                                                            : <Camera size={22} className="text-white" strokeWidth={2.5} />
                                                        }
                                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
                                                    </label>
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{profileForm.name || user?.name || 'Your Name'}</p>
                                                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Hover over photo to change it, or use the buttons below.</p>
                                                    <div className="flex gap-2 pt-1">
                                                        <label className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                                                            {photoUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                                                            Upload Photo
                                                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
                                                        </label>
                                                        {photoPreview && (
                                                            <button
                                                                onClick={handleRemovePhoto}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                                                            >
                                                                <Trash2 size={12} /> Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    {photoMsg.text && (
                                                        <p className={`text-[10px] font-bold flex items-center gap-1 ${photoMsg.type === 'error' ? 'text-rose-500' : 'text-primary'
                                                            }`}>
                                                            {photoMsg.type === 'success' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                                                            {photoMsg.text}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-5 border-t border-slate-100 dark:border-slate-800" />
                                        </div>

                                        {/* ── Personal Info Form ── */}
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Personal Information</h4>
                                        <form onSubmit={handleSaveProfile} className="space-y-4">
                                            {[
                                                { label: 'Full Name', key: 'name', type: 'text', Icon: User, placeholder: 'Your full name' },
                                                { label: 'Email Address', key: 'email', type: 'email', Icon: Mail, placeholder: 'your@email.com' },
                                                { label: 'Age', key: 'age', type: 'number', Icon: Calendar, placeholder: 'Your age' },
                                                { label: 'Phone Number', key: 'phone', type: 'tel', Icon: Phone, placeholder: '+91 00000-00000' },
                                            ].map(({ label, key, type, Icon: Ic, placeholder }) => (
                                                <div key={key} className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
                                                    <div className="relative group">
                                                        <Ic className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={16} />
                                                        <input
                                                            type={type}
                                                            placeholder={placeholder}
                                                            value={profileForm[key]}
                                                            onChange={e => setProfileForm(prev => ({ ...prev, [key]: e.target.value }))}
                                                            className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-3 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/5 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {profileMsg.text && (
                                                <div className={`flex items-center gap-2 text-xs font-bold px-1 ${profileMsg.type === 'error' ? 'text-rose-500' : 'text-primary'}`}>
                                                    {profileMsg.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                                                    {profileMsg.text}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={profileSaving}
                                                className="w-full h-12 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60 transition-all mt-2"
                                            >
                                                {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={15} /> Save Changes</>}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* ── APPEARANCE TAB ── */}
                                {activeTab === 'appearance' && (
                                    <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Theme</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { val: 'light', label: 'Light', Icon: Sun },
                                                    { val: 'dark', label: 'Dark', Icon: Moon },
                                                ].map(({ val, label, Icon: Ic }) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => setTheme(val)}
                                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === val
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-600 hover:border-slate-200 dark:hover:border-slate-700'
                                                            }`}
                                                    >
                                                        <Ic size={22} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                    </motion.div>
                                )}

                                {/* ── SECURITY TAB ── */}
                                {activeTab === 'security' && (
                                    <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-5 uppercase tracking-widest">Change Password</h4>
                                            <form onSubmit={handleChangePw} className="space-y-3">
                                                {/* Current password */}
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={15} />
                                                    <input
                                                        type={showCurrent ? 'text' : 'password'}
                                                        placeholder="Current password"
                                                        value={pwForm.current}
                                                        onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                                                        className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-3 pl-11 pr-12 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/5 transition-all"
                                                    />
                                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-primary transition-colors">
                                                        {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                                                    </button>
                                                </div>

                                                {/* New password */}
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={15} />
                                                    <input
                                                        type={showNew ? 'text' : 'password'}
                                                        placeholder="New password (min 8 chars)"
                                                        value={pwForm.newPw}
                                                        onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                                                        className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-3 pl-11 pr-12 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/5 transition-all"
                                                    />
                                                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-primary transition-colors">
                                                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                                    </button>
                                                </div>

                                                {/* Strength bar */}
                                                {pwForm.newPw && (
                                                    <div className="space-y-1">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength() ? strengthColor[pwStrength()] : 'bg-slate-100 dark:bg-slate-800'}`} />
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{strengthLabel[pwStrength()]}</p>
                                                    </div>
                                                )}

                                                {/* Confirm */}
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={15} />
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        value={pwForm.confirm}
                                                        onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                                                        className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-3 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/5 transition-all"
                                                    />
                                                </div>

                                                {pwMsg.text && (
                                                    <div className={`flex items-center gap-2 text-xs font-bold px-1 ${pwMsg.type === 'error' ? 'text-rose-500' : 'text-primary'}`}>
                                                        {pwMsg.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                                                        {pwMsg.text}
                                                    </div>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={pwSaving}
                                                    className="w-full h-12 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                                                >
                                                    {pwSaving ? <Loader2 size={16} className="animate-spin" /> : <><Lock size={14} /> Update Password</>}
                                                </button>
                                            </form>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-5 uppercase tracking-widest">Security Questions</h4>
                                            <form onSubmit={handleUpdateSQ} className="space-y-4">
                                                {sqForm.map((sq, i) => (
                                                    <div key={i} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Question {i + 1}</p>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none" size={14} />
                                                            <select
                                                                value={sq.question}
                                                                onChange={e => {
                                                                    const newSq = [...sqForm];
                                                                    newSq[i].question = e.target.value;
                                                                    setSqForm(newSq);
                                                                }}
                                                                className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-10 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/20 transition-all appearance-none cursor-pointer"
                                                            >
                                                                <option value="" disabled>Select a security question</option>
                                                                {SECURITY_QUESTIONS.map((q, idx) => (
                                                                    <option key={idx} value={q}>{q}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                                <ChevronDown size={16} />
                                                            </div>
                                                        </div>
                                                        <div className="relative group">
                                                            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={14} />
                                                            <input
                                                                type="text"
                                                                placeholder={`Your Answer ${i + 1}`}
                                                                value={sq.answer}
                                                                onChange={e => {
                                                                    const newSq = [...sqForm];
                                                                    newSq[i].answer = e.target.value;
                                                                    setSqForm(newSq);
                                                                }}
                                                                className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/20 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Confirm with Password</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={15} />
                                                        <input
                                                            type="password"
                                                            placeholder="Your account password"
                                                            value={sqConfirmPw}
                                                            onChange={e => setSqConfirmPw(e.target.value)}
                                                            className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-3 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/20 transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {sqMsg.text && (
                                                    <div className={`flex items-center gap-2 text-xs font-bold px-1 ${sqMsg.type === 'error' ? 'text-rose-500' : 'text-primary'}`}>
                                                        {sqMsg.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                                                        {sqMsg.text}
                                                    </div>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={sqSaving}
                                                    className="w-full h-12 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                                                >
                                                    {sqSaving ? <Loader2 size={16} className="animate-spin" /> : <><Shield size={14} /> Update Security Questions</>}
                                                </button>
                                            </form>
                                        </div>

                                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                            <DeleteAccountSection />
                                        </div>


                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PatientPreferencesModal;
