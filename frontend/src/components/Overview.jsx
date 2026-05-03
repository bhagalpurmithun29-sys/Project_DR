import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  Settings,
  LogOut,
  Search,
  Bell,
  Sliders,
  Eye,
  TrendingUp,
  Cpu,
  UserPlus,
  MoreVertical,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  Activity,
  Shield,
  HelpCircle,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── DATA ──────────────────────────────────────────────────────────────────────

const ADMIN_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHgC2b8NJiUELGKU5vi2ftOS8NWc5OLQtWL4Sc-KpFoRYp0jBtPy7t9Ldxchb7ZH8_hOz_eDjiKnYI1m_0NckhtE1YTztSa0XeJE2eKA_el7jX_6UZWVqgZYyi3gGzhubCjRekUmSFnotWux9jgLc5uug8DLLGZGjxJLTEDJG8MIYT5-oj9EyD9c1bM9Ari7mRdlJ912itjltynRvtazFvjiVdPN5cyB34SneNH41EZP370N3rdZVu8wNa-OT2d4QI5SM_rQdSZVAp";

const USER_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDaNgrbpXKzQSi7ppxAornhQ2p5gabnsV6uoiP2xcli6vrkTNCSflx2nm_2XoXW9Uc3o8AjlPYluofLPEeJnCB1J6GAecckgYvPxHw-V4QQ-778_BseqH-x_7-2DdLJLQcnLrE9sLx46Jyg4p8JLkOLPPFKNcG9UqAbeIi_9tJ2cEfmEK5HJ6UT8z2uefH98Spk89ct0QMFfdTA2PLUrANp29jKExe_8jix-Ec3gigoqWOFUKygNlklvbQsYXKle-4C3B7FenjR_mza",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDJIzY84Biq_1k_9ilhnB9MAbiffJmJOCgUOLtPqOYPUdA6ZeFFRhenWZ33StD5ZHNoKqyDnzlrTijjMxnx-idnVTP81Gbsb71VwWVtJBJ8HJ9X94_FbdMaHYiBAZWhseWXI7EovG2Gx_BbKybAwX5k7xt9_OgC88vKuFIQ9qVR_IQuvt1Fo9ngxrXYIwv6OxtdGXhMM7exw2OOoG139QXIRxhYAeQG7iMuit4o0Z2TR9zZyLDXt_1_rTx9oS6sSjchsko7e3XMt_9i",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAPIQTyqRZKxwWLVj6bGNtbbkK_6I-jH0W3qARnHu1J0n_UsUONRHdoQ8rH2IJ_E11rXq6OGcDKmmvwFnKvEtXRVIvfPpAzZBoSHjxEBXwhfpGkIQtESwUCroCUk4gOOILneokkKzWOqLUOmV8w40AmmqOY_Ht4hqd0ZgW3L2W3t_ZYA2dVAwl55Bu2K6zNJI34Oft2WdrET4gY9mUbdLEbKBtLEHjy1Vy7F4NiOer6KPxhbIBKt1xY-sZZA3tm8wH7Bl1biviL4yK9",
];

