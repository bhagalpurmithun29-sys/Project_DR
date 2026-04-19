import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import {
  Eye,
  LayoutDashboard,
  Activity,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Download,
  PlusCircle,
  ChevronLeft,
  CheckCircle,
  Calendar,
  List,
  Grid,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  MoreHorizontal,
  Filter,
  BarChart3,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientPreferencesModal from './PatientPreferencesModal';

const PAGE_SIZE = 6;

function ConfidenceBar({ value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 flex-shrink-0">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full rounded-full bg-primary"
        />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{value}%</span>
    </div>
  );
}

const DetailedScanHistory = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await patientService.getMyProfile();
      if (res.success) {
        setPatient(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

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
        console.error("Failed to fetch history", error);
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

  const filtered = scans.filter(
    (s) =>
      (s.aiResult && s.aiResult.toLowerCase().includes(search.toLowerCase())) ||
      (s._id && s._id.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentScans = filtered.slice(startIndex, startIndex + PAGE_SIZE);

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
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-main font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-72 flex-shrink-0 bg-sidebar border-r border-white/5 hidden lg:flex flex-col z-50">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white italic uppercase leading-none">RetinaAI</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Patients Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 mt-6 custom-scrollbar">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group text-left">
            <LayoutDashboard size={16} />
            <span className="text-sm">Patient Dashboard</span>
          </button>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
            <Activity size={16} />
            <span className="text-sm">Health Analytics</span>
          </Link>
          <Link to="/scan-history" className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 transition-all">
            <History size={16} strokeWidth={2.5} />
            <span className="text-sm">Reports</span>
          </Link>
          <Link to="/tips" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
            <BookOpen size={16} />
            <span className="text-sm">Medical Library</span>
          </Link>

          <div className="pt-8 mb-4">
            <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">System</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group text-left"
            >
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5 text-left">
            <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm flex-shrink-0" style={{ backgroundImage: `url(${patient?.photo ? (patient.photo.startsWith('http') ? patient.photo : `${api.defaults.baseURL.replace('/api', '')}${patient.photo}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Patient')}&background=059669&color=fff&bold=true`})` }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-white">{user?.name || 'Patient'}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{patient?.patientId || 'Medical ID: 88A-29C'}</p>
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

            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Scan <span className="text-primary not-italic">Records</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center px-4 py-2 bg-slate-100 rounded-xl border border-slate-200/50">
              <ShieldCheck size={16} className="text-primary mr-2" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Instance-{patient?._id?.substring(0, 8).toUpperCase() || "AUTH"}</span>
            </div>

          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-10 space-y-10 w-full max-w-[1500px] mx-auto flex-1 flex flex-col"
        >
          {/* Controls Bar */}
          <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-[400px] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search archive entries..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-16 pr-6 py-4 bg-slate-50/50 border-none rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto px-2">
              <div className="flex p-1.5 bg-slate-50 rounded-2xl shadow-inner border border-slate-100">
                <button
                  onClick={() => setViewMode("list")}
                  className={`size-11 rounded-xl flex items-center justify-center transition-all ${viewMode === "list" ? "bg-white text-primary shadow-lg shadow-primary/10" : "text-slate-300 hover:text-slate-500"
                    }`}
                >
                  <List size={20} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`size-11 rounded-xl flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-lg shadow-primary/10" : "text-slate-300 hover:text-slate-500"
                    }`}
                >
                  <Grid size={20} />
                </button>
              </div>
              <button className="size-14 bg-slate-50 text-slate-300 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center justify-center border border-slate-100 shadow-inner">
                <Filter size={20} />
              </button>
            </div>
          </motion.section>

          {/* Records Section */}
          <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden flex-1 flex flex-col">
            {viewMode === "list" ? (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-main/50">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Scan Identity</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Diagnosis Epoch</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">AI Outcome</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Anomaly Index</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">AI Confidence</th>
                      <th className="px-10 py-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {currentScans.length > 0 ? currentScans.map((row) => (
                        <motion.tr
                          key={row._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-primary/[0.02] transition-all cursor-pointer group/row"
                        >
                          <td className="px-10 py-8">
                            <span className="text-[11px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 select-none">ID-{row._id.substring(0, 8).toUpperCase()}</span>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                              <Calendar size={14} className="text-slate-300" />
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 tracking-tight leading-none italic">{new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Certified Record</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${(row.aiResult || '').includes('Moderate') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              (row.aiResult || '').includes('Severe') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-primary/10 text-primary border-primary/20'
                              }`}>
                              {row.aiResult || 'Pending Analysis'}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">{row.lesionCount}</span>
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Lesions</span>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <ConfidenceBar value={95} />
                          </td>
                          <td className="px-10 py-8 text-right">
                            {['Analyzed', 'Reviewed'].includes(row.status) ? (
                              <Link
                                to={`/report/${row._id}`}
                                className="h-10 px-5 bg-slate-900 text-white hover:bg-slate-800 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group/btn"
                              >
                                View Report <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                              </Link>
                            ) : (
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                {row.status}
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="px-10 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                                <Search size={32} />
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No diagnostic entries found in current subset</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-10 flex-1 overflow-y-auto">
                {currentScans.map((row) => (
                  <motion.div
                    key={row._id}
                    layoutId={row._id}
                    className="group bg-main rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 transition-transform">
                      <Activity size={80} />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">ID-{row._id.substring(0, 6)}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 italic">
                          <Clock size={12} /> {new Date(row.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="aspect-[16/10] bg-white rounded-2xl border border-slate-100 shadow-inner overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                        <img src={row.imageUrl ? (row.imageUrl.startsWith('http') ? row.imageUrl : `${api.defaults.baseURL.replace('/api', '')}${row.imageUrl}`) : "https://images.unsplash.com/photo-1579154235602-3c22bd4b5683?w=500&auto=format"} alt="Fundus Scan" className="w-full h-full object-cover p-2 rounded-[2rem]" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900 tracking-tight italic">{row.aiResult}</h4>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-primary">{row.lesionCount}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Lesions</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[95%]" />
                        </div>
                      </div>

                      {['Analyzed', 'Reviewed'].includes(row.status) ? (
                        <Link
                          to={`/report/${row._id}`}
                          className="w-full h-12 bg-white text-slate-900 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2"
                        >
                          Access Analysis <ArrowUpRight size={14} strokeWidth={2.5} />
                        </Link>
                      ) : (
                        <div className="w-full h-12 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                          {row.status} <Clock size={14} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="p-10 bg-main/50 border-t border-slate-50 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {currentScans.length} of {filtered.length} Indexed Results</p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="size-11 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="px-4 text-[11px] font-black text-slate-900 uppercase">Page {currentPage} of {totalPages || 1}</div>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="size-11 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>

        {/* Footer */}
        <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            © 2024 RetinaAI Clinical Systems / Diagnostic Repository / Node-{user?._id?.substring(0, 8) || "882B-7"}
          </p>
        </footer>
      </main>
      <PatientPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        patient={patient}
        user={user}
      />
    </div>
  );
};

export default DetailedScanHistory;
