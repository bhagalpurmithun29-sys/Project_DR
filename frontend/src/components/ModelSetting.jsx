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
  Plus,
  Zap,
  Microscope,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Assets & Constants ---
const avatarUrls = {
  admin: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHgC2b8NJiUELGKU5vi2ftOS8NWc5OLQtWL4Sc-KpFoRYp0jBtPy7t9Ldxchb7ZH8_hOz_eDjiKnYI1m_0NckhtE1YTztSa0XeJE2eKA_el7jX_6UZWVqgZYyi3gGzhubCjRekUmSFnotWux9jgLc5uug8DLLGZGjxJLTEDJG8MIYT5-oj9EyD9c1bM9Ari7mRdlJ912itjltynRvtazFvjiVdPN5cyB34SneNH41EZP370N3rdZVu8wNa-OT2d4QI5SM_rQdSZVAp",
  staff1:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYVMdSodEeqXXao_8ywmApzjYK5Wm1QVDWbRiGKf7g8CmzawVljlvbFZZU3cnvOKM1YCkExf9eTruqo8UHgR_eVGlRmzjmlrd3lrr3JEBv1QNScAoqsCC85zlTcCtT5BKgEpU5Ky4B11zoXsec3n1lGGH872gsx_OBZpC_fvAAP89oaEk6gbGirBqGStLszOKpbaxLo0lF7WH3DXaS9750ORICRiUnYFx4E_yC_TJRCkFnshuy81YaVtroyrT7PghHVVBZRG-LOiTk",
  staff2:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBxDrZuapUUwb1gUj_xo9FAqGZTs9zmusGgoexNNN_OD5WFp3XTitlgK8AprNKmPYsQK40xdUzDhU3LmKX48vqVHIGwB0x4PsAM27WsX0pqGOZMKHRTz49JyPcGtVnCJ5m5TGO9bAlXlKnw_Ee1COmkzApBKvY0pCEpuazT4LCPzNeymPXKi51euTzRK5NGgoIbGUH7KheXzY3piKZ2t-I6wFP-lFFCWTU16ZpQ2ZjFVUM2o73oDbIdODS6kFuhYu2OhNRA0xrs8KR9",
  staff3:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCDDEOMpWQKP5VA9jii6DMvc0eSlL8ieUVbbPPfd8UBf7G_uube1hN_bqBzc0T724AnjeWLdCBHpKpzRA6kSCUZmyWxxbEp5fjjixiMatvBTdr8M36VamRqJ_vTAsWbEuCwN4yIGHMMUFKEeWqpsyHTyZBquK_RgsXTvlA8dnT44g6wbefw1oZHwWj7OS7U3HdnMvoYiFRa1iG9QZTIeEeWbI5JF9UyBmyEFgal8FfZIrwi2sD9hSWdokjqoq7iUIigUQugACT_v8KN",
  active1:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDaNgrbpXKzQSi7ppxAornhQ2p5gabnsV6uoiP2xcli6vrkTNCSflx2nm_2XoXW9Uc3o8AjlPYluofLPEeJnCB1J6GAecckgYvPxHw-V4QQ-778_BseqH-x_7-2DdLJLQcnLrE9sLx46Jyg4p8JLkOLPPFKNcG9UqAbeIi_9tJ2cEfmEK5HJ6UT8z2uefH98Spk89ct0QMFfdTA2PLUrANp29jKExe_8jix-Ec3gigoqWOFUKygNlklvbQsYXKle-4C3B7FenjR_mza",
  active2:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDJIzY84Biq_1k_9ilhnB9MAbiffJmJOCgUOLtPqOYPUdA6ZeFFRhenWZ33StD5ZHNoKqyDnzlrTijjMxnx-idnVTP81Gbsb71VwWVtJBJ8HJ9X94_FbdMaHYiBAZWhseWXI7EovG2Gx_BbKybAwX5k7xt9_OgC88vKuFIQ9qVR_IQuvt1Fo9ngxrXYIwv6OxtdGXhMM7exw2OOoG139QXIRxhYAeQG7iMuit4o0Z2TR9zZyLDXt_1_rTx9oS6sSjchsko7e3XMt_9i",
  active3:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAPIQTyqRZKxwWLVj6bGNtbbkK_6I-jH0W3qARnHu1J0n_UsUONRHdoQ8rH2IJ_E11rXq6OGcDKmmvwFnKvEtXRVIvfPpAzZBoSHjxEBXwhfpGkIQtESwUCroCUk4gOOILneokkKzWOqLUOmV8w40AmmqOY_Ht4hqd0ZgW3L2W3t_ZYA2dVAwl55Bu2K6zNJI34Oft2WdrET4gY9mUbdLEbKBtLEHjy1Vy7F4NiOer6KPxhbIBKt1xY-sZZA3tm8wH7Bl1biviL4yK9",
};

const scanImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCfD8Dj16VY9WpTXciO1HuD2buk7h-oBVH4BbETQtUAAwQVqhCgmvnhAURFGonPUat0v_fAKa2rMfMLeVa_Z-_-mIVwORztF6jIEsensTugkky9J2ze-X3E6F8Gbjy15I5yALWHjPZ04CqfJuJ4bxIY-ofZIZm7xWbun7pt-44Jg3RQBY-XXQw_IhBEVEcgdH5pZWQtotawDPvwKXW5HKw5y4u-kGPbYW_y_bY_E4Ka58gD0toJ25fv7w8k_iqKUwHCCeM_92mQBpUf",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCu_No3u1t1GpiW9DWpTQ-zkcn030CpbeC6AahM1ip_Fz9IkVhxjj4EmoZPruXJd65mMlcYGRb_-QH-rvQ775kJ_9wQPCVncah_fQzbxUb7VkiCgZ3CDlpTe7w---e6xxfHgf_VchnKvQh4AdzV_FTUmpcjyYy7stUzrkU7M2vAQCojqLxC7RR47RABFHKO0e1dlA5U9Ap-QALYActpRov-VwDPNK9pw2Slzf_fkg3mLRkdED-XH24fURTPL_zgofKgMaXLDJoOQa1j",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCyKqnYx99I4N1T4BxWjcHQUXXngCEqJZqzeJ7bO3i3p37x1I9hOSVCyyhE46w5bTGD85NTCz3gTQunNp6lKVD0Oz3EDhVZnxsPrSe3iYbTeqIV31FaNxNDaYDE3772j1__eGCN7QuNlIV9Wye8wJzNPTD8s9534SoQoLfpmdfCPA3vKymgTEJkkm9j3PdIQ-A-tsga_zdTSnEiF_oOSAERUz-blLbwu-PKDTb_M_vPktF6-1lqKlgfLnuqFHqwg8OU5D3g8A8yC00S",
];

// --- Sidebar Component ---
const Sidebar = () => (
  <aside className="fixed top-0 left-0 flex h-screen w-72 flex-col border-r border-white/5 bg-sidebar z-50">
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

    <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
      <div className="py-2">
        <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Main Menu
        </p>
        <div className="space-y-1">
          <NavItem icon={LayoutDashboard} active>Dashboard</NavItem>
          <NavItem icon={Users}>User Management</NavItem>
          <NavItem icon={ImageIcon}>Image Gallery</NavItem>
          <NavItem icon={Sliders}>Model Settings</NavItem>
        </div>
      </div>
      <div className="mt-6 border-t border-slate-100 pt-6">
        <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          System
        </p>
        <div className="space-y-1">
          <NavItem icon={Activity}>Activity Logs</NavItem>
          <NavItem icon={Shield}>Security</NavItem>
          <NavItem icon={HelpCircle}>Support</NavItem>
        </div>
      </div>
    </nav>

    <div className="p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
        <div className="size-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white/10 shadow-sm">
          <img
            src={avatarUrls.admin}
            alt="Dr. Sarah Chen"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-black truncate text-white">Dr. Sarah Chen</p>
          <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">Senior Administrator</p>
        </div>
        <button className="text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  </aside>
);

const NavItem = ({ icon: Icon, children, active = false }) => {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${active
        ? "bg-primary text-white shadow-lg shadow-primary/25"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      <span>{children}</span>
    </a>
  );
};