const STAFF = [
  {
    name: "Dr. Helena Hills",
    email: "h.hills@retinaai.health",
    role: "Lead Retina Specialist",
    lastActive: "12 mins ago",
    status: "Online",
    statusStyle: "bg-primary/10 text-primary border-primary/20",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYVMdSodEeqXXao_8ywmApzjYK5Wm1QVDWbRiGKf7g8CmzawVljlvbFZZU3cnvOKM1YCkExf9eTruqo8UHgR_eVGlRmzjmlrd3lrr3JEBv1QNScAoqsCC85zlTcCtT5BKgEpU5Ky4B11zoXsec3n1lGGH872gsx_OBZpC_fvAAP89oaEk6gbGirBqGStLszOKpbaxLo0lF7WH3DXaS9750ORICRiUnYFx4E_yC_TJRCkFnshuy81YaVtroyrT7PghHVVBZRG-LOiTk",
  },
  {
    name: "Marcus Thorne",
    email: "m.thorne@retinaai.health",
    role: "Data Scientist",
    lastActive: "2 hours ago",
    status: "Offline",
    statusStyle: "bg-slate-100 text-slate-600 border-slate-200",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBxDrZuapUUwb1gUj_xo9FAqGZTs9zmusGgoexNNN_OD5WFp3XTitlgK8AprNKmPYsQK40xdUzDhU3LmKX48vqVHIGwB0x4PsAM27WsX0pqGOZMKHRTz49JyPcGtVnCJ5m5TGO9bAlXlKnw_Ee1COmkzApBKvY0pCEpuazT4LCPzNeymPXKi51euTzRK5NGgoIbGUH7KheXzY3piKZ2t-I6wFP-lFFCWTU16ZpQ2ZjFVUM2o73oDbIdODS6kFuhYu2OhNRA0xrs8KR9",
  },
  {
    name: "Jin Wu",
    email: "j.wu@retinaai.health",
    role: "Clinical Technician",
    lastActive: "Yesterday",
    status: "Away",
    statusStyle: "bg-amber-100 text-amber-700 border-amber-200",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCDDEOMpWQKP5VA9jii6DMvc0eSlL8ieUVbbPPfd8UBf7G_uube1hN_bqBzc0T724AnjeWLdCBHpKpzRA6kSCUZmyWxxbEp5fjjixiMatvBTdr8M36VamRqJ_vTAsWbEuCwN4yIGHMMUFKEeWqpsyHTyZBquK_RgsXTvlA8dnT44g6wbefw1oZHwWj7OS7U3HdnMvoYiFRa1iG9QZTIeEeWbI5JF9UyBmyEFgal8FfZIrwi2sD9hSWdokjqoq7iUIigUQugACT_v8KN",
  },
];

const ALERTS = [
  {
    icon: <AlertCircle className="text-red-500" size={18} />,
    borderColor: "border-red-500",
    bg: "bg-red-50/50",
    title: "High Risk Detected",
    titleColor: "text-red-900",
    badge: "Critical",
    badgeColor: "bg-red-100 text-red-700",
    desc: "Abnormal latency in Node 4. API responses might be delayed.",
    descColor: "text-red-700/80",
  },
  {
    icon: <AlertTriangle className="text-amber-500" size={18} />,
    borderColor: "border-amber-500",
    bg: "bg-amber-50/50",
    title: "Model Retraining",
    titleColor: "text-amber-900",
    badge: "Medium",
    badgeColor: "bg-amber-100 text-amber-700",
    desc: "Scheduled maintenance in 2 hours. Limited availability.",
    descColor: "text-amber-700/80",
  },
  {
    icon: <Info className="text-primary" size={18} />,
    borderColor: "border-primary",
    bg: "bg-primary/5",
    title: "New Updates",
    titleColor: "text-primary",
    badge: "Low",
    badgeColor: "bg-primary/10 text-primary",
    desc: "A new version of the AI engine (v2.4.1) is available.",
    descColor: "text-primary/70",
  },
];

const SCAN_THUMBNAILS = [
  {
    label: "Patient #1024",
    dot: "bg-red-500",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfD8Dj16VY9WpTXciO1HuD2buk7h-oBVH4BbETQtUAAwQVqhCgmvnhAURFGonPUat0v_fAKa2rMfMLeVa_Z-_-mIVwORztF6jIEsensTugkky9J2ze-X3E6F8Gbjy15I5yALWHjPZ04CqfJuJ4bxIY-ofZIZm7xWbun7pt-44Jg3RQBY-XXQw_IhBEVEcgdH5pZWQtotawDPvwKXW5HKw5y4u-kGPbYW_y_bY_E4Ka58gD0toJ25fv7w8k_iqKUwHCCeM_92mQBpUf",
  },
  {
    label: "Patient #1025",
    dot: "bg-primary",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCu_No3u1t1GpiW9DWpTQ-zkcn030CpbeC6AahM1ip_Fz9IkVhxjj4EmoZPruXJd65mMlcYGRb_-QH-rvQ775kJ_9wQPCVncah_fQzbxUb7VkiCgZ3CDlpTe7w---e6xxfHgf_VchnKvQh4AdzV_FTUmpcjyYy7stUzrkU7M2vAQCojqLxC7RR47RABFHKO0e1dlA5U9Ap-QALYActpRov-VwDPNK9pw2Slzf_fkg3mLRkdED-XH24fURTPL_zgofKgMaXLDJoOQa1j",
  },
  {
    label: "Patient #1026",
    dot: "bg-amber-500",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyKqnYx99I4N1T4BxWjcHQUXXngCEqJZqzeJ7bO3i3p37x1I9hOSVCyyhE46w5bTGD85NTCz3gTQunNp6lKVD0Oz3EDhVZnxsPrSe3iYbTeqIV31FaNxNDaYDE3772j1__eGCN7QuNlIV9Wye8wJzNPTD8s9534SoQoLfpmdfCPA3vKymgTEJkkm9j3PdIQ-A-tsga_zdTSnEiF_oOSAERUz-blLbwu-PKDTb_M_vPktF6-1lqKlgfLnuqFHqwg8OU5D3g8A8yC00S",
  },
];

