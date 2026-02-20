import { useState } from "react";

const MaterialIcon = ({ name, className = "" }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontFamily: "'Material Symbols Outlined'",
      fontWeight: "normal",
      fontStyle: "normal",
      display: "inline-block",
      lineHeight: 1,
      letterSpacing: "normal",
      textTransform: "none",
      whiteSpace: "nowrap",
      wordWrap: "normal",
      direction: "ltr",
      WebkitFontSmoothing: "antialiased",
    }}
  >
    {name}
  </span>
);

const NAV_LINKS = ["How it Works", "Features", "Pricing", "Research"];

const FEATURE_CARDS = [
  {
    icon: "bolt",
    title: "Fast AI Detection",
    desc: "Instant screening results in under 5 seconds with high sensitivity and specificity. Reduce patient wait times significantly.",
    link: "Learn more",
  },
  {
    icon: "biotech",
    title: "Lesion Segmentation",
    desc: "Precise visual mapping of microaneurysms, hemorrhages, and exudates using voxel-level precision modeling.",
    link: "View demo",
  },
  {
    icon: "description",
    title: "Clinical Reports",
    desc: "Automated generation of detailed PDF reports compatible with EMR systems for seamless clinical integration and patient record keeping.",
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

const RETINA_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Om2eDYt4uJrgKmYfi-f35eCzHdWKt7Xp7NJnlQ3sbHIcR6Ql1DVji8qeh-B_JG5IMtfJVDmuuGQisMRrqZcCsxlUIO1MgsOOVnLB378X6qj9gvxqzb6ESp7dukxuRh1Fn0r5-Z7h6YmpJb5LYUKTU03X9kt47zDcOzSF7NJdQGNKKE27N3sT2iQvKPB7iOmndkgTW2_WhGLKCQG1DgBsC32u-deYQiYanTF0T7IE42OQnEXhOn3uvvs8udE1dRLYLJcEOAq04jQL";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-sans text-slate-900 antialiased">
      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#137fec] text-white">
              <MaterialIcon name="visibility" className="text-2xl" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">RetinaAI</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((label) => (
              <a
                key={label}
                href="#"
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#137fec]"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden text-sm font-bold text-slate-700 transition-colors hover:text-[#137fec] sm:block">
              Login
            </button>
            <button className="rounded-xl bg-[#137fec] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#137fec]/20 transition-all hover:bg-[#137fec]/90 active:scale-95">
              Get Started
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <MaterialIcon name={mobileMenuOpen ? "close" : "menu"} className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
            {NAV_LINKS.map((label) => (
              <a
                key={label}
                href="#"
                className="block py-2.5 text-sm font-semibold text-slate-600 hover:text-[#137fec]"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        {/* ── HERO ── */}
        <section
          className="relative overflow-hidden px-6 py-16 lg:px-12 lg:py-24"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(19,127,236,0.08) 0%, transparent 70%)",
          }}
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row">
            {/* Left */}
            <div className="flex flex-1 flex-col items-start gap-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#137fec]/10 px-4 py-1.5 text-[#137fec]">
                <MaterialIcon name="verified" className="text-sm" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Clinical Grade AI v4.0
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900 lg:text-7xl">
                AI-Powered <br />
                <span className="text-[#137fec]">Diabetic Retinopathy</span> Detection
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                Fast, accurate, and automated screening for retinal diseases using state-of-the-art
                deep learning. Empowering healthcare professionals with instant diagnostic insights.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="flex h-14 items-center gap-2 rounded-xl bg-[#137fec] px-8 text-base font-bold text-white shadow-xl shadow-[#137fec]/25 transition-all hover:-translate-y-0.5 hover:shadow-[#137fec]/40 active:translate-y-0">
                  <MaterialIcon name="upload_file" />
                  Upload Image
                </button>
                <button className="flex h-14 items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 text-base font-bold text-slate-900 transition-all hover:bg-slate-50">
                  <MaterialIcon name="play_circle" />
                  Watch Demo
                </button>
              </div>

              {/* Trust */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {DOCTOR_AVATARS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Doctor"
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Trusted by{" "}
                  <span className="font-bold text-slate-900">500+ clinics</span> worldwide
                </p>
              </div>
            </div>

            {/* Right — retina visual */}
            <div className="relative flex flex-1 items-center justify-center">
              <div className="relative h-80 w-80 lg:h-[500px] lg:w-[500px]">
                <div className="absolute inset-0 rounded-full bg-[#137fec]/5 blur-3xl" />
                <div className="relative h-full w-full overflow-hidden rounded-full border-8 border-white/50 bg-slate-100 shadow-2xl">
                  <img
                    src={RETINA_IMAGE}
                    alt="Retina Scan"
                    className="h-full w-full object-cover opacity-90 mix-blend-multiply"
                  />
                  {/* Scan overlays */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-48 w-48 rounded-lg border-2 border-dashed border-[#137fec] bg-[#137fec]/10 backdrop-blur-sm">
                      <div className="absolute -right-2 -top-2 flex h-6 w-16 items-center justify-center rounded bg-[#137fec] text-[10px] font-bold text-white">
                        LESION
                      </div>
                    </div>
                    <div className="absolute bottom-1/4 left-1/3 h-12 w-12 rounded-full border-2 border-red-500 bg-red-500/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="bg-white px-6 py-20 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#137fec]">
                Key Capabilities
              </h2>
              <h3 className="mt-4 text-3xl font-black text-slate-900 lg:text-4xl">
                Advanced Diagnostic Ecosystem
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Our proprietary neural networks are trained on millions of clinical images to provide
                unparalleled accuracy in diabetic retinopathy screening.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {FEATURE_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col gap-6 rounded-2xl border border-white/30 p-8 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#137fec]/10"
                  style={{ background: "rgba(255,255,255,0.7)" }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#137fec] text-white">
                    <MaterialIcon name={card.icon} className="text-3xl" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{card.title}</h4>
                    <p className="mt-3 leading-relaxed text-slate-600">{card.desc}</p>
                  </div>
                  <a
                    href="#"
                    className="mt-auto inline-flex items-center gap-2 font-bold text-[#137fec] hover:underline"
                  >
                    {card.link}
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center lg:py-24">
            {/* Glow blobs */}
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-[#137fec] blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-[#137fec] blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-black text-white lg:text-5xl">
                Ready to enhance your clinical workflow?
              </h2>
              <p className="mt-6 text-lg text-slate-300">
                Join thousands of medical professionals using AI to prevent blindness and improve
                patient outcomes through early detection.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button className="rounded-xl bg-[#137fec] px-10 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105">
                  Get Started Now
                </button>
                <button className="rounded-xl border border-white/20 px-10 py-4 text-base font-bold text-white transition-all hover:bg-white/10">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#137fec] text-white">
                  <MaterialIcon name="visibility" className="text-xl" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">RetinaAI</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Leading the way in AI-driven ophthalmic diagnostics. Built for clinicians, powered by
                science.
              </p>
            </div>

            {/* Columns */}
            {FOOTER_COLS.map((col) => (
              <div key={col.heading}>
                <h5 className="font-bold text-slate-900">{col.heading}</h5>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-slate-600 transition-colors hover:text-[#137fec]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-8 md:flex-row">
            <p className="text-xs text-slate-500">
              © 2024 RetinaAI Systems Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              {["public", "alternate_email", "link"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="text-slate-400 transition-colors hover:text-[#137fec]"
                >
                  <MaterialIcon name={icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}