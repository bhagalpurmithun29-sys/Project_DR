import React, { useState, useEffect, useContext } from 'react';
import {
    Eye,
    LayoutDashboard,
    Activity,
    Bell,
    Settings,
    LogOut,
    Search,
    ChevronRight,
    Users,
    Microscope,
    AlertTriangle,
    Clock,
    User,
    ArrowRight,
    TrendingUp,
    Shield,
    FileText,
    MoreHorizontal,
    Filter,
    ArrowUpRight,
    Zap, X, Calendar
} from 'lucide-react';
import CentralAlertsModal from '../components/CentralAlertsModal';
import NodeSettingsModal from '../components/NodeSettingsModal';
import { AuthContext } from '../context/AuthContext';
import doctorService from '../services/doctorService';
import scanService from '../services/scanService';
import patientService from '../services/patientService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { normalizeUrl } from '../services/api';
import ProfileIncompleteBanner from '../components/ProfileIncompleteBanner';
import Toast from '../components/Toast';


const DoctorDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [scans, setScans] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [search, setSearch] = useState('');
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
    const location = useLocation();
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        if (location.state?.loginSuccess) {
            showToast(`Welcome back, Dr. ${user?.name || 'Provider'}!`, 'success');
            // Clear state to prevent re-showing
            window.history.replaceState({}, document.title);
        }
    }, [location.state, user?.name]);

    const fetchData = async () => {
        try {
            const [profileRes, scansRes, patientsRes, notificationsRes] = await Promise.allSettled([
                doctorService.getProfile(),
                scanService.getScans(),
                patientService.getAllPatients(),
                api.get('/notifications')
            ]);

            if (profileRes.status === 'fulfilled' && profileRes.value.data) {
                setProfile(profileRes.value.data);
                setIsProfileIncomplete(false);
            } else {
                if (profileRes.status === 'rejected') {
                    console.error('Profile fetch failed', profileRes.reason);
                }
                setIsProfileIncomplete(true);
                setProfile(null);
            }

            if (scansRes.status === 'fulfilled') setScans(scansRes.value.data);
            if (patientsRes.status === 'fulfilled') setPatients(patientsRes.value.data);
            if (notificationsRes.status === 'fulfilled') {
                const unread = (notificationsRes.value.data.data || []).filter(n => !n.isRead).length;
                setUnreadNotifications(unread);
            }
        } catch (err) {
            console.error('Unexpected error during dashboard fetch', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchNotificationsCount();
        }, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchNotificationsCount = async () => {
        try {
            const res = await api.get('/notifications');
            const unread = (res.data.data || []).filter(n => !n.isRead).length;
            setUnreadNotifications(unread);
        } catch (err) {
            console.error('Failed to fetch notifications count:', err);
        }
    };

    // Refresh count when modal closes
    useEffect(() => {
        if (!isAlertsOpen) {
            fetchNotificationsCount();
        }
    }, [isAlertsOpen]);



    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const analyzedScans = scans.filter(s => s.status !== 'Pending');
    const totalAnalyzed = analyzedScans.length || 1;
    const highRiskCount = analyzedScans.filter(s => s.aiResult === 'High Risk').length;
    const moderateCount = analyzedScans.filter(s => s.aiResult === 'Moderate').length;
    const lowRiskCount = Math.max(0, totalAnalyzed - highRiskCount - moderateCount);

    const severityStats = [
        { label: "Healthy / Controlled", percent: Math.round((lowRiskCount / totalAnalyzed) * 100), color: "bg-primary", stroke: "text-primary" },
        { label: "Moderate Retinopathy", percent: Math.round((moderateCount / totalAnalyzed) * 100), color: "bg-amber-500", stroke: "text-amber-500" },
        { label: "High Risk Proliferative", percent: Math.round((highRiskCount / totalAnalyzed) * 100), color: "bg-rose-500", stroke: "text-rose-500" }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-main flex items-center justify-center transition-colors duration-300">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                    <Eye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 }
    };

    const KPI_CARDS = [
        {
            icon: Users,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
            label: "Patient Base",
            value: new Set(scans.map(s => s.patient?._id)).size.toString(),
            trend: "+0",
            trendUp: true,
        },
        {
            icon: Microscope,
            iconBg: "bg-teal-500/10",
            iconColor: "text-teal-500",
            label: "Total Scans",
            value: scans.length.toString(),
            trend: scans.filter(s => {
                const d = new Date(s.createdAt);
                const now = new Date();
                return d.toDateString() === now.toDateString();
            }).length.toString() + " today",
            trendUp: true,
        },
        {
            icon: AlertTriangle,
            iconBg: "bg-rose-500/10",
            iconColor: "text-rose-500",
            label: "High Risk Cases",
            value: scans.filter(s => s.aiResult === 'High Risk').length.toString(),
            trend: "Critical",
            trendUp: false,
            valueColor: "text-rose-500",
        },
        {
            icon: Clock,
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-500",
            label: "Pending Review",
            value: scans.filter(s => s.status === 'Pending').length.toString(),
            trend: "Awaiting",
            trendUp: true,
        },
    ];

    const RECENT_ACTIVITY = scans.slice(0, 5).map(scan => ({
        _id: scan._id,
        name: scan.patient?.name || "Unknown Patient",
        initials: (scan.patient?.name || "UP").split(' ').map(n => n[0]).join(''),
        time: new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk: scan.aiResult,
        riskStyle: scan.aiResult === 'High Risk' ? "bg-rose-50 text-rose-600 border-rose-100" :
            scan.aiResult === 'Moderate' ? "bg-amber-50 text-amber-600 border-amber-100" :
                "bg-emerald-50 text-emerald-600 border-emerald-100",
        status: scan.status,
        statusStyle: scan.status === 'Pending' ? "text-amber-600" : "text-primary",
        statusDot: scan.status === 'Pending' ? "bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.4)] animate-pulse" : "bg-primary",
        action: scan.status === 'Pending' ? "Analyze" : "Details",
        source: scan.diagnosisCenter?.name || "Self",
        diagnosor: scan.technician || "Direct Entry"
    }));

    const filteredPatients = patients.filter(p =>
        (p.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (p.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (p.phoneNumber || '').includes(search)
    );

    const filteredScans = scans.filter(s =>
        (s.patient?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (s.aiResult?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (s.status?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const SearchResults = () => {
        if (!search) return null;

        const hasMatches = filteredPatients.length > 0 || filteredScans.length > 0;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] z-[100] max-h-[500px] overflow-y-auto custom-scrollbar overflow-x-hidden"
            >
                <div className="p-6 space-y-6">
                    {filteredPatients.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Patient Entities</h5>
                                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">{filteredPatients.length}</span>
                            </div>
                            <div className="space-y-2">
                                {filteredPatients.slice(0, 3).map((p) => (
                                    <div
                                        key={p._id}
                                        onClick={() => navigate('/doctor/scan-history', { state: { searchTerm: p.name } })}
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group/res"
                                    >
                                        <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                                            {p.name?.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover/res:text-primary transition-colors">{p.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.email || p.phoneNumber}</p>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-200 group-hover/res:text-primary transition-all -translate-x-2 opacity-0 group-hover/res:translate-x-0 group-hover/res:opacity-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredScans.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Diagnostic Scans</h5>
                                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">{filteredScans.length}</span>
                            </div>
                            <div className="space-y-2">
                                {filteredScans.slice(0, 4).map((s) => (
                                    <div
                                        key={s._id}
                                        onClick={() => navigate('/doctor/scan-history', { state: { searchTerm: s.patient?.name } })}
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group/res"
                                    >
                                        <div className={`size-10 rounded-xl flex items-center justify-center font-black text-[9px] border-2 border-white shadow-sm ${s.aiResult === 'High Risk' ? 'bg-rose-50 text-rose-500' :
                                            s.aiResult === 'Moderate' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                                            }`}>
                                            {s.eyeSide}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-900 group-hover/res:text-primary transition-colors">{s.patient?.name || 'Unknown'}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${s.aiResult === 'High Risk' ? 'text-rose-500' : s.aiResult === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                                                    }`}>{s.aiResult || 'Pending'}</span>
                                                <span className="size-1 rounded-full bg-slate-200" />
                                                <span className="text-[9px] font-bold text-slate-300 italic">{new Date(s.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-200 group-hover/res:text-primary transition-all -translate-x-2 opacity-0 group-hover/res:translate-x-0 group-hover/res:opacity-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!hasMatches && (
                        <div className="py-12 text-center space-y-4">
                            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                <Search size={24} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No clinical matches found</p>
                        </div>
                    )}
                </div>
                {hasMatches && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:underline underline-offset-4">
                            View all {filteredScans.length + filteredPatients.length} search results
                        </button>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-main font-display text-slate-900 dark:text-slate-100 antialiased flex flex-col lg:flex-row overflow-x-hidden transition-colors duration-300">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-screen w-72 bg-sidebar border-r border-white/5 hidden lg:flex flex-col z-50">
                <div className="p-8 pb-12 flex items-center gap-3">
                    <div className="size-11 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
                        <Activity size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white italic uppercase leading-none">RetinaAI</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-primary">Clinical Portal</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
                    <Link to="/doctor-dashboard" className="flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/25 transition-all">
                        <LayoutDashboard size={18} strokeWidth={2.5} />
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/doctor/scan-history" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
                        <Activity size={18} />
                        <span className="text-sm">Scan History</span>
                    </Link>
                    <Link to="/doctor/appointments" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
                        <Calendar size={18} />
                        <span className="text-sm">Appointments</span>
                    </Link>
                    <Link to="/doctor-profile" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
                        <User size={18} />
                        <span className="text-sm">Profile</span>
                    </Link>
                    <div className="pt-8 mb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">System</div>
                    <button onClick={() => setIsAlertsOpen(true)} className="w-full flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
                        <Bell size={18} />
                        <span className="text-sm">Notifications</span>
                        {unreadNotifications > 0 && (
                            <span className="ml-auto size-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-lg font-black shadow-lg shadow-rose-500/20">
                                {unreadNotifications > 99 ? '99+' : unreadNotifications.toString().padStart(2, '0')}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
                        <Settings size={18} />
                        <span className="text-sm">Settings</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5">
                        <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm" style={{ backgroundImage: `url(${normalizeUrl(profile?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Doctor')}&background=059669&color=fff&bold=true`})` }}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-white">Dr. {user?.name || "Provider"}</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">Retina Specialist</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-500/10 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                        <LogOut size={16} strokeWidth={2.5} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col relative z-10 lg:ml-72">
                {/* Header Overlay Effect */}
                <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <header className="sticky top-0 h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between px-10 z-[60]">
                    <div className="flex flex-col">

                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                className="w-80 pl-12 pr-10 py-3 bg-slate-100/60 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all shadow-inner"
                                placeholder="Search clinical data..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Escape' && setSearch('')}
                            />
                            <AnimatePresence>
                                {search && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-all"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                            <AnimatePresence>
                                <SearchResults />
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-slate-100 rounded-xl flex gap-1">
                                <button className="p-2.5 rounded-lg bg-white shadow-sm text-primary"><Zap size={18} /></button>
                                <button className="p-2.5 rounded-lg text-slate-400 hover:text-slate-600"><Filter size={18} /></button>
                            </div>
                        </div>
                    </div>
                </header>

                {isProfileIncomplete && <ProfileIncompleteBanner />}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-10 space-y-10 w-full max-w-[1500px] mx-auto"
                >
                    {/* Welcome banner */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-2">
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic">Active <span className="text-primary not-italic">Clinical Environment</span></h3>
                            <p className="text-lg font-medium text-slate-500 dark:text-slate-400 max-w-xl">Diagnostic metrics sync completed. You have 3 urgent reviews remaining in your queue.</p>
                        </div>

                    </motion.div>

                    {/* KPI Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {KPI_CARDS.map((card, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-black/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="text-slate-200 dark:text-slate-700" size={20} />
                                </div>
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`p-4 rounded-2xl ${card.iconBg} ${card.iconColor} shadow-sm border border-white dark:border-slate-700`}>
                                        <card.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${card.trendUp ? 'bg-primary/10 text-primary' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                                        {card.trendUp ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
                                        {card.trend}
                                    </div>
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{card.label}</p>
                                <h3 className={`text-4xl font-black tracking-tight ${card.valueColor || 'text-slate-900 dark:text-white'}`}>{card.value}</h3>
                                <div className="mt-6 h-1 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "0%" }}
                                        transition={{ delay: 0.5 + (i * 0.1), duration: 1.5 }}
                                        className={`h-full w-2/3 ${card.iconBg.replace('/10', '')} opacity-40`}
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Feed / Activity */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-black/20 overflow-hidden group">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Diagnostic Workflow</h4>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1 italic">Real-time patient entry system</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/5 hover:text-primary transition-all"><MoreHorizontal size={20} /></button>
                                </div>
                            </div>
                            <div className="overflow-x-auto px-2">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafc]/50 dark:bg-slate-950/50">
                                        <tr>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Patient Entity</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Time Sync</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">AI Scoring</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Source Portal</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Vitals</th>
                                            <th className="px-8 py-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {RECENT_ACTIVITY.map((row, i) => (
                                            <tr
                                                key={i}
                                                onClick={() => navigate('/doctor/scan-history', { state: { searchTerm: row.name } })}
                                                className="hover:bg-primary/[0.02] transition-all cursor-pointer group/row"
                                            >
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-11 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 shadow-sm flex items-center justify-center font-black text-xs text-primary group-hover/row:border-primary/20 transition-all">
                                                            {row.initials}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-1">{row.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID: 8829-{i}X</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{row.time}</td>
                                                <td className="px-8 py-8">
                                                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${row.risk === 'High Risk' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-500/20' : row.risk === 'Moderate' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20'}`}>
                                                        {row.risk}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{row.source}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Lab: {row.diagnosor}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${row.statusStyle}`}>
                                                        <div className={`size-2.5 rounded-full border-2 border-white shadow-sm ${row.statusDot}`} />
                                                        {row.status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8 text-right">
                                                    <button className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                                                        <ArrowRight size={18} strokeWidth={2.5} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-8 bg-[#f8fafc]/50 dark:bg-slate-950/50 border-t border-slate-50 dark:border-slate-800 flex justify-center">
                                <Link to="/doctor/scan-history" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] hover:text-primary transition-colors flex items-center gap-2">
                                    Full Patient Directory <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>

                        {/* Side Widgets */}
                        <div className="space-y-10">
                            {/* Distribution Graph Simulation */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-black/20">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white italic">Severity <span className="text-primary">Spread</span></h4>
                                    <Activity className="text-slate-200 dark:text-slate-700" size={20} />
                                </div>
                                <div className="flex items-center justify-center py-6">
                                    <div className="relative size-44 group cursor-help">
                                        <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: severityStats[0].percent / 100 }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                                className={severityStats[0].stroke} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${severityStats[0].percent}, 100`} strokeLinecap="round" strokeWidth="4" />
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: severityStats[1].percent / 100 }}
                                                transition={{ duration: 1.2, delay: 0.8 }}
                                                className={severityStats[1].stroke} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${severityStats[1].percent}, 100`} strokeDashoffset={-severityStats[0].percent} strokeLinecap="round" strokeWidth="4" />
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: severityStats[2].percent / 100 }}
                                                transition={{ duration: 1, delay: 1.1 }}
                                                className={severityStats[2].stroke} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${severityStats[2].percent}, 100`} strokeDashoffset={-(severityStats[0].percent + severityStats[1].percent)} strokeLinecap="round" strokeWidth="4" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                                {scans.length >= 1000 ? `${(scans.length / 1000).toFixed(1)}K` : scans.length}
                                            </span>
                                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">Cases</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    {severityStats.map((stat, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-2.5 rounded-full ${stat.color} shadow-sm`} />
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900 dark:text-slate-200">{stat.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Alert Queue */}
                            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/30 transition-colors" />
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-slate-900 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                        <div className="size-8 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 text-primary">
                                            <Shield size={16} />
                                        </div>
                                        Urgent Queue
                                    </h4>
                                    <span className="px-3 py-1 bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-500/30 animate-pulse">Critical</span>
                                </div>
                                <div className="space-y-4">
                                    {scans.filter(s => s.aiResult === 'High Risk').slice(0, 2).map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/20 transition-all cursor-pointer group/item shadow-sm hover:shadow-md">
                                            <div className="size-10 rounded-xl bg-white flex flex-col items-center justify-center font-black leading-none group-hover/item:bg-primary border border-slate-100 transition-all">
                                                <span className="text-[9px] text-slate-400 group-hover/item:text-white/70 opacity-60">
                                                    {new Date(item.createdAt).toLocaleString('default', { month: 'short' })}
                                                </span>
                                                <span className="text-base text-slate-900 group-hover/item:text-white">
                                                    {new Date(item.createdAt).getDate()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-900 truncate">{item.patient?.name || 'Unknown'}</p>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">High Risk Detected</p>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-300 group-hover/item:text-primary transition-all" />
                                        </div>
                                    ))}
                                    {scans.filter(s => s.aiResult === 'High Risk').length === 0 && (
                                        <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No Critical Cases</p>
                                        </div>
                                    )}
                                </div>
                                <button className="w-full mt-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
                                    Access Full Triage
                                </button>
                            </motion.div>
                        
                            
                            {/* Clinical Security Signature */}
                            <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-4 shadow-inner">
                                <div className="size-11 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-primary border border-slate-100 dark:border-slate-800 italic font-black text-sm">R</div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-0.5">Secure Physician Instance</p>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic">Auth ID: 88A-29C-77X</p>
                                </div>
                                <div className="ml-auto size-2 bg-primary rounded-full shadow-[0_0_8px_rgba(5,150,105,0.6)]" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        © 2024 RetinaAI Clinical Systems / v2.4.1-stable / Node {user?.id?.substring(0, 8) || "882B-7"}
                    </p>
                </footer>
            </main>



            {/* System Modals */}
            <CentralAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
            <NodeSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <AnimatePresence>
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(prev => ({ ...prev, show: false }))}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorDashboard;
