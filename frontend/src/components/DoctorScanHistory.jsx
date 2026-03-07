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
    Shield
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import patientService from '../services/patientService';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorScanHistory = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState('All');

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const dummyScans = [
                    { id: 1, patientName: "Robert Chen", date: "2024-03-05", time: "10:45 AM", risk: "High Risk", status: "Pending", type: "Post-Treatment" },
                    { id: 2, patientName: "Elena Jimenez", date: "2024-03-05", time: "09:12 AM", risk: "Moderate", status: "Reviewed", type: "Annual" },
                    { id: 3, patientName: "Michael Wong", date: "2024-03-04", time: "08:50 AM", risk: "Low Risk", status: "Reviewed", type: "Routine" },
                    { id: 4, patientName: "Sarah Jenkins", date: "2024-03-04", time: "04:30 PM", risk: "High Risk", status: "Reviewed", type: "Urgent" },
                    { id: 5, patientName: "David Miller", date: "2024-03-03", time: "11:20 AM", risk: "Low Risk", status: "Reviewed", type: "Annual" },
                ];
                setScans(dummyScans);
            } catch (err) {
                console.error('Failed to fetch scans', err);
            } finally {
                setLoading(false);
            }
        };
        fetchScans();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredScans = scans.filter(scan => {
        const matchesSearch = scan.patientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = filterRisk === 'All' || scan.risk === filterRisk;
        return matchesSearch && matchesRisk;
    });

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
                    <Link to="/doctor-dashboard" className="flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <LayoutDashboard size={18} />
                        <span className="text-sm">Workspace</span>
                    </Link>
                    <Link to="/doctor/scan-history" className="flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/25 transition-all">
                        <Activity size={18} strokeWidth={2.5} />
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
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
                        <Settings size={18} />
                        <span className="text-sm">Node Settings</span>
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
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Clinic Hub / <span className="text-primary italic">Archive</span></h2>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Patient <span className="text-primary not-italic">Center</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="h-12 px-6 bg-white border-2 border-slate-100 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm text-slate-600">
                            <Download size={16} />
                            Generate Report
                        </button>
                    </div>
                </header>

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
                            <button className="size-14 bg-slate-50 text-slate-300 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center justify-center border border-slate-100 shadow-inner">
                                <Filter size={20} />
                            </button>
                        </div>
                    </motion.section>

                    {/* Table Section */}
                    <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden flex-1 flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc]/50">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Patient Data Entity</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Analysis Epoch</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">AI Scoring</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Directive</th>
                                        <th className="px-10 py-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence>
                                        {filteredScans.length > 0 ? filteredScans.map((scan, i) => (
                                            <motion.tr
                                                key={scan.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="hover:bg-primary/[0.02] transition-all cursor-pointer group/row"
                                            >
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="size-12 rounded-2xl bg-white border-2 border-slate-50 shadow-sm flex items-center justify-center font-black text-xs text-primary group-hover/row:border-primary/20 transition-all">
                                                            {scan.patientName.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-slate-900 leading-none mb-1.5">{scan.patientName}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DR-{scan.id}092-B</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-700 italic">{scan.date}</span>
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{scan.time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${scan.risk === 'High Risk' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            scan.risk === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                'bg-green-50 text-green-600 border-green-100'
                                                        }`}>
                                                        {scan.risk}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${scan.status === 'Pending' ? 'text-amber-500' : 'text-green-600'
                                                        }`}>
                                                        <div className={`size-2.5 rounded-full border-2 border-white shadow-sm ${scan.status === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-green-600'
                                                            }`} />
                                                        {scan.status}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{scan.type}</span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button className="size-11 rounded-xl bg-slate-50 text-slate-300 hover:bg-white hover:text-primary hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-center border border-transparent hover:border-primary/20 opacity-0 group-hover/row:opacity-100 translate-x-4 group-hover/row:translate-x-0">
                                                            <Download size={18} />
                                                        </button>
                                                        <button className="h-11 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:-translate-y-1 shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
                                                            Analyze
                                                            <ArrowUpRight size={16} strokeWidth={2.5} />
                                                        </button>
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
                            <div className="p-10 bg-[#f8fafc]/50 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredScans.length} of {scans.length} patient records</p>
                                <div className="flex gap-2">
                                    <button className="size-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-xs font-black hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">1</button>
                                    <button className="size-10 rounded-xl bg-white border border-slate-100 text-slate-300 flex items-center justify-center text-xs font-black hover:bg-slate-50 transition-all">2</button>
                                </div>
                            </div>
                        )}
                    </motion.section>

                    {/* Bottom Security Note */}
                    <div className="flex items-center justify-center gap-4 py-4 px-8 bg-slate-900 rounded-[2rem] w-fit mx-auto shadow-2xl">
                        <Shield className="text-primary" size={20} strokeWidth={2.5} />
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">AES-256 Quantum-Shielded Diagnostic Vault Active</span>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        © 2024 RetinaAI Clinical Systems / Data Repository / Unit-{user?.id?.substring(0, 8) || "882B-7"}
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default DoctorScanHistory;
