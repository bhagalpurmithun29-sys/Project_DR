/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    }, []);

    // Load user details if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.data);
                } catch (error) {
                    console.error('Failed to fetch user:', error.response?.data?.message || error.message);
                    // Token invalid/expired — clear it so user is redirected to login
                    logout();
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token, logout]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success) {
            setToken(res.data.data.token);
            setUser(res.data.data);
            localStorage.setItem('token', res.data.data.token);
        }
        return res.data;
    };

    const register = async (name, email, password, role, age) => {
        const res = await api.post('/auth/register', { name, email, password, role, age });
        if (res.data.success) {
            setToken(res.data.data.token);
            setUser(res.data.data);
            localStorage.setItem('token', res.data.data.token);
        }
        return res.data;
    };

    const loginWithGoogle = async (googleToken, role) => {
        const res = await api.post('/auth/google', { accessToken: googleToken, role });
        if (res.data.success) {
            setToken(res.data.data.token);
            setUser(res.data.data);
            localStorage.setItem('token', res.data.data.token);
        }
        return res.data;
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, login, register, loginWithGoogle, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
