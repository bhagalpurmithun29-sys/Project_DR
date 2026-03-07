import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
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
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
