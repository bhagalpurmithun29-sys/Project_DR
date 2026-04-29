import axios from 'axios';

const LOCAL_DEV_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

const trimTrailingSlashes = (value) => value.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
    const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

    if (configuredBaseUrl) {
        const normalizedBaseUrl = trimTrailingSlashes(configuredBaseUrl);
        return normalizedBaseUrl.endsWith('/api')
            ? normalizedBaseUrl
            : `${normalizedBaseUrl}/api`;
    }

    if (import.meta.env.DEV && typeof window !== 'undefined') {
        const { hostname } = window.location;

        if (LOCAL_DEV_HOSTS.has(hostname)) {
            const backendHost = hostname === '0.0.0.0' ? 'localhost' : hostname;
            return `http://${backendHost}:5001/api`;
        }
    }

    return '/api';
};

export const getApiErrorMessage = (error, fallbackMessage = 'Something went wrong. Please try again.') => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.code === 'ERR_NETWORK') {
        return 'Cannot reach the backend API. Start the backend server on port 5001 and try again.';
    }

    if (error.response?.status === 404) {
        return 'The requested API route was not found. Make sure the backend server is running on port 5001.';
    }

    if (error.response?.status === 503) {
        return error.response.data.message || 'Database is currently offline. Please check your MongoDB Atlas connection or IP whitelist.';
    }

    return fallbackMessage;
};

const api = axios.create({
    baseURL: resolveApiBaseUrl(),
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stale token + redirect to login
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const normalizeUrl = (url) => {
    if (!url) return null;
    const baseUrl = resolveApiBaseUrl().replace('/api', '');
    
    // If it's a full URL (Cloudinary or otherwise), return as is
    if (url.startsWith('http')) return url;
    
    // If it's a relative path, prepend the base URL
    const separator = url.startsWith('/') ? '' : '/';
    // If backend returns just the filename, we assume it's in /uploads/
    const isFilenameOnly = !url.includes('/') && !url.startsWith('http');
    const path = isFilenameOnly ? `/uploads/${url}` : `${separator}${url}`;
    
    return `${baseUrl}${path}`;
};

export default api;
