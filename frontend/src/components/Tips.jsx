import React, { useState, useContext } from "react";
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
  BookOpen,
  Info,
  ShieldCheck,
  Microscope,
  CheckCircle,
  Download,
  Video,
  FileText,
  ArrowRight,
  Stethoscope,
  BarChart3,
  Search,
  ArrowUpRight,
  Plus,
  Play,
  X,
  TrendingUp,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientPreferencesModal from './PatientPreferencesModal';

const EducationalResources = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isPrimerOpen, setIsPrimerOpen] = useState(false);
  const [patient, setPatient] = useState(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await patientService.getMyProfile();
        if (res.success) {
          setPatient(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };

    void loadProfile();
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

  const infoCards = [
    {
      icon: Info,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      title: "Diagnostic Primer",
      desc: "Diabetic retinopathy manifests through microvascular deterioration in the retinal tissue. Understanding the underlying pathophysiology is critical for effective management.",
      linkText: "Clinical Abstract",
    },
    {
      icon: ShieldCheck,
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-600",
      title: "Prevention Protocol",
      desc: "Optimal glycemic control and regular blood pressure monitoring are the cornerstones of preventing disease progression according to ETDRS standards.",
      linkText: "Management Guide",
    },
    {
      icon: Microscope,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      title: "AI Methodology",
      desc: "RetinaAI leverages deep convolutional neural networks to identify subtle lesion patterns with 98.4% clinical validation accuracy.",
      linkText: "Whitepaper v2.4",
    },
  ];

  const drStages = [
    {
      stage: "STAGE 01",
      title: "Mild NPDR",
      desc: "Presence of isolated microaneurysms; early-stage focal ballooning of retinal capillaries.",
      image: "https://images.unsplash.com/photo-1576091160550-2173599211d0?w=500&auto=format",
    },
    {
      stage: "STAGE 02",
      title: "Moderate NPDR",
      desc: "Widespread vascular distortion and incipient leakage; compromised retinal perfusion identified.",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format",
    },
    {
      stage: "STAGE 03",
      title: "Severe NPDR",
      desc: "Extensive capillary non-perfusion; significant increase in intraretinal microvascular abnormalities.",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=500&auto=format",
    },
    {
      stage: "STAGE 04",
      highlight: true,
      title: "Proliferative DR",
      desc: "Advanced neovascularization; fragile vessels prone to vitreous hemorrhage and tractional detachment.",
      image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format",
    },
  ];

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
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
            <LayoutDashboard size={16} />
            <span className="text-sm">Patient Dashboard</span>
          </button>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
            <Activity size={16} />
            <span className="text-sm">Health Analytics</span>
          </Link>
          <Link to="/scan-history" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
            <History size={16} />
            <span className="text-sm">Reports</span>
          </Link>
          <Link to="/tips" className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 transition-all">
            <BookOpen size={16} strokeWidth={2.5} />
            <span className="text-sm">Medical Library</span>
          </Link>

          <div className="pt-8 mb-4">
            <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">System</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group"
            >
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5 text-left">
            <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm flex-shrink-0" style={{ backgroundImage: `url(${patient?.photo && patient.photo !== 'default-patient.jpg' ? patient.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Patient')}&background=059669&color=fff&bold=true`})` }}></div>
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
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Knowledge Hub / <span className="text-primary italic">Library</span></h2>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Medical <span className="text-primary not-italic">Resources</span></h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
              <input
                className="w-72 pl-16 pr-6 py-4 bg-slate-100/60 border-none rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all shadow-inner"
                placeholder="Search medical database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="h-12 px-6 bg-white border-2 border-slate-100 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm text-slate-600">
              <Download size={16} />
              Archive Guidelines
            </button>
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-10 space-y-16 w-full max-w-[1500px] mx-auto"
        >
          {/* Welcome Intro */}
          <motion.section variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">Evidence Based <span className="text-primary not-italic">Ophthalmology</span></h3>
              <p className="text-lg font-medium text-slate-500 leading-relaxed italic">Access Doctor-grade guidance on Diabetic Retinopathy management, clinical classifications, and AI-assisted diagnostic methodologies.</p>
            </div>

          </motion.section>

          {/* Feature Grid */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {infoCards.map((card, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-primary/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  <card.icon size={100} />
                </div>
                <div className={`size-14 rounded-2xl ${card.iconBg} flex items-center justify-center mb-8 shadow-sm border border-white`}>
                  <card.icon className={card.iconColor} size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight italic">{card.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm mb-10 italic">{card.desc}</p>
                <button 
                  onClick={() => card.title === "Diagnostic Primer" ? setIsPrimerOpen(true) : null}
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:text-primary transition-colors border-t border-slate-50 pt-6 w-full"
                >
                  {card.linkText}
                  <ArrowUpRight size={16} strokeWidth={3} className="ml-auto" />
                </button>
              </div>
            ))}
          </motion.section>

          {/* Video / Gallery Section */}
          <motion.section variants={itemVariants} className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight italic">Progression <span className="text-primary">Taxonomy</span></h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Staging classification according to ETDRS criteria</p>
              </div>
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors cursor-help">Technical Metadata</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {drStages.map((stage, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col">
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <img src={stage.image} alt={stage.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 p-2 rounded-[2.5rem]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={`absolute top-6 left-6 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md shadow-2xl border border-white/20 ${stage.highlight ? 'bg-primary text-white' : 'bg-white/80 text-slate-900'}`}>
                      {stage.stage}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="size-12 bg-white rounded-full flex items-center justify-center shadow-2xl text-primary scale-0 group-hover:scale-100 transition-transform duration-500">
                        <Plus size={24} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-3 flex-1">
                    <h4 className="text-lg font-black text-slate-900 tracking-tight italic group-hover:text-primary transition-colors">{stage.title}</h4>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed italic line-clamp-3">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Deep Focus Section */}
          <motion.div variants={itemVariants} className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -translate-y-12 translate-x-12 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] translate-y-24 -translate-x-24" />

            <div className="relative z-10 flex-1 space-y-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border border-white/10">
                <Stethoscope size={16} className="text-primary" />
                Clinical Protocols
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl font-black tracking-tighter leading-[0.9] italic">2024 Practice <br /><span className="text-primary not-italic">Standards</span></h2>
                <p className="text-white/40 text-lg font-medium max-w-xl leading-relaxed italic">
                  Complete access to the 2024 AAO Diabetic Retinopathy Preferred Practice Patterns used to calibrate our AI neural architecture.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 pt-4 border-t border-white/5">
                {[
                  "Screening frequency matrix",
                  "Anti-VEGF clinical indicators",
                  "Laser photocoagulation standards",
                  "Hemoglobin A1c correlation"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/60 group/item">
                    <CheckCircle size={18} className="text-primary group-hover/item:scale-125 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 pt-6">
                <button className="h-14 px-10 bg-white text-slate-900 font-black rounded-2xl shadow-2xl shadow-black/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 text-[11px] uppercase tracking-widest">
                  <Download size={18} strokeWidth={2.5} />
                  Download PDF
                </button>
                <button className="h-14 px-10 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 text-[11px] uppercase tracking-widest group/play">
                  <Play size={18} className="group-hover/play:fill-white transition-all" />
                  Clinical Briefing
                </button>
              </div>
            </div>

            <div className="w-full lg:w-96 relative perspective-1000 hidden xl:block">
              <motion.div
                animate={{ rotateY: [0, 5, 0], rotateX: [2, 0, 2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="aspect-[3/4] bg-white text-slate-900 rounded-[2.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col group/doc relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="flex-1 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-6 text-center group-hover/doc:border-primary/20 transition-colors">
                  <div className="size-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 group-hover/doc:text-primary group-hover/doc:bg-primary/5 transition-all">
                    <FileText size={40} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Protected Draft</p>
                    <p className="text-lg font-black tracking-tight leading-tight italic">Clinical Guidelines<br />Revision 2024.4</p>
                  </div>
                </div>
                <div className="mt-10 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="size-8 rounded-full bg-slate-100 border-2 border-white shadow-sm" />
                    ))}
                  </div>
                  <ShieldCheck className="text-primary opacity-20" size={24} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            © 2024 RetinaAI Medical Systems / v2.4.1-STABLE / Node {user?._id?.substring(0, 8) || "882B-7"}
          </p>
        </footer>
      </main>
      <PatientPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        user={user}
      />

      {/* Diagnostic Primer Modal */}
      <AnimatePresence>
        {isPrimerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsPrimerOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed top-[5%] bottom-[5%] left-1/2 -translate-x-1/2 z-[110] w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
            >
              {/* Modal Header */}
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Diagnostic Primer</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">RetinaAI Medical Library</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPrimerOpen(false)}
                  className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar text-left">
                <section>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic">Diabetic Retinopathy (DR)</h3>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    Diabetic retinopathy is a microvascular complication of diabetes mellitus that affects the retina—the light-sensitive tissue at the back of the eye. It is one of the leading causes of preventable blindness worldwide, especially in working-age adults.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <Activity size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🔬 Pathophysiology (What actually happens?)</h4>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Microvascular Damage", desc: "High glucose → damage to endothelial cells and pericytes. Loss of pericytes weakens vessel walls, making capillaries leaky and fragile." },
                        { title: "Capillary Occlusion", desc: "Thickening of basement membrane leads to reduced blood flow, causing retinal ischemia (lack of oxygen)." },
                        { title: "Increased Permeability", desc: "Breakdown of the blood-retinal barrier allows fluid and lipids to leak into the retina, causing macular edema." },
                        { title: "Neovascularization", desc: "Advanced stage: Ischemia triggers release of VEGF, forming abnormal blood vessels prone to bleeding." }
                      ].map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{item.title}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <TrendingUp size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📊 Stages of Diabetic Retinopathy</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20">
                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">01. NPDR</p>
                        <h5 className="text-lg font-black text-slate-900 dark:text-white mb-2">Non-Proliferative Stage</h5>
                        <ul className="grid grid-cols-2 gap-2">
                          {['Microaneurysms', 'Hemorrhages', 'Hard exudates', 'Cotton wool spots'].map(t => (
                            <li key={t} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                              <div className="size-1 rounded-full bg-emerald-400" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20">
                        <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-3">02. PDR</p>
                        <h5 className="text-lg font-black text-slate-900 dark:text-white mb-2">Proliferative Stage</h5>
                        <ul className="space-y-2">
                          {['Abnormal neovascularization', 'Vitreous hemorrhage', 'Tractional retinal detachment'].map(t => (
                            <li key={t} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                              <div className="size-1 rounded-full bg-rose-400" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <section className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group text-left">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Info size={80} />
                    </div>
                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 text-left">⚠️ Key Clinical Features</h4>
                    <ul className="space-y-4">
                      {[
                        'Blurred or fluctuating vision',
                        'Dark spots or floaters',
                        'Impaired color vision',
                        'Vision loss (in severe cases)',
                        'Often asymptomatic in early stages'
                      ].map(t => (
                        <li key={t} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                          <div className="size-1.5 rounded-full bg-primary" /> {t}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 text-left">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-left">🧪 Diagnostic Methods</h4>
                    <div className="space-y-5">
                      {[
                        { icon: Eye, title: "Fundus Examination", desc: "Direct visualization of retina using ophthalmoscopy." },
                        { icon: BookOpen, title: "Fundus Photography", desc: "Used in AI/ML models (like your project 👀) for autonomous screening." },
                        { icon: Globe, title: "Optical Coherence Tomography", desc: "Detects macular edema with high precision." },
                        { icon: FileText, title: "Fluorescein Angiography", desc: "Identifies leakage and retinal ischemia." }
                      ].map((m, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <m.icon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1 text-left">{m.title}</p>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-left">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  Peer-Reviewed Clinical Data
                </p>
                <button 
                  onClick={() => setIsPrimerOpen(false)}
                  className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationalResources;
