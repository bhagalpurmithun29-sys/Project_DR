import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
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
import Tips from './components/Tips';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientReport from './pages/PatientReport';
import DiagnosisCenterDashboard from './pages/DiagnosisCenterDashboard';
import ProfileSetup from './pages/ProfileSetup';
import DiabetesChatbot from './components/DiabetesChatbot';

// Exact patient-only routes where the chatbot is allowed
const PATIENT_ROUTES = ['/dashboard', '/analytics', '/scan-history'];

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

  const isPatientRoute =
    PATIENT_ROUTES.includes(pathname) ||
    pathname.startsWith('/report/');

  if (!user || user.role !== 'patient' || !isPatientRoute) return null;

  return <DiabetesChatbot />;
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
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
                path="/report/:id"
                element={
                  <PrivateRoute>
                    <PatientReport />
                  </PrivateRoute>
                }
              />
              <Route
                path="/scan-history"
                element={
                  <RoleRoute allowedRoles={['patient']}>
                    <PatientScanHistory />
                  </RoleRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <RoleRoute allowedRoles={['patient']}>
                    <Tips />
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
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
