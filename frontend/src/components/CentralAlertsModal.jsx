import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Bell, Shield, Activity, Settings, UserPlus,
    CheckCircle2, ArrowRight, Loader2, RefreshCw, FileText, Inbox, Trash2
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// Map backend type → visual style
const TYPE_MAP = {
    Security: { Icon: Shield,   color: 'text-rose-500',   bg: 'bg-rose-50',   border: 'border-rose-100'  },
    Report:   { Icon: FileText, color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-100' },
    System:   { Icon: Settings, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
    patient:  { Icon: UserPlus, color: 'text-primary',    bg: 'bg-primary/5', border: 'border-primary/10' },
};

const fallback = { Icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' };

function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

const CentralAlertsModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [alerts, setAlerts]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [markingAll, setMarkingAll] = useState(false);
    const [readIds, setReadIds]       = useState(new Set());

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/notifications');
            setAlerts(res.data.data || []);
        } catch {
            setError('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) fetchAlerts();
    }, [isOpen, fetchAlerts]);

    const handleMarkOne = async (id) => {
        if (readIds.has(id)) return;
        try {
            await api.put(`/notifications/${id}/read`);
            setReadIds(prev => new Set([...prev, id]));
            setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
        } catch { /* silent */ }
    };

    const handleMarkAll = async () => {
        if (markingAll) return;
        setMarkingAll(true);
        try {
            await api.put('/notifications/read-all');
            setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
            setReadIds(prev => new Set([...prev, ...alerts.map(a => a._id)]));
        } catch { /* silent */ } finally {
            setMarkingAll(false);
        }
    };

    const handleDeleteOne = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setAlerts(prev => prev.filter(a => a._id !== id));
        } catch { /* silent */ }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Clear all notifications?')) return;
        try {
            await api.delete('/notifications');
            setAlerts([]);
        } catch { /* silent */ }
    };

    const handleAction = (alert) => {
        handleMarkOne(alert._id);
        if (alert.type === 'Report' && alert.relatedId) {
            onClose();
            navigate(`/report/${alert.relatedId}`);
        } else if (alert.type === 'Security') {
            onClose();
            navigate('/doctor/scan-history');
        }
    };

    const unreadCount = alerts.filter(a => !a.isRead && !readIds.has(a._id)).length;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-sidebar/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                    <Bell size={20} strokeWidth={2.5} />
                                </div>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 size-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Notifications</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Notifications</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchAlerts}
                                disabled={loading}
                                title="Refresh"
                                className="size-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={handleDeleteAll}
                                disabled={loading || alerts.length === 0}
                                title="Clear All"
                                className="size-8 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors disabled:opacity-30"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button
                                onClick={onClose}
                                className="size-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-xs font-bold text-slate-500">
                                Recent Activity
                                {unreadCount > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-black rounded-md">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAll}
                                    disabled={markingAll}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/70 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                >
                                    {markingAll
                                        ? <Loader2 size={11} className="animate-spin" />
                                        : <CheckCircle2 size={12} />
                                    }
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="py-16 flex flex-col items-center gap-3">
                                <Loader2 size={28} className="animate-spin text-primary/40" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fetching alerts…</p>
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div className="py-12 flex flex-col items-center gap-3">
                                <p className="text-xs font-bold text-rose-400">{error}</p>
                                <button onClick={fetchAlerts} className="text-[10px] font-black text-primary uppercase tracking-widest underline underline-offset-4">Retry</button>
                            </div>
                        )}

                        {/* Empty */}
                        {!loading && !error && alerts.length === 0 && (
                            <div className="py-16 flex flex-col items-center gap-4">
                                <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                                    <Inbox size={32} />
                                </div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No alerts at this time</p>
                            </div>
                        )}

                        {/* Alert list */}
                        {!loading && !error && alerts.length > 0 && (
                            <div className="space-y-3">
                                <AnimatePresence initial={false}>
                                    {alerts.map((alert, i) => {
                                        const style = TYPE_MAP[alert.type] || fallback;
                                        const isRead = alert.isRead || readIds.has(alert._id);
                                        const hasAction = alert.type === 'Report' || alert.type === 'Security';
                                        return (
                                            <motion.div
                                                key={alert._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: isRead ? 0.65 : 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`relative p-4 rounded-2xl border ${style.bg} ${style.border} group transition-all`}
                                            >
                                                {/* Unread dot */}
                                                {!isRead && (
                                                    <span className="absolute top-3.5 right-3.5 size-2 bg-primary rounded-full shadow-[0_0_6px_rgba(5,150,105,0.5)]" />
                                                )}

                                                <div className="flex gap-3">
                                                    <div className={`size-10 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0 ${style.color}`}>
                                                        <style.Icon size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <h4 className={`text-sm font-bold leading-tight ${isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                                                                {alert.title}
                                                            </h4>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
                                                                {timeAgo(alert.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{alert.message}</p>

                                                        <div className="flex items-center gap-3 mt-3">
                                                            {!isRead && (
                                                                <button
                                                                    onClick={() => handleMarkOne(alert._id)}
                                                                    className="text-[9px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1"
                                                                >
                                                                    <CheckCircle2 size={10} /> Mark read
                                                                </button>
                                                            )}
                                                            {hasAction && (
                                                                <button
                                                                    onClick={() => handleAction(alert)}
                                                                    className={`text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 ${style.color} hover:opacity-70`}
                                                                >
                                                                    View <ArrowRight size={10} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteOne(alert._id)}
                                                                className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && alerts.length > 0 && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {alerts.length} total · {unreadCount} unread
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CentralAlertsModal;
