import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
              path="/tips"
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
        </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
