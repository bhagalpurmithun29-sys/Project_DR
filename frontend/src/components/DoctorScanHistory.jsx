import React, { useState, useEffect, useContext } from 'react';
import {
    Search,
    Filter,
    Download,
    Eye,
    ChevronDown,
    MoreVertical,
    Calendar,
    User,
    ArrowLeft,
    LayoutDashboard,
    Activity,
    Bell,
    Settings,
    LogOut,
    ArrowRight,
    ArrowUpRight,
    FilterX,
    ClipboardList,
    Shield,
    CheckCircle
} from 'lucide-react';
import CentralAlertsModal from '../components/CentralAlertsModal';
import NodeSettingsModal from '../components/NodeSettingsModal';
import { AuthContext } from '../context/AuthContext';
import scanService from '../services/scanService';
import doctorService from '../services/doctorService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ProfileIncompleteBanner from '../components/ProfileIncompleteBanner';


const DoctorScanHistory = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
    const [filterRisk, setFilterRisk] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest');
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [selectedScan, setSelectedScan] = useState(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);


    useEffect(() => {
        fetchScans();
        fetchProfile();
        fetchNotificationsCount();

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

    const fetchProfile = async () => {
        try {
            const res = await doctorService.getProfile();
            setProfile(res.data);
            setIsProfileIncomplete(false);
        } catch (err) {
            console.error('Failed to fetch profile', err);
            setIsProfileIncomplete(true);
        }
    };

    const fetchScans = async () => {
        setLoading(true);
        try {
            const res = await scanService.getScans();
            setScans(res.data.map(scan => ({
                id: scan._id,
                patientId: scan.patient?.patientId || `DR-${scan._id.substring(0, 5)}`,
                patientName: scan.patient?.name || "Unknown Patient",
                patientAge: scan.patient?.age || "N/A",
                date: new Date(scan.createdAt).toLocaleDateString(),
                time: new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                risk: scan.aiResult || "Pending",
                status: scan.status,
                type: scan.eyeSide === 'OD' ? 'Right Eye' : 'Left Eye',
                imageUrl: scan.imageUrl,
                lesionCount: scan.lesionCount,
                insights: scan.insights,
                notes: scan.clinicalNotes,
                aiReportSummary: scan.aiReportSummary,
                diagnosisCenter: scan.diagnosisCenter?.name || "Self-Uploaded",
                technician: scan.technician || "Direct",
                doctorName: scan.referredDoctor?.name
            })));
        } catch (err) {
            console.error('Failed to fetch scans', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeClick = async (scan) => {
        if (scan.status === 'Analyzed') {
            setSelectedScan(scan);
            setIsAnalysisModalOpen(true);
            return;
        }

        // If Pending, trigger analysis
        try {
            const res = await scanService.analyzeScan(scan.id);
            if (res.success) {
                // Refresh data and open modal
                await fetchScans();
                // We need the updated scan object from the list
                const updatedScansRes = await scanService.getScans();
                const updatedScan = updatedScansRes.data.find(s => s._id === scan.id);
                if (updatedScan) {
                    setSelectedScan({
                        id: updatedScan._id,
                        patientId: updatedScan.patient?.patientId || `DR-${updatedScan._id.substring(0, 5)}`,
                        patientName: updatedScan.patient?.name || "Unknown Patient",
                        patientAge: updatedScan.patient?.age || "N/A",
                        date: new Date(updatedScan.createdAt).toLocaleDateString(),
                        time: new Date(updatedScan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        risk: updatedScan.aiResult,
                        status: updatedScan.status,
                        type: updatedScan.eyeSide === 'OD' ? 'Right Eye' : 'Left Eye',
                        imageUrl: updatedScan.imageUrl,
                        lesionCount: updatedScan.lesionCount,
                        insights: updatedScan.insights,
                        notes: updatedScan.clinicalNotes,
                        aiReportSummary: updatedScan.aiReportSummary,
                        doctorName: updatedScan.referredDoctor?.name
                    });
                    setIsAnalysisModalOpen(true);
                }
            }
        } catch (err) {
            console.error('Analysis failed', err);
            alert('Analysis failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleFinalizeAnalysis = async () => {
        if (!selectedScan) return;

        setIsUpdatingStatus(true);
        try {
            await scanService.updateScan(selectedScan.id, { status: 'Reviewed' });
            setIsAnalysisModalOpen(false);
            fetchScans();
        } catch (err) {
            console.error('Failed to update scan status', err);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const activeFilterCount = [filterRisk !== 'All', filterStatus !== 'All', filterType !== 'All'].filter(Boolean).length;

    const clearAllFilters = () => {
        setFilterRisk('All');
        setFilterStatus('All');
        setFilterType('All');
        setSortOrder('newest');
    };

    const filteredScans = scans
        .filter(scan => {
            const matchesSearch = scan.patientName.toLowerCase().includes(searchTerm.toLowerCase())
                || scan.patientId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRisk = filterRisk === 'All' || scan.risk === filterRisk;
            const matchesStatus = filterStatus === 'All' || scan.status === filterStatus;
            const matchesType = filterType === 'All' || scan.type === filterType;
            return matchesSearch && matchesRisk && matchesStatus && matchesType;
        })
        .sort((a, b) => {
            const dA = new Date(a.date), dB = new Date(b.date);
            return sortOrder === 'newest' ? dB - dA : dA - dB;
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-main flex items-center justify-center">
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

    return (
        <div className="min-h-screen bg-main font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-x-hidden">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-screen w-72 bg-sidebar border-r border-white/5 hidden lg:flex flex-col z-50">
                <div className="p-8 pb-12 flex items-center gap-3">
                    <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                        <Activity size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white italic uppercase leading-none">RetinaAI</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Clinical Portal</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-1 mt-6 custom-scrollbar">
                    <Link to="/doctor-dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
                        <LayoutDashboard size={16} />
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/doctor/scan-history" className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 transition-all">
                        <Activity size={16} strokeWidth={2.5} />
                        <span className="text-sm">Scan History</span>
                    </Link>
                    <Link to="/doctor-profile" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
                        <User size={16} />
                        <span className="text-sm">Profile</span>
                    </Link>
                    <div className="pt-8 mb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">System</div>
                    <button onClick={() => setIsAlertsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
                        <Bell size={16} />
                        <span className="text-sm">Notifications</span>
                        {unreadNotifications > 0 && (
                            <span className="ml-auto size-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-lg font-black shadow-lg shadow-rose-500/20">
                                {unreadNotifications > 99 ? '99+' : unreadNotifications.toString().padStart(2, '0')}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group text-left">
                        <Settings size={16} />
                        <span className="text-sm">Settings</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5">
                        <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm flex-shrink-0" style={{ backgroundImage: `url(${profile?.photo && profile.photo !== 'default-doctor.jpg' ? profile.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Doctor')}&background=059669&color=fff&bold=true`})` }}></div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-black truncate text-white">Dr. {user?.name || 'Provider'}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest text-left">Retina Specialist</p>
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
                <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <header className="sticky top-0 z-40 h-24 bg-white/70 backdrop-blur-xl border-b border-white flex items-center justify-between px-10">
                    <div className="flex flex-col">

                        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Patient <span className="text-primary not-italic">Center</span></h1>
                    </div>

                    <div className="flex items-center gap-4">

                    </div>
                </header>

                {isProfileIncomplete && <ProfileIncompleteBanner />}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-10 space-y-10 w-full max-w-[1500px] mx-auto flex-1 flex flex-col"
                >
                    {/* Filter Bar */}
                    <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-[500px] group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                className="w-full pl-16 pr-6 py-4 bg-slate-50/50 border-none rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all shadow-inner"
                                placeholder="Locate patient entry by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto px-2">
                            <div className="relative flex-1 md:flex-initial group">
                                <select
                                    className="w-full appearance-none bg-slate-50/50 border-none rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 pr-12 outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner cursor-pointer"
                                    value={filterRisk}
                                    onChange={(e) => setFilterRisk(e.target.value)}
                                >
                                    <option value="All">Global Population</option>
                                    <option value="High Risk">High Risk Only</option>
                                    <option value="Moderate">Moderate Spectrum</option>
                                    <option value="Low Risk">Healthy Retinas</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>

                            {/* Filter Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setFilterPanelOpen(prev => !prev)}
                                    className={`size-14 rounded-2xl transition-all flex items-center justify-center border shadow-inner relative ${filterPanelOpen || activeFilterCount > 0
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-slate-50 text-slate-400 hover:bg-primary/5 hover:text-primary border-slate-100'
                                        }`}
                                >
                                    <Filter size={20} />
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>

                                {/* Filter Dropdown Panel */}
                                <AnimatePresence>
                                    {filterPanelOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                            className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-5 space-y-5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Advanced Filters</p>
                                                {activeFilterCount > 0 && (
                                                    <button onClick={clearAllFilters} className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1 transition-colors">
                                                        <FilterX size={11} /> Clear all
                                                    </button>
                                                )}
                                            </div>

                                            {/* Status Filter */}
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scan Status</p>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {['All', 'Pending', 'Analyzed'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setFilterStatus(s)}
                                                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === s
                                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                        >{s === 'All' ? 'Any' : s}</button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Eye Side Filter */}
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scan Type</p>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {['All', 'Right Eye', 'Left Eye'].map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setFilterType(t)}
                                                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === t
                                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                        >{t === 'All' ? 'Both' : t}</button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Sort Order */}
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sort By Date</p>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {[{ val: 'newest', label: 'Newest First' }, { val: 'oldest', label: 'Oldest First' }].map(({ val, label }) => (
                                                        <button
                                                            key={val}
                                                            onClick={() => setSortOrder(val)}
                                                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortOrder === val
                                                                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                        >{label}</button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setFilterPanelOpen(false)}
                                                className="w-full h-10 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                            >
                                                Apply & Close
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.section>

                    {/* Table Section */}
                    <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden flex-1 flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-main/50">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Patient ID</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Patient Name</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Age</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Scan Date</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Source Portfolio</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence>
                                        {filteredScans.length > 0 ? filteredScans.map((scan) => (
                                            <motion.tr
                                                key={scan.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="hover:bg-primary/[0.02] transition-all cursor-pointer group/row"
                                            >
                                                <td className="px-10 py-8">
                                                    <p className="text-[11px] font-black text-slate-500 tracking-widest">{scan.patientId}</p>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center font-black text-[10px] text-primary">
                                                            {scan.patientName.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <p className="text-sm font-black text-slate-900">{scan.patientName}</p>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <p className="text-sm font-bold text-slate-600 italic">{scan.patientAge}</p>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <p className="text-sm font-black text-slate-700">{scan.date}</p>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex flex-col">
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{scan.diagnosisCenter}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Lab: {scan.technician}</p>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${scan.status === 'Pending' ? 'text-amber-500' : 'text-primary'}`}>
                                                        <div className={`size-2.5 rounded-full border-2 border-white shadow-sm ${scan.status === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-primary'}`} />
                                                        {scan.status}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {scan.status === 'Analyzed' ? (
                                                            <Link
                                                                to={`/report/${scan.id}`}
                                                                className="h-10 px-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                                                            >
                                                                View Report
                                                                <ArrowRight size={14} />
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAnalyzeClick(scan)}
                                                                className="h-10 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:-translate-y-1 shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                                                            >
                                                                Analyze
                                                                <ArrowUpRight size={14} strokeWidth={2.5} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="px-10 py-24 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 shadow-inner">
                                                            <Search size={32} />
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No diagnostic records synchronized</p>
                                                        <button onClick={() => setSearchTerm('')} className="text-[10px] font-black text-primary uppercase tracking-widest underline underline-offset-4">Reset Node Filter</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                        {filteredScans.length > 0 && (
                            <div className="p-10 bg-main/50 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredScans.length} of {scans.length} patient records</p>
                                <div className="flex gap-2">
                                    <button className="size-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-xs font-black hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">1</button>
                                    <button className="size-10 rounded-xl bg-white border border-slate-100 text-slate-300 flex items-center justify-center text-xs font-black hover:bg-slate-50 transition-all">2</button>
                                </div>
                            </div>
                        )}
                    </motion.section>


                </motion.div>


                {/* Analysis Modal */}
                <AnimatePresence>
                    {isAnalysisModalOpen && selectedScan && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAnalysisModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                            >
                                {/* Image Section */}
                                <div className="md:w-1/2 bg-slate-950 flex items-center justify-center p-4 relative min-h-[300px]">
                                    <img
                                        src={selectedScan.imageUrl || "https://images.unsplash.com/photo-1579154235602-3c22bd4b5683?w=800&auto=format"}
                                        alt="Retinal Fundus"
                                        className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/5"
                                    />
                                    <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedScan.type}</span>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="md:w-1/2 p-10 flex flex-col overflow-y-auto">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Scan <span className="text-primary not-italic">Analysis</span></h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Diagnostic results sync: {selectedScan.date}</p>
                                        </div>
                                        <button onClick={() => setIsAnalysisModalOpen(false)} className="size-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center font-bold">✕</button>
                                    </div>

                                    <div className="space-y-8 flex-1">
                                        {/* Patient Info */}
                                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-primary border border-slate-100 italic text-sm">
                                                    {selectedScan.patientName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Entity</p>
                                                    <h4 className="text-lg font-black text-slate-900 leading-none">{selectedScan.patientName}</h4>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Results Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <Activity className="text-slate-50" size={40} />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">AI Scoring</p>
                                                <h5 className={`text-xl font-black italic relative z-10 ${selectedScan.risk === 'High Risk' ? 'text-rose-500' :
                                                    selectedScan.risk === 'Moderate' ? 'text-amber-500' : 'text-primary'
                                                    }`}>{selectedScan.risk}</h5>
                                            </div>

                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <Shield className="text-slate-50" size={40} />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Physician</p>
                                                <h5 className="text-xl font-black text-slate-900 relative z-10">Dr. {selectedScan.doctorName || "Review Pending"}</h5>
                                            </div>
                                        </div>

                                        {/* Clinical Summary */}
                                        {selectedScan.aiReportSummary && (
                                            <div className="space-y-3 pt-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-primary">Clinical Summary (Generative AI)</p>
                                                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-inner italic text-xs font-bold text-slate-600 leading-relaxed">
                                                    {selectedScan.aiReportSummary}
                                                </div>
                                            </div>
                                        )}

                                        {/* Insights */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Clinical Insights</p>
                                            <div className="space-y-3">
                                                {selectedScan.insights?.map((insight, idx) => (
                                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                        <div className={`size-2 rounded-full mt-1.5 shrink-0 ${insight.type === 'high_risk' ? 'bg-rose-500' : 'bg-primary'}`} />
                                                        <p className="text-xs font-bold text-slate-600 leading-relaxed">{insight.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Clinical Notes */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Physician Observations</p>
                                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl italic text-xs font-bold text-slate-500 leading-relaxed">
                                                {selectedScan.notes || "No additional observations noted for this diagnostic unit."}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <button
                                            onClick={() => setIsAnalysisModalOpen(false)}
                                            className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                        >
                                            Close Portal
                                        </button>
                                        <button
                                            onClick={handleFinalizeAnalysis}
                                            disabled={isUpdatingStatus || selectedScan.status === 'Reviewed'}
                                            className="flex-[2] h-14 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUpdatingStatus ? (
                                                <div className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                                            ) : (
                                                <>
                                                    {selectedScan.status === 'Reviewed' ? 'Analysis Certified' : 'Complete Analysis'}
                                                    <CheckCircle size={16} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* Footer */}
                <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        © 2024 RetinaAI Clinical Systems / Data Repository / Unit-{user?.id?.substring(0, 8) || "882B-7"}
                    </p>
                </footer>
            </main>

            {/* System Modals */}
            <CentralAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
            <NodeSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default DoctorScanHistory;
