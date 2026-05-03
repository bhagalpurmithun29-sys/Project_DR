import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ChatProvider } from './context/ChatContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/PatientDashboard';
import DoctorRegistration from './pages/DoctorRegistration';
import DoctorProfile from './pages/DoctorProfile';
import DoctorScanHistory from './components/DoctorScanHistory';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import './index.css';
import PatientAnalytics from './components/PatientAnalytics';
import PatientScanHistory from './components/PatientScanHistory';
import AiAssistant from './components/AiAssistant';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientReport from './pages/PatientReport';
import DiagnosisCenterDashboard from './pages/DiagnosisCenterDashboard';
import ProfileSetup from './pages/ProfileSetup';
import SharedChat from './components/SharedChat';
import PatientAppointments from './components/PatientAppointments';
import DoctorAppointments from './components/DoctorAppointments';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Exact patient-only routes where the chatbot is allowed
const PATIENT_ROUTES = ['/dashboard', '/analytics', '/reports', '/appointments'];

/**
 * Renders the DiabetesChatbot ONLY when:
 * 1. The logged-in user's role is 'patient'
 * 2. The current URL is a patient-specific route
 *
 * This prevents the chatbot from appearing on the landing page,
 * login page, doctor pages, or any other non-patient screen.
 * Must be rendered inside <Router> so useLocation works.
 */
function PatientChatbot() {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isPatientRoute =
    (PATIENT_ROUTES.includes(pathname) || pathname.startsWith('/report/')) &&
    !pathname.toLowerCase().includes('ai-assistant');

  if (!user || user.role !== 'patient' || !isPatientRoute) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xl max-w-[200px]"
            >
              <p className="text-[11px] font-bold text-slate-500 leading-tight">
                🩺 Ask about <span className="text-primary font-black">diabetes</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          className="relative size-14 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center transition-all"
          style={{ background: isOpen ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#059669,#10b981)' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={22} className="text-white" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle size={22} className="text-white" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 right-6 z-[9998]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, originX: 1, originY: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <SharedChat variant="floating" onClose={() => setIsOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ChatProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/google/callback" element={<div className="min-h-screen bg-main flex items-center justify-center font-bold">Verifying...</div>} />
                <Route
                  path="/profile-setup"
                  element={
                    <PrivateRoute>
                      <ProfileSetup />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RoleRoute allowedRoles={['patient']}>
                      <Dashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/doctor-registration"
                  element={
                    <PrivateRoute>
                      <DoctorRegistration />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <RoleRoute allowedRoles={['patient']}>
                      <PatientAnalytics />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/doctor-dashboard"
                  element={
                    <RoleRoute allowedRoles={['doctor']}>
                      <DoctorDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/doctor-profile"
                  element={
                    <RoleRoute allowedRoles={['doctor']}>
                      <DoctorProfile />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/doctor/scan-history"
                  element={
                    <RoleRoute allowedRoles={['doctor']}>
                      <DoctorScanHistory />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/doctor/appointments"
                  element={
                    <RoleRoute allowedRoles={['doctor']}>
                      <DoctorAppointments />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/report/:id"
                  element={
                    <PrivateRoute>
                      <PatientReport />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <RoleRoute allowedRoles={['patient']}>
                      <PatientScanHistory />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <RoleRoute allowedRoles={['patient']}>
                      <PatientAppointments />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <RoleRoute allowedRoles={['patient']}>
                      <AiAssistant />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/diagnosis-center/*"
                  element={
                    <RoleRoute allowedRoles={['diagnosis_center']}>
                      <DiagnosisCenterDashboard />
                    </RoleRoute>
                  }
                />
                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>

              {/*
                DiabetesChatbot — visible ONLY when:
                · user.role === 'patient'
                · current URL is a patient route (/dashboard, /analytics, /scan-history, /tips, /report/*)
                Hidden on: landing page, login, register, doctor pages, diagnosis center pages
              */}
              <PatientChatbot />
            </Router>
          </ChatProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
