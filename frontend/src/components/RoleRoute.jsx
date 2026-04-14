import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye } from 'lucide-react';

const RoleRoute = ({ children, allowedRoles }) => {
    const { user, token, loading } = useContext(AuthContext);

    // Wait until auth state is fully resolved (prevents redirect flash)
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <Eye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={20} />
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // user may briefly be null after a refresh — wait until loaded
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard
        if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
        if (user.role === 'diagnosis_center') return <Navigate to="/diagnosis-center/" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default RoleRoute;
