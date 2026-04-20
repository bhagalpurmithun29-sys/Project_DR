import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import api from "../services/api";
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
  Globe,
  Heart,
  Droplets,
  Zap,
  Coffee,
  Calendar,
  AlertCircle,
  Cpu,
  Database,
  BarChart,
  Target,
  Layers,
  Brain,
  Check,
  AlertTriangle,
  ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientPreferencesModal from './PatientPreferencesModal';

const EducationalResources = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isPrimerOpen, setIsPrimerOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [patient, setPatient] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [dbCards, setDbCards] = useState(null);
  const [dbStages, setDbStages] = useState(null);

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

    const loadMedicalResources = async () => {
      try {
        const res = await api.get('/medical-resources');
        if (res.data.success) {
          const data = res.data.data;

          const stages = data.filter(d => d.category === 'stage').map(d => ({
            stage: d.stageLevel,
            title: d.title,
            desc: d.description,
            image: d.imageUrl,
            highlight: d.highlight,
            gallery: d.gallery || [],
            sections: d.sections || []
          }));

          const cardConfig = {
            primer: { icon: Info, iconBg: "bg-primary/10", iconColor: "text-primary", linkText: "Clinical Abstract" },
            protocol: { icon: ShieldCheck, iconBg: "bg-teal-500/10", iconColor: "text-teal-600", linkText: "Management Guide" },
            methodology: { icon: Microscope, iconBg: "bg-amber-500/10", iconColor: "text-amber-600", linkText: " " }
          };

          const cards = data.filter(d => ['primer', 'protocol', 'methodology'].includes(d.category)).map(d => ({
            ...cardConfig[d.category],
            title: d.title,
            desc: d.description,
            category: d.category,
            gallery: d.gallery || []
          }));

          setDbStages(stages);
          setDbCards(cards);
        }
      } catch (err) {
        console.error('Failed to fetch medical resources', err);
      }
    };

    void loadProfile();
    void loadMedicalResources();
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
      linkText: " ",
    },
  ];

  const drStages = [
    {
      stage: "STAGE 01",
      title: "Mild NPDR",
      desc: "Presence of isolated microaneurysms; early-stage focal ballooning of retinal capillaries.",
      image: "/stage1.jpeg",
    },
    {
      stage: "STAGE 02",
      title: "Moderate NPDR",
      desc: "Widespread vascular distortion and incipient leakage; compromised retinal perfusion identified.",
      image: "/stage2.jpeg",
    },
    {
      stage: "STAGE 03",
      title: "Severe NPDR",
      desc: "Extensive capillary non-perfusion; significant increase in intraretinal microvascular abnormalities.",
      image: "/stage3.jpeg",
    },
    {
      stage: "STAGE 04",
      highlight: true,
      title: "Proliferative DR",
      desc: "Advanced neovascularization; fragile vessels prone to vitreous hemorrhage and tractional detachment.",
      image: "/stage4.jpeg",
    },
  ];

  const activeInfoCards = dbCards || infoCards;
  const activeDrStages = dbStages || drStages;

  const filteredInfoCards = activeInfoCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrStages = activeDrStages.filter(stage =>
    stage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Medical <span className="text-primary not-italic">Library</span></h1>
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
            {filteredInfoCards.map((card, idx) => (
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
                  onClick={() => {
                    if (card.title === "Diagnostic Primer") setIsPrimerOpen(true);
                    if (card.title === "Prevention Protocol") setIsProtocolOpen(true);
                    if (card.title === "AI Methodology") setIsMethodologyOpen(true);
                  }}
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
                <h4 className="text-2xl font-black text-slate-900 tracking-tight italic">TYPES OF <span className="text-primary">STAGES</span></h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Staging classification according to ETDRS criteria</p>
              </div>
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors cursor-help">Technical Metadata</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredDrStages.map((stage, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedStage(stage.title)}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <img src={stage.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 p-2 rounded-[2.5rem]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-6 left-6 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-primary text-white shadow-2xl border border-white/20">
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

        </motion.div>

        {/* Footer */}
        <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            © 2024 RetinaAI Medical Systems
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

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <Layers size={18} />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📸 Retinal Imaging Gallery</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {(dbCards?.find(c => c.category === 'primer')?.gallery || []).length > 0
                      ? dbCards.find(c => c.category === 'primer').gallery.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setZoomedImage(img.imageUrl)}
                          className="aspect-square rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 cursor-zoom-in"
                        >
                          <img src={img.imageUrl} alt={img.caption || `Retinal Scan ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                              <ZoomIn size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      ))
                      : ['dpp1.jpeg', 'dpp2.jpeg', 'dpp3.jpeg', 'dpp4.jpeg'].map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setZoomedImage(`/images/${img}`)}
                          className="aspect-square rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 cursor-zoom-in"
                        >
                          <img src={`/images/${img}`} alt={`Retinal Scan ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                              <ZoomIn size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
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

      {/* Prevention Protocol Modal (Management Guide) */}
      <AnimatePresence>
        {isProtocolOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsProtocolOpen(false)}
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
                  <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Prevention Protocol</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-left">ETDRS Management Standards</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProtocolOpen(false)}
                  className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar text-left">
                <section>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic">🛡️ Prevention & Management</h3>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    The Early Treatment Diabetic Retinopathy Study (ETDRS) established that strict systemic control + timely screening are the most effective strategies to prevent onset and slow progression of diabetic retinopathy (DR).
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Glycemic Control */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <Droplets size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🧪 1. Optimal Glycemic Control</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 space-y-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">Primary Pillar: Reducing microvascular damage.</p>
                      <div className="flex items-center gap-4 py-3 border-y border-amber-100/50">
                        <div className="text-2xl font-black text-amber-600">HbA1c &lt; 7%</div>
                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Target</div>
                      </div>
                      <ul className="space-y-2">
                        {['Prevents endothelial damage', 'Reduces microaneurysms', 'Slows capillary leakage'].map(t => (
                          <li key={t} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            <CheckCircle size={14} className="text-amber-500" /> {t}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg inline-block uppercase tracking-wider">
                        1% HbA1c drop = 35% Risk Reduction
                      </p>
                    </div>
                  </section>

                  {/* BP Control */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
                        <Heart size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">💓 2. Blood Pressure Control</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 space-y-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">Second Pillar: decelerating retinal vessel damage.</p>
                      <div className="flex items-center gap-4 py-3 border-y border-rose-100/50">
                        <div className="text-2xl font-black text-rose-600">&lt;130/80</div>
                        <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest">mmHg Target</div>
                      </div>
                      <ul className="space-y-2">
                        {['Reduces stress on capillaries', 'Prevents hemorrhages', 'Decreases vision loss risk'].map(t => (
                          <li key={t} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            <CheckCircle size={14} className="text-rose-500" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Screening Schedule */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Calendar size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">👁️ 3. Regular Retinal Screening</h4>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group space-y-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Recommended Schedule</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Type 1</p>
                            <p className="text-xs font-bold text-white leading-tight">Annual after 5 years</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Type 2</p>
                            <p className="text-xs font-bold text-white leading-tight">Annual from diagnosis</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Diagnostic Methods</p>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                          <Zap size={14} className="text-primary" /> Fundus Photography (AI Analysis)
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                          <Zap size={14} className="text-primary" /> Optical Coherence Tomography (OCT)
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Lifestyle & Lipids */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                        <Activity size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🥗 4. Lifestyle & Lipid Control</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">Lifestyle Impact</h5>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {['Balanced diet', 'Physical activity', 'Smoking cessation', 'Weight mgmt'].map(t => (
                            <li key={t} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                              <div className="size-1 rounded-full bg-emerald-400" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Zap size={12} className="text-primary" /> 5. Lipid Control
                        </h5>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                          High cholesterol contributes to hard exudates. Statins/fibrates may reduce retinal damage risk.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Special Situations */}
                <section className="p-8 rounded-[2.5rem] bg-rose-500 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertCircle size={100} />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-left">⚠️ 6. Special Situations</h4>
                      <p className="text-2xl font-black italic text-left">High-Risk Monitoring Periods</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 text-left">Pregnancy</p>
                        <p className="text-xs font-bold text-left">DR can worsen rapidly; frequent eye exams required.</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 text-left">Long Duration</p>
                        <p className="text-xs font-bold text-left">Increased diabetes duration leads to higher cumulative risk.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center border border-teal-500/20">
                      <Video size={18} />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📹 Prevention Clinical Gallery</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {(dbCards?.find(c => c.category === 'protocol')?.gallery || []).length > 0
                      ? dbCards.find(c => c.category === 'protocol').gallery.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setZoomedImage(img.imageUrl)}
                          className="aspect-video rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-500 cursor-zoom-in"
                        >
                          <img src={img.imageUrl} alt={`Management Protocol ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-teal-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                              <ZoomIn size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      ))
                      : ['ppp1.jpeg', 'ppp2.jpeg', 'ppp3.jpeg', 'ppp4.jpeg', 'ppp5.jpeg', 'ppp6.jpeg'].map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setZoomedImage(`/images/${img}`)}
                          className="aspect-video rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-500 cursor-zoom-in"
                        >
                          <img src={`/images/${img}`} alt={`Management Protocol ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-teal-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                              <ZoomIn size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-teal-600" />
                  ETDRS Gold Standard Protocols
                </p>
                <button
                  onClick={() => setIsProtocolOpen(false)}
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
                >
                  Confirm Awareness
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Methodology Modal (Whitepaper v2.4) */}
      <AnimatePresence>
        {isMethodologyOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsMethodologyOpen(false)}
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
                  <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Microscope size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">AI Methodology</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-left">Whitepaper v2.4 / Engineering Draft</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMethodologyOpen(false)}
                  className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar text-left">
                <section>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic">🤖 RetinaAI Core Architecture</h3>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    RetinaAI uses deep learning—specifically Convolutional Neural Networks (CNNs)—to automatically detect and classify retinal lesions from fundus images with ~98.4% clinical validation accuracy.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* CNN Logic */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Brain size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🧠 Convolutional Neural Networks</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">Spatial Feature Extraction Pipeline:</p>
                      <div className="space-y-3">
                        {[
                          { title: "Input", desc: "Raw Fundus retinal image matrix" },
                          { title: "Convolution", desc: "Detects edges, textures, and subtle lesions" },
                          { title: "Pooling", desc: "Reduces noise while retaining key features" },
                          { title: "Classification", desc: "Fully connected layers for severity grading" }
                        ].map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="text-[10px] font-black text-primary w-4 uppercase tracking-widest">{i + 1}</div>
                            <div>
                              <p className="text-[11px] font-black text-slate-900 dark:text-white mb-0.5">{step.title}</p>
                              <p className="text-[10px] font-medium text-slate-500">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Lesion Detection */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 flex items-center justify-center border border-teal-100 dark:border-teal-500/20">
                        <Target size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">👁️ Lesion Detection Capabilities</h4>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={80} />
                      </div>
                      <ul className="space-y-4 relative z-10">
                        {[
                          'Microaneurysms (Early markers)',
                          'Hemorrhages (Vascular leakage)',
                          'Hard exudates (Lipid deposits)',
                          'Cotton wool spots (Ischemia)',
                          'Neovascularization (Advanced DR)'
                        ].map(t => (
                          <li key={t} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                            <div className="size-1 rounded-full bg-primary" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Model Architecture */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <Layers size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🏗️ Model Architecture Pipeline</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">1. Preprocessing (CLAHE)</h5>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Contrast enhancement and noise reduction to standardize input fundus images.</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">2. Feature Extraction (Backbone)</h5>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Leveraging state-of-the-art backbones: ResNet, EfficientNet, and YOLO for precise localization.</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">3. Post-processing (NMS)</h5>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Confidence thresholding and Non-Max Suppression for refined severity grading.</p>
                      </div>
                    </div>
                  </section>

                  {/* Metrics & Explainability */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                        <BarChart size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📊 Performance & Explainability</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100">
                          <p className="text-2xl font-black text-indigo-600">98.4%</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Accuracy</p>
                        </div>
                        <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100">
                          <p className="text-2xl font-black text-indigo-600">High</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sensitivity</p>
                        </div>
                      </div>
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 space-y-2">
                        <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                          <Eye size={12} className="text-indigo-500" /> Explainability (Grad-CAM)
                        </h5>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                          Grad-CAM heatmaps highlight diagnostic regions, allowing doctors to verify AI predictions and improving overall clinical trust.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Training Strategy */}
                <section className="p-10 rounded-[3rem] bg-slate-900 text-white flex flex-col md:flex-row gap-10 items-center overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                  <div className="relative z-10 flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/50 border border-white/10">
                      <Database size={14} /> Training Metadata
                    </div>
                    <h4 className="text-3xl font-black tracking-tighter italic">Optimization <span className="text-primary not-italic">Engine</span></h4>
                    <p className="text-xs font-medium text-white/40 leading-relaxed">Labeled fundus images optimized via Cross-entropy and IoU / CIoU loss functions.</p>
                  </div>
                  <div className="relative z-10 grid grid-cols-2 gap-4 flex-1 w-full">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Loss</p>
                      <p className="text-xs font-bold">IoU / CIoU</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Metric</p>
                      <p className="text-xs font-bold">mAP @0.5</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                      <Cpu size={18} />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🏗️ Neural Architecture Gallery</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {(dbCards?.find(c => c.category === 'methodology')?.gallery || []).length > 0
                      ? dbCards.find(c => c.category === 'methodology').gallery.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setZoomedImage(img.imageUrl)}
                          className="aspect-square rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 cursor-zoom-in"
                        >
                          <img src={img.imageUrl} alt={`AI Model Pipeline ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                              <ZoomIn size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      ))
                      : ['aim1.jpeg', 'aim2.jpeg', 'aim3.jpeg', 'aim4.jpeg', 'aim5.jpeg', 'aim6.jpeg', 'aim7.jpeg', 'aim8.jpeg'].map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setZoomedImage(`/images/${img}`)}
                          className="aspect-square rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 cursor-zoom-in"
                        >
                          <img src={`/images/${img}`} alt={`AI Model Pipeline ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                              <ZoomIn size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Cpu size={14} className="text-amber-500" />
                  Neural Architecture v2.4.1
                </p>
                <button
                  onClick={() => setIsMethodologyOpen(false)}
                  className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Technical Acknowledged
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mild NPDR Modal (Stage 01) */}
      <AnimatePresence>
        {selectedStage === "Mild NPDR" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedStage(null)}
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
                  <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Eye size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Mild NPDR</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-left">Stage 01 / Early Detection</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar text-left">
                <section>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic">👁️ Non-Proliferative Stage</h3>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    Mild NPDR is the earliest clinically detectable stage of diabetic retinopathy. It is defined by the presence of isolated microaneurysms—tiny outpouchings of retinal capillaries caused by hyperglycemia-induced microvascular damage.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* What are Microaneurysms */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <Microscope size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🔬 What are Microaneurysms?</h4>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={80} />
                      </div>
                      <ul className="space-y-4 relative z-10">
                        {[
                          'Localized saccular dilations of capillary walls',
                          'Usually 10–100 μm in diameter',
                          'Appear as small red dots on fundus',
                          'Located in the inner nuclear layer'
                        ].map(t => (
                          <li key={t} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                            <div className="size-1 rounded-full bg-emerald-400" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Deep Mechanism */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Brain size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🧠 Pathophysiology (Deep Mechanism)</h4>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Pericyte Loss", desc: "High glucose → apoptosis of pericytes. Result: weakened vessel wall → bulging." },
                        { title: "Basement Membrane", desc: "Accumulation of matrix proteins reduces oxygen diffusion and capillary function." },
                        { title: "Endothelial Dysfunction", desc: "Oxidative stress disrupts tight junctions and breaks blood-retinal barrier." }
                      ].map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-black text-slate-900 dark:text-white mb-0.5">{item.title}</p>
                          <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Clinical Features */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                        <Target size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🔍 Clinical Features</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-4">
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-indigo-100/50">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-indigo-400 uppercase">Symptoms</p>
                          <p className="text-[11px] font-bold text-slate-700">Typically asymptomatic</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-indigo-400 uppercase">Vision</p>
                          <p className="text-[11px] font-bold text-slate-700">Remains normal</p>
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Fundus Findings:</p>
                      <ul className="space-y-2">
                        {['Few scattered microaneurysms', 'No significant hemorrhages', 'No hard exudates present'].map(t => (
                          <li key={t} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                            <CheckCircle size={12} className="text-indigo-500" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Diagnostic Appearance */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
                        <Layers size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🧪 Diagnostic Appearance</h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        { title: "Fundus Photography", desc: "Small, round red dots (uniform shape unlike hemorrhages)." },
                        { title: "Fluorescein Angiography", desc: "Shows hyperfluorescence due to dye leakage from MA." },
                        { title: "OCT Imaging", desc: "Usually normal unless early macular edema begins." }
                      ].map((d, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <span className="text-[10px] font-black">{i + 1}</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none mb-1">{d.title}</p>
                            <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{d.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Management Stage */}
                <section className="p-8 rounded-[2.5rem] bg-emerald-600 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck size={100} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-left">🛡️ Management & Monitoring</h4>
                      <p className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Early Intervention</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <p className="text-xl font-black italic text-left">Systemic Control</p>
                        <div className="space-y-2">
                          {['Strict Glucose (HbA1c < 7%)', 'Blood Pressure Mgmt', 'Lipid Regulation'].map(m => (
                            <div key={m} className="flex items-center gap-3 text-xs font-bold text-white/80">
                              <Check size={14} className="text-white" /> {m}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4 border-l border-white/10 pl-10">
                        <p className="text-xl font-black italic text-left">Clinical Schedule</p>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-black text-white/60 uppercase mb-1">Exam Frequency</p>
                          <p className="text-sm font-black">Annual Retinal Exam</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                      <Activity size={18} />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📸 Clinical Manifestations Gallery</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['npdr1.jpeg', 'npdr2.jpeg', 'npdr3.jpeg'].map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setZoomedImage(`/images/${img}`)}
                        className="aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-zoom-in"
                      >
                        <img src={`/images/${img}`} alt={`Mild NPDR Asset ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                            <ZoomIn size={20} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" />
                  Clinical Status: Non-Proliferative
                </p>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
                >
                  Return to Taxonomy
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Moderate NPDR Modal (Stage 02) */}
      <AnimatePresence>
        {selectedStage === "Moderate NPDR" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedStage(null)}
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
                  <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <History size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Moderate NPDR</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-left">Stage 02 / Progressive Damage</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar text-left">
                <section>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic">👁️ Progressive Non-Proliferative Stage</h3>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    Moderate NPDR represents a progressive stage of diabetic retinopathy where retinal microvascular damage becomes more diffuse and clinically significant. It is characterized by widespread vascular abnormalities, increased leakage, and early impairment of retinal perfusion.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Pathological Changes */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <Microscope size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🔬 Key Pathological Changes</h4>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={80} />
                      </div>
                      <ul className="space-y-4 relative z-10">
                        {[
                          'Increased Microaneurysms & Hemorrhages',
                          'Diffuse Widespread Vascular Damage',
                          'Worsening Blood-Retinal Barrier Leakage',
                          'Capillary Non-Perfusion (Localized Ischemia)',
                          'Venous Abnormalities (Early Hypoxia Signs)'
                        ].map(t => (
                          <li key={t} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                            <div className="size-1 rounded-full bg-amber-400" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Pathophysiology */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Brain size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🧠 Pathophysiology (Deeper Insight)</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">🔄 Cycle of Microvascular Damage</p>
                        <div className="space-y-3">
                          {[
                            'Hyperglycemia → Endothelial Injury',
                            'Capillary Breakdown → Leakage',
                            'Capillary Closure → Ischemia',
                            'Ischemia → Early VEGF Release'
                          ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="size-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                {i + 1}
                              </div>
                              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-4 py-3 rounded-2xl inline-block uppercase tracking-wider w-full border border-amber-100 dark:border-amber-900/50">
                        ⚠️ Transition phase toward severe stages
                      </p>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Fundus & Diagnostics */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                        <Target size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🔍 Diagnostic Findings</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-4">
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-indigo-100/50">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-indigo-400 uppercase">Symptoms</p>
                          <p className="text-[11px] font-bold text-slate-700">Blurred Vision / Difficulty</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-indigo-400 uppercase">Risk</p>
                          <p className="text-[11px] font-bold text-slate-700">Increases significantly</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { title: "Fundus Photo", desc: "Clearly visible hemorrhages + widespread microaneurysms." },
                          { title: "Fluorescein", desc: "Areas of capillary dropout and leakage points detected." },
                          { title: "OCT", desc: "Crucial for detecting early diabetic macular edema (DME)." }
                        ].map((d, i) => (
                          <div key={i} className="flex gap-4">
                            <CheckCircle size={14} className="text-indigo-500 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none mb-1">{d.title}</p>
                              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{d.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Clinical Significance */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
                        <Layers size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📊 Clinical Significance</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 space-y-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">Indicates active disease progression and critical risk of:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          'Diabetic Macular Edema (DME)',
                          'Progression to Severe NPDR',
                          'Transition to Proliferative DR (PDR)'
                        ].map(t => (
                          <div key={t} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-100/50">
                            <TrendingUp size={14} className="text-rose-500" />
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{t}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] pt-2">Critical intervention timing required</p>
                    </div>
                  </section>
                </div>

                {/* Management Stage */}
                <section className="p-8 rounded-[2.5rem] bg-amber-600 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck size={100} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-left">🛡️ Management & Strategy</h4>
                      <p className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Stage 02 Control</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <p className="text-xl font-black italic text-left">Systemic & Early Treatment</p>
                        <div className="space-y-2">
                          {['Aggressive Glycemic Control', 'Blood Pressure Regulation', 'Lipid Management', 'Anti-VEGF (if DME develops)'].map(m => (
                            <div key={m} className="flex items-center gap-3 text-xs font-bold text-white/80">
                              <Check size={14} className="text-white" /> {m}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4 border-l border-white/10 pl-10">
                        <p className="text-xl font-black italic text-left">Monitoring Protocol</p>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-black text-white/60 uppercase mb-1">Exam Frequency</p>
                          <p className="text-sm font-black italic">Every 6–12 Months</p>
                          <p className="text-[10px] font-bold mt-2 opacity-60">Depending on clinical findings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                      <History size={18} />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📸 Clinical Progression Gallery</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(dbStages?.find(s => s.title === "Moderate NPDR")?.gallery || []).length > 0
                      ? dbStages.find(s => s.title === "Moderate NPDR").gallery.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setZoomedImage(img.imageUrl)}
                          className="aspect-square rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 cursor-zoom-in"
                        >
                          <img src={img.imageUrl} alt={img.caption || `Moderate NPDR Asset ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                              <ZoomIn size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      ))
                      : ['mndpr1.jpeg', 'mndpr2.jpeg', 'mndpr3.jpeg', 'mndpr4.jpeg', 'mndpr5.jpeg'].map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setZoomedImage(`/images/${img}`)}
                          className="aspect-square rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 cursor-zoom-in"
                        >
                          <img src={`/images/${img}`} alt={`Moderate NPDR Asset ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                              <ZoomIn size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Stethoscope size={14} className="text-amber-500" />
                  Clinical Transition Phase identified
                </p>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
                >
                  Return to Taxonomy
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Severe NPDR Modal (Stage 03) */}
      <AnimatePresence>
        {selectedStage === "Severe NPDR" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedStage(null)}
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
                  <div className="size-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Severe NPDR</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-left">Stage 03 / Pre-Proliferative Warning</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar text-left">
                <section>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic">👁️ Pre-Proliferative Stage</h3>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    Severe NPDR is a critical pre-proliferative stage of diabetic retinopathy, defined by extensive capillary non-perfusion (ischemia) and a marked increase in intraretinal microvascular abnormalities (IRMA). At this point, the retina is under severe oxygen deprivation, creating strong pressure for disease progression.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Core Pathology */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
                        <Microscope size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🔬 Core Pathological Features</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Activity size={80} />
                        </div>
                        <ul className="space-y-4 relative z-10">
                          {[
                            'Extensive Capillary Non-Perfusion',
                            'Intraretinal Microvascular Abnormalities (IRMA)',
                            'Significant Venous Beading & Tortuosity',
                            'Severe Retinal Hypoxia (Oxygen deprivation)'
                          ].map(t => (
                            <li key={t} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                              <div className="size-1 rounded-full bg-rose-500" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                          💡 Key Distinction
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                          IRMA stay <strong>inside</strong> the retina, while neovascularization (in PDR) grows <strong>on the surface</strong>.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 4-2-1 Rule */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <BarChart size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📏 Diagnostic Criterion: “4-2-1 Rule”</h4>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-6">
                      <p className="text-[11px] font-bold text-slate-500 italic">Severe NPDR is diagnosed if any ONE of the following is present:</p>
                      <div className="space-y-3">
                        {[
                          { val: "4", unit: "Quadrants", desc: "Severe hemorrhages + microaneurysms" },
                          { val: "2", unit: "Quadrants", desc: "Significant Venous beading" },
                          { val: "1", unit: "Quadrant", desc: "Prominent IRMA channels" }
                        ].map((rule, i) => (
                          <div key={i} className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                            <div className="text-3xl font-black text-primary">{rule.val}</div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rule.unit}</p>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{rule.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-medium text-primary text-center leading-relaxed">
                          Predicts very high risk of transition to Proliferative DR (PDR).
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Pathophysiology */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <Brain size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🧠 Pathophysiology (Tipping Point)</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 space-y-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">Reflects severe microvascular compromise:</p>
                      <div className="space-y-2">
                        {[
                          'Chronic Hyperglycemia → Endothelial Damage',
                          'Extensive Capillary Closure → Retinal Ischemia',
                          'Ischemia → Massive Release of VEGF signaling',
                          'Compensatory IRMA and Venous Remodeling'
                        ].map(t => (
                          <div key={t} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-100/50">
                            <TrendingUp size={14} className="text-amber-500" />
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Clinical & Significance */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                        <Target size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📊 Clinical Significance</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-6">
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-indigo-100/50">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-indigo-400 uppercase">Progression Risk</p>
                          <p className="text-[11px] font-bold text-slate-700">~50% within 1 year</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-indigo-400 uppercase">Symptoms</p>
                          <p className="text-[11px] font-bold text-slate-700">Often asymptomatic</p>
                        </div>
                      </div>
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 space-y-2">
                        <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                          ⚠️ Danger Zone
                        </h5>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                          Significant retinal damage may already be present despite minimal symptoms. Reduced contrast sensitivity and mild blurring are critical warning signs.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Management Stage */}
                <section className="p-8 rounded-[2.5rem] bg-rose-600 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck size={100} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-left">🛡️ Management & Strategy</h4>
                      <p className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Stage 03 Intervention</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <p className="text-xl font-black italic text-left">Aggressive Treatment</p>
                        <div className="space-y-2">
                          {['HbA1c < 7% (Systemic)', 'Panretinal Photocoagulation (PRP)', 'Anti-VEGF Therapy if needed'].map(m => (
                            <div key={m} className="flex items-center gap-3 text-xs font-bold text-white/80">
                              <Check size={14} className="text-white" /> {m}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4 border-l border-white/10 pl-10">
                        <p className="text-xl font-black italic text-left">Urgent Monitoring</p>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-black text-white/60 uppercase mb-1">Exam Frequency</p>
                          <p className="text-sm font-black italic">Every 3–6 Months</p>
                          <p className="text-[10px] font-bold mt-2 opacity-60">Critical for preventing vision loss</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
                      <AlertCircle size={18} />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📸 Pre-Proliferative Clinical Gallery</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {['sndpr2.jpeg', 'sndpr3.jpeg', 'sndpr4.jpeg', 'sndpr5.jpeg', 'sndpr6.jpeg', 'snpdr1.jpeg'].map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setZoomedImage(`/images/${img}`)}
                        className="aspect-video rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500 cursor-zoom-in"
                      >
                        <img src={`/images/${img}`} alt={`Severe NPDR Asset ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-rose-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                            <ZoomIn size={20} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-500" />
                  Pre-Proliferative Stage Confirmed
                </p>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
                >
                  Return to Taxonomy
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Proliferative DR Modal (Stage 04) */}
      <AnimatePresence>
        {selectedStage === "Proliferative DR" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedStage(null)}
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
                  <div className="size-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Proliferative DR</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-left">Stage 04 / Advanced Critical Stage</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar text-left">
                <section>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic">🚨 Proliferative Advanced Phase</h3>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    Proliferative Diabetic Retinopathy (PDR) is the most advanced and vision-threatening stage of diabetic retinopathy. It is defined by pathological neovascularization—the growth of fragile, abnormal new blood vessels in response to severe retinal ischemia.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Neovascularization hallmark */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-500/20">
                        <Microscope size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🌱 Neovascularization (Hallmark)</h4>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={80} />
                      </div>
                      <div className="space-y-4 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">NVD</p>
                            <p className="text-xs font-bold text-white leading-tight">Growth on Optic Disc</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">NVE</p>
                            <p className="text-xs font-bold text-white leading-tight">Growth Elsewhere</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {['Thin, tangled vascular networks', 'Grow along retina & into vitreous', 'Lack normal vessel integrity'].map(t => (
                            <li key={t} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                              <div className="size-1 rounded-full bg-red-500" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Complications */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
                        <AlertTriangle size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">⚠️ Major Complications</h4>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Vitreous Hemorrhage", desc: "Fragile vessels rupture → bleed into vitreous. Symptoms: Sudden floaters or dark vision." },
                        { title: "Retinal Detachment", desc: "Fibrous tissue contracts and pulls the retina away, risking permanent blindness." },
                        { title: "Neovascular Glaucoma", desc: "New vessels on iris block aqueous outflow, increasing intraocular pressure." }
                      ].map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-black text-slate-900 dark:text-white mb-0.5">{item.title}</p>
                          <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Pathophysiology */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Brain size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🔁 Disease Cascade (Advanced)</h4>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="space-y-4">
                        {[
                          'Chronic Hyperglycemia → Capillary Closure',
                          'Extensive Retinal Ischemia (No Oxygen)',
                          'Massive Release of Angiogenic Factors (VEGF)',
                          'VEGF stimulates abnormal Neovascularization'
                        ].map((step, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="size-6 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Features & Emergency */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                        <Target size={18} />
                      </div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">🧠 Clinical Features</h4>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-4">
                      <div className="space-y-2">
                        {['Sudden or severe vision loss', 'Floaters (black spots or cobwebs)', 'Blurred or distorted vision'].map(t => (
                          <div key={t} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/50">
                            <TrendingUp size={14} className="text-indigo-500" />
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{t}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-red-500 text-white rounded-2xl text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest">Medical Emergency</p>
                        <p className="text-xs font-bold mt-1">Immediate evaluation required</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Management Stage */}
                <section className="p-8 rounded-[2.5rem] bg-red-600 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck size={100} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-left">💊 Urgent & Aggressive Management</h4>
                      <p className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Stage 04 Crisis</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <p className="text-xl font-black italic text-left">Therapeutic Options</p>
                        <div className="space-y-3">
                          {[
                            { t: 'Anti-VEGF Therapy', d: 'Reduces neovascularization' },
                            { t: 'Panretinal Photocoagulation (PRP)', d: 'Destroys ischemic retina via laser' },
                            { t: 'Vitrectomy', d: 'Surgical removal of blood/tissue' }
                          ].map(m => (
                            <div key={m.t} className="flex items-start gap-3">
                              <Zap size={14} className="text-white mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-black">{m.t}</p>
                                <p className="text-[10px] font-bold text-white/60">{m.d}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4 border-l border-white/10 pl-10">
                        <p className="text-xl font-black italic text-left">Clinical Alert</p>
                        <div className="p-5 bg-white/10 rounded-2xl border border-white/10 space-y-2">
                          <p className="text-[10px] font-black text-white/60 uppercase">Protocol</p>
                          <p className="text-sm font-black">Urgent Vitreo-Retinal evaluation</p>
                          <p className="text-[10px] font-medium opacity-60">Wait time: &lt; 24-48 hours for acute loss</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20">
                      <AlertCircle size={18} />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">📸 Advanced Clinical Gallery</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {['pdr1.jpeg', 'pdr2.jpeg', 'pdr3.jpeg', 'pdr4.jpeg', 'pdr5.jpeg', 'pdr6.jpeg'].map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setZoomedImage(`/images/${img}`)}
                        className="aspect-video rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group relative shadow-sm hover:shadow-xl hover:shadow-red-500/10 transition-all duration-500 cursor-zoom-in"
                      >
                        <img src={`/images/${img}`} alt={`Proliferative DR Asset ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <div className="size-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-red-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                            <ZoomIn size={20} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Stethoscope size={14} className="text-red-500" />
                  Advanced Proliferative Phase
                </p>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
                >
                  Return to Taxonomy
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Zoomed Image Lightbox */}
      <AnimatePresence>
        {zoomedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-10 cursor-zoom-out"
              onClick={() => setZoomedImage(null)}
            >
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-10 right-10 size-14 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[210]"
                onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
              >
                <X size={28} />
              </motion.button>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative max-w-5xl w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={zoomedImage}
                  alt="Zoomed Retinal Asset"
                  className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl border border-white/10"
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationalResources;
