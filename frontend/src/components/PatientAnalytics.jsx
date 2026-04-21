import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  LayoutDashboard,
  Activity,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  Calendar,
  Printer,
  BookOpen,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Dna,
  ShieldCheck,
  Download,
  ArrowUpRight,
  Zap,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientPreferencesModal from './PatientPreferencesModal';
import patientService from "../services/patientService";
import api from "../services/api";

const X_AXIS_LABELS = ["Jan 2024", "Mar 2024", "May 2024", "Jul 2024", "Sep 2024", "Nov 2024"];

export default function PatientAnalytics() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeEye, setActiveEye] = useState("OD");
  const [patient, setPatient] = useState(null);
  const [stats, setStats] = useState([]);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const profile = await patientService.getMyProfile();
        if (profile.success) {
          setPatient(profile.data);
          const res = await patientService.getPatientScans(profile.data._id);
          const scanData = res.data;

          // Calculate some dynamic stats for the cards based on latest scan
          const latest = scanData[0] || {};
          const dynamicStats = [
            {
              icon: Dna,
              iconBg: "bg-teal-500/10",
              iconColor: "text-teal-500",
              barColor: "bg-teal-500",
              label: "Vessel Density",
              value: latest.aiResult === 'Low Risk' ? "44.2%" : "38.5%",
              barWidth: latest.aiResult === 'Low Risk' ? 44.2 : 38.5,
              trend: "+2.1%",
              trendUp: true,
            },
            {
              icon: AlertCircle,
              iconBg: "bg-rose-500/10",
              iconColor: "text-rose-500",
              barColor: "bg-rose-500",
              label: "Lesion Count",
              value: (latest.lesionCount || 0).toString(),
              unit: "Focal",
              barWidth: Math.min((latest.lesionCount || 0) * 5, 100),
              trend: latest.aiResult,
              trendUp: latest.aiResult === 'Low Risk',
            },
            {
              icon: Activity,
              iconBg: "bg-primary/10",
              iconColor: "text-primary",
              barColor: "bg-primary",
              label: "Scan Progress",
              value: scanData.length.toString(),
              unit: "Total",
              barWidth: Math.min(scanData.length * 10, 100),
              trend: "Stable",
              trendUp: true,
            },
          ];
          setStats(dynamicStats);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <LayoutDashboard size={18} />
            <span className="text-sm">Patient Dashboard</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/25 transition-all">
            <Activity size={18} strokeWidth={2.5} />
            <span className="text-sm">Health Analytics</span>
          </Link>
          <Link to="/scan-history" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <History size={18} />
            <span className="text-sm">Reports</span>
          </Link>
          <Link to="/ai-assistant" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <MessageCircle size={18} />
            <span className="text-sm">AI Assistant</span>
          </Link>

          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account</p>
            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group text-left"
            >
              <Settings size={18} />
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
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Health Hub / <span className="text-primary">Analytics</span></h2>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Biometric <span className="text-primary not-italic">Insights</span></h1>
          </div>


        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-10 space-y-10 w-full max-w-[1500px] mx-auto"
        >
          {/* KPI Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((card, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="text-slate-200" size={20} />
                </div>
                <div className="flex items-start justify-between mb-8">
                  <div className={`p-4 rounded-2xl ${card.iconBg} ${card.iconColor} shadow-sm border border-white`}>
                    <card.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${card.trendUp ? 'bg-primary/10 text-primary' : 'bg-rose-50 text-rose-600'}`}>
                    {card.trendUp ? <TrendingUp size={12} /> : <AlertCircle size={12} />}
                    {card.trend}
                  </div>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{card.label}</p>
                <div className="flex items-end gap-1.5">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900">{card.value}</h3>
                  {card.unit && <span className="text-xs font-black text-slate-300 uppercase mb-1.5">{card.unit}</span>}
                </div>
                <div className="mt-6 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ delay: 0.5 + (idx * 0.1), duration: 1.5 }}
                    className={`h-full w-2/3 ${card.iconColor.replace('text-', 'bg-')} opacity-40`}
                    style={{ width: `${card.barWidth}%` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Lesion Distribution */}
            <motion.div variants={itemVariants} className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30 group">
              <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight italic">Lesion <span className="text-primary">Topography</span></h4>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Distribution analysis by quadrant</p>
                </div>
                <div className="flex p-1.5 bg-slate-50 rounded-2xl shadow-inner">
                  {["OD (Right)", "OS (Left)"].map((eye) => {
                    const key = eye.split(" ")[0];
                    const active = activeEye === key;
                    return (
                      <button
                        key={eye}
                        onClick={() => setActiveEye(key)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-white text-primary shadow-lg shadow-primary/10" : "text-slate-400 hover:text-slate-600"
                          }`}
                      >
                        {eye}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative flex h-[450px] items-center justify-center py-10">
                <svg className="h-full w-full max-w-[450px] drop-shadow-2xl" viewBox="0 0 400 400">
                  {/* Grid polygons with gradients */}
                  {[
                    "200,40 352,151 294,330 106,330 48,151",
                    "200,80 314,163 271,298 129,298 86,163",
                    "200,120 276,175 247,265 153,265 124,175",
                  ].map((pts, i) => (
                    <polygon
                      key={pts}
                      points={pts}
                      fill="none"
                      stroke={i === 0 ? "rgba(5,150,105,0.1)" : "rgba(5,150,105,0.05)"}
                      strokeWidth="2"
                    />
                  ))}
                  {/* Axis lines */}
                  {[
                    [200, 200, 200, 40],
                    [200, 200, 352, 151],
                    [200, 200, 294, 330],
                    [200, 200, 106, 330],
                    [200, 200, 48, 151],
                  ].map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(5,150,105,0.05)" strokeWidth="1" />
                  ))}
                  {/* Data area */}
                  <motion.polygon
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 2 }}
                    points="200,80 320,165 240,280 140,250 80,140"
                    fill="rgba(5,150,105,0.15)"
                    stroke="var(--primary)"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    className="group-hover:fill-primary/25 transition-colors duration-500"
                  />
                  {/* Labels */}
                  <g className="text-[10px] font-black text-slate-300 uppercase tracking-widest fill-slate-300">
                    <text textAnchor="middle" x="200" y="25">Hemorrhages</text>
                    <text textAnchor="start" x="365" y="155">Exudates</text>
                    <text textAnchor="start" x="305" y="360">Cotton Wool</text>
                    <text textAnchor="end" x="90" y="360">Vascular</text>
                    <text textAnchor="end" x="30" y="155">Aneurysms</text>
                  </g>
                </svg>

                <div className="absolute top-0 right-0 p-6 space-y-4 bg-main/50 backdrop-blur-sm rounded-3xl border border-white/50">
                  <div className="flex items-center gap-3">
                    <div className="size-3 bg-primary rounded-full shadow-[0_0_8px_rgba(5,150,105,0.6)]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Scan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-3 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Baseline</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Risk Gauge */}
            <motion.div variants={itemVariants} className="lg:col-span-4 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-12 translate-x-12" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl translate-y-12 -translate-x-12" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-10">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic flex items-center gap-3">
                    <Zap size={16} className="text-primary" />
                    Risk Vector
                  </h4>
                  <span className="px-3 py-1 bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5">12M Window</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center pb-10">
                  <div className="relative size-64 flex items-center justify-center">
                    <svg className="size-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeDasharray="264" />
                      <motion.circle
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * 0.68) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        cx="50" cy="50" r="42" fill="none" stroke="#059669" strokeWidth="10" strokeDasharray="264" strokeLinecap="round"
                        className="drop-shadow-[0_0_15px_rgba(5,150,105,0.6)]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <span className="text-6xl font-black tracking-tighter leading-none">68<span className="text-2xl text-primary">%</span></span>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-3">High Probability</span>
                    </div>
                  </div>

                  <div className="mt-12 w-full space-y-4">
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                      <p className="text-xs font-bold text-white/70 leading-relaxed">
                        Likely clinical progression to <span className="text-primary font-black uppercase">Severe NPDR</span> detected.
                      </p>
                    </div>
                    <button className="w-full py-5 bg-white text-slate-900 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-black/40 hover:scale-[1.02] active:scale-95 transition-all">
                      Initialize Action Plan
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Longitudinal Health */}
            <motion.div variants={itemVariants} className="lg:col-span-12 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30">
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight italic">Longitudinal <span className="text-primary">Correlation</span></h4>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">HbA1c levels mapped against focal lesion counts</p>
                </div>
                <div className="flex gap-8 px-6 py-4 bg-main rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HbA1c Sync (%)</span>
                  </div>

                </div>
              </div>

              <div className="relative h-72 w-full group">
                <svg className="h-full w-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                  {/* Grid System */}
                  {[40, 100, 160].map((y) => (
                    <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(5,150,105,0.03)" strokeWidth="1" />
                  ))}

                  {/* HbA1c Line */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                    d="M0,140 L200,150 L400,130 L600,80 L800,110 L1000,90"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                    className="opacity-50"
                  />
                  {[[200, 150], [400, 130], [600, 80], [800, 110]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="5" fill="#f43f5e" className="shadow-lg" />
                  ))}

                  {/* Lesion Line */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.5 }}
                    d="M0,160 L200,165 L400,155 L600,120 L800,130 L1000,70"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {[[200, 165], [400, 155], [600, 120], [800, 130], [1000, 70]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="6" fill="#059669" className="group-hover:scale-125 transition-transform" />
                  ))}
                </svg>

                <div className="mt-8 flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  {X_AXIS_LABELS.map((l) => <span key={l}>{l}</span>)}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer CTA */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-10 text-white flex items-center justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <ShieldCheck size={120} />
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Diagnostic Status</h4>
                <h3 className="text-xl font-black tracking-tight leading-relaxed italic">Moderate <span className="text-primary">NPDR</span> / Clinical Stage <span className="text-rose-500">2B</span></h3>
              </div>
              <div className="relative z-10 px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                Synchronized Oct 2024
              </div>
            </div>

            <button className="lg:w-96 bg-primary rounded-[2.5rem] p-10 text-white flex items-center justify-between shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-1 group">
              <div className="text-left">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-2">Protocol</h4>
                <h3 className="text-xl font-black italic">Anti-VEGF Therapy</h3>
              </div>
              <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <ChevronRight size={24} strokeWidth={3} />
              </div>
            </button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            © 2024 RetinaAI Analytics Systems / v2.4.1-STABLE / Node {user?._id?.substring(0, 8) || "882B-7"}
          </p>
        </footer>
      </main>
      <PatientPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        patient={patient}
        user={user}
        onProfileUpdate={(updated) => setPatient(prev => ({ ...prev, ...updated }))}
      />
    </div>
  );
}
