import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import patientService from '../services/patientService';
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
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PatientDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [patient, setPatient] = useState(null);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const patientRes = await patientService.getMyProfile();
                if (patientRes.success) {
                    setPatient(patientRes.data);
                    const scansRes = await patientService.getPatientScans(patientRes.data._id);
                    if (scansRes.success) {
                        setScans(scansRes.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
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
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 antialiased font-display">
            {/* Sidebar */}
            <aside className="sticky top-0 h-screen w-72 bg-white/50 backdrop-blur-xl border-r border-slate-200/60 flex flex-col z-50">
                <div className="p-8 flex items-center gap-3">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Activity size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-black text-lg tracking-tight text-slate-900 italic uppercase leading-none">RetinaAI</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Patient Portal</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/25 transition-all">
                        <LayoutDashboard size={18} strokeWidth={2.5} />
                        <span className="text-sm">Overview</span>
                    </Link>
                    <Link to="/analytics" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold">
                        <Activity size={18} />
                        <span className="text-sm">Health Metrics</span>
                    </Link>
                    <Link to="/scan-history" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold">
                        <History size={18} />
                        <span className="text-sm">Scan Archive</span>
                    </Link>
                    <Link to="/tips" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold">
                        <BookOpen size={18} />
                        <span className="text-sm">Medical Hub</span>
                    </Link>

                    <div className="pt-6 mt-6 border-t border-slate-100">
                        <p className="px-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                        <Link to="#" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold">
                            <Settings size={18} />
                            <span className="text-sm">Preferences</span>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold mt-1">
                            <LogOut size={18} />
                            <span className="text-sm">Secure Sign Out</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4">
                    <div className="bg-slate-100/50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                        <div className="size-10 rounded-full border-2 border-white shadow-sm bg-cover bg-center" style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=" + (user?.name || "Patient") + "&background=137fec&color=fff&bold=true')" }}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-slate-900">{user?.name || "John Doe"}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">Regular Patient</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
                {/* Topbar */}
                <header className="sticky top-0 z-40 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-10">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                        <span>Portal</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-primary italic">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search medical data..."
                                className="bg-slate-100/80 border-none rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all w-64"
                            />
                        </div>
                        <button className="relative p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200/80 hover:text-slate-900 transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 size-2 rounded-full border-2 border-white bg-red-500"></span>
                        </button>
                    </div>
                </header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-10 space-y-10 max-w-[1400px] mx-auto w-full"
                >
                    {/* Welcome Section */}
                    <motion.section variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Welcome back, <span className="text-primary italic">{patient?.name?.split(' ')[0] || "Friend"}</span></h2>
                            <p className="text-lg font-medium text-slate-500">Your AI-analyzed retinal health overview for today.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="h-14 px-8 rounded-2xl bg-white border-2 border-slate-100 text-sm font-black text-slate-600 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <Download size={18} />
                                Export History
                            </button>
                            <button className="h-14 px-8 rounded-2xl bg-primary text-white text-sm font-black shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all flex items-center gap-2">
                                <PlusCircle size={18} strokeWidth={2.5} />
                                New AI Scan
                            </button>
                        </div>
                    </motion.section>

                    {/* Patient Card */}
                    <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center relative z-10">
                            <div className="flex gap-8 items-center flex-1">
                                <div className="size-32 rounded-[2rem] border-8 border-white shadow-2xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=" + (patient?.name || user?.name || "Patient") + "&background=137fec&color=fff&bold=true')" }}></div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{patient?.name || user?.name}</h3>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${patient?.riskLevel === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                            <span className={`size-2 rounded-full ${patient?.riskLevel === 'High' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                            {patient?.riskLevel ? `${patient.riskLevel} Risk` : "Active Status"}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-500">
                                        <span className="flex items-center gap-2"><Calendar size={16} className="text-slate-300" /> {patient?.age || "N/A"} Years</span>
                                        <span className="flex items-center gap-2"><Activity size={16} className="text-slate-300" /> {patient?.diabetesType || "Type Not Specified"}</span>
                                        <span className="flex items-center gap-2"><Mail size={16} className="text-slate-300" /> {patient?.email || user?.email}</span>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 rounded-lg px-3 py-1 bg-slate-50">Patient ID: {patient?._id?.substring(0, 12).toUpperCase()}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 rounded-lg px-3 py-1 bg-slate-50">HIPAA Compliant Vault</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 w-full lg:w-auto min-w-[400px]">
                                {[
                                    { label: "Total Scans", val: scans.length, trend: "History", color: "text-slate-900" },
                                    { label: "Stage", val: scans[0]?.aiResult || "None", trend: "Severity", color: "text-primary" },
                                    { label: "Glucose", val: patient?.hba1c ? `${patient.hba1c}%` : "N/A", trend: "HbA1c", color: "text-amber-500" }
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-[#f8fafc] rounded-3xl p-5 border border-white text-center shadow-inner hover:bg-white hover:border-slate-100 transition-all group/stat">
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-extrabold mb-2">{stat.label}</p>
                                        <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                                        <div className="mt-2 h-0.5 w-6 bg-slate-200 mx-auto group-hover/stat:w-12 transition-all group-hover/stat:bg-primary" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Interaction Area */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Chart Card */}
                            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Progression Analytics</h4>
                                        <p className="text-sm font-medium text-slate-500">Automated lesion detection delta tracking</p>
                                    </div>
                                    <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                                        <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-white rounded-xl shadow-sm text-slate-900 transition-all">Yearly</button>
                                        <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">All Time</button>
                                    </div>
                                </div>

                                <div className="h-72 w-full relative">
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                                <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                            d="M0,150 C100,160 200,120 300,130 C400,140 500,80 600,90 C700,100 800,40 800,40"
                                            fill="none"
                                            stroke="#137fec"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <motion.path
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1, duration: 1 }}
                                            d="M0,150 C100,160 200,120 300,130 C400,140 500,80 600,90 C700,100 800,40 800,40 L800,200 L0,200 Z"
                                            fill="url(#chartGradient)"
                                        />
                                        {[100, 300, 500, 800].map((cx, i) => (
                                            <motion.circle
                                                key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 1.5 + (i * 0.1) }}
                                                cx={cx} cy={[160, 130, 80, 40][i]} r="6" fill="#137fec" stroke="white" strokeWidth="3" className="shadow-lg"
                                            />
                                        ))}
                                    </svg>
                                    <div className="mt-8 flex justify-between px-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        <span>Jan 2024</span>
                                        <span>Apr 2024</span>
                                        <span>Jul 2024</span>
                                        <span>Oct 2024</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Scan History Table */}
                            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Access Recent Reports</h4>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
                                        <input
                                            className="pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-none bg-slate-50 focus:ring-4 focus:ring-primary/5 w-48"
                                            placeholder="Find report..."
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#f8fafc]/50">
                                            <tr>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AI Result</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Markers</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                                <th className="px-8 py-5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {scans.length > 0 ? scans.map((scan) => (
                                                <tr key={scan._id} className="hover:bg-slate-50/80 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-black text-slate-900">{new Date(scan.date).toLocaleDateString()}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OS (Left Eye)</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${scan.aiResult.includes('Moderate') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-primary/5 text-primary border-primary/10'}`}>
                                                            {scan.aiResult}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{scan.lesionCount} lesions</td>
                                                    <td className="px-8 py-6">
                                                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${scan.status === 'Reviewed' ? 'text-green-600' : 'text-amber-600'}`}>
                                                            <span className={`size-1.5 rounded-full ${scan.status === 'Reviewed' ? 'bg-green-600' : 'bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.5)] animate-pulse'}`}></span>
                                                            {scan.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="size-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20">
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
                            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 group">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Eye size={16} />
                                    </div>
                                    Latest Fundus Scan
                                </h4>
                                <div className="aspect-[4/5] w-full rounded-[2rem] bg-slate-100 relative overflow-hidden group/img cursor-zoom-in">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/img:scale-110" style={{ backgroundImage: `url('${scans[0]?.imageUrl || "https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=800"}')` }}></div>
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <div className="bg-white text-primary p-4 rounded-2xl shadow-2xl scale-50 group-hover/img:scale-100 transition-transform duration-500">
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
                            <motion.div variants={itemVariants} className="bg-primary shadow-[0_30px_60px_-15px_rgba(19,127,236,0.3)] rounded-[2.5rem] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-colors" />
                                <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                                        <Brain size={16} />
                                    </div>
                                    AI Core Insights
                                </h4>
                                <ul className="space-y-6">
                                    {scans[0]?.insights && scans[0].insights.length > 0 ? scans[0].insights.map((insight, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <div className="size-8 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center text-white border border-white/10">
                                                {insight.type === 'high_risk' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                            </div>
                                            <p className="text-xs font-bold leading-relaxed text-white/90" dangerouslySetInnerHTML={{
                                                __html: insight.message
                                                    .replace(/(\d+%)/, '<span class="px-1.5 py-0.5 bg-white/20 rounded-md font-black text-white">$1</span>')
                                                    .replace(/(In \d+ Months)/, '<span class="text-white font-black underline underline-offset-4 decoration-white/30">$1</span>')
                                            }} />
                                        </li>
                                    )) : (
                                        <div className="text-center py-6 text-white/40 italic text-xs font-bold uppercase tracking-widest">Awaiting engine sync...</div>
                                    )}
                                </ul>
                                <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                                    Full Engine Report
                                </button>
                            </motion.div>

                            {/* Clinical Notes Card */}
                            <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-white/50 text-[10px] font-black uppercase tracking-widest">Medical Directive</h4>
                                    <FileText size={18} className="text-white/20 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-sm font-medium leading-relaxed text-white/80 italic border-l-2 border-primary/40 pl-4 py-2">
                                    "{scans[0]?.clinicalNotes || "Maintain rigorous glycemic control and monitor daily for new distortions or flashes."}"
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-primary overflow-hidden">
                                            <img src="https://ui-avatars.com/api/?name=Sarah+Smith&background=137fec&color=fff" alt="Dr." />
                                        </div>
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Dr. Sarah Smith</p>
                                    </div>
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Verified</span>
                                </div>
                            </motion.div>

                            {/* Security Badge */}
                            <div className="p-6 rounded-3xl bg-slate-100 flex items-center gap-4 border border-slate-200/50">
                                <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                    <Shield size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-0.5">Privacy Lock Active</p>
                                    <p className="text-[9px] font-bold text-slate-400 leading-none">AES-256 Retinal Data Encryption</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-auto px-10 py-10 text-center border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        © 2024 HealthAI Diagnostic Systems / v2.4.1-stable / Patient Vault Active
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default PatientDashboard;
