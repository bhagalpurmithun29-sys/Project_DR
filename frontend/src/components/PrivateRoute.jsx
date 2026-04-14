import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye } from 'lucide-react';

const PrivateRoute = ({ children }) => {
    const { token, loading } = useContext(AuthContext);

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

    return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
