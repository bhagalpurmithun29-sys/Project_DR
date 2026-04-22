import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import patientService from '../services/patientService';
import api from '../services/api';
import notificationService from '../services/notificationService';
import {
    Eye,
    LayoutDashboard,
    Activity,
    History,
    Settings,
    LogOut,
    ChevronRight,
    Download,
    PlusCircle,
    Calendar,
    Mail,
    ChevronDown,
    Search,
    AlertCircle,
    CheckCircle,
    FileText,
    ZoomIn,
    Brain,
    BookOpen,
    TrendingUp,
    Shield,
    Bell,
    User,
    ArrowUpRight,
    X,
    Check,
    Phone,
    MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientPreferencesModal from '../components/PatientPreferencesModal';

const PatientDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [patient, setPatient] = useState(null);
    const [scans, setScans] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const latestResult = scans[0]?.aiResult?.toLowerCase() || '';
    const diabeticStage = latestResult.includes('proliferative') || latestResult.includes('pdr') || latestResult.includes('high') ? 'Stage 4' :
                         latestResult.includes('severe') ? 'Stage 3' :
                         latestResult.includes('moderate') ? 'Stage 2' :
                         latestResult.includes('mild') ? 'Stage 1' : 
                         latestResult.includes('no dr') || latestResult.includes('healthy') || latestResult.includes('low') ? 'Healthy' : 'Healthy';

    const getRiskLevel = (result) => {
        if (!result) return 'None';
        const lowerResult = result.toLowerCase();
        if (lowerResult.includes('pdr') || lowerResult.includes('severe') || lowerResult.includes('high')) return 'High';
        if (lowerResult.includes('moderate')) return 'Moderate';
        return 'Low';
    };

    const fetchData = async () => {
        try {
            const patientRes = await patientService.getMyProfile();
            if (patientRes.success) {
                setPatient(patientRes.data);
                const [scansRes, notificationsRes] = await Promise.all([
                    patientService.getPatientScans(patientRes.data._id),
                    notificationService.getNotifications()
                ]);

                if (scansRes.success) setScans(scansRes.data);
                if (notificationsRes.success) setNotifications(notificationsRes.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Polling for real-time updates from database (every 30s)
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAllAsRead = async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            await Promise.all(unread.map(n => notificationService.markAsRead(n._id)));
            // Refresh notifications
            const res = await notificationService.getNotifications();
            if (res.success) setNotifications(res.data);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);

            const res = await patientService.uploadPatientPhoto(patient._id, formData);
            if (res.success) {
                setPatient({ ...patient, photo: res.data });
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scans, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `RetinaAI_Scan_History_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setIsExportModalOpen(false);
    };

    const handleExportCSV = () => {
        if (scans.length === 0) return setIsExportModalOpen(false);

        const headers = ['Date', 'AI Result', 'Lesion Count', 'Status'];
        const csvRows = [headers.join(',')];

        scans.forEach(scan => {
            const values = [
                new Date(scan.date).toLocaleDateString(),
                scan.aiResult || 'Pending',
                scan.lesionCount || 0,
                scan.status || 'Pending'
            ];
            csvRows.push(values.map(v => `"${v}"`).join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `RetinaAI_Scan_History_${new Date().toISOString().split('T')[0]}.csv`);
        a.click();
        setIsExportModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <Eye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={20} />
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-main font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-x-hidden">
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
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/25 transition-all">
                        <LayoutDashboard size={18} strokeWidth={2.5} />
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
                    <Link to="/ai-assistant" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
                        <MessageCircle size={18} />
                        <span className="text-sm">AI Assistant</span>
                    </Link>

                    <div className="pt-6 mt-6 border-t border-white/5">
                        <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account</p>
                        <button
                            onClick={() => setIsPreferencesOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group"
                        >
                            <Settings size={18} />
                            <span className="text-sm">Settings</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5">
                        <div className="size-10 rounded-xl border-2 border-white/10 shadow-sm bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url('${patient?.photo ? (patient.photo.startsWith('http') ? patient.photo : `${api.defaults.baseURL.replace('/api', '')}${patient.photo}`) : "https://ui-avatars.com/api/?name=" + (user?.name || "Patient") + "&background=059669&color=fff&bold=true"}')` }}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-white" title={patient?.name || user?.name || 'Patient'}>{patient?.name || user?.name || 'Patient'}</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">{patient?.patientId || 'Patient'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-500/10 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                        <LogOut size={16} strokeWidth={2.5} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col lg:ml-72">
                {/* Topbar */}
                <header className="sticky top-0 z-40 h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between px-10">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                        <span>Patient</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-primary italic font-black">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className={`relative p-2.5 rounded-xl transition-all ${isNotificationOpen ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className={`absolute top-2.5 right-2.5 size-2 rounded-full border-2 ${isNotificationOpen ? 'border-primary bg-white px-0.5' : 'border-white dark:border-slate-800 bg-red-500'}`}></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotificationOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-[400px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 z-20 overflow-hidden"
                                        >
                                            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
                                                    Clinical Updates
                                                    {unreadCount > 0 && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px]">{unreadCount} New</span>}
                                                </h3>
                                                <button onClick={markAllAsRead} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Mark all read</button>
                                            </div>
                                            <div className="max-h-[450px] overflow-y-auto p-4 space-y-2">
                                                {notifications.length > 0 ? notifications.map((n) => (
                                                    <div
                                                        key={n._id}
                                                        className={`p-4 rounded-2xl border transition-all cursor-pointer group/item ${n.isRead ? 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 opacity-60' : 'bg-primary/[0.02] dark:bg-primary/5 border-primary/10 hover:bg-primary/[0.04]'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`size-2 rounded-full ${n.type === 'Report' ? 'bg-primary' : 'bg-amber-500'}`} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{n.type}</span>
                                                            </div>
                                                            {!n.isRead && (
                                                                <button
                                                                    onClick={(e) => handleMarkAsRead(e, n._id)}
                                                                    className="size-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all"
                                                                >
                                                                    <Check size={12} strokeWidth={3} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{n.title}</p>
                                                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">{n.message}</p>
                                                        <p className="mt-3 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString()}</p>
                                                    </div>
                                                )) : (
                                                    <div className="py-12 text-center">
                                                        <Bell className="mx-auto text-slate-200 mb-4" size={32} />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed px-10">No messages in your clinical archive yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                                                    <button className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">Clear Metadata Cache</button>
                                                </div>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <AnimatePresence>
                    {isExportModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
                                onClick={() => setIsExportModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 pointer-events-auto"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        <Download size={24} strokeWidth={2.5} />
                                    </div>
                                    <button onClick={() => setIsExportModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Export Reports</h3>
                                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Download a comprehensive spreadsheet or dataset of your retinal scans and insights.</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleExportCSV}
                                        className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary transition-all group flex items-center text-left gap-4"
                                    >
                                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">Spreadsheet (.csv)</p>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Best for Excel or Google Sheets</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleExportJSON}
                                        className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary transition-all group flex items-center text-left gap-4"
                                    >
                                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">Raw Data (.json)</p>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Best for developers or APIs</p>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-10 space-y-10 max-w-[1400px] mx-auto w-full"
                >
                    {/* Welcome Section */}
                    <motion.section variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Welcome back, <span className="text-primary italic">{patient?.name?.split(' ')[0] || "Friend"}</span></h2>
                            <p className="text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-primary uppercase tracking-widest">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                                </span>
                                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setIsExportModalOpen(true)} className="h-14 px-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-sm font-black text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm">
                                <Download size={18} />
                                Export History
                            </button>
                        </div>
                    </motion.section>

                    {/* Patient Card */}
                    <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center relative z-10">
                            <div className="flex gap-8 items-center flex-1">
                                <div className="relative group/avatar cursor-pointer">
                                    <div className="size-32 rounded-[2rem] border-8 border-white dark:border-slate-800 shadow-2xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url('${patient?.photo ? (patient.photo.startsWith('http') ? patient.photo : `${api.defaults.baseURL.replace('/api', '')}${patient.photo}`) : "https://ui-avatars.com/api/?name=" + (patient?.name || user?.name || "Patient") + "&background=137fec&color=fff&bold=true"}')` }}></div>
                                    <label className="absolute inset-0 bg-black/40 rounded-[2rem] sm:opacity-0 sm:group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-8 border-transparent">
                                        <div className="text-white text-center flex flex-col items-center gap-1">
                                            {uploadingPhoto ? (
                                                <div className="size-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                            ) : (
                                                <>
                                                    <PlusCircle size={20} strokeWidth={2.5} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">Update<br />Photo</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{patient?.name || user?.name}</h3>
                                        <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-primary/10 text-primary border border-primary/20">
                                            <span className="size-2 rounded-full bg-primary" />
                                            Patient
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-2"><Calendar size={16} className="text-slate-300 dark:text-slate-600" /> {patient?.age || "N/A"} Years</span>
                                        <span className={`flex items-center gap-2 ${
                                            diabeticStage === 'Stage 4' || diabeticStage === 'Stage 3' ? 'text-rose-500' : 
                                            diabeticStage === 'Stage 2' ? 'text-amber-500' : 'text-slate-500'
                                        }`} title="Latest Retinopathy Stage">
                                            <Activity size={16} className={`${
                                                diabeticStage === 'Stage 4' || diabeticStage === 'Stage 3' ? 'text-rose-400' : 
                                                diabeticStage === 'Stage 2' ? 'text-amber-400' : 'text-slate-300'
                                            }`} /> 
                                            {scans[0]?.aiResult || patient?.diabetesType || "No Scan Data"}
                                        </span>
                                        <span className="flex items-center gap-2"><Mail size={16} className="text-slate-300 dark:text-slate-600" /> {patient?.email || user?.email}</span>
                                        <span className="flex items-center gap-2"><Phone size={16} className="text-slate-300 dark:text-slate-600" /> {patient?.phoneNumber || "N/A"}</span>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-1 bg-slate-50 dark:bg-slate-800/50">Patient ID: {patient?._id?.substring(0, 12).toUpperCase()}</span>

                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full lg:w-auto min-w-[300px] lg:min-w-[450px]">
                                {[
                                    { label: "Total Scans", val: scans.length, trend: "History", color: "text-slate-900 dark:text-white" },
                                    { 
                                        label: "Current Risk", 
                                        val: getRiskLevel(scans[0]?.aiResult), 
                                        trend: scans[0]?.aiResult || "Severity", 
                                        color: getRiskLevel(scans[0]?.aiResult) === 'High' ? "text-rose-500" : getRiskLevel(scans[0]?.aiResult) === 'Moderate' ? "text-amber-500" : "text-emerald-500" 
                                    },
                                    {
                                        label: "Diabetic Stage",
                                        val: diabeticStage,
                                        trend: scans[0]?.aiResult || "Status",
                                        color: diabeticStage === 'Stage 4' || diabeticStage === 'Stage 3' ? 'text-rose-500' :
                                               diabeticStage === 'Stage 2' ? 'text-amber-500' :
                                               diabeticStage === 'Healthy' ? 'text-emerald-500' : 'text-primary'
                                    }
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-5 border border-white dark:border-slate-800 text-center shadow-inner hover:bg-white dark:hover:bg-slate-800 hover:border-slate-100 dark:hover:border-slate-700 transition-all group/stat">
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-extrabold mb-2">{stat.label}</p>
                                        <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                                        <div className="mt-2 h-0.5 w-6 bg-slate-200 dark:bg-slate-700 mx-auto group-hover/stat:w-12 transition-all group-hover/stat:bg-primary" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Interaction Area */}
                        <div className="lg:col-span-2 space-y-10">

                            {/* Scan History Table */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/30 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Access Recent Reports</h4>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={14} />
                                        <input
                                            className="pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 w-48"
                                            placeholder="Find report..."
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 dark:bg-slate-950/50">
                                            <tr>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Date</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">AI Result</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Markers</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Status</th>
                                                <th className="px-8 py-5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {scans.length > 0 ? scans.map((scan) => (
                                                <tr key={scan._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(scan.date).toLocaleDateString()}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">OS (Left Eye)</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                                            getRiskLevel(scan.aiResult) === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                                            getRiskLevel(scan.aiResult) === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        }`}>
                                                            {scan.aiResult || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{scan.lesionCount} lesions</td>
                                                    <td className="px-8 py-6">
                                                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${scan.status === 'Reviewed' ? 'text-primary' : 'text-amber-600'}`}>
                                                            <span className={`size-1.5 rounded-full ${scan.status === 'Reviewed' ? 'bg-primary' : 'bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.5)] animate-pulse'}`}></span>
                                                            {scan.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => navigate('/scan-history')}
                                                            className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20"
                                                        >
                                                            <ArrowUpRight size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <FileText className="text-slate-200" size={48} />
                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No scanned history available</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar Controls */}
                        <div className="space-y-10">
                            {/* Visual Asset Card */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 group">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Eye size={16} />
                                    </div>
                                    Latest Fundus Scan
                                </h4>
                                <div className="aspect-[4/5] w-full rounded-[2rem] bg-slate-100 dark:bg-slate-800 relative overflow-hidden group/img cursor-zoom-in">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/img:scale-110" style={{ backgroundImage: `url('${scans[0]?.imageUrl ? (scans[0].imageUrl.startsWith('http') ? scans[0].imageUrl : `${api.defaults.baseURL.replace('/api', '')}${scans[0].imageUrl}`) : "/stage1.jpeg"}')` }}></div>
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <div className="bg-white dark:bg-slate-900 text-primary p-4 rounded-2xl shadow-2xl scale-50 group-hover/img:scale-100 transition-transform duration-500">
                                            <ZoomIn size={24} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    {/* Scan Info Overlay */}
                                    <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center text-[9px] font-black text-white/80 uppercase tracking-widest backdrop-blur-md bg-black/40 px-4 py-3 rounded-xl border border-white/10 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                        <span>Left Eye (OS)</span>
                                        <span>#DR-8829</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* AI Insights Card */}
                            <motion.div variants={itemVariants} className="bg-white shadow-xl shadow-slate-200/30 rounded-[2.5rem] p-8 border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
                                <h4 className="text-slate-900 text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Brain size={16} />
                                    </div>
                                    AI Core Insights
                                </h4>
                                <ul className="space-y-6">
                                    {scans[0]?.insights && scans[0].insights.length > 0 ? scans[0].insights.map((insight, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <div className="size-8 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center text-primary border border-slate-100">
                                                {insight.type === 'high_risk' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                            </div>
                                            <p className="text-xs font-bold leading-relaxed text-slate-500" dangerouslySetInnerHTML={{
                                                __html: insight.message
                                                    .replace(/(\d+%)/, '<span class="px-1.5 py-0.5 bg-primary/10 rounded-md font-black text-primary">$1</span>')
                                                    .replace(/(In \d+ Months)/, '<span class="text-primary font-black underline underline-offset-4 decoration-primary/30">$1</span>')
                                            }} />
                                        </li>
                                    )) : (
                                        <div className="text-center py-6 text-slate-300 italic text-xs font-bold uppercase tracking-widest">Awaiting engine sync...</div>
                                    )}
                                </ul>
                                <button className="w-full mt-10 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all">
                                    Full Engine Report
                                </button>
                            </motion.div>




                            {/* Security Badge */}
                            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center gap-4 border border-slate-200/50 dark:border-slate-800">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Shield size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-0.5">Privacy Lock Active</p>
                                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-none">AES-256 Retinal Data Encryption</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-auto px-10 py-10 text-center border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
                        © 2024 RetinaAI Clinical Systems / v2.4.1-stable / Patient Vault Active
                    </p>
                </footer>
            </main>
            {/* Patient Preferences Modal */}
            <PatientPreferencesModal
                isOpen={isPreferencesOpen}
                onClose={() => setIsPreferencesOpen(false)}
                patient={patient}
                user={user}
                onProfileUpdate={(updated) => setPatient(prev => {
                    const merged = { ...prev, ...updated };
                    // Preferences form sends 'phone', Patient model uses 'phoneNumber'
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

export default PatientDashboard;
