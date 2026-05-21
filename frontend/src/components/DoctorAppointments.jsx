import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import appointmentService from "../services/appointmentService";
import api, { normalizeUrl } from "../services/api";
import {
  Eye,
  LayoutDashboard,
  Activity,
  LogOut,
  ChevronRight,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  User,
  Shield,
  Bell,
  Settings,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CentralAlertsModal from './CentralAlertsModal';
import NodeSettingsModal from './NodeSettingsModal';

const formatSpecialization = (spec) => {
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

const DoctorAppointments = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const filteredAppointments = appointments
    .filter(app => {
      const matchStatus = filterStatus === 'all' || app.status === filterStatus;

      let matchDate = true;
      if (filterDate) {
        const appDateStr = new Date(app.date).toISOString().split('T')[0];
        matchDate = appDateStr === filterDate;
      }

      return matchStatus && matchDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;

      return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
    });

  const handleBulkAction = async (status) => {
    const pendingToUpdate = filteredAppointments.filter(app => app.status === 'pending');
    if (pendingToUpdate.length === 0) {
      alert("No pending appointments found in the current filtered view.");
      return;
    }

    if (!window.confirm(`Are you sure you want to mark all ${pendingToUpdate.length} pending appointments as ${status}?`)) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all(pendingToUpdate.map(app => appointmentService.updateStatus(app._id, status)));
      setAppointments(prev => prev.map(app => {
        const isUpdated = pendingToUpdate.some(p => p._id === app._id);
        return isUpdated ? { ...app, status } : app;
      }));
    } catch (err) {
      alert(err.message || "Failed to update some appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, appRes] = await Promise.all([
        api.get('/doctors/profile'),
        appointmentService.getDoctorAppointments('me')
      ]);
      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (appRes.success) setAppointments(appRes.data);
    } catch (err) {
      console.error("Failed to fetch doctor data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await appointmentService.updateStatus(id, status);
      if (res.success) {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      }
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
          <Eye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-main font-display text-slate-900 dark:text-slate-100 antialiased flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar - Reusing exactly from DoctorDashboard */}
      <aside className="fixed top-0 left-0 h-screen w-72 bg-sidebar border-r border-white/5 hidden lg:flex flex-col z-50">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="size-11 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white italic uppercase leading-none">Retinal AI</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-primary">Clinical Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
          <Link to="/doctor-dashboard" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <LayoutDashboard size={18} />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link to="/doctor/scan-history" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <Activity size={18} />
            <span className="text-sm">Scan History</span>
          </Link>
          <Link to="/doctor/appointments" className="flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/25 transition-all">
            <Calendar size={18} strokeWidth={2.5} />
            <span className="text-sm">Appointments</span>
          </Link>
          <Link to="/doctor-profile" className="flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <User size={18} />
            <span className="text-sm">Profile</span>
          </Link>
          <div className="pt-8 mb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">System</div>
          <button onClick={() => setIsAlertsOpen(true)} className="w-full flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group text-left">
            <Bell size={18} />
            <span className="text-sm">Notifications</span>
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group text-left">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5">
            <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm" style={{ backgroundImage: `url(${normalizeUrl(profile?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Doctor')}&background=059669&color=fff&bold=true`})` }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-white">Dr. {user?.name || "Provider"}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest break-words">
                {formatSpecialization(profile?.specialization)}
              </p>
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

        <header className="sticky top-0 h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between px-10 z-[60]">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Patient <span className="text-primary not-italic">Appointments</span></h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                {filterDate ? `Daily Queue` : `Total Queue`}: {
                  appointments.filter(app => {
                    if (app.status === 'rejected') return false;
                    if (!filterDate) return true;
                    const appDateStr = new Date(app.date).toISOString().split('T')[0];
                    return appDateStr === filterDate;
                  }).length
                }
              </span>
            </div>
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-10 space-y-10 w-full max-w-[1500px] mx-auto flex-1 flex flex-col"
        >
          {/* Controls Bar: Filters and Bulk Actions */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 w-full">
            {/* Filters Container */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 flex-1">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'completed', 'rejected'].map(status => {
                  const appointmentsOnSelectedDate = appointments.filter(app => {
                    if (!filterDate) return true;
                    const appDateStr = new Date(app.date).toISOString().split('T')[0];
                    return appDateStr === filterDate;
                  });
                  const count = status === 'all'
                    ? appointmentsOnSelectedDate.length
                    : appointmentsOnSelectedDate.filter(a => a.status === status).length;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilterStatus(status)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterStatus === status
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                          : 'bg-[#f8fafc]/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 hover:border-primary/20 text-slate-500 dark:text-slate-400'
                        }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Date Filter Input */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-[#f8fafc]/50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:border-primary/20 focus:ring-2 focus:ring-primary/5 transition-all"
                  title="Filter by Date"
                />
                {filterDate && (
                  <button
                    type="button"
                    onClick={() => setFilterDate('')}
                    className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    Clear Date
                  </button>
                )}
              </div>
            </div>

            {/* Bulk Action Buttons */}
            {filteredAppointments.some(a => a.status === 'pending') && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleBulkAction('confirmed')}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <Check size={14} strokeWidth={2.5} /> Confirm Filtered Pending
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAction('rejected')}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/10 transition-all flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <X size={14} strokeWidth={2.5} /> Reject Filtered Pending
                </button>
              </div>
            )}
          </motion.div>

          {/* Appointments Table */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/30 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-[#f8fafc]/50 dark:bg-slate-950/50">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Patient</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Schedule</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Reason</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  <AnimatePresence>
                    {filteredAppointments.length > 0 ? filteredAppointments.map((app) => (
                      <motion.tr
                        key={app._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-primary/[0.02] transition-all"
                      >
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            <div className="size-11 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 shadow-sm flex items-center justify-center font-black text-xs text-primary">
                              {app.patientId?.name?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-1">{app.patientId?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID: {app.patientId?.patientId || 'A-8829'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none italic">{new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                              <Clock size={10} /> {app.time}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${app.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20' :
                              app.status === 'completed' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-100 dark:border-indigo-500/20' :
                                app.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20' :
                                  app.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-500/20' :
                                    'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-100'
                            }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-xs font-bold text-slate-500 max-w-xs truncate italic">"{app.reason || 'Regular checkup'}"</p>
                        </td>
                        <td className="px-10 py-8 text-right">
                          {app.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'confirmed')}
                                className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                title="Confirm"
                              >
                                <Check size={18} strokeWidth={3} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                className="size-10 rounded-xl bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                                title="Reject"
                              >
                                <X size={18} strokeWidth={3} />
                              </button>
                            </div>
                          ) : app.status === 'confirmed' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'completed')}
                                className="px-4 h-10 rounded-xl bg-primary text-white flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest"
                                title="Mark as Completed"
                              >
                                <CheckCircle size={14} strokeWidth={2.5} /> Checkup Done
                              </button>
                            </div>
                          ) : (
                            <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-primary transition-all">
                              <MoreHorizontal size={20} />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-10 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-700">
                              <Calendar size={32} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No appointments in queue</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.section>
        </motion.div>

        {/* Footer */}
        <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            © 2026 Retinal AI Clinical Systems / Physician Portal / Node-{user?.id?.substring(0, 8) || "882B-7"}
          </p>
        </footer>
      </main>

      <CentralAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
      <NodeSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default DoctorAppointments;
