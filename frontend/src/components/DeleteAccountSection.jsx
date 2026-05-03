import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Trash2, Lock, Loader2, X,
    ShieldAlert, ChevronRight, AlertCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DeleteAccountSection = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // UI State
    const [confirmText, setConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') return;

        setLoading(true);
        setError('');
        try {
            const res = await api.delete('/auth/delete-account', {
                data: { password }
            });

            if (res.data.success) {
                // Logout and redirect
                logout();
                navigate('/login', { state: { message: 'Your account has been deleted.' } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account. Please verify your password.');
            setShowConfirmModal(false);
        } finally {
            setLoading(false);
        }
    };

    const isReady = confirmText === 'DELETE' && password.length >= 4;

    return (
        <div className="space-y-6">
            <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-[2rem] p-8">
                <div className="flex items-start gap-5 mb-8">
                    <div className="size-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 flex-shrink-0">
                        <ShieldAlert size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-rose-600 dark:text-rose-500 tracking-tight leading-none mb-2">Delete My Account</h3>
                        <p className="text-sm font-bold text-rose-500/80 leading-relaxed">
                            This action is permanent and cannot be undone. All your patient data, reports,
                            medical scans, and account settings will be erased from our servers immediately.
                        </p>
                    </div>
                </div>

                <div className="space-y-5 max-w-md">
                    {/* Confirmation Case-Sensitive Type-in */}
                    <div className="space-y-2">
                        <label htmlFor="delete-account-confirm-text" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Type <span className="text-rose-500 italic">DELETE</span> to confirm</label>
                        <div className="relative group">
                            <Trash2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={16} />
                            <input
                                id="delete-account-confirm-text"
                                name="delete_account_confirm_text"
                                autoComplete="off"
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-black text-rose-500 placeholder:text-slate-200 dark:placeholder:text-slate-700 outline-none focus:border-rose-500/20 focus:ring-4 focus:ring-rose-500/5 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Verification */}
                    <div className="space-y-2">
                        <label htmlFor="delete-account-password" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Verify Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                id="delete-account-password"
                                name="delete_account_password"
                                autoComplete="current-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-bold animate-pulse">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={!isReady || loading}
                        className="w-full h-14 rounded-2xl bg-rose-500 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:bg-rose-600 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={16} /> Delete Account permanently</>}
                    </button>
                </div>
            </div>

            {/* Double Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowConfirmModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center"
                        >
                            <div className="size-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-6">
                                <AlertTriangle size={40} strokeWidth={2.5} />
                            </div>

                            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Are you 100% sure?</h4>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                                This action is permanent. You will lose access to all your diagnostic patterns and patient data forever.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="w-full h-14 rounded-2xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Yes, Delete Everything"}
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={loading}
                                    className="w-full h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    No, Keep my account
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeleteAccountSection;
