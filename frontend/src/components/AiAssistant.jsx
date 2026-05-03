import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import { normalizeUrl } from "../services/api";
import {
  Activity, LayoutDashboard, History, Settings, LogOut, MessageCircle, Calendar
} from 'lucide-react';
import PatientPreferencesModal from './PatientPreferencesModal';
import SharedChat from './SharedChat';

const AiAssistant = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Load profile
  useEffect(() => {
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
    void loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-main font-display text-slate-900 antialiased flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
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
          <Link to="/appointments" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold group">
            <Calendar size={18} />
            <span className="text-sm">Appointments</span>
          </Link>
          <Link to="/ai-assistant" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/25 transition-all">
            <MessageCircle size={18} strokeWidth={2.5} />
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

      {/* Main Content (Chat Area) */}
      <main className="flex-1 h-screen flex flex-col bg-white lg:ml-72 relative overflow-hidden min-h-0">
        <SharedChat variant="full" />
      </main>

      <PatientPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        patient={patient}
        user={user}
        onProfileUpdate={(updated) => setPatient(prev => ({ ...prev, ...updated }))}
      />
    </div>
  );
};

export default AiAssistant;