// --- Header Component ---
const Header = ({ notificationEnabled = true }) => {
  const [showNotification, setShowNotification] = useState(notificationEnabled);
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white bg-white/70 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Model Configuration</h2>
        <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Stable v2.4
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search params..."
            className="w-72 rounded-xl border-none bg-slate-100 py-2.5 pl-11 pr-4 text-sm font-medium outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-primary/20"
          />
        </div>
        <button
          className="relative rounded-xl bg-slate-100 p-2.5 text-slate-500 transition-all hover:bg-slate-200/80 hover:text-slate-900"
          onClick={() => setShowNotification(!showNotification)}
        >
          <Bell size={20} />
          {showNotification && (
            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
        <button className="rounded-xl bg-slate-100 p-2.5 text-slate-500 transition-all hover:bg-slate-200/80 hover:text-slate-900">
          <Sliders size={20} />
        </button>
      </div>
    </header>
  );
};

// --- Metric Card Component ---
const MetricCard = ({ title, value, change, icon: Icon, colorClass = "bg-primary/10 text-primary", changeSuffix = "vs. last month" }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
          <h3 className="text-4xl font-black tracking-tight mt-2 text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl shadow-lg ${colorClass}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      {change && (
        <div className="mt-6 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary border border-primary/20">
            <TrendingUp size={14} />
            {change}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{changeSuffix}</span>
        </div>
      )}
    </motion.div>
  );
};

