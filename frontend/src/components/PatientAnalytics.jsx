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
import api, { normalizeUrl } from "../services/api";

const X_AXIS_LABELS = ["Jan 2024", "Mar 2024", "May 2024", "Jul 2024", "Sep 2024", "Nov 2024"];

export default function PatientAnalytics() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeEye, setActiveEye] = useState("OD");
  const [patient, setPatient] = useState(null);
  const [stats, setStats] = useState([]);
  const [latestScan, setLatestScan] = useState(null);
  const [odScan, setOdScan] = useState(null);
  const [osScan, setOsScan] = useState(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // ── DR Stage helpers ──────────────────────────────────────────────────────
  const getDRStage = (prediction, aiResult) => {
    const t = (prediction || aiResult || '').toLowerCase();
    if (t.includes('proliferat') || t.includes('pdr') || t.includes('high')) return 4;
    if (t.includes('severe') || t.includes('stage 3')) return 3;
    if (t.includes('moderate') || t.includes('stage 2')) return 2;
    if (t.includes('mild') || t.includes('stage 1') || t.includes('npdr')) return 1;
    return 0;
  };

  const DR_STAGE_LABELS = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'];
  const DR_STAGE_COLORS = ['#059669', '#10b981', '#f59e0b', '#f97316', '#f43f5e'];

  const PENTAGON_ANGLES = [-90, -18, 54, 126, 198]; // degrees
  const RADAR_CX = 200, RADAR_CY = 200, RADAR_MAX_R = 140;

  const buildRadarPolygon = (scan) => {
    if (!scan) return '200,200 200,200 200,200 200,200 200,200';
    const drStage = getDRStage(scan.prediction, scan.aiResult);
    const values = [
      drStage / 4,                                   // DR Grade
      scan.aiConfidence || 0,                        // AI Confidence
      Math.min((scan.lesionCount || 0) / 8, 1),     // Lesions
      (drStage / 4 + (scan.aiConfidence || 0)) / 2, // Risk Score
      Math.min((scan.lesionPercent || 0) / 50, 1),  // Progression
    ];
    return values.map((v, i) => {
      const rad = (PENTAGON_ANGLES[i] * Math.PI) / 180;
      const x = RADAR_CX + RADAR_MAX_R * v * Math.cos(rad);
      const y = RADAR_CY + RADAR_MAX_R * v * Math.sin(rad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const profile = await patientService.getMyProfile();
        if (profile.success) {
          setPatient(profile.data);
          const res = await patientService.getPatientScans(profile.data._id);
          const scanData = res.data;

          const sorted = [...scanData].sort((a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          );
          const latest = sorted.find(s => s.status === 'Analyzed') || sorted[0] || {};

          // Separate by eye side
          const odScans = sorted.filter(s => s.eyeSide === 'OD');
          const osScans = sorted.filter(s => s.eyeSide === 'OS');
          setOdScan(odScans.find(s => s.status === 'Analyzed') || odScans[0] || null);
          setOsScan(osScans.find(s => s.status === 'Analyzed') || osScans[0] || null);

          // Determine colors based on risk
          const isHighRisk   = latest.aiResult?.includes('High');
          const isModRisk    = latest.aiResult?.includes('Moderate');
          const confidence   = latest.aiConfidence || 0;
          const confPct      = (confidence * 100).toFixed(2);

          const predictionName = latest.prediction
            || latest.findings?.[0]?.replace('AI Analysis detects: ', '')
            || (latest.status === 'Analyzed' ? latest.aiResult : 'No Scan Yet');

          const dynamicStats = [
            // ── Card 1: Prediction (DR grade) ──────────────────
            {
              icon: Dna,
              iconBg: isHighRisk ? "bg-rose-500/10" : isModRisk ? "bg-amber-500/10" : "bg-teal-500/10",
              iconColor: isHighRisk ? "text-rose-500" : isModRisk ? "text-amber-500" : "text-teal-500",
              label: "Prediction",
              value: predictionName,
              unit: "",
              barWidth: isHighRisk ? 90 : isModRisk ? 55 : 20,
              trend: latest.aiResult || "Pending",
              trendUp: !isHighRisk,
            },
            // ── Card 2: Confidence ──────────────────────────────
            {
              icon: BarChart3,
              iconBg: isHighRisk ? "bg-rose-500/10" : isModRisk ? "bg-amber-500/10" : "bg-primary/10",
              iconColor: isHighRisk ? "text-rose-500" : isModRisk ? "text-amber-500" : "text-primary",
              label: "Confidence",
              value: confidence ? `${confPct}%` : "—",
              unit: confidence ? "certainty" : "",
              barWidth: confPct || 0,
              trend: isHighRisk ? "High Risk" : isModRisk ? "Moderate" : "Low Risk",
              trendUp: !isHighRisk,
            },
            // ── Card 3: Lesions Detected ────────────────────────
            {
              icon: AlertCircle,
              iconBg: (latest.lesionCount || 0) > 2 ? "bg-rose-500/10" : (latest.lesionCount || 0) > 0 ? "bg-amber-500/10" : "bg-teal-500/10",
              iconColor: (latest.lesionCount || 0) > 2 ? "text-rose-500" : (latest.lesionCount || 0) > 0 ? "text-amber-500" : "text-teal-500",
              label: "Lesions Detected",
              value: latest.status === 'Analyzed' ? (latest.lesionCount ?? 0).toString() : "—",
              unit: latest.lesionCount > 0 ? "Focal" : "",
              barWidth: Math.min((latest.lesionCount || 0) * 12, 100),
              trend: (latest.lesionCount || 0) > 2 ? "High Risk" : (latest.lesionCount || 0) > 0 ? "Moderate" : "Stable",
              trendUp: (latest.lesionCount || 0) <= 1,
            },
            // ── Card 4: Scan Progress (original) ───────────────
            {
              icon: Activity,
              iconBg: "bg-primary/10",
              iconColor: "text-primary",
              label: "Scan Progress",
              value: scanData.length.toString(),
              unit: "Total",
              barWidth: Math.min(scanData.length * 10, 100),
              trend: "Stable",
              trendUp: true,
            },
          ];
          setStats(dynamicStats);
          setLatestScan(latest);
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
          <Link to="/reports" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <History size={18} />
            <span className="text-sm">Reports</span>
          </Link>
          <Link to="/appointments" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <Calendar size={18} />
            <span className="text-sm">Appointments</span>
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
            <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm flex-shrink-0" style={{ backgroundImage: `url(${normalizeUrl(patient?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Patient')}&background=059669&color=fff&bold=true`})` }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-white">{user?.name || 'Patient'}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">Patient</p>
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

            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Health <span className="text-primary not-italic">Analytics</span></h1>
          </div>


        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-10 space-y-10 w-full max-w-[1500px] mx-auto"
        >
          {/* KPI Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((card, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="text-slate-200" size={20} />
                </div>
                <div className="flex items-start justify-between mb-8">
                  <div className={`p-4 rounded-2xl ${card.iconBg} ${card.iconColor} shadow-sm border border-white`}>
                    <card.icon size={22} strokeWidth={2.5} />
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
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight italic">DR Stage <span className="text-primary">Analysis</span></h4>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Bilateral retinal assessment</p>
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

              {/* DR Stage Info Bar */}
              {(() => {
                const eyeScan = activeEye === 'OD' ? odScan : osScan;
                const stage = eyeScan ? getDRStage(eyeScan.prediction, eyeScan.aiResult) : null;
                const stageLabel = stage !== null ? DR_STAGE_LABELS[stage] : null;
                const stageColor = stage !== null ? DR_STAGE_COLORS[stage] : '#94a3b8';
                return eyeScan ? (
                  <div className="mb-6 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stageColor }} />
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{stageLabel}</span>
                      <span className="text-[10px] font-bold text-slate-400">Stage {stage}/4</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Confidence: <span className="text-slate-700">{((eyeScan.aiConfidence || 0) * 100).toFixed(2)}%</span></span>
                      <span>Lesions: <span className="text-slate-700">{eyeScan.lesionCount ?? 0}</span></span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    No scan data for {activeEye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                  </div>
                );
              })()}

              <div className="relative flex h-[420px] items-center justify-center">
                <svg className="h-full w-full max-w-[420px] drop-shadow-2xl" viewBox="0 0 400 400">
                  {/* Grid rings */}
                  {[1, 0.75, 0.5, 0.25].map((ratio, i) => (
                    <polygon
                      key={i}
                      points={PENTAGON_ANGLES.map(a => {
                        const r = (PENTAGON_ANGLES[0], RADAR_MAX_R) * ratio;
                        const rad = (a * Math.PI) / 180;
                        return `${(RADAR_CX + RADAR_MAX_R * ratio * Math.cos(rad)).toFixed(1)},${(RADAR_CY + RADAR_MAX_R * ratio * Math.sin(rad)).toFixed(1)}`;
                      }).join(' ')}
                      fill="none"
                      stroke={i === 0 ? 'rgba(5,150,105,0.12)' : 'rgba(5,150,105,0.05)'}
                      strokeWidth={i === 0 ? '2' : '1'}
                    />
                  ))}
                  {/* Axis lines */}
                  {PENTAGON_ANGLES.map((a, i) => {
                    const rad = (a * Math.PI) / 180;
                    return <line key={i} x1={RADAR_CX} y1={RADAR_CY} x2={(RADAR_CX + RADAR_MAX_R * Math.cos(rad)).toFixed(1)} y2={(RADAR_CY + RADAR_MAX_R * Math.sin(rad)).toFixed(1)} stroke="rgba(5,150,105,0.08)" strokeWidth="1" />;
                  })}
                  {/* Dynamic data polygon */}
                  {(() => {
                    const eyeScan = activeEye === 'OD' ? odScan : osScan;
                    const pts = buildRadarPolygon(eyeScan);
                    const stage = eyeScan ? getDRStage(eyeScan.prediction, eyeScan.aiResult) : 0;
                    const fillColor = `${DR_STAGE_COLORS[stage]}25`;
                    const strokeColor = DR_STAGE_COLORS[stage];
                    return (
                      <motion.polygon
                        key={activeEye}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', duration: 1.5 }}
                        points={pts}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                    );
                  })()}
                  {/* Axis labels */}
                  <g fontSize="9" fontWeight="800" fill="#94a3b8" textAnchor="middle" style={{ fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <text x="200" y="18">DR Grade</text>
                    <text x="378" y="148" textAnchor="start">Confidence</text>
                    <text x="318" y="372" textAnchor="start">Lesions</text>
                    <text x="82" y="372" textAnchor="end">Risk Score</text>
                    <text x="22" y="148" textAnchor="end">Progression</text>
                  </g>
                  {/* Stage scale ticks */}
                  {[0.25, 0.5, 0.75, 1].map((r, i) => (
                    <text key={i} x={RADAR_CX + 5} y={(RADAR_CY - RADAR_MAX_R * r + 3).toFixed(1)} fontSize="7" fill="#cbd5e1" fontWeight="700">S{i + 1}</text>
                  ))}
                </svg>

                <div className="absolute top-2 right-2 p-4 space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
                  {[0, 1, 2, 3, 4].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <div className="size-2 rounded-full" style={{ backgroundColor: DR_STAGE_COLORS[s] }} />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">S{s}: {DR_STAGE_LABELS[s].split(' ')[0]}</span>
                    </div>
                  ))}
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
                        animate={{ strokeDashoffset: 264 - (264 * (latestScan?.aiConfidence || 0)) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        cx="50" cy="50" r="42" fill="none"
                        stroke={latestScan?.aiConfidence >= 0.7 ? '#f43f5e' : latestScan?.aiConfidence >= 0.4 ? '#f59e0b' : '#059669'}
                        strokeWidth="10" strokeDasharray="264" strokeLinecap="round"
                        className={latestScan?.aiConfidence >= 0.7 ? 'drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'drop-shadow-[0_0_15px_rgba(5,150,105,0.6)]'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <span className="text-6xl font-black tracking-tighter leading-none">
                        {latestScan?.aiConfidence ? (latestScan.aiConfidence * 100).toFixed(2) : '—'}
                        {latestScan?.aiConfidence ? <span className="text-2xl text-primary">%</span> : null}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-3">
                        {latestScan?.aiConfidence >= 0.7 ? 'High Probability' : latestScan?.aiConfidence >= 0.4 ? 'Moderate Probability' : latestScan?.aiConfidence ? 'Low Probability' : 'No Scan Yet'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-12 w-full space-y-4">
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                      <p className="text-xs font-bold text-white/70 leading-relaxed">
                        {latestScan?.prediction
                          ? <>Detected: <span className="text-primary font-black uppercase">{latestScan.prediction}</span> with {((latestScan.aiConfidence || 0) * 100).toFixed(2)}% confidence.</>
                          : 'Run an AI analysis to see your risk assessment here.'}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
