import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Activity, LogOut, Users, Scan, MapPin, Phone, Mail,
    Award, Settings, Calendar, ChevronRight, BarChart2, FileText,
    Edit3, CheckCircle2, Plus, Search, Filter, Eye, Trash2, X,
    Lock, User, Bell, Shield, Camera, Loader2, AlertCircle,
    TrendingUp, Clock, RefreshCw, Save, ChevronDown, Hash,
    Download, Printer, CheckSquare
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { SECURITY_QUESTIONS } from '../constants/securityQuestions';
import DeleteAccountSection from '../components/DeleteAccountSection';

/* ─── tiny helpers ─────────────────────────────────── */
const Avatar = ({ name, photo, size = 10 }) => (
    <div
        className={`size-${size} rounded-full bg-cover bg-center border-2 border-white shadow-sm flex-shrink-0`}
        style={{ backgroundImage: `url('${photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=059669&color=fff&bold=true`}')` }}
    />
);

const Badge = ({ children, color = 'emerald' }) => {
    const map = { emerald: 'bg-primary/10 text-primary border-primary/20', green: 'bg-primary/10 text-primary border-primary/20', red: 'bg-red-50 text-red-600 border-red-100', amber: 'bg-amber-50 text-amber-600 border-amber-100', slate: 'bg-slate-50 text-slate-500 border-slate-100' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[color] || map.slate}`}>{children}</span>;
};

const Input = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
        <div className="relative group">
            {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />}
            <input className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all`} {...props} />
        </div>
    </div>
);

