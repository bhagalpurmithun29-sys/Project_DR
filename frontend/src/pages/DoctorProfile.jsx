import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import doctorService from '../services/doctorService';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { normalizeUrl } from '../services/api';
import {
    Camera, Loader2, LogOut, Activity, LayoutDashboard, User,
    Bell, Settings, Edit3, Shield, Star, Award, MapPin, Calendar,
    Users, Phone, Mail, Link as LinkIcon, AlertCircle, Zap, TrendingUp, Microscope
} from 'lucide-react';
import CentralAlertsModal from '../components/CentralAlertsModal';
import NodeSettingsModal from '../components/NodeSettingsModal';
import ProfileIncompleteBanner from '../components/ProfileIncompleteBanner';


const DoctorProfile = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [copyStatus, setCopyStatus] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const fileInputRef = useRef(null);

    const fetchNotificationsCount = async () => {
        try {
            const res = await api.get('/notifications');
            const unread = (res.data.data || []).filter(n => !n.isRead).length;
            setUnreadNotifications(unread);
        } catch (err) {
            console.error('Failed to fetch notifications count:', err);
        }
    };

    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        fetchNotificationsCount();

        const interval = setInterval(() => {
            fetchNotificationsCount();
        }, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await doctorService.uploadProfilePhoto(formData);
            if (res.success) {
                setProfile(res.data);
            }
        } catch (err) {
            console.error('Failed to upload photo', err);
            alert('Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCall = () => {
        if (profile?.phoneNumber) {
            window.location.href = `tel:${profile.phoneNumber}`;
        } else {
            alert('Phone number not available');
        }
    };

    const handleMail = () => {
        if (profile?.email) {
            window.location.href = `mailto:${profile.email}`;
        } else {
            alert('Email address not available');
        }
    };

    const handleCopy = () => {
        const textToCopy = `${profile?.email || user?.email} | ${profile?.phoneNumber || 'N/A'}`;
        navigator.clipboard.writeText(textToCopy);
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus(null), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-main">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
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
            {/* Sidebar (Matches DoctorDashboard) */}
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
                    <Link to="/doctor/scan-history" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
                        <Activity size={18} />
                        <span className="text-sm">Scan History</span>
                    </Link>
                    <Link to="/doctor/appointments" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
                        <Calendar size={18} />
                        <span className="text-sm">Appointments</span>
                    </Link>
                    <Link to="/doctor-profile" className="flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/25 transition-all">
                        <User size={18} strokeWidth={2.5} />
                        <span className="text-sm">Profile</span>
                    </Link>
                    <div className="pt-8 mb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">System</div>
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
                        <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm" style={{ backgroundImage: `url(${normalizeUrl(profile?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Doctor')}&background=059669&color=fff&bold=true`})` }}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-white">Dr. {user?.name || "Provider"}</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">Retina Specialist</p>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                        <LogOut size={16} strokeWidth={2.5} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 flex flex-col relative z-10 lg:ml-72">
                {/* Header Ambient Glow */}
                <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />

                {/* Topbar */}
                <header className="sticky top-0 z-[60] h-24 bg-white/70 backdrop-blur-xl border-b border-white flex items-center justify-between px-10">
                    <div className="flex flex-col">

                        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Doctor <span className="text-primary not-italic">Dashboard </span></h1>
                    </div>

                    <div className="flex items-center gap-4">

                        <Link to="/doctor-registration" className="h-12 px-6 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 flex items-center gap-2 transition-all">
                            <Edit3 size={16} />
                            MODIFY PROFILE
                        </Link>
                    </div>
                </header>

                {isProfileIncomplete && <ProfileIncompleteBanner />}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-10 mx-auto w-full max-w-[1500px] flex flex-col xl:flex-row gap-8"
                >
                    {/* Left Column (Main Info) */}
                    <div className="flex-1 flex flex-col gap-8">

                        {/* Hero Profile Card */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 pt-10 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                                {/* Avatar Section */}
                                <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="size-40 rounded-[2rem] bg-slate-100 p-1.5 shadow-xl shadow-slate-200/50">
                                        <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                                            <img
                                                src={normalizeUrl(profile?.photo) || `https://ui-avatars.com/api/?name=${user?.name}&background=059669&color=fff&size=400&bold=true`}
                                                alt="Dr. Avatar"
                                                className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                                                {isUploading ? <Loader2 className="animate-spin text-white" size={32} /> : <Camera className="text-white" size={32} />}
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                                    <div className="absolute -bottom-3 -right-3 size-10 rounded-xl bg-primary text-white flex items-center justify-center border-4 border-white shadow-sm">
                                        <Shield size={18} className="fill-current" />
                                    </div>
                                </div>

                                {/* Identity Data */}
                                <div className="flex-1 text-center md:text-left pt-2">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20 flex items-center gap-1.5">
                                            <Activity size={12} /> {profile?.specialization === 'retina' ? 'Retina Specialist' : (profile?.specialization || 'Retina Specialist')}
                                        </span>
                                    </div>



                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                        {user?.name || "Dr. Identity Unknown"}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium mb-8 max-w-xl">
                                        Board-certified Retina Specialist specializing in advanced diabetic retinopathy grading, macular degeneration intervention, and AI-assisted clinical diagnoses.
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { icon: Shield, label: "Medical License", value: profile?.licenseNumber || "Pending" },
                                            { icon: MapPin, label: "Jurisdiction", value: profile?.country || "N/A" },
                                            { icon: Calendar, label: "Experience", value: profile?.experience || "0-5 yrs" },
                                            { icon: Users, label: "Total Patients", value: "320+" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5 mb-1">
                                                    <item.icon size={10} /> {item.label}
                                                </div>
                                                <div className="text-sm font-bold text-slate-900 uppercase truncate">
                                                    {item.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* KPI Stats Row */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Activity, color: "text-primary", bg: "bg-primary/10", label: "Total DR Cases", val: "320", trend: "+12% this month", up: true },
                                { icon: Zap, color: "text-teal-500", bg: "bg-teal-50", label: "Treatment Success", val: "94%", trend: "+3% vs last qtr", up: true },
                                { icon: Microscope, color: "text-forest-charcoal", bg: "bg-slate-50", label: "Avg Response Time", val: "48h", trend: "-6h improvement", up: true },
                                { icon: Award, color: "text-amber-500", bg: "bg-amber-50", label: "Degrees Sync", val: profile?.degrees?.length || "2", trend: "Synchronized", up: true }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/20 hover:-translate-y-1 transition-transform group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                            <stat.icon size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${stat.up ? 'bg-primary/10 text-primary' : 'bg-rose-50 text-rose-600'} flex items-center gap-1`}>
                                            <TrendingUp size={10} /> {stat.trend}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{stat.val}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>

                        {/* DR Grading Panel */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Diabetic Retinopathy Distribution</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Grading Hub</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap hidden sm:block">
                                    Last 30 Days
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { name: "Mild NPDR", count: 86, pct: "26.9%", color: "bg-primary" },
                                    { name: "Moderate NPDR", count: 112, pct: "35%", color: "bg-amber-400" },
                                    { name: "Severe NPDR", count: 74, pct: "23.1%", color: "bg-orange-500" },
                                    { name: "PDR", count: 48, pct: "15%", color: "bg-rose-500" },
                                ].map((grade, i) => (
                                    <div key={i} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`size-3 rounded-full ${grade.color} shadow-sm`} />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{grade.name}</span>
                                            </div>
                                        </div>
                                        <div className="text-4xl font-black text-slate-900 mb-1">{grade.count}</div>
                                        <div className="text-[10px] font-bold text-slate-400 mb-4">{grade.pct} of cases</div>
                                        <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-full ${grade.color}`} style={{ width: grade.pct }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>


                    </div>

                    {/* Right Column (Widget Sidebar) */}
                    <motion.div variants={itemVariants} className="w-full xl:w-[360px] flex-shrink-0 flex flex-col gap-8">

                        {/* Identity Meta */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 text-slate-900 relative overflow-hidden group">
                            <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
                                <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <Shield size={16} className="text-primary" />
                                </div>
                                Identity Meta
                            </h4>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 mt-1">
                                        <Mail size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Authenticated Endpoint</p>
                                        <p className="text-sm font-bold text-slate-900 break-all">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 mt-1">
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Member Inception</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 mt-1">
                                        <MapPin size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Local Node</p>
                                        <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Facility Cluster: {profile?._id?.substring(0, 6).toUpperCase() || "69AD4D"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">EZEE Active</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">v2.4.1-STABLE</span>
                            </div>
                        </div>

                        {/* Academic Foundations */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                    <Award size={24} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Academic Foundations</h3>
                            </div>
                            <div className="space-y-4">
                                {profile?.degrees?.length > 0 ? profile.degrees.map((deg, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 leading-tight">{deg.title}</h4>
                                            <p className="text-[11px] font-bold text-slate-500 mt-1">{deg.institution}</p>
                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-2">{deg.year || 'Valid'}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-loose">No academic data synchronized</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>



                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors group">
                            <div className="size-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                                <Phone size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-slate-900">Clinical Support</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">24/7 Priority Emergency</p>
                            </div>
                            <div className="size-8 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white text-slate-300 flex items-center justify-center transition-all">
                                <LinkIcon size={14} />
                            </div>
                        </div>

                       
                    </motion.div>
                </motion.div>

                <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/80 backdrop-blur-md">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        © 2024 RetinaAI Clinical Systems / v2.4.1-stable / Node {user?.id?.substring(0, 8) || "882B-7"}
                    </p>
                </footer>
            </main>

            {/* System Modals */}
            <CentralAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
            <NodeSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default DoctorProfile;
