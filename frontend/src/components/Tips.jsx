import React, { useState, useContext } from "react";
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
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EducationalResources = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600",
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
    <div className="min-h-screen bg-[#f8fafc] font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-72 bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 hidden lg:flex flex-col z-50">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 italic uppercase leading-none">RetinaAI</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Patient Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
            <LayoutDashboard size={18} />
            <span className="text-sm">Overview</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
            <BarChart3 size={18} />
            <span className="text-sm">Health Analytics</span>
          </Link>
          <Link to="/scan-history" className="flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
            <History size={18} />
            <span className="text-sm">Scan Archive</span>
          </Link>
          <Link to="/tips" className="flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/25 transition-all">
            <BookOpen size={18} strokeWidth={2.5} />
            <span className="text-sm">Medical Library</span>
          </Link>
          <div className="pt-8 mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">System</div>
          <button className="w-full flex items-center gap-3 px-4 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-all group">
            <Settings size={18} />
            <span className="text-sm">Preferences</span>
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
              <p className="text-lg font-medium text-slate-500 leading-relaxed italic">Access professional-grade guidance on Diabetic Retinopathy management, clinical classifications, and AI-assisted diagnostic methodologies.</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-3xl flex gap-2">
              <button className="px-6 py-3 bg-white shadow-sm rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary">All Resources</button>
              <button className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Clinical Focus</button>
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
                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:text-primary transition-colors border-t border-slate-50 pt-6 w-full">
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
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] translate-y-24 -translate-x-24" />

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
    </div>
  );
};

export default EducationalResources;