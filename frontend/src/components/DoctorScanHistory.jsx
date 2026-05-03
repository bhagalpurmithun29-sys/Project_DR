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
    CheckCircle,
    Target,
    AlertCircle
} from 'lucide-react';
import CentralAlertsModal from '../components/CentralAlertsModal';
import NodeSettingsModal from '../components/NodeSettingsModal';
import { AuthContext } from '../context/AuthContext';
import scanService from '../services/scanService';
import doctorService from '../services/doctorService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { normalizeUrl } from '../services/api';
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
    const [siblingScan, setSiblingScan] = useState(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
    const [doctorPrescription, setDoctorPrescription] = useState('');
    const [sendingToPatient, setSendingToPatient] = useState(false);


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
            if (res.data) {
                setProfile(res.data);
                setIsProfileIncomplete(false);
            } else {
                setProfile(null);
                setIsProfileIncomplete(true);
            }
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
                createdAt: scan.createdAt,
                risk: scan.aiResult || "Pending",
                status: scan.status,
                type: scan.eyeSide === 'OD' ? 'Right Eye' : 'Left Eye',
                imageUrl: scan.imageUrl,
                lesionCount: scan.lesionCount,
                aiConfidence: scan.aiConfidence,
                insights: scan.insights,
                notes: scan.clinicalNotes,
                aiReportSummary: scan.aiReportSummary,
                diagnosisCenter: scan.diagnosisCenter?.name || "Self-Uploaded",
                technician: scan.technician || "Direct",
                doctorName: scan.referredDoctor?.name,
                prescription: scan.doctorPrescription,
                sentToPatient: scan.sentToPatient
            })));
        } catch (err) {
            console.error('Failed to fetch scans', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeClick = async (group) => {
        const { mainScan, siblingScan: sib } = group;
        if (mainScan.status === 'Analyzed' || mainScan.status === 'Reviewed') {
            setSelectedScan(mainScan);
            setSiblingScan(sib);
            setDoctorPrescription(mainScan.prescription || '');
            setIsAnalysisModalOpen(true);
            return;
        }

        // If Pending, trigger analysis
        try {
            const res = await scanService.analyzeScan(mainScan.id);
            if (sib && sib.status === 'Pending') {
                await scanService.analyzeScan(sib.id);
            }
            if (res.success) {
                // Refresh data and open modal
                await fetchScans();
                // We need the updated scan object from the list
                const updatedScansRes = await scanService.getScans();
                const updatedScan = updatedScansRes.data.find(s => s._id === mainScan.id);
                const updatedSib = sib ? updatedScansRes.data.find(s => s._id === sib.id) : null;
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
                        aiConfidence: updatedScan.aiConfidence,
                        insights: updatedScan.insights,
                        notes: updatedScan.clinicalNotes,
                        aiReportSummary: updatedScan.aiReportSummary,
                        doctorName: updatedScan.referredDoctor?.name,
                        prescription: updatedScan.doctorPrescription,
                        sentToPatient: updatedScan.sentToPatient
                    });
                    if (updatedSib) {
                        setSiblingScan({
                            id: updatedSib._id,
                            patientId: updatedSib.patient?.patientId || `DR-${updatedSib._id.substring(0, 5)}`,
                            patientName: updatedSib.patient?.name || "Unknown Patient",
                            patientAge: updatedSib.patient?.age || "N/A",
                            date: new Date(updatedSib.createdAt).toLocaleDateString(),
                            time: new Date(updatedSib.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            createdAt: updatedSib.createdAt,
                            risk: updatedSib.aiResult,
                            status: updatedSib.status,
                            type: updatedSib.eyeSide === 'OD' ? 'Right Eye' : 'Left Eye',
                            imageUrl: updatedSib.imageUrl,
                            lesionCount: updatedSib.lesionCount,
                            aiConfidence: updatedSib.aiConfidence,
                            insights: updatedSib.insights,
                            notes: updatedSib.clinicalNotes,
                            aiReportSummary: updatedSib.aiReportSummary,
                            doctorName: updatedSib.referredDoctor?.name,
                            prescription: updatedSib.doctorPrescription,
                            sentToPatient: updatedSib.sentToPatient
                        });
                    } else {
                        setSiblingScan(null);
                    }
                    setDoctorPrescription(updatedScan.doctorPrescription || '');
                    setIsAnalysisModalOpen(true);
                }
            }
        } catch (err) {
            console.error('Analysis failed', err);
            alert('Analysis failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleFinalizeAnalysis = async (send = false) => {
        if (!selectedScan) return;

        if (send) setSendingToPatient(true);
        else setIsUpdatingStatus(true);

        try {
            const updateData = { 
                status: 'Reviewed',
                doctorPrescription: doctorPrescription
            };
            
            if (send) {
                updateData.sentToPatient = true;
            }

            await scanService.updateScan(selectedScan.id, updateData);
            if (siblingScan) {
                await scanService.updateScan(siblingScan.id, updateData);
            }
            setIsAnalysisModalOpen(false);
            fetchScans();
            if (send) alert('Report and prescription have been securely sent to the patient.');
        } catch (err) {
            console.error('Failed to update scan status', err);
            alert('Failed to update: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsUpdatingStatus(false);
            setSendingToPatient(false);
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
            const dA = new Date(a.createdAt || a.date), dB = new Date(b.createdAt || b.date);
            return sortOrder === 'newest' ? dB - dA : dA - dB;
        });

    const groupedScans = [];
    const seen = new Set();
    filteredScans.forEach(s => {
        if (seen.has(s.id)) return;
        const sibling = filteredScans.find(sib =>
            sib.id !== s.id &&
            sib.patientId === s.patientId &&
            sib.type !== s.type &&
            Math.abs(new Date(sib.createdAt || sib.date) - new Date(s.createdAt || s.date)) < 5 * 60 * 1000
        );
        if (sibling) {
            groupedScans.push({
                id: s.id,
                groupType: 'Bilateral',
                mainScan: s.type === 'Right Eye' ? s : sibling,
                siblingScan: s.type === 'Right Eye' ? sibling : s,
            });
            seen.add(s.id);
            seen.add(sibling.id);
        } else {
            groupedScans.push({
                id: s.id,
                groupType: 'Single',
                mainScan: s,
                siblingScan: null
            });
            seen.add(s.id);
        }
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
                    <div className="size-11 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
                        <Activity size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white italic uppercase leading-none">RetinaAI</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-primary">Clinical Portal</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
                    <Link to="/doctor-dashboard" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
                        <LayoutDashboard size={18} />
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/doctor/scan-history" className="flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/25 transition-all">
                        <Activity size={18} strokeWidth={2.5} />
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
                    <div className="pt-8 mb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">System</div>
                    <button onClick={() => setIsAlertsOpen(true)} className="w-full flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group text-left">
                        <Bell size={18} />
                        <span className="text-sm">Notifications</span>
                        {unreadNotifications > 0 && (
                            <span className="ml-auto size-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-lg font-black shadow-lg shadow-rose-500/20">
                                {unreadNotifications > 99 ? '99+' : unreadNotifications.toString().padStart(2, '0')}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group text-left">
                        <Settings size={18} />
                        <span className="text-sm">Settings</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5">
                        <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm flex-shrink-0" style={{ backgroundImage: `url(${normalizeUrl(profile?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Doctor')}&background=059669&color=fff&bold=true`})` }}></div>
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
                                id="doctor-scan-history-search"
                                name="doctor_scan_history_search"
                                className="w-full pl-16 pr-6 py-4 bg-slate-50/50 border-none rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all shadow-inner"
                                placeholder="Locate patient entry by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto px-2">
                            <div className="relative flex-1 md:flex-initial group">
                                <select
                                    id="doctor-scan-history-risk-filter"
                                    name="doctor_scan_history_risk_filter"
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
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Scan Type</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Scan Date</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Source Portfolio</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence>
                                        {groupedScans.length > 0 ? groupedScans.map((group) => {
                                            const { mainScan: scan, groupType } = group;
                                            return (
                                            <motion.tr
                                                key={group.id}
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
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${groupType === 'Bilateral' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {groupType}
                                                        </span>
                                                        {groupType === 'Single' && (
                                                            <span className="text-[10px] font-bold text-slate-400">{scan.type === 'Right Eye' ? 'OD' : 'OS'}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <p className="text-sm font-black text-slate-700">{scan.date}</p>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex flex-col">
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{scan.diagnosisCenter}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic capitalize">Lab: {scan.technician}</p>
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
                                                        {scan.status === 'Pending' ? (
                                                            <button
                                                                onClick={() => handleAnalyzeClick(group)}
                                                                className="h-10 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:-translate-y-1 shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                                                            >
                                                                Analyze
                                                                <ArrowUpRight size={14} strokeWidth={2.5} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAnalyzeClick(group)}
                                                                className={`h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${
                                                                    scan.status === 'Reviewed' 
                                                                    ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                                                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10'
                                                                }`}
                                                            >
                                                                {scan.status === 'Reviewed' ? 'View Review' : 'Review & Prescribe'}
                                                                <ArrowRight size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )}) : (
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
                                <div className="md:w-1/2 bg-slate-950 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative border-r border-slate-800">
                                    {[selectedScan, siblingScan]
                                        .filter(Boolean)
                                        .sort((left, right) => {
                                            if (left.type === right.type) return 0;
                                            return left.type === 'Right Eye' ? -1 : 1;
                                        })
                                        .map((scan) => (
                                        <div key={scan.id || `${scan.type}-${scan.createdAt || scan.date}`} className="w-full flex flex-col gap-3">
                                            <div className="flex items-center">
                                                <span className="px-3 py-1.5 bg-white/10 rounded-xl border border-white/20 text-[9px] font-black text-white uppercase tracking-widest backdrop-blur-md">
                                                    {scan.type}
                                                </span>
                                            </div>
                                            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                                                <img
                                                    src={normalizeUrl(scan.imageUrl) || "https://images.unsplash.com/photo-1579154235602-3c22bd4b5683?w=800&auto=format"}
                                                    alt={scan.type}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Info Section */}
                                <div className="md:w-1/2 p-10 flex flex-col overflow-y-auto custom-scrollbar">
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
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <Activity className="text-slate-50" size={40} />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">AI Scoring</p>
                                                <div className="space-y-2 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        {siblingScan && <span className="text-[10px] font-black text-slate-300 w-6">OD:</span>}
                                                        <h5 className={`text-base font-black italic ${selectedScan.risk === 'High Risk' ? 'text-rose-500' :
                                                            selectedScan.risk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                                                            }`}>{selectedScan.risk}</h5>
                                                    </div>
                                                    {siblingScan && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-slate-300 w-6">OS:</span>
                                                            <h5 className={`text-base font-black italic ${siblingScan.risk === 'High Risk' ? 'text-rose-500' :
                                                                siblingScan.risk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                                                                }`}>{siblingScan.risk}</h5>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <Target className="text-slate-50" size={40} />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">AI Confidence</p>
                                                <div className="space-y-2 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        {siblingScan && <span className="text-[10px] font-black text-slate-300 w-6">OD:</span>}
                                                        <h5 className="text-base font-black text-slate-900">{selectedScan.aiConfidence ? `${(selectedScan.aiConfidence * 100).toFixed(1)}%` : '—'}</h5>
                                                    </div>
                                                    {siblingScan && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-slate-300 w-6">OS:</span>
                                                            <h5 className="text-base font-black text-slate-900">{siblingScan.aiConfidence ? `${(siblingScan.aiConfidence * 100).toFixed(1)}%` : '—'}</h5>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <AlertCircle className="text-slate-50" size={40} />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Lesions Detected</p>
                                                <div className="space-y-2 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        {siblingScan && <span className="text-[10px] font-black text-slate-300 w-6">OD:</span>}
                                                        <h5 className="text-base font-black text-slate-900">{selectedScan.lesionCount ?? '—'}</h5>
                                                    </div>
                                                    {siblingScan && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-slate-300 w-6">OS:</span>
                                                            <h5 className="text-base font-black text-slate-900">{siblingScan.lesionCount ?? '—'}</h5>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <User className="text-slate-50" size={40} />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Technician</p>
                                                <h5 className="text-lg font-black text-slate-900 relative z-10 capitalize">{selectedScan.technician || "Unknown"}</h5>
                                            </div>

                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <Shield className="text-slate-50" size={40} />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Physician</p>
                                                <h5 className="text-lg font-black text-slate-900 relative z-10 leading-tight">Dr. {selectedScan.doctorName || "Review Pending"}</h5>
                                            </div>
                                        </div>

                                        {/* Clinical Summary */}
                                        {(selectedScan.aiReportSummary || (siblingScan && siblingScan.aiReportSummary)) && (
                                            <div className="space-y-3 pt-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-primary">Clinical Summary (Generative AI)</p>
                                                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-inner italic text-xs font-bold text-slate-600 leading-relaxed space-y-4">
                                                    <div>
                                                        {siblingScan && <span className="font-black text-[10px] text-slate-400 uppercase block mb-1">Right Eye (OD)</span>}
                                                        {selectedScan.aiReportSummary}
                                                    </div>
                                                    {siblingScan && siblingScan.aiReportSummary && (
                                                        <div className="pt-4 border-t border-slate-100">
                                                            <span className="font-black text-[10px] text-slate-400 uppercase block mb-1">Left Eye (OS)</span>
                                                            {siblingScan.aiReportSummary}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Prescription Section */}
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center justify-between ml-2">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Medical Prescription / Advice</p>
                                                {selectedScan.sentToPatient && (
                                                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                        <CheckCircle size={10} /> Sent to Patient
                                                    </span>
                                                )}
                                            </div>
                                            <textarea
                                                id="doctor-prescription"
                                                name="doctor_prescription"
                                                value={doctorPrescription}
                                                onChange={(e) => setDoctorPrescription(e.target.value)}
                                                placeholder="Write medications, lifestyle advice, or follow-up instructions here..."
                                                className="w-full p-6 bg-indigo-50/30 border-2 border-indigo-100 rounded-3xl italic text-xs font-bold text-slate-700 leading-relaxed outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 transition-all min-h-[120px] resize-none shadow-inner placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col gap-3">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setIsAnalysisModalOpen(false)}
                                                className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                            >
                                                Close
                                            </button>
                                            <button
                                                onClick={() => handleFinalizeAnalysis(false)}
                                                disabled={isUpdatingStatus || sendingToPatient}
                                                className="flex-1 h-14 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {isUpdatingStatus ? <div className="size-4 border-2 border-slate-900/30 border-t-slate-900 animate-spin rounded-full" /> : 'Save Draft'}
                                            </button>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleFinalizeAnalysis(true)}
                                            disabled={isUpdatingStatus || sendingToPatient || !doctorPrescription.trim()}
                                            className="w-full h-14 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sendingToPatient ? (
                                                <div className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                                            ) : (
                                                <>
                                                    {selectedScan.sentToPatient ? 'Update & Re-send to Patient' : 'Finalize & Send to Patient'}
                                                    <ArrowRight size={16} />
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