const BAR_HEIGHTS = [40, 55, 62, 48, 70, 82, 78, 85, 92, 98];
const BAR_LABELS = ["Oct 01", "Oct 08", "Oct 15", "Oct 22", "Today"];

const NAV_MAIN = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "User Management", active: false },
  { icon: ImageIcon, label: "Image Gallery", active: false },
  { icon: Sliders, label: "Model Settings", active: false },
];

const NAV_SYSTEM = [
  { icon: Activity, label: "Activity Logs" },
  { icon: Shield, label: "Security" },
  { icon: HelpCircle, label: "Support" },
];

// ── COMPONENTS ─────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 flex h-screen w-72 flex-col border-r border-white/5 bg-sidebar z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 p-8">
        <div className="rounded-xl bg-primary/10 p-2 text-primary shadow-sm">
          <Activity size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-lg font-black leading-none tracking-tight text-white italic">RetinaAI</h1>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Admin Suite
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {/* Main */}
        <div className="py-2">
          <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Main Menu
          </p>
          <div className="space-y-1">
            {NAV_MAIN.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${item.active
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <item.icon size={18} strokeWidth={item.active ? 2.5 : 2} />
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* System */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            System
          </p>
          <div className="space-y-1">
            {NAV_SYSTEM.map((item) => (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 transition-all hover:bg-white/5 hover:text-white"
              >
                <item.icon size={18} />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* User info */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
          <img
            src={ADMIN_AVATAR}
            alt="Admin"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-white">Dr. Sarah Chen</p>
            <p className="truncate text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Header({ search, onSearch }) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white bg-white/70 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black tracking-tight">System Overview</h2>
        <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Healthy
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary"
          />
          <input
            id="overview-search"
            name="overview_search"
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search records..."
            className="w-72 rounded-xl border-none bg-slate-100 py-2.5 pl-11 pr-4 text-sm font-medium outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-primary/20"
          />
        </div>
        <button className="relative rounded-xl bg-slate-100 p-2.5 text-slate-500 transition-all hover:bg-slate-200/80 hover:text-slate-900 focus:ring-2 focus:ring-primary/20">
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>
        <button className="rounded-xl bg-slate-100 p-2.5 text-slate-500 transition-all hover:bg-slate-200/80 hover:text-slate-900">
          <Sliders size={20} />
        </button>
      </div>
    </header>
  );
}

function MetricCard({ title, value, icon: Icon, trend, colorClass }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-[2rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
          <h3 className="mt-2 text-4xl font-black tracking-tight">{value}</h3>
        </div>
        <div className={`rounded-2xl p-3 shadow-lg ${colorClass}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      {trend && (
        <div className="mt-6 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary border border-primary/20">
            <TrendingUp size={14} />
            {trend}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">vs. last month</span>
        </div>
      )}
    </motion.div>
  );
}

function StaffTable() {
  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white shadow-sm xl:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-100 p-8">
        <div>
          <h4 className="text-xl font-black tracking-tight">Staff Directory</h4>
          <p className="text-sm font-medium text-slate-500">Manage clinical access and permissions</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
          <UserPlus size={18} />
          Add Member
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {["Full Name", "Role", "Last Activity", "Status", "Action"].map((col, i) => (
                <th key={col} className={`px-8 py-5 ${i === 4 ? "text-right" : ""}`}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {STAFF.map((member) => (
              <tr key={member.email} className="group transition-colors hover:bg-slate-50/50">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{member.name}</p>
                      <p className="truncate text-xs font-medium text-slate-400">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs font-bold text-slate-600">{member.role}</td>
                <td className="px-8 py-5 text-xs font-bold text-slate-400">{member.lastActive}</td>
                <td className="px-8 py-5">
                  <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${member.statusStyle}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-primary">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemAlerts() {
  const [alerts, setAlerts] = useState(ALERTS);

  return (
    <div className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">System Alerts</h4>
        <button
          onClick={() => setAlerts([])}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline hover:underline-offset-4"
        >
          Clear all
        </button>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.1 }}
              className={`flex gap-4 rounded-2xl border-l-[6px] p-5 shadow-sm transition-transform hover:scale-[1.02] ${alert.borderColor} ${alert.bg}`}
            >
              <div className="mt-0.5">{alert.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-black ${alert.titleColor}`}>{alert.title}</p>
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${alert.badgeColor}`}>
                    {alert.badge}
                  </span>
                </div>
                <p className={`text-xs font-medium leading-relaxed ${alert.descColor}`}>{alert.desc}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {alerts.length === 0 && (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active threats</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScanGallery() {
  return (
    <div className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">Recent Scans</h4>
        <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline hover:underline-offset-4 flex items-center gap-1 group">
          View All <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {SCAN_THUMBNAILS.map((scan) => (
          <div
            key={scan.label}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 transition-all hover:scale-[1.05] hover:shadow-lg"
          >
            <img src={scan.src} alt={scan.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{scan.label}</span>
            </div>
            <div className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ring-4 ring-white shadow-sm ${scan.dot}`} />
          </div>
        ))}
        <button className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-primary/40 hover:bg-primary/5">
          <div className="flex flex-col h-full w-full items-center justify-center gap-2">
            <div className="rounded-xl bg-white p-3 text-slate-300 shadow-sm transition-colors group-hover:text-primary">
              <Plus size={24} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary">Upload New</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function PerformanceChart() {
  const [activeTab, setActiveTab] = useState("Weekly");
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h4 className="text-xl font-black tracking-tight">Model Accuracy</h4>
          <p className="text-sm font-medium text-slate-500">Real-time inference precision tracking</p>
        </div>
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1.5 shadow-inner">
          {["Weekly", "Monthly", "Yearly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bars Chart */}
      <div className="relative flex h-56 w-full items-end gap-2 px-4">
        {BAR_HEIGHTS.map((h, i) => {
          const isLast = i === BAR_HEIGHTS.length - 1;
          const isHovered = hoveredBar === i;

          return (
            <div
              key={i}
              className="group relative flex-1 cursor-pointer"
              style={{ height: `${h}%` }}
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className={`h-full w-full rounded-t-xl transition-all ${isLast
                  ? "bg-primary shadow-lg shadow-primary/30"
                  : "bg-primary/10 hover:bg-primary/40"
                  }`}
              />

              <AnimatePresence>
                {(isLast || isHovered) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 shadow-xl"
                  >
                    <div className="text-[10px] font-black text-white">{h}% Accuracy</div>
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="mt-6 flex justify-between px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
        {BAR_LABELS.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [search, setSearch] = useState("");

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex min-h-screen bg-main font-display text-slate-900 antialiased overflow-x-hidden">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col pb-12 ml-72">
        <Header search={search} onSearch={setSearch} />

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="mx-auto w-full max-w-[1600px] space-y-10 p-10"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <MetricCard
              title="Total Scans"
              value="12,840"
              icon={Eye}
              trend="5.2%"
              colorClass="bg-primary/10 text-primary"
            />
            <MetricCard
              title="Accuracy"
              value="98.2%"
              icon={Cpu}
              trend="+0.1%"
              colorClass="bg-primary/10 text-primary"
            />
            <MetricCard
              title="Active Pros"
              value="458"
              icon={Users}
              trend="+12 today"
              colorClass="bg-amber-500/10 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-10 xl:grid-cols-3">
            <StaffTable />
            <div className="space-y-8">
              <SystemAlerts />
              <ScanGallery />
            </div>
          </div>

          <PerformanceChart />
        </motion.div>

        <footer className="mt-auto px-10 pt-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            © 2024 RetinaAI Clinical Systems / v2.4.1-stable / Encryption Active
          </p>
        </footer>
      </main>
    </div>
  );
}