// --- Staff Table Row Component ---
const StaffRow = ({ name, email, role, lastActive, status, avatar }) => {
  const statusStyles = {
    Online: "bg-primary/10 text-primary border-primary/20",
    Offline: "bg-slate-100 text-slate-600 border-slate-200",
    Away: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black truncate text-slate-900">{name}</p>
            <p className="text-xs font-medium text-slate-400 truncate">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-5 text-xs font-bold text-slate-600">{role}</td>
      <td className="px-8 py-5 text-xs font-bold text-slate-400">{lastActive}</td>
      <td className="px-8 py-5">
        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${statusStyles[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-8 py-5 text-right">
        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-primary">
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
};

// --- Alert Component ---
const Alert = ({ severity, title, message }) => {
  const severityMap = {
    Critical: { border: "border-red-500", bg: "bg-red-50/50", icon: <AlertCircle className="text-red-500" size={18} />, titleColor: "text-red-900", tagColor: "bg-red-100 text-red-700" },
    Medium: { border: "border-amber-500", bg: "bg-amber-50/50", icon: <AlertTriangle className="text-amber-500" size={18} />, titleColor: "text-amber-900", tagColor: "bg-amber-100 text-amber-700" },
    Low: { border: "border-primary", bg: "bg-primary/5", icon: <Info className="text-primary" size={18} />, titleColor: "text-primary", tagColor: "bg-primary/10 text-primary" },
  };
  const style = severityMap[severity] || severityMap.Low;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-4 p-5 rounded-2xl border-l-[6px] shadow-sm hover:scale-[1.02] transition-transform ${style.border} ${style.bg}`}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className={`text-sm font-black ${style.titleColor}`}>{title}</p>
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${style.tagColor}`}>{severity}</span>
        </div>
        <p className={`text-xs font-medium leading-relaxed opacity-80 ${style.titleColor}`}>{message}</p>
      </div>
    </motion.div>
  );
};

// --- Main App Component ---
function App() {
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex min-h-screen bg-main font-display text-slate-900 antialiased overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-12 ml-72">
        <Header />

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="p-10 space-y-10 max-w-[1600px] mx-auto w-full"
        >
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricCard
              title="Total Scans"
              value="12,840"
              change="5.2%"
              icon={Eye}
              colorClass="bg-primary/10 text-primary"
            />
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Model Accuracy</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-4xl font-black tracking-tight text-slate-900">98.2%</h3>
                    <span className="text-xs font-black text-primary">+0.1%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "98.2%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-primary h-full rounded-full shadow-lg shadow-primary/30"
                    />
                  </div>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-2xl ml-4 shadow-lg">
                  <Cpu size={24} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest italic">Confidence: 99.4% Threshold</p>
            </motion.div>
            <MetricCard
              title="Active Pros"
              value="458"
              icon={Users}
              trend="+12 today"
              colorClass="bg-amber-500/10 text-amber-600"
              change="+12 today"
              changeSuffix=""
            />
          </div>

          {/* Main Data Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Staff Table */}
            <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black tracking-tight text-slate-900">Staff Directory</h4>
                  <p className="text-sm font-medium text-slate-500">Manage clinical access and permissions</p>
                </div>
                <button className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95">
                  <UserPlus size={18} />
                  Add Member
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                      <th className="px-8 py-5">Full Name</th>
                      <th className="px-8 py-5">Role</th>
                      <th className="px-8 py-5">Last Activity</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <StaffRow name="Dr. Helena Hills" email="h.hills@retinaai.health" role="Lead Opthalmologist" lastActive="12 mins ago" status="Online" avatar={avatarUrls.staff1} />
                    <StaffRow name="Marcus Thorne" email="m.thorne@retinaai.health" role="Data Scientist" lastActive="2 hours ago" status="Offline" avatar={avatarUrls.staff2} />
                    <StaffRow name="Jin Wu" email="j.wu@retinaai.health" role="Clinical Technician" lastActive="Yesterday" status="Away" avatar={avatarUrls.staff3} />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Alerts + Scan Gallery */}
            <div className="space-y-8">
              {/* System Alerts */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">System Alerts</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary cursor-pointer hover:underline hover:underline-offset-4">Clear all</span>
                </div>
                <div className="space-y-4">
                  <Alert severity="Critical" title="High Risk Detected" message="Abnormal latency in Node 4. API responses might be delayed." />
                  <Alert severity="Medium" title="Model Retraining" message="Scheduled maintenance in 2 hours." />
                  <Alert severity="Low" title="New Updates" message="A new version of the AI engine (v2.4.1) is available." />
                </div>
              </div>

              {/* Recent Retinal Scans */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Recent Scans</h4>
                  <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline hover:underline-offset-4 flex items-center gap-1 group">
                    View All <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {scanImages.map((src, idx) => (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      key={idx}
                      className="group relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Patient #102{4 + idx}</span>
                      </div>
                      <img src={src} alt={`Scan ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className={`absolute top-3 right-3 size-2.5 ring-4 ring-white shadow-sm ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-primary' : 'bg-amber-500'} rounded-full`}></div>
                    </motion.div>
                  ))}
                  <button className="group relative aspect-square bg-slate-50/50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <div className="flex flex-col h-full w-full items-center justify-center gap-2">
                      <div className="rounded-xl bg-white p-3 text-slate-300 shadow-sm group-hover:text-primary transition-colors">
                        <Plus size={24} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary">Upload New</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
              <div>
                <h4 className="text-xl font-black tracking-tight text-slate-900">Performance Tracking</h4>
                <p className="text-sm font-medium text-slate-500">Real-time inference accuracy over time</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 shadow-inner p-1.5 rounded-2xl">
                <button className="px-4 py-2 text-xs font-black rounded-xl bg-white shadow-sm text-slate-900">Weekly</button>
                <button className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-700 transition-colors">Monthly</button>
                <button className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-700 transition-colors">Yearly</button>
              </div>
            </div>

            <div className="h-56 w-full flex items-end gap-2 px-4 relative">
              {[40, 55, 62, 48, 70, 82, 78, 85, 92, 98].map((height, i) => {
                const isLast = i === 9;
                return (
                  <div
                    key={i}
                    className="flex-1 relative group"
                    style={{ height: `${height}%` }}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className={`w-full rounded-t-xl transition-all cursor-pointer ${isLast ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-primary/10 hover:bg-primary/40'}`}
                    />
                    {isLast && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-100 pointer-events-none whitespace-nowrap shadow-xl">
                        98.2% (Today)
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 bg-slate-900 rotate-45" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-6 px-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
              <span>Oct 01</span>
              <span>Oct 08</span>
              <span>Oct 15</span>
              <span>Oct 22</span>
              <span>Today</span>
            </div>
          </div>
        </motion.div>

        <footer className="p-10 text-center mt-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            © 2024 RetinaAI Clinical Systems / v2.4.1-stable / Encryption Active
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;