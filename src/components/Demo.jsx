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

const RETINA_ORIGINAL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCiL0jP3nAZbIn4O6gdJj86n4ZFzrW7Y_preOIoOPRY0SV-XhpS5FiUYc0A8FnXituve0t6QQrvTcobJ7MYh_2UVBnp76hqlM6_tu14zLUg7DTJ26YxT2pFdaT0fLgi_QTe7EhiK5q6Vkl7-oVxHejxVEPzD6I7JipAZyiQUc_LqZ7BIkvrIYesncqGdYHwVl1Jh03UHfmd8K9eT0sGgnp0slV0vZAp_aJGtqmDSbmS7V5xiFj82Nw9I4bHC2tJEJbbIiMJbZY4fzLt";

const RETINA_AI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBaQUdUCvd0WwkJMsnvD-AFZ0HAycqZJMmYiG1p8ahbuFE58b5ftxBu4nfbNXwSCrs7Wz5FtuHK-lXX-A7AmqsUC7cidxtcYNPmgjPS2SsbyLAeuPYfCRSDXlig75GWmXy3Z1LVUupMTO9Gd-M9MjySQJaUc7m3Yvr9mZaLON7jHcXum7MbQdaXly7-Hj7DAvclRFL07eKMOvVCkwJAAT7ZW6J1G8yb4LcMieAdRubaeDFHBLNOBX6Xv9ys7k4buzRaBafcnmY0h7MA";

const DOCTOR_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCJqtVREflNWeT5o-pdw4iRDdlZB79LuLht36kdMvDmZHI023cSl6vedHv_ERZTfpRUXdEGv_PpQPLnOhlZKjTLDK4yyLPJxW00_h0VZdeQ74vfVe3Lh-Eodezjcz5G1PnogyPlymo7AOiEfSiJkEHFGN4KbbtUo1kYCtXrf5TEoyVY6W_eDXuTcctWZzIctajf91yETf7JwbpD3Fqd77Juin2JDpdJx1_ZxFrqxH7DmJnJKyIGfDnT0XwFd6w7ax96DfoygCbtkoSS";