const Select = ({ label, children, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
        <div className="relative">
            <select className="w-full pl-4 pr-8 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all appearance-none" {...props}>
                {children}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-400 font-medium mt-1 text-sm">{subtitle}</p>}
        </div>
        {action}
    </div>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Icon size={28} className="text-slate-300" />
        </div>
        <p className="text-slate-700 font-black text-lg">{title}</p>
        <p className="text-slate-400 font-medium text-sm mt-1">{subtitle}</p>
    </div>
);

/* ═══════════════════════════════════════════════════
   SECTION: DASHBOARD OVERVIEW
═══════════════════════════════════════════════════ */
const DashboardSection = ({ center, patients, scans, onCenterUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await api.post('/diagnosis-centers/me/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                onCenterUpdate(res.data.data);
            }
        } catch (err) {
            console.error('Failed to upload photo', err);
            alert('Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    const stats = [
        { label: 'Total Scans', value: scans.length || 0, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Patients Served', value: patients.length || 0, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Scans This Month', value: scans.filter(s => new Date(s.date || s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Reports Generated', value: scans.filter(s => s.analysis).length, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const recentPatients = patients.slice(0, 5);

    return (
        <div className="space-y-6 bg-main min-h-screen">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Welcome back, <span className="text-primary italic">{center?.centerName?.split(' ')[0] || 'Center'}</span> 👋
                        </h1>
                        <p className="text-slate-400 font-medium mt-1">Here's your diagnostic center overview for today.</p>
                    </div>
                </div>
            </motion.div>

            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex flex-wrap gap-6 items-center">
                <div className="relative flex-shrink-0 group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="size-24 rounded-[1.25rem] border-4 border-white shadow-xl bg-cover bg-center overflow-hidden relative"
                        style={{ backgroundImage: `url('${center?.photo && center.photo !== 'default-center.jpg' ? center.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(center?.centerName || 'DC')}&background=059669&color=fff&bold=true&size=96`}')` }}>
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-[2px]">
                            {isUploading ? <Loader2 className="animate-spin text-white" size={24} /> : <Camera className="text-white" size={24} />}
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-primary size-4 rounded-full border-2 border-white z-10" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-black text-slate-900">{center?.centerName || 'Your Center'}</h2>
                        <Badge color="emerald"><Building2 size={9} className="inline mr-1" />{center?.centerType === 'Clinic' ? 'Diagnosis Center' : (center?.centerType || 'Diagnosis Center')}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-bold text-slate-500">
                        {center?.email && <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-300" />{center.email}</span>}
                        {center?.phone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-300" />{center.phone}</span>}
                        {(center?.address || center?.city) && (
                            <span className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-slate-300" />
                                {[center.address, center.city].filter(Boolean).join(', ')}
                            </span>
                        )}
                        {center?.licenseNumber && <span className="flex items-center gap-1.5"><Award size={13} className="text-slate-300" />Lic: {center.licenseNumber}</span>}
                    </div>
                    <div className="flex gap-2 pt-0.5">
                        {center?.centerId && <Badge color="slate">ID: {center.centerId}</Badge>}
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, color, bg }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                        <p className={`text-3xl font-black ${color}`}>{value}</p>
                        <div className={`mt-3 h-1 w-10 rounded-full ${bg}`} />
                    </motion.div>
                ))}
            </div>

            {/* Recent Patients */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Recent Patients</h3>
                {recentPatients.length === 0
                    ? <p className="text-slate-400 text-sm font-medium py-6 text-center">No patients yet. Use the Patients tab to add one.</p>
                    : <div className="space-y-3">
                        {recentPatients.map(p => (
                            <div key={p._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all">
                                <Avatar name={p.name} photo={p.photo} size={10} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate">{p.name}</p>
                                    <p className="text-xs text-slate-400 font-medium">{p.patientId} · Age {p.age}</p>
                                </div>
                                <Badge color={p.riskLevel === 'High' ? 'red' : p.riskLevel === 'Moderate' ? 'amber' : 'emerald'}>{p.riskLevel || 'Low'}</Badge>
                            </div>
                        ))}
                    </div>}
            </motion.div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   SECTION: PATIENTS
═══════════════════════════════════════════════════ */
const PatientsSection = ({ patients, onRefresh }) => {
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', age: '', gender: 'Male', email: '', phoneNumber: '', diabetesType: 'Type 2' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg({ type: '', text: '' });
        try {
            await api.post('/patients', form);
            setMsg({ type: 'success', text: 'Patient registered successfully.' });
            setForm({ name: '', age: '', gender: 'Male', email: '', phoneNumber: '', diabetesType: 'Type 2' });
            onRefresh();
            setTimeout(() => setShowAdd(false), 1200);
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to register patient.' });
        } finally { setSaving(false); }
    };

    return (
        <div>
            <SectionHeader
                title="Patients"
                subtitle={`${patients.length} patient${patients.length !== 1 ? 's' : ''} registered`}
                action={
                    <motion.button whileHover={{ y: -1 }} onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <Plus size={16} /> New Patient
                    </motion.button>
                }
            />

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, ID or email…"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-white font-bold text-sm text-slate-900 outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {filtered.length === 0
                    ? <EmptyState icon={Users} title="No Patients Found" subtitle={search ? 'Try a different search term.' : 'Register your first patient to get started.'} />
                    : (
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-100 bg-slate-50/50">
                                <tr>
                                    {['Patient', 'ID', 'Age', 'Gender', 'Risk', 'Last Exam'].map(h => (
                                        <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={p.name} photo={p.photo} size={9} />
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{p.name}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{p.email || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-black text-slate-500">{p.patientId}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-700">{p.age}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-700">{p.gender || '—'}</td>
                                        <td className="px-5 py-4"><Badge color={p.riskLevel === 'High' ? 'red' : p.riskLevel === 'Moderate' ? 'amber' : 'emerald'}>{p.riskLevel || 'Low'}</Badge></td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-500">{p.lastExamDate ? new Date(p.lastExamDate).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
            </div>

            {/* Add Patient Modal */}
            <AnimatePresence>
                {showAdd && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
                            <div className="px-8 pt-8 pb-5 border-b border-slate-100 flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Register New Patient</h3>
                                    <p className="text-sm text-slate-400 font-medium mt-1">Add a patient to your center's records.</p>
                                </div>
                                <button onClick={() => setShowAdd(false)} className="size-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                    <X size={15} />
                                </button>
                            </div>
                            <form onSubmit={handleAdd} className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Full Name" icon={User} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                                    <Input label="Age" icon={Hash} type="number" required min={1} max={120} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="35" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select label="Gender" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                                        {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                                    </Select>
                                    <Select label="Diabetes Type" value={form.diabetesType} onChange={e => setForm(f => ({ ...f, diabetesType: e.target.value }))}>
                                        {['Type 1', 'Type 2', 'Gestational', 'None'].map(t => <option key={t}>{t}</option>)}
                                    </Select>
                                </div>
                                <Input label="Email" icon={Mail} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="patient@email.com" />
                                <Input label="Phone Number" icon={Phone} value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="+91 9999 999 999" />
                                {msg.text && (
                                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                        {msg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {msg.text}
                                    </div>
                                )}
                                <button type="submit" disabled={saving}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60 transition-all">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Register Patient</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   SECTION: SCANS
═══════════════════════════════════════════════════ */
const ScansSection = ({ scans, patients, onRefresh }) => {
    const [search, setSearch] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ patientId: '', eye: 'Right', notes: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const filtered = scans.filter(s =>
        s.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        s._id?.includes(search)
    );

    const handleNewScan = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg({ type: '', text: '' });
        try {
            await api.post('/scans', { patient: form.patientId, eye: form.eye, notes: form.notes });
            setMsg({ type: 'success', text: 'Scan record created.' });
            onRefresh();
            setTimeout(() => setShowNew(false), 1200);
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create scan.' });
        } finally { setSaving(false); }
    };

    const statusColor = (s) => s.analysis ? 'emerald' : 'amber';

    return (
        <div>
            <SectionHeader
                title="Scans"
                subtitle={`${scans.length} scan record${scans.length !== 1 ? 's' : ''}`}
                action={
                    <motion.button whileHover={{ y: -1 }} onClick={() => setShowNew(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <Plus size={16} /> New Scan
                    </motion.button>
                }
            />
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scans…"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-white font-bold text-sm text-slate-900 outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {filtered.length === 0
                    ? <EmptyState icon={Scan} title="No Scans Yet" subtitle="Create your first scan record." />
                    : (
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-100 bg-slate-50/50">
                                <tr>
                                    {['Scan ID', 'Patient', 'Eye', 'Date', 'Status', 'Risk'].map(h => (
                                        <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 text-xs font-black text-slate-500">{s._id?.slice(-8)}</td>
                                        <td className="px-5 py-4 text-sm font-black text-slate-900">{s.patientName || '—'}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-700">{s.eye || '—'}</td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-500">{s.date ? new Date(s.date).toLocaleDateString() : '—'}</td>
                                        <td className="px-5 py-4"><Badge color={statusColor(s)}>{s.analysis ? 'Analysed' : 'Pending'}</Badge></td>
                                        <td className="px-5 py-4"><Badge color={s.analysis?.riskLevel === 'High Risk' ? 'red' : s.analysis?.riskLevel === 'Moderate Risk' ? 'amber' : 'emerald'}>{s.analysis?.riskLevel || '—'}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
            </div>

            {/* New Scan Modal */}
            <AnimatePresence>
                {showNew && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowNew(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 overflow-hidden">
                            <div className="px-8 pt-8 pb-5 border-b border-slate-100 flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Create Scan Record</h3>
                                    <p className="text-sm text-slate-400 font-medium mt-1">Log a new retinal scan.</p>
                                </div>
                                <button onClick={() => setShowNew(false)} className="size-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"><X size={15} /></button>
                            </div>
                            <form onSubmit={handleNewScan} className="p-8 space-y-4">
                                <Select label="Select Patient" required value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
                                    <option value="">— Choose a patient —</option>
                                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
                                </Select>
                                <Select label="Eye" value={form.eye} onChange={e => setForm(f => ({ ...f, eye: e.target.value }))}>
                                    {['Right', 'Left', 'Both'].map(e => <option key={e}>{e}</option>)}
                                </Select>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (optional)</label>
                                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all resize-none"
                                        placeholder="Any relevant clinical notes…" />
                                </div>
                                {msg.text && (
                                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                        {msg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {msg.text}
                                    </div>
                                )}
                                <button type="submit" disabled={saving || !form.patientId}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60 transition-all">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><Scan size={16} /> Create Scan</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   SECTION: REPORTS
═══════════════════════════════════════════════════ */
const ReportsSection = ({ scans }) => {
    const analysed = scans.filter(s => s.analysis);
    const [search, setSearch] = useState('');
    const filtered = analysed.filter(s =>
        s.patientName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <SectionHeader title="Reports" subtitle={`${analysed.length} analysed report${analysed.length !== 1 ? 's' : ''}`} />
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports by patient…"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-white font-bold text-sm text-slate-900 outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {filtered.length === 0
                    ? <EmptyState icon={FileText} title="No Reports Yet" subtitle="Analysed scans will appear here as printable reports." />
                    : (
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-100 bg-slate-50/50">
                                <tr>
                                    {['Report', 'Patient', 'Eye', 'Date', 'Risk Level', 'DR Grade', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 text-xs font-black text-slate-500">RPT-{s._id?.slice(-6).toUpperCase()}</td>
                                        <td className="px-5 py-4 text-sm font-black text-slate-900">{s.patientName || '—'}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-700">{s.eye || '—'}</td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-500">{s.date ? new Date(s.date).toLocaleDateString() : '—'}</td>
                                        <td className="px-5 py-4"><Badge color={s.analysis?.riskLevel?.includes('High') ? 'red' : s.analysis?.riskLevel?.includes('Moderate') ? 'amber' : 'emerald'}>{s.analysis?.riskLevel || '—'}</Badge></td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-700">{s.analysis?.drGrade || '—'}</td>
                                        <td className="px-5 py-4">
                                            <Link to={`/report/${s._id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all">
                                                <Eye size={12} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   SECTION: ANALYTICS
═══════════════════════════════════════════════════ */
const AnalyticsSection = ({ scans, patients }) => {
    const analysed = scans.filter(s => s.analysis);
    const high = analysed.filter(s => s.analysis?.riskLevel?.includes('High')).length;
    const moderate = analysed.filter(s => s.analysis?.riskLevel?.includes('Moderate')).length;
    const low = analysed.length - high - moderate;

    const byMonth = {};
    scans.forEach(s => {
        const m = new Date(s.date || s.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        byMonth[m] = (byMonth[m] || 0) + 1;
    });
    const monthlyData = Object.entries(byMonth).slice(-6);
    const maxVal = Math.max(...monthlyData.map(([, v]) => v), 1);

    const riskStats = [
        { label: 'High Risk', value: high, color: 'bg-red-500', pct: analysed.length ? Math.round(high / analysed.length * 100) : 0 },
        { label: 'Moderate Risk', value: moderate, color: 'bg-amber-400', pct: analysed.length ? Math.round(moderate / analysed.length * 100) : 0 },
        { label: 'Low Risk', value: low, color: 'bg-primary', pct: analysed.length ? Math.round(low / analysed.length * 100) : 0 },
    ];

    return (
        <div>
            <SectionHeader title="Analytics" subtitle="Scan trends and risk distribution overview." />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Patients', value: patients.length, color: 'text-primary' },
                    { label: 'Total Scans', value: scans.length, color: 'text-primary' },
                    { label: 'Analysed', value: analysed.length, color: 'text-purple-600' },
                    { label: 'High Risk', value: high, color: 'text-red-600' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                        <p className={`text-3xl font-black ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Risk Distribution</h3>
                    {analysed.length === 0
                        ? <p className="text-slate-400 text-sm font-medium text-center py-12">No analysed scans yet.</p>
                        : <div className="space-y-5">
                            {riskStats.map(({ label, value, color, pct }) => (
                                <div key={label}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-black text-slate-700">{label}</span>
                                        <span className="text-xs font-black text-slate-500">{value} ({pct}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                                            className={`h-full rounded-full ${color}`} />
                                    </div>
                                </div>
                            ))}
                        </div>}
                </div>

                {/* Monthly Scans Bar Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Monthly Scans</h3>
                    {monthlyData.length === 0
                        ? <p className="text-slate-400 text-sm font-medium text-center py-12">No scan data yet.</p>
                        : <div className="flex items-end gap-3 h-40">
                            {monthlyData.map(([month, count], idx) => {
                                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
                                return (
                                    <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                        <span className="text-xs font-black text-slate-700">{count}</span>
                                        <motion.div
                                            initial={{ height: 0 }} animate={{ height: `${(count / maxVal) * 100}%` }}
                                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                                            className={`w-full ${colors[idx % colors.length]} rounded-t-xl min-h-[4px] opacity-80`}
                                        />
                                        <span className="text-[9px] font-black text-slate-400 uppercase">{month}</span>
                                    </div>
                                );
                            })}
                        </div>}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   SECTION: SETTINGS
═══════════════════════════════════════════════════ */
const SettingsSection = ({ center, user, onCenterUpdate }) => {
    const [tab, setTab] = useState('profile');
    const [profile, setProfile] = useState({
        centerName: center?.centerName || '',
        centerType: center?.centerType || 'Diagnosis Center',
        licenseNumber: center?.licenseNumber || '',
        address: center?.address || '',
        city: center?.city || '',
        phone: center?.phone || '',
        email: center?.email || '',
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
    const [sqSaving, setSqSaving] = useState(false);
    const [sqMsg, setSqMsg] = useState({ type: '', text: '' });
    const [sq, setSq] = useState({ q1: '', a1: '', q2: '', a2: '' });

    const saveProfile = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg({ type: '', text: '' });
        try {
            const res = await api.put('/diagnosis-centers/me', profile);
            setMsg({ type: 'success', text: 'Profile updated successfully.' });
            onCenterUpdate(res.data.data);
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        } finally { setSaving(false); }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        if (!pw.current || !pw.newPw || !pw.confirm) { setPwMsg({ type: 'error', text: 'Please fill all password fields.' }); return; }
        if (pw.newPw !== pw.confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
        if (pw.newPw.length < 8) { setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return; }

        setPwSaving(true); setPwMsg({ type: '', text: '' });
        try {
            await api.put('/auth/change-password', {
                currentPassword: pw.current,
                newPassword: pw.newPw
            });
            setPwMsg({ type: 'success', text: 'Password changed successfully.' });
            setPw({ current: '', newPw: '', confirm: '' });
        } catch (err) {
            setPwMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        } finally { setPwSaving(false); }
    };

    const saveSecurityQuestions = async (e) => {
        e.preventDefault();

        if (!sq.q1 || !sq.a1 || !sq.q2 || !sq.a2) {
            setSqMsg({ type: 'error', text: 'Please fill both security questions and answers.' });
            return;
        }
        if (sq.q1 === sq.q2) {
            setSqMsg({ type: 'error', text: 'Please select two different security questions.' });
            return;
        }

        setSqSaving(true); setSqMsg({ type: '', text: '' });
        try {
            await api.put('/auth/update-security-questions', {
                securityQuestions: [
                    { question: sq.q1, answer: sq.a1 },
                    { question: sq.q2, answer: sq.a2 }
                ]
            });
            setSqMsg({ type: 'success', text: 'Security questions updated successfully.' });
            setSq({ q1: '', a1: '', q2: '', a2: '' });
        } catch (err) {
            setSqMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        } finally { setSqSaving(false); }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: Building2 },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div>
            <SectionHeader title="Settings" subtitle="Manage your center profile, security and preferences." />
            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-52 flex-shrink-0 space-y-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => { setTab(id); setMsg({ type: '', text: '' }); setPwMsg({ type: '', text: '' }); setSqMsg({ type: '', text: '' }); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${tab === id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}>
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    {/* ── Profile Tab ── */}
                    {tab === 'profile' && (
                        <form onSubmit={saveProfile} className="space-y-5">
                            <h3 className="text-base font-black text-slate-900 mb-6">Center Profile</h3>
                            <Input label="Center Name" icon={Building2} required value={profile.centerName} onChange={e => setProfile(p => ({ ...p, centerName: e.target.value }))} placeholder="My Diagnosis Center" />
                            <div className="grid grid-cols-2 gap-4">
                                <Select label="Center Type" value={profile.centerType} onChange={e => setProfile(p => ({ ...p, centerType: e.target.value }))}>
                                    {['Diagnosis Center', 'Lab', 'Optical Center', 'Other'].map(t => <option key={t}>{t}</option>)}
                                </Select>
                                <Input label="License Number" icon={Award} value={profile.licenseNumber} onChange={e => setProfile(p => ({ ...p, licenseNumber: e.target.value }))} placeholder="LIC-123456" />
                            </div>
                            <Input label="Contact Email" icon={Mail} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="center@email.com" />
                            <Input label="Phone" icon={Phone} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9999 999 999" />
                            <Input label="Address" icon={MapPin} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="123 Medical Street" />
                            <Input label="City" icon={MapPin} value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" />
                            {msg.text && (
                                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                    {msg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {msg.text}
                                </div>
                            )}
                            <motion.button whileHover={{ y: -1 }} type="submit" disabled={saving}
                                className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 transition-all">
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
                            </motion.button>
                        </form>
                    )}

                    {/* ── Security Tab ── */}
                    {tab === 'security' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-base font-black text-slate-900 mb-1">Change Password</h3>
                                <p className="text-sm text-slate-400 font-medium mb-6">Use a strong, unique password for your account.</p>
                                <form onSubmit={savePassword} className="space-y-4">
                                    <Input label="Current Password" icon={Lock} type="password" required value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
                                    <Input label="New Password" icon={Lock} type="password" required value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} placeholder="Min. 8 characters" />
                                    <Input label="Confirm New Password" icon={Lock} type="password" required value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
                                    {pwMsg.text && (
                                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${pwMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                            {pwMsg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {pwMsg.text}
                                        </div>
                                    )}
                                    <motion.button whileHover={{ y: -1 }} type="submit" disabled={pwSaving}
                                        className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 transition-all">
                                        {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />} Change Password
                                    </motion.button>
                                </form>

                                {/* Security Questions Section */}
                                <form onSubmit={saveSecurityQuestions} className="pt-6 border-t border-slate-100 mt-6 space-y-6">
                                    {/* Security Questions Section */}
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 mb-1">Update Security Questions</h4>
                                        <p className="text-xs text-slate-400 font-medium mb-4">Questions used for account recovery.</p>
                                    </div>

                                    {/* Show current questions if they exist */}
                                    {user?.securityQuestions && user.securityQuestions.length === 2 && (
                                        <div className="bg-slate-50 p-4 rounded-xl space-y-2 mb-4 border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Questions</p>
                                            {user.securityQuestions.map((q, idx) => (
                                                <p key={idx} className="text-xs font-bold text-slate-600 flex items-start gap-2">
                                                    <span className="text-primary mt-0.5">•</span> {q.question}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Select label="Security Question 1" value={sq.q1} onChange={e => setSq(s => ({ ...s, q1: e.target.value }))}>
                                                <option value="">— Select a question —</option>
                                                {SECURITY_QUESTIONS.filter(q => q !== sq.q2).map(q => <option key={q} value={q}>{q}</option>)}
                                            </Select>
                                            <Input icon={Shield} value={sq.a1} onChange={e => setSq(s => ({ ...s, a1: e.target.value }))} placeholder="Your answer" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Select label="Security Question 2" value={sq.q2} onChange={e => setSq(s => ({ ...s, q2: e.target.value }))}>
                                                <option value="">— Select a question —</option>
                                                {SECURITY_QUESTIONS.filter(q => q !== sq.q1).map(q => <option key={q} value={q}>{q}</option>)}
                                            </Select>
                                            <Input icon={Shield} value={sq.a2} onChange={e => setSq(s => ({ ...s, a2: e.target.value }))} placeholder="Your answer" />
                                        </div>
                                    </div>

                                    {sqMsg.text && (
                                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${sqMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                            {sqMsg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {sqMsg.text}
                                        </div>
                                    )}
                                    <motion.button whileHover={{ y: -1 }} type="submit" disabled={sqSaving}
                                        className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 transition-all">
                                        {sqSaving ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />} Update Security Questions
                                    </motion.button>
                                </form>
                            </div>
                            <div className="border-t border-slate-100 pt-8">
                                <h3 className="text-base font-black text-slate-900 mb-1">Account Info</h3>
                                <p className="text-sm text-slate-400 font-medium mb-4">Your account details managed by RetinaAI.</p>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Role', value: 'Diagnosis Center' },
                                        { label: 'Email', value: user?.email || '—' },
                                        { label: 'Center ID', value: center?.centerId || '—' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
                                            <span className="text-sm font-bold text-slate-700">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-8 mt-8">
                                <DeleteAccountSection />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════ */
const DiagnosisCenterDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [center, setCenter] = useState(null);
    const [patients, setPatients] = useState([]);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity, path: 'overview' },
        { id: 'patients', label: 'Patients', icon: Users, path: 'patients' },
        { id: 'scans', label: 'Scans', icon: Scan, path: 'scans' },
        { id: 'reports', label: 'Reports', icon: FileText, path: 'reports' },
        { id: 'analytics', label: 'Analytics', icon: BarChart2, path: 'analytics' },
        { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
    ];

    // Determine active nav from URL
    const currentPath = location.pathname.split('/').pop();
    const activeNav = navItems.find(item => item.path === currentPath)?.id || 'dashboard';

    const fetchAll = async () => {
        try {
            const [cRes, pRes, sRes] = await Promise.all([
                api.get('/diagnosis-centers/me'),
                api.get('/patients'),
                api.get('/scans'),
            ]);
            if (cRes.data.success) setCenter(cRes.data.data);
            if (pRes.data.success) setPatients(pRes.data.data);
            if (sRes.data.success) setScans(sRes.data.data);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    if (loading) return (
        <div className="min-h-screen bg-main flex items-center justify-center">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={20} />
            </div>
        </div>
    );

    const avatarUrl = center?.photo && center.photo !== 'default-center.jpg'
        ? center.photo
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(center?.centerName || user?.name || 'DC')}&background=137fec&color=fff&bold=true`;

    return (
        <div className="font-display min-h-screen bg-main flex">
            {/* ── Sidebar ── */}
            <aside className="w-60 bg-sidebar border-r border-white/5 flex flex-col fixed h-full z-20 shadow-xl">
                <div className="px-5 py-6 border-b border-white/5">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors">
                            <Activity className="text-primary" size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white tracking-tight italic uppercase">RetinaAI</h2>
                            <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em]">Center Portal</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map(({ id, label, icon: Icon, path }) => (
                        <button key={id} onClick={() => navigate(`/diagnosis-center/${path}`)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-bold text-sm ${activeNav === id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}>
                            <Icon size={16} strokeWidth={activeNav === id ? 2.5 : 2} />
                            {label}
                            {activeNav === id && <ChevronRight size={12} className="ml-auto text-white/50" />}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-white/5">
                    <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/5">
                        <div className="size-9 rounded-full border-2 border-white/10 shadow-sm bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url('${avatarUrl}')` }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-white" title={center?.centerName || user?.name}>
                                {center?.centerName || user?.name}
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 truncate uppercase tracking-widest">Diagnosis Center</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="mt-2 w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-sm">
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="ml-60 flex-1 p-8 min-h-screen">
                <AnimatePresence mode="wait">
                    <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Routes>
                            <Route path="/" element={<Navigate to="overview" replace />} />
                            <Route path="overview" element={<DashboardSection center={center} patients={patients} scans={scans} onCenterUpdate={setCenter} />} />
                            <Route path="patients" element={<PatientsSection patients={patients} onRefresh={fetchAll} />} />
                            <Route path="scans" element={<ScansSection scans={scans} patients={patients} onRefresh={fetchAll} />} />
                            <Route path="reports" element={<ReportsSection scans={scans} />} />
                            <Route path="analytics" element={<AnalyticsSection scans={scans} patients={patients} />} />
                            <Route path="settings" element={<SettingsSection center={center} user={user} onCenterUpdate={setCenter} />} />
                        </Routes>
                    </motion.div>
                </AnimatePresence>
                <div className="mt-10 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        © 2024 RetinaAI Systems · Diagnosis Center Portal · HIPAA Vault Active
                    </p>
                </div>
            </main>
        </div>
    );
};

export default DiagnosisCenterDashboard;
