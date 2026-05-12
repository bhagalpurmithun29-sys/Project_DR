import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Users,
  UserCheck,
  Activity,
  Building2,
  Calendar,
  Mail,
  ShieldCheck,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";

const getSpecializationLabel = (spec) => {
  if (!spec) return 'Retina Specialist';
  const mapping = {
    'dr_scanning': 'Diabetic Retinopathy scanning',
    'medical_dr': 'Medical Diabetic Retinopathy',
    'dr_surgery': 'Advanced DR & Vitreoretinal Surgery',
    'dr_lasers': 'Laser & DR Therapeutics',
    'general': 'General Retina',
    'retina': 'Medical Retina',
    'surgery': 'Vitreoretinal Surgery',
    'pediatric': 'Pediatric Retina'
  };
  return mapping[spec] || spec;
};

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "pending" | "verified" | "rejected"
  const [activeRole, setActiveRole] = useState("doctor"); // "doctor" | "diagnosis_center"
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/admin/users");
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to retrieve user accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (userId, status) => {
    try {
      const res = await api.put("/auth/admin/verify", { userId, status });
      if (res.data.success) {
        showToast(`Account successfully updated to ${status}.`, "success");
        // Optimistic state update
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, isVerified: status } : u));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Compute analytics
  const totalUsers = usersList.length;
  const pendingCount = usersList.filter(u => u.isVerified === "pending").length;
  const verifiedCount = usersList.filter(u => u.isVerified === "verified").length;
  const rejectedCount = usersList.filter(u => u.isVerified === "rejected").length;

  const clinicianCount = usersList.filter(u => u.role === "doctor").length;
  const diagnosticCenterCount = usersList.filter(u => u.role === "diagnosis_center").length;

  // Filter & Search users
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || u.isVerified === activeFilter;
    const matchesRole = u.role === activeRole;
    return matchesSearch && matchesFilter && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-display text-slate-800 antialiased pb-12">
      {/* ── TOP HEADER ── */}
      <div className="relative overflow-hidden py-10 px-8 text-white shadow-2xl" style={{ background: "linear-gradient(135deg, #059669 0%, #022c22 100%)" }}>
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md">
              <Activity className="text-white" size={32} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500 text-white font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={10} strokeWidth={3} /> CLINICAL GRADE AI V1.0
                  </span>
                  <span className="text-[10px] bg-white/15 text-white/90 font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    SYSTEM ADMIN
                  </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight mt-1.5">Visionary Precision AI</h1>
                <p className="text-emerald-200/80 text-sm font-semibold mt-1 max-w-2xl">
                  Advanced automatic eye scanning for diabetic retinopathy, helping administrators with doctor verification and hospital/facility audit reports.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:-translate-y-0.5"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-6 mt-10">

        {/* ── ANALYTICS WIDGETS ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Registered", count: totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Pending Verification", count: pendingCount, icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Verified Credentials", count: verifiedCount, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
            { label: "Rejected Applications", count: rejectedCount, icon: ShieldAlert, color: "text-rose-600 bg-rose-50" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{card.label}</span>
                <h3 className="text-4xl font-black text-slate-900 mt-2">{card.count}</h3>
              </div>
              <div className={`rounded-2xl p-4 ${card.color}`}>
                <card.icon size={24} strokeWidth={2.5} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SEPARATE SECTION SELECTOR (CLINICIANS VS DIAGNOSTIC CENTERS) ── */}
        <div className="mb-8 flex items-center justify-center p-1.5 bg-slate-200/50 rounded-[2rem] h-16 max-w-2xl mx-auto shadow-inner gap-1 border border-slate-300/5">
          <button
            onClick={() => setActiveRole("doctor")}
            className={`flex-1 flex items-center justify-center gap-3 h-full rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all ${activeRole === "doctor"
                ? "bg-white text-emerald-700 shadow-md"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <Activity size={16} strokeWidth={2.5} />
            <span>Clinicians / Doctors</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeRole === "doctor" ? "bg-emerald-100 text-emerald-800" : "bg-slate-300/50 text-slate-600"}`}>
              {clinicianCount}
            </span>
          </button>
          <button
            onClick={() => setActiveRole("diagnosis_center")}
            className={`flex-1 flex items-center justify-center gap-3 h-full rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all ${activeRole === "diagnosis_center"
                ? "bg-white text-blue-700 shadow-md"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <Building2 size={16} strokeWidth={2.5} />
            <span>Diagnostic Centers</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeRole === "diagnosis_center" ? "bg-blue-100 text-blue-800" : "bg-slate-300/50 text-slate-600"}`}>
              {diagnosticCenterCount}
            </span>
          </button>
        </div>

        {/* ── FILTER & SEARCH SECTION ── */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
            {[
              { id: "all", label: "All Users" },
              { id: "pending", label: "Pending" },
              { id: "verified", label: "Verified" },
              { id: "rejected", label: "Rejected" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeFilter === tab.id
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3 pl-12 pr-5 text-sm font-bold text-slate-800 outline-none transition-all focus:bg-white focus:border-emerald-600/30 focus:ring-4 focus:ring-emerald-600/5 shadow-inner"
            />
          </div>
        </div>

        {/* ── DATA SECTION ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4" />
            <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Retrieving system accounts...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center bg-white border border-slate-100 rounded-[2.5rem] py-20 px-6">
            <ShieldCheck size={56} className="mx-auto text-slate-300 mb-4" />
            <h4 className="text-lg font-black text-slate-800">No accounts match search filters</h4>
            <p className="text-slate-500 text-sm font-medium mt-1">All accounts are up to date and audit verified.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((item, index) => {
                const isPending = item.isVerified === "pending";
                const isVerified = item.isVerified === "verified";
                const isRejected = item.isVerified === "rejected";

                return (
                  <motion.div
                    layout
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    {/* Role Tag & Status Watermark */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        {item.role === "doctor" ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-700 font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                            <Activity size={12} /> Clinician
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] bg-blue-50 text-blue-700 font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                            <Building2 size={12} /> Diagnostic Center
                          </span>
                        )}
                      </div>

                      {/* Status indicator */}
                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                            <CheckCircle size={12} /> Active Verified
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                            <XCircle size={12} /> Rejected Profile
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main Credentials */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{item.name}</h4>
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs mt-1.5">
                          <Mail size={14} className="text-slate-400" />
                          <span>{item.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs mt-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span>Joined: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Professional Info details */}
                      {item.profile && (
                        <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2 border border-slate-100">
                          {item.profile.licenseNumber && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Medical License</span>
                              <span className="font-black text-slate-800">{item.profile.licenseNumber}</span>
                            </div>
                          )}
                          {item.profile.specialization && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Specialization</span>
                              <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{getSpecializationLabel(item.profile.specialization)}</span>
                            </div>
                          )}
                          {item.profile.centerType && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Facility Type</span>
                              <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{item.profile.centerType}</span>
                            </div>
                          )}
                          {item.profile.experience && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Experience</span>
                              <span className="font-black text-slate-800">{item.profile.experience} years</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Verification Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-auto">
                      {!isVerified && (
                        <button
                          onClick={() => handleVerify(item._id, "verified")}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-sm transition-colors"
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                      )}
                      {!isRejected && (
                        <button
                          onClick={() => handleVerify(item._id, "rejected")}
                          className={`flex-1 inline-flex items-center justify-center gap-2 border-2 text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all ${isVerified
                              ? "border-slate-100 hover:border-rose-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "border-rose-600 text-rose-600 hover:bg-rose-50"
                            }`}
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Toast Messages */}
      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
