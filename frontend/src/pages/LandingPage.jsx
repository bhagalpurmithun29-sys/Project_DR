import { useState, useEffect, useRef } from "react";
import {
  Eye,
  Menu,
  X,
  Zap,
  Microscope,
  FileText,
  ShieldCheck,
  ArrowRight,
  Globe,
  Linkedin,
  ChevronRight,
  Github,
  Twitter
} from "lucide-react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" }
];

const FEATURE_CARDS = [
  {
    icon: <Zap className="text-white" size={28} />,
    title: "Fast AI Detection",
    desc: "Instant screening results in under 5 seconds with high sensitivity and specificity. Reduce patient wait times significantly.",
    link: "Learn more",
  },
  {
    icon: <Microscope className="text-white" size={28} />,
    title: "Lesion Segmentation",
    desc: "Precise visual mapping of microaneurysms, hemorrhages, and exudates using voxel-level precision modeling.",
    link: "View demo",
  },
  {
    icon: <FileText className="text-white" size={28} />,
    title: "Clinical Reports",
    desc: "Automated generation of detailed PDF reports compatible with EMR systems for seamless clinical integration.",
    link: "Sample report",
  },
];

const FOOTER_COLS = [
  {
    heading: "Product",
    links: ["Detection Engine", "Reporting Tools", "API Documentation", "Integration Guide"],
  },
  {
    heading: "Company",
    links: ["About Us", "Research Papers", "Careers", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Service", "HIPAA Compliance", "Cookie Settings"],
  },
];

const DOCTOR_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBi4ZUxJZx361dxhCt_ZNNK5K77WNq4ODA3Fzhb6dHxeciedZqUrkvvh2n5JKfLDFubuK9T-nqOIMXaomDq_tAbtV3NRaMtdYQBk0VOpND2jXcW1AJ2rglsxwt-ra4ebEyY7GUwxaIC0UJq9o3Hfn16xPZ_QKzPxgGzucELH_LFJ38M_ZoctRxEpQ2AbeUJUKfM8oJfiuR6XQgp99aJS3xw27gCJOqdUSB0fKbN3haodxhJTnoEhnRgWXkFsXIQKCT6onpcIlzvlVmf",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCrdLYY_l2eh_dRiITkRI8iLBxWmppEQ2l_yyL-YZk5Mlua04O1RpiHh_dbjM2iPPNTqeJuBySKBBjz6CPs3B7yrLHkAIzYxXlT3644hfnNyHLmex1J6-F4QDFVGXjD4cPW-7KfIVp_9Hr7nA7IQ1KfZFxYRg2J7PAdXCF1I3POhR95PL9t9IFULJg5KB0tuB94UKMCYLBJRT6GioIenhntYTnnfoy0OhJrIpby183ncsMm-Xj0dn6WOTJSLTEFuF0BAUav50RFty2j",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCWurH7np9JVTTMX5awLBrg7FlxFjTtLv1wxgh6Mn-efAyQDxO1SAxMhSYrYU3NXdxlofDg1gwyGTc5XNZ19W_V7Zw8iQi8tMivRcPi-vqCi-nuOVAqrSAAqlRaHI_qn-8VI0XRfODiD9QUB9EFH9-C__8J7CIrAck3ntuJpWBGgJxRFIwbBRuvOeAuKId_rfqSJEFtGBVdWSUgMCdLaXe-p6wnAzFO24Hn0uXOux5cjA63lpMuVr4etM2HpImbha_3KNYWYHkoevXi",
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Smooth spring values for the image pan (follows cursor toward card center offset)
  const imgX = useSpring(0, { stiffness: 55, damping: 18 });
  const imgY = useSpring(0, { stiffness: 55, damping: 18 });

  // Smooth spring values for card 3-D tilt
  const tiltX = useSpring(0, { stiffness: 45, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 45, damping: 20 });

  // Ref so we can read the card's current screen position
  const cardRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // ── 3-D tilt: normalised -1 → 1 across viewport ──
      tiltX.set(((clientX / innerWidth) - 0.5) * 30);
      tiltY.set(((clientY / innerHeight) - 0.5) * -30);

      // ── Eye-follow: vector from card centre to cursor ──
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Ramp up travel smoothly over the first 500 px from the card centre
      const maxTravel = 30;
      const norm = Math.min(dist, 500) / 500;
      imgX.set((dx / dist) * norm * maxTravel);
      imgY.set((dy / dist) * norm * maxTravel);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [imgX, imgY, tiltX, tiltY]);

  // Handle disabling body scroll during intro
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showIntro]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-main font-display text-slate-900 antialiased overflow-x-hidden">

      {/* ── CINEMATIC INTRO ANIMATION ── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950 overflow-hidden"
          >
            {/* Cinematic background glow */}
            <motion.div
              className="absolute inset-0 bg-primary/5 blur-[100px]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />

            <motion.div
              // Step 1: Pulse (0-1.5s) -> Step 2: Rotate & Morph (1.5s-2.5s) -> Step 3: Fast open/scale out (2.5s-3s)
              animate={{
                scale: [0.8, 1, 0.8, 1, 1.2, 5],
                rotate: [0, 0, 0, 180, 180, 180],
                opacity: [1, 1, 1, 1, 1, 0],
              }}
              transition={{
                duration: 3,
                times: [0, 0.2, 0.4, 0.7, 0.8, 1],
                ease: "easeInOut",
              }}
              style={{ willChange: "transform, opacity" }}
              onAnimationComplete={() => setShowIntro(false)}
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-white shadow-[0_0_60px_-15px_rgba(5,150,105,0.6)]"
            >
              <Eye size={40} strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        {/* ── NAVBAR ── */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 transition-transform group-hover:scale-110">
                <Eye size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">RetinaAI</span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-bold text-slate-500 transition-all hover:text-primary hover:scale-105"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="hidden text-sm font-bold text-slate-700 transition-colors hover:text-primary sm:block"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
              >
                Get Started
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-slate-100 bg-white px-6 py-6 md:hidden"
              >
                <div className="flex flex-col gap-4">
                  {NAV_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="text-base font-bold text-slate-600 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="h-px bg-slate-100 my-2" />
                  <Link to="/login" className="text-base font-bold text-slate-900">Login</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <main>
          {/* ── HERO ── */}
          <section className="relative overflow-hidden px-6 py-20 lg:px-12 lg:py-32">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-200 h-200 bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-150 h-150 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row"
            >
              {/* ── LEFT CONTENT ── */}
              <div className="flex flex-1 flex-col items-start gap-8 relative z-10">
                <motion.div
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary border border-primary/10 shadow-sm"
                >
                  <ShieldCheck size={16} strokeWidth={2.5} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Clinical Grade AI v4.0
                  </span>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-6xl font-black leading-[1.05] tracking-tight text-slate-900 lg:text-8xl"
                >
                  Visionary <br />
                  <span className="text-primary italic">Precision</span> AI
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="max-w-xl text-xl leading-relaxed text-slate-500 font-medium"
                >
                  Automated, state-of-the-art screening for diabetic retinopathy. Empowering clinicians with instant, voxel-level diagnostic insights.
                </motion.p>

                <motion.div variants={itemVariants} className="flex items-center gap-6 pt-6">
                  <div className="flex -space-x-4">
                    {DOCTOR_AVATARS.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Doctor"
                        className="h-12 w-12 rounded-full border-4 border-white object-cover shadow-lg"
                      />
                    ))}
                    <div className="h-12 w-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shadow-lg">
                      +500
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-amber-400 mb-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          key={i}
                        >★</motion.span>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-slate-500">
                      Trusted by <span className="text-slate-900">Top Medical Facilities</span>
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* ── RIGHT VISUAL ── */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                className="relative flex flex-1 items-center justify-center lg:justify-end"
              >
                <div className="relative group">
                  {/* Decorative rings */}
                  <div className="absolute inset-0 -m-8 rounded-full border-2 border-primary/20 border-dashed animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-0 -m-16 rounded-full border border-slate-200 pointer-events-none" />

                  {/* Card — circular, 3-D tilt from global spring */}
                  <motion.div
                    ref={cardRef}
                    className="relative h-80 w-80 lg:h-130 lg:w-130 overflow-hidden rounded-full"
                    style={{
                      rotateY: tiltX,
                      rotateX: tiltY,
                      transformPerspective: 1000,
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ scale: { duration: 40 } }}
                  >
                    {/* ── z-0: Retina image, oversized so pan never shows edges ── */}
                    <motion.div
                      className="absolute z-0 pointer-events-none"
                      style={{
                        top: "-10%",
                        left: "-10%",
                        width: "120%",
                        height: "120%",
                        x: imgX,
                        y: imgY,
                      }}
                    >
                      <img
                        src="/retina_scan.png"
                        alt="Retina Scan"
                        className="h-full w-full object-cover"
                      />
                    </motion.div>

                    {/* ── z-10: Colour tint overlay ── */}
                    <div className="absolute inset-0 z-10 bg-primary/10 mix-blend-overlay group-hover:bg-transparent transition-all duration-700 pointer-events-none" />



                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* ── FEATURES ── */}
          <section id="features" className="bg-white px-6 py-24 lg:px-12 lg:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="mb-20 text-center max-w-3xl mx-auto">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-xs font-black uppercase tracking-[0.3em] text-primary"
                >
                  Key Capabilities
                </motion.h2>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 text-4xl font-black text-slate-900 lg:text-5xl tracking-tight"
                >
                  Next-Gen Diagnostic Suite
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-lg text-slate-500 font-medium leading-relaxed"
                >
                  Proprietary neural networks trained on millions of clinical markers to deliver instant precision in Retina.
                </motion.p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {FEATURE_CARDS.map((card, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={card.title}
                    className="group flex flex-col gap-8 rounded-[2.5rem] bg-[#f8fafc] border border-slate-100 p-10 hover:bg-white hover:border-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{card.title}</h4>
                      <p className="mt-4 text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                    </div>
                    <div className="mt-auto pt-4 flex items-center gap-2 font-black text-sm text-primary">
                      {card.link}
                      <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── STATS ── */}
          <section className="bg-sidebar py-24 px-6 lg:px-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(5,150,105,0.1),transparent_70%)]" />
            <div className="mx-auto max-w-7xl relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {[
                { val: "98.2%", label: "Model Accuracy" },
                { val: "500k+", label: "Scans Processed" },
                { val: "< 2s", label: "Inference Time" },
                { val: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                    className="text-4xl lg:text-6xl font-black text-white mb-2"
                  >
                    {stat.val}
                  </motion.div>
                  <div className="text-xs font-black uppercase tracking-widest text-primary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-[4rem] bg-primary px-8 py-20 text-center lg:py-32 shadow-[0_40px_100px_-20px_rgba(5,150,105,0.4)]"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

              <div className="relative z-10 mx-auto max-w-3xl">
                <h2 className="text-4xl font-black text-white lg:text-7xl leading-tight tracking-tight">
                  Empower your <br />
                  clinical workflow.
                </h2>
                <p className="mt-8 text-xl text-white/80 font-medium">
                  Join thousands of medical Doctors using AI to prevent blindness and improve patient outcomes through early detection.
                </p>
                <div className="mt-12 flex flex-wrap justify-center gap-6">
                  <Link
                    to="/register"
                    className="rounded-2xl bg-white px-12 py-5 text-lg font-black text-primary shadow-2xl transition-transform hover:scale-105 active:scale-95"
                  >
                    Get Started For Free
                  </Link>
                  <button className="rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md px-12 py-5 text-lg font-black text-white transition-all hover:bg-white/20">
                    Contact Specialist
                  </button>
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-100 bg-white px-6 py-20 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <Link to="/" className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                    <Eye size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-900">RetinaAI</span>
                </Link>
                <p className="text-lg leading-relaxed text-slate-500 font-medium max-w-sm">
                  Redefining ophthalmic diagnostics through medical-grade artificial intelligence.
                </p>
                <div className="flex gap-4 mt-8">
                  {[Twitter, Github, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>

              {FOOTER_COLS.map((col) => (
                <div key={col.heading}>
                  <h5 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">
                    {col.heading}
                  </h5>
                  <ul className="space-y-4 font-bold text-slate-500">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-sm transition-colors hover:text-primary flex items-center gap-2 group"
                        >
                          <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col items-center justify-between gap-6 md:flex-row">
              <p className="text-sm font-bold text-slate-400">
                © 2024 RetinaAI Systems Inc.
              </p>
              <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
                <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                <div className="flex items-center gap-2 text-primary">
                  <Globe size={16} />
                  English (US)
                </div>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}