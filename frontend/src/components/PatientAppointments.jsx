import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import appointmentService from "../services/appointmentService";
import doctorService from "../services/doctorService";
import api, { normalizeUrl } from "../services/api";
import {
  Eye,
  LayoutDashboard,
  Activity,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  PlusCircle,
  Calendar,
  Clock,
  ArrowRight,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  X,
  User,
  ShieldCheck,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientPreferencesModal from './PatientPreferencesModal';

const PatientAppointments = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const patientRes = await patientService.getMyProfile();
      if (patientRes.success) {
        setPatient(patientRes.data);
        const [appRes, docRes] = await Promise.all([
          appointmentService.getPatientAppointments('me'),
          api.get('/auth/doctors')
        ]);
        if (appRes.success) setAppointments(appRes.data);
        if (docRes.data.success) setDoctors(docRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBookingLoading(true);

    try {
      const res = await appointmentService.createAppointment(bookingForm);
      if (res.success) {
        setSuccess('Appointment requested successfully!');
        setBookingForm({ doctorId: '', date: '', time: '', reason: '' });
        setTimeout(() => {
          setIsBookModalOpen(false);
          fetchData();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
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
    <div className="min-h-screen bg-main font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar - Reusing exactly from ScanHistory */}
      <aside className="fixed top-0 left-0 h-screen w-72 flex-shrink-0 bg-sidebar border-r border-white/5 hidden lg:flex flex-col z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white italic uppercase leading-none">RetinaAI</h1>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mt-1">Patients Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 mt-6 custom-scrollbar">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <LayoutDashboard size={18} />
            <span className="text-sm">Patient Dashboard</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <Activity size={18} />
            <span className="text-sm">Health Analytics</span>
          </Link>
          <Link to="/reports" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <History size={18} />
            <span className="text-sm">Reports</span>
          </Link>
          <Link to="/appointments" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/25 transition-all">
            <Calendar size={18} strokeWidth={2.5} />
            <span className="text-sm">Appointments</span>
          </Link>
          <Link to="/ai-assistant" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <MessageCircle size={18} />
            <span className="text-sm">AI Assistant</span>
          </Link>

          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account</p>
            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group text-left"
            >
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5 text-left">
            <div className="size-10 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-sm flex-shrink-0" style={{ backgroundImage: `url(${normalizeUrl(patient?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Patient')}&background=059669&color=fff&bold=true`})` }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-white">{user?.name || 'Patient'}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">Patient</p>
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Medical <span className="text-primary not-italic">Appointments</span></h1>
          </div>
          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <PlusCircle size={16} /> Book Appointment
          </button>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-10 space-y-10 w-full max-w-[1500px] mx-auto flex-1 flex flex-col"
        >
          {/* Appointments Table */}
          <motion.section variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-main/50">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Doctor</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Date & Time</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Reason</th>
                    <th className="px-10 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {appointments.length > 0 ? appointments.map((app) => (
                      <motion.tr
                        key={app._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-primary/[0.02] transition-all"
                      >
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-cover bg-center border-2 border-slate-50 shadow-sm" style={{ backgroundImage: `url(${normalizeUrl(app.doctorId?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.doctorId?.name || 'Dr')}&background=059669&color=fff&bold=true`})` }}></div>
                            <div>
                              <p className="text-sm font-black text-slate-900 leading-none">Dr. {app.doctorId?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{app.doctorId?.specialization || 'Specialist'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 tracking-tight leading-none italic">{new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                              <Clock size={10} /> {app.time}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            app.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-xs font-bold text-slate-500 max-w-xs truncate">{app.reason || 'Regular checkup'}</p>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button className="p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:text-primary transition-all">
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-10 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                              <Calendar size={32} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No appointments found</p>
                            <button onClick={() => setIsBookModalOpen(true)} className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Book your first appointment</button>
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
        <footer className="mt-auto px-10 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            © 2024 RetinaAI Clinical Systems / Appointments / Node-{user?._id?.substring(0, 8) || "882B-7"}
          </p>
        </footer>
      </main>

      {/* Book Appointment Modal - Reusing DiagnosisCenter style logic */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsBookModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
              <div className="px-8 pt-8 pb-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Book Appointment</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">Schedule a session with a retina specialist.</p>
                </div>
                <button onClick={() => setIsBookModalOpen(false)} className="size-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={handleBookAppointment} className="p-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Doctor</label>
                  <select 
                    required 
                    value={bookingForm.doctorId}
                    onChange={e => setBookingForm(f => ({ ...f, doctorId: e.target.value }))}
                    className="w-full pl-4 pr-8 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all appearance-none"
                  >
                    <option value="">— Choose a doctor —</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingForm.date}
                      onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                    <select 
                      required
                      value={bookingForm.time}
                      onChange={e => setBookingForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full pl-4 pr-8 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all appearance-none"
                    >
                      <option value="">— Time —</option>
                      {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Visit</label>
                  <textarea 
                    value={bookingForm.reason}
                    onChange={e => setBookingForm(f => ({ ...f, reason: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all resize-none"
                    placeholder="Briefly describe your concern..."
                    rows={3}
                  />
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold">
                    <CheckCircle size={14} /> {success}
                  </div>
                )}

                <button type="submit" disabled={bookingLoading}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60 transition-all">
                  {bookingLoading ? <div className="size-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : 'Confirm Booking Request'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PatientPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        patient={patient}
        user={user}
      />
    </div>
  );
};

export default PatientAppointments;
