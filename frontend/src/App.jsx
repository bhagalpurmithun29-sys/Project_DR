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


            </Router>
          </ChatProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