export default function RetinaAIAnalysis() {
  const [activeView, setActiveView] = useState("dual");

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-sans text-slate-900 antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .heatmap-overlay {
          background:
            radial-gradient(circle at 40% 50%, rgba(239,68,68,0.4) 0%, transparent 20%),
            radial-gradient(circle at 60% 40%, rgba(249,115,22,0.4) 0%, transparent 15%),
            radial-gradient(circle at 55% 65%, rgba(239,68,68,0.3) 0%, transparent 25%);
        }
        .glass-panel {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.3);
        }
      `}</style>

      <div className="flex min-h-screen flex-col">
        {/* ── NAVBAR ── */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-md lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-3 text-[#137fec]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#137fec]/10">
              <MaterialIcon name="visibility" className="text-[#137fec]" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">RetinaAI</h2>
          </div>

          {/* Nav + actions */}
          <div className="flex flex-1 items-center justify-end gap-6 lg:gap-8">
            <nav className="hidden items-center gap-9 md:flex">
              {["Dashboard", "Patients"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-[#137fec]"
                >
                  {item}
                </a>
              ))}
              <a
                href="#"
                className="border-b-2 border-[#137fec] py-1 text-sm font-bold text-slate-900"
              >
                New Analysis
              </a>
            </nav>

            <div className="flex gap-2">
              {["settings", "notifications"].map((icon) => (
                <button
                  key={icon}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
                >
                  <MaterialIcon name={icon} />
                </button>
              ))}
            </div>

            <div className="rounded-full border border-[#137fec]/30 bg-[#137fec]/20 p-0.5">
              <img
                src={DOCTOR_AVATAR}
                alt="Doctor"
                className="h-9 w-9 rounded-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-10">
          {/* Breadcrumb + Page Header */}
          <div className="mb-8 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Analysis</span>
              <MaterialIcon name="chevron_right" className="text-xs" />
              <span className="font-semibold text-[#137fec]">New Upload</span>
            </div>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
                  Diabetic Retinopathy Analysis
                </h1>
                <p className="mt-1 text-slate-500">
                  Upload retinal fundus images for AI-powered lesion detection and clinical staging.
                </p>
              </div>
              <button className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50">
                <MaterialIcon name="history" className="text-sm" />
                History
              </button>
            </div>
          </div>

          {/* ── UPLOAD ZONE ── */}
          <div className="mb-10">
            <div className="glass-panel group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#137fec]/40 p-12 text-center transition-all hover:border-[#137fec]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#137fec]/10 transition-transform group-hover:scale-110">
                <MaterialIcon name="cloud_upload" className="text-4xl text-[#137fec]" />
              </div>
              <div className="max-w-md">
                <h3 className="mb-2 text-xl font-bold text-slate-900">Upload Retinal Image</h3>
                <p className="text-sm text-slate-500">
                  Drag and drop fundus images (.jpg, .png) or click to browse. Supported
                  high-resolution DICOM and JPEG formats.
                </p>
              </div>
              <button className="mt-4 flex h-12 min-w-[140px] items-center justify-center rounded-xl bg-[#137fec] px-6 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#137fec]/20 transition-all hover:brightness-110">
                Select File
              </button>
            </div>
          </div>

          {/* ── ANALYSIS RESULTS ── */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Left: Image Comparison */}
            <div className="flex flex-col gap-6 lg:col-span-8">
              {/* Section header + toggle */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">AI Analysis Preview</h2>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {["Dual View", "Overlay"].map((label) => (
                    <button
                      key={label}
                      onClick={() => setActiveView(label === "Dual View" ? "dual" : "overlay")}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                        (label === "Dual View" && activeView === "dual") ||
                        (label === "Overlay" && activeView === "overlay")
                          ? "bg-white text-[#137fec] shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Original */}
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-black">
                    <img
                      src={RETINA_ORIGINAL}
                      alt="Original retinal fundus"
                      className="h-full w-full object-cover opacity-90"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      Original
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500">Source: Left Eye (OS)</p>
                </div>

                {/* AI Processed */}
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-[#137fec]/50 bg-black">
                    <img
                      src={RETINA_AI}
                      alt="AI processed retinal image"
                      className="h-full w-full object-cover"
                    />
                    {/* Heatmap overlay */}
                    <div className="heatmap-overlay pointer-events-none absolute inset-0" />

                    {/* Bounding boxes */}
                    <div className="absolute left-1/3 top-1/4 h-16 w-16 rounded border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      <span className="absolute -top-5 left-0 bg-red-500 px-1 text-[8px] font-bold text-white">
                        EXUDATE
                      </span>
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 h-12 w-12 rounded border-2 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                      <span className="absolute -top-5 left-0 bg-orange-500 px-1 text-[8px] font-bold text-white">
                        HEM
                      </span>
                    </div>

                    <div className="absolute left-4 top-4 rounded-full bg-[#137fec]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      AI Processed
                    </div>
                    <div className="absolute bottom-4 right-4 rounded-lg bg-black/50 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      Heatmap Opacity: 80%
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500">
                    Processed at: 2023-10-24 14:32
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Results Sidebar */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              {/* Detection card */}
              <div className="glass-panel flex flex-col gap-6 rounded-xl border border-[#137fec]/20 p-6">
                {/* Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Detection Status
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">Analysis Complete</h3>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    High Risk
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Stats */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">DR Stage</label>
                    <p className="text-2xl font-black text-slate-900">Proliferative (PDR)</p>
                    <p className="mt-1 text-xs italic text-slate-400">
                      Stage 4: Severe vessel growth detected.
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-end justify-between">
                      <label className="text-xs font-semibold text-slate-500">
                        Confidence Score
                      </label>
                      <span className="text-lg font-bold text-[#137fec]">98.4%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#137fec]"
                        style={{ width: "98.4%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detection counts */}
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {[
                    { label: "Microaneurysms", value: "24 detected" },
                    { label: "Exudates", value: "12 clusters" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <span className="block text-[10px] font-bold uppercase text-slate-400">
                        {stat.label}
                      </span>
                      <span className="text-lg font-bold text-slate-800">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4">
                  <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#137fec] text-sm font-bold text-white shadow-lg shadow-[#137fec]/25 transition-all hover:brightness-110">
                    <MaterialIcon name="picture_as_pdf" className="text-xl" />
                    Download PDF Report
                  </button>
                  <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50">
                    <MaterialIcon name="share" className="text-xl" />
                    Send to Patient Portal
                  </button>
                </div>
              </div>

              {/* Clinical guidance */}
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <MaterialIcon name="info" className="text-amber-500" />
                  <p className="text-xs leading-relaxed text-amber-800">
                    <strong>Clinical Guidance:</strong> High risk of vision loss detected. Urgent
                    specialist consultation is recommended within 48-72 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-6 text-xs text-slate-400 md:flex-row lg:px-10">
          <p>© 2023 RetinaAI Diagnostic Systems. HIPAA Compliant.</p>
          <div className="flex gap-6">
            {["System Status: Optimal", "Terms of Service", "API Documentation"].map((item) => (
              <a key={item} href="#" className="transition-colors hover:text-[#137fec]">
                {item}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}