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
    Zap, PlusCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import doctorService from '../services/doctorService';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await doctorService.getProfile();
                setProfile(res.data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
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

    const KPI_CARDS = [
        {
            icon: Users,
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
            label: "Patient Base",
            value: "1,284",
            trend: "+4.2%",
            trendUp: true,
        },
        {
            icon: Microscope,
            iconBg: "bg-indigo-500/10",
            iconColor: "text-indigo-500",
            label: "Scans (24h)",
            value: "42",
            trend: "+12.8%",
            trendUp: true,
        },
        {
            icon: AlertTriangle,
            iconBg: "bg-rose-500/10",
            iconColor: "text-rose-500",
            label: "Emergent Cases",
            value: "07",
            trend: "+2 new",
            trendUp: false,
            valueColor: "text-rose-500",
        },
        {
            icon: Clock,
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-500",
            label: "AI Latency",
            value: "0.8s",
            trend: "-0.4s",
            trendUp: true,
        },
    ];

    const RECENT_ACTIVITY = [
        {
            name: "Robert Chen",
            initials: "RC",
            time: "10:45 AM",
            risk: "High Risk",
            riskStyle: "bg-rose-50 text-rose-600 border-rose-100",
            status: "Pending Review",
            statusStyle: "text-amber-600",
            statusDot: "bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.4)] animate-pulse",
            action: "Analyze",
        },
        {
            name: "Elena Jimenez",
            initials: "EJ",
            time: "09:12 AM",
            risk: "Moderate",
            riskStyle: "bg-amber-50 text-amber-600 border-amber-100",
            status: "Reviewed",
            statusStyle: "text-green-600",
            statusDot: "bg-green-600",
            action: "Details",
        },
        {
            name: "Michael Wong",
            initials: "MW",
            time: "08:50 AM",
            risk: "Low Risk",
            riskStyle: "bg-green-50 text-green-600 border-green-100",
            status: "Reviewed",
            statusStyle: "text-green-600",
            statusDot: "bg-green-600",
            action: "Details",
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-x-hidden">
            {/* Sidebar */}
            <aside className="sticky top-0 h-screen w-72 bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 hidden lg:flex flex-col z-50">
                <div className="p-8 pb-12 flex items-center gap-3">
                    <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                        <Activity size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 italic uppercase leading-none">RetinaAI</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Clinical Portal</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5">
                    <Link to="/doctor-dashboard" className="flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/25 transition-all">
                        <LayoutDashboard size={18} strokeWidth={2.5} />
                        <span className="text-sm">Workspace</span>
                    </Link>
                    <Link to="/doctor/scan-history" className="flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <Activity size={18} />
                        <span className="text-sm">Patient Archive</span>
                    </Link>
                    <Link to="/doctor-profile" className="flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <User size={18} />
                        <span className="text-sm">Clinical Profile</span>
                    </Link>
                    <div className="pt-8 mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">System</div>
                    <button className="w-full flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <Bell size={18} />
                        <span className="text-sm">Central Alerts</span>
                        <span className="ml-auto size-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-lg font-black shadow-lg shadow-rose-500/20">07</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <Settings size={18} />
                        <span className="text-sm">Node Settings</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-100/50 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-slate-100">
                        <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=Sarah+Smith&background=137fec&color=fff&bold=true')" }}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-slate-900">Dr. {user?.name.split(' ').pop() || "Smith"}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">Head Physician</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                        <LogOut size={16} strokeWidth={2.5} />
                        End Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col relative z-10">
                {/* Header Overlay Effect */}
                <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <header className="sticky top-0 z-40 h-24 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-10">
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Clinic Hub / <span className="text-primary italic">Live</span></h2>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Physician Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                className="w-72 pl-12 pr-6 py-3 bg-slate-100/60 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all shadow-inner"
                                placeholder="Search clinical data..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-slate-100 rounded-xl flex gap-1">
                                <button className="p-2.5 rounded-lg bg-white shadow-sm text-primary"><Zap size={18} /></button>
                                <button className="p-2.5 rounded-lg text-slate-400 hover:text-slate-600"><Filter size={18} /></button>
                            </div>
                        </div>
                    </div>
                </header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-10 space-y-10 w-full max-w-[1500px] mx-auto"
                >
                    {/* Welcome banner */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-2">
                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">Active <span className="text-primary not-italic">Clinical Environment</span></h3>
                            <p className="text-lg font-medium text-slate-500 max-w-xl">Diagnostic metrics sync completed. You have 3 urgent reviews remaining in your queue.</p>
                        </div>
                        <button className="h-14 px-10 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-slate-900/40 hover:-translate-y-1 transition-all flex items-center gap-3">
                            <PlusCircle size={18} strokeWidth={2.5} />
                            Initialize New Scan
                        </button>
                    </motion.div>

                    {/* KPI Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {KPI_CARDS.map((card, i) => (
                            <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="text-slate-200" size={20} />
                                </div>
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`p-4 rounded-2xl ${card.iconBg} ${card.iconColor} shadow-sm border border-white`}>
                                        <card.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${card.trendUp ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {card.trendUp ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
                                        {card.trend}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{card.label}</p>
                                <h3 className={`text-4xl font-black tracking-tight ${card.valueColor || 'text-slate-900'}`}>{card.value}</h3>
                                <div className="mt-6 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
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
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden group">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Diagnostic Workflow</h4>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1 italic">Real-time patient entry system</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/5 hover:text-primary transition-all"><MoreHorizontal size={20} /></button>
                                </div>
                            </div>
                            <div className="overflow-x-auto px-2">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafc]/50">
                                        <tr>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient Entity</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Time Sync</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AI Scoring</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vitals</th>
                                            <th className="px-8 py-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {RECENT_ACTIVITY.map((row, i) => (
                                            <tr key={i} className="hover:bg-primary/[0.02] transition-all cursor-pointer group/row">
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-11 rounded-2xl bg-white border-2 border-slate-50 shadow-sm flex items-center justify-center font-black text-xs text-primary group-hover/row:border-primary/20 transition-all">
                                                            {row.initials}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-slate-900 leading-none mb-1">{row.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: 8829-{i}X</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8 text-xs font-black text-slate-500 uppercase tracking-widest">{row.time}</td>
                                                <td className="px-8 py-8">
                                                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${row.riskStyle}`}>
                                                        {row.risk}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${row.statusStyle}`}>
                                                        <div className={`size-2.5 rounded-full border-2 border-white shadow-sm ${row.statusDot}`} />
                                                        {row.status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8 text-right">
                                                    <button className="size-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                                                        <ArrowRight size={18} strokeWidth={2.5} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-8 bg-[#f8fafc]/50 border-t border-slate-50 flex justify-center">
                                <Link to="/doctor/scan-history" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-primary transition-colors flex items-center gap-2">
                                    Full Patient Directory <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>

                        {/* Side Widgets */}
                        <div className="space-y-10">
                            {/* Distribution Graph Simulation */}
                            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-xl font-black tracking-tight text-slate-900 italic">Severity <span className="text-primary">Spread</span></h4>
                                    <Activity className="text-slate-200" size={20} />
                                </div>
                                <div className="flex items-center justify-center py-6">
                                    <div className="relative size-44 group cursor-help">
                                        <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                            <motion.path
                                                initial={{ pathLength: 0 }} animate={{ pathLength: 0.6 }} transition={{ duration: 1.5, delay: 0.5 }}
                                                className="text-green-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="60, 100" strokeLinecap="round" strokeWidth="4" />
                                            <motion.path
                                                initial={{ pathLength: 0 }} animate={{ pathLength: 0.25 }} transition={{ duration: 1.2, delay: 0.8 }}
                                                className="text-amber-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="25, 100" strokeDashoffset="-60" strokeLinecap="round" strokeWidth="4" />
                                            <motion.path
                                                initial={{ pathLength: 0 }} animate={{ pathLength: 0.15 }} transition={{ duration: 1, delay: 1.1 }}
                                                className="text-rose-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="15, 100" strokeDashoffset="-85" strokeLinecap="round" strokeWidth="4" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="text-3xl font-black text-slate-900 leading-none">1.2K</span>
                                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Cases</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    {[
                                        { label: "Healthy / Controlled", val: "60%", color: "bg-green-500" },
                                        { label: "Moderate Retinopathy", val: "25%", color: "bg-amber-500" },
                                        { label: "High Risk Proliferative", val: "15%", color: "bg-rose-500" }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-2.5 rounded-full ${stat.color} shadow-sm`} />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{stat.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Alert Queue */}
                            <motion.div variants={itemVariants} className="bg-slate-900 shadow-2xl rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/30 transition-colors" />
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                        <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
                                            <Shield size={16} />
                                        </div>
                                        Urgent Queue
                                    </h4>
                                    <span className="px-3 py-1 bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-500/30 animate-pulse">Critical</span>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { name: "Thomas Miller", type: "Immediate Screening", date: "Oct 28" },
                                        { name: "Alice Freeman", type: "Post-Surgical View", date: "Oct 29" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer group/item">
                                            <div className="size-10 rounded-xl bg-slate-800 flex flex-col items-center justify-center font-black leading-none group-hover/item:bg-primary transition-all">
                                                <span className="text-[9px] text-slate-400 group-hover/item:text-white opacity-60">{item.date.split(' ')[0]}</span>
                                                <span className="text-base text-white">{item.date.split(' ')[1]}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-white truncate">{item.name}</p>
                                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-0.5">{item.type}</p>
                                            </div>
                                            <ArrowRight size={16} className="text-white/20 group-hover/item:text-primary transition-all" />
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-8 py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Access Full Triage
                                </button>
                            </motion.div>

                            {/* Clinical Security Signature */}
                            <div className="p-6 rounded-[2rem] bg-[#f8fafc] border border-slate-200/60 flex items-center gap-4 shadow-inner">
                                <div className="size-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100 italic font-black text-sm">R</div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Secure Physician Instance</p>
                                    <p className="text-[10px] font-bold text-slate-400 italic">Auth ID: 88A-29C-77X</p>
                                </div>
                                <div className="ml-auto size-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
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
        </div>
    );
};

export default DoctorDashboard;
