import React, { useState, useEffect, useContext } from 'react';
import {
    Eye,
    User,
    LogOut,
    LayoutDashboard,
    Briefcase,
    GraduationCap,
    Phone,
    Mail,
    MapPin,
    Activity,
    Search,
    ChevronRight,
    Bell,
    Settings,
    Edit3,
    FileText,
    ShieldCheck,
    Award,
    Calendar,
    ArrowUpRight,
    MoreHorizontal,
    Globe
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import doctorService from '../services/doctorService';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorProfile = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await doctorService.getProfile();
                setProfile(res.data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
                setError('Profile not found. Please complete your registration.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
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

    if (error && !profile) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-100 p-12 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
                    <div className="size-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-amber-100">
                        <Briefcase className="text-amber-500" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Profile Incomplete</h2>
                    <p className="text-slate-500 mb-10 font-medium leading-relaxed">{error}</p>
                    <Link
                        to="/doctor-registration"
                        className="block w-full py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all uppercase text-xs tracking-widest"
                    >
                        Initialize Professional ID
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="mt-8 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <LogOut size={14} /> Close Session
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-x-hidden">
            {/* Sidebar */}
            <aside className="sticky top-0 h-screen w-72 bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 hidden lg:flex flex-col z-50">
                <div className="p-8 pb-12 flex items-center gap-3">
                    <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Activity size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 italic uppercase leading-none">RetinaAI</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Clinical Portal</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5">
                    <Link to="/doctor-dashboard" className="flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <LayoutDashboard size={18} />
                        <span className="text-sm">Workspace</span>
                    </Link>
                    <Link to="/doctor/scan-history" className="flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <Activity size={18} />
                        <span className="text-sm">Patient Archive</span>
                    </Link>
                    <Link to="/doctor-profile" className="flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/25 transition-all">
                        <User size={18} strokeWidth={2.5} />
                        <span className="text-sm">Clinical Profile</span>
                    </Link>
                    <div className="pt-8 mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Settings</div>
                    <button className="w-full flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <Bell size={18} />
                        <span className="text-sm">Alerts</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <Settings size={18} />
                        <span className="text-sm">Node Configuration</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                        <LogOut size={16} strokeWidth={2.5} />
                        End Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col relative z-10">
                <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <header className="sticky top-0 z-40 h-24 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-10">
                    <div className="flex flex-col">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Clinic Hub / <span className="text-primary">Identity</span></h2>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Professional <span className="text-primary not-italic">Dossier</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/doctor-registration" className="h-12 px-6 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 group transition-all">
                            <Edit3 size={16} />
                            Modify Credentials
                        </Link>
                    </div>
                </header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-10 space-y-10 w-full max-w-[1400px] mx-auto"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Summary Column */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Main Identity Card */}
                            <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                                    <div className="size-40 rounded-[2.5rem] bg-slate-50 border-8 border-white shadow-2xl flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=137fec&color=fff&size=400&bold=true`}
                                            alt="Professional Portrait"
                                            className="size-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 space-y-6 pt-2">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{user?.name}</h2>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">{profile?.specialization || 'General'} Specialist</span>
                                                    <div className="size-1 rounded-full bg-slate-300" />
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-lg text-green-600 border border-green-100 italic">
                                                        <ShieldCheck size={12} strokeWidth={3} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">E2E Verified</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm">
                                                        <Award size={14} className="text-slate-400" />
                                                    </div>
                                                ))}
                                                <div className="size-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center shadow-sm text-[8px] font-black">+12</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-4 border-t border-slate-50">
                                            {[
                                                { icon: Briefcase, label: "Medical License", val: profile?.licenseNumber || "N/A" },
                                                { icon: Globe, label: "Jurisdiction", val: (profile?.country === 'us' ? 'United States' : profile?.country === 'uk' ? 'United Kingdom' : profile?.country) || "Pending" },
                                                { icon: Activity, label: "Experience", val: profile?.experience || "0-5 Yrs" }
                                            ].map((item, i) => (
                                                <div key={i} className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <item.icon size={13} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                                    </div>
                                                    <p className="text-sm font-black text-slate-900 uppercase italic">{item.val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Academic Background */}
                            <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <GraduationCap size={22} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Academic Foundations</h3>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Credential Hub</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profile?.degrees?.length > 0 ? profile.degrees.map((deg, index) => (
                                        <div key={index} className="p-6 rounded-[2rem] bg-[#f8fafc] border border-slate-50 group hover:bg-primary hover:border-primary transition-all duration-500 cursor-default">
                                            <div className="flex items-start gap-5">
                                                <div className="size-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <FileText size={22} />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-black text-slate-900 group-hover:text-white transition-colors tracking-tight">{deg.title}</h4>
                                                    <p className="text-xs font-bold text-slate-400 group-hover:text-white/60 transition-colors mt-1">{deg.institution}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 py-12 flex flex-col items-center gap-4 text-slate-300 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                            <FileText size={40} strokeWidth={1} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No academic data synchronized</p>
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        </div>

                        {/* Metadata Column */}
                        <div className="lg:col-span-4 space-y-10">
                            {/* Security Meta */}
                            <motion.section variants={itemVariants} className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-x-12 translate-y-12" />
                                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white/40 mb-10 flex items-center gap-3">
                                    <ShieldCheck size={16} className="text-primary" />
                                    Identity Meta
                                </h3>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="size-11 bg-white/5 rounded-xl flex items-center justify-center text-white/30 border border-white/5">
                                            <Mail size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Authenticated Endpoint</p>
                                            <p className="text-sm font-black truncate text-white/80 italic">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="size-11 bg-white/5 rounded-xl flex items-center justify-center text-white/30 border border-white/5">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Member Inception</p>
                                            <p className="text-sm font-black truncate text-white/80 italic">{new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="size-11 bg-white/5 rounded-xl flex items-center justify-center text-white/30 border border-white/5">
                                            <MapPin size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Local Node</p>
                                            <p className="text-sm font-black truncate text-white/80 italic">Facility Cluster: {profile?._id?.substring(0, 6).toUpperCase() || "CORE-01"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
                                    <span>E2EE Active</span>
                                    <span>v2.4.1-STABLE</span>
                                </div>
                            </motion.section>

                            {/* Contact Support Widget */}
                            <motion.button
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="w-full p-8 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-between group shadow-xl shadow-slate-200/20"
                            >
                                <div className="flex items-center gap-5 text-left">
                                    <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Phone size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">Clinical Support</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">24/7 Priority Emergency</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="text-slate-200 group-hover:text-primary transition-all" size={24} />
                            </motion.button>

                            {/* Verification Badge */}
                            <div className="p-8 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100 flex items-center justify-center gap-3">
                                <ShieldCheck className="text-indigo-600" size={24} strokeWidth={2.5} />
                                <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">Medical Integrity Verified</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        © 2024 RetinaAI Clinical Systems / Professional Identity Instance / Node-{user?.id?.substring(0, 8) || "882B-7"}
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default DoctorProfile;
