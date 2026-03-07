import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
    const { user, token, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user?.role)) {
        // Redirect to their respective dashboards if they try to access unauthorized pages
        return user?.role === 'doctor' ? <Navigate to="/doctor-dashboard" /> : <Navigate to="/dashboard" />;
    }

    return children;
};

export default RoleRoute;
