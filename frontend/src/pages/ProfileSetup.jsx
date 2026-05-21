import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { SECURITY_QUESTIONS } from '../constants/securityQuestions';

const ProfileSetup = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [q1, setQ1] = useState('');
    const [a1, setA1] = useState('');
    const [q2, setQ2] = useState('');
    const [a2, setA2] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [hasSecurityQuestions, setHasSecurityQuestions] = useState(null);
    const [showPendingModal, setShowPendingModal] = useState(false);

    const defaultNextRoute = user?.role === 'doctor' || user?.role === 'technician'
        ? '/doctor-dashboard'
        : user?.role === 'diagnosis_center'
            ? '/diagnosis-center/'
            : '/dashboard';
    const nextRoute = location.state?.nextRoute || defaultNextRoute;

    useEffect(() => {
        const loadMe = async () => {
            if (loading || !user) return;
            try {
                const res = await api.get('/auth/me');
                const questions = res?.data?.data?.securityQuestions || [];
                setHasSecurityQuestions(questions.length === 2);
            } catch {
                setHasSecurityQuestions(false);
            }
        };
        loadMe();
    }, [loading, user]);

    useEffect(() => {
        if (hasSecurityQuestions) {
            navigate(nextRoute, { replace: true });
        }
    }, [hasSecurityQuestions, navigate, nextRoute]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!q1 || !a1 || !q2 || !a2) {
            setError('Please select and answer two different security questions.');
            return;
        }

        if (q1 === q2) {
            setError('Please select two different security questions.');
            return;
        }

        setSaving(true);
        try {
            await api.put('/auth/security-questions', {
                securityQuestions: [
                    { question: q1, answer: a1 },
                    { question: q2, answer: a2 },
                ],
            });

            if (user?.role === 'diagnosis_center') {
                setShowPendingModal(true);
            } else {
                navigate(nextRoute);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save security questions');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user || hasSecurityQuestions === null) {
        return null;
    }

    return (
        <div className="min-h-screen bg-main flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl"
            >
                <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3">
                        <Shield className="text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Profile Setup</h1>
                        <p className="text-sm font-medium text-slate-500">Set your security questions to finish account setup.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="profile-setup-question-1" className="text-xs font-black uppercase tracking-widest text-slate-400">Security Question 1</label>
                        <select
                            id="profile-setup-question-1"
                            name="security_question_1"
                            autoComplete="off"
                            required
                            value={q1}
                            onChange={(e) => setQ1(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary/50"
                        >
                            <option value="" disabled>Select a question...</option>
                            {SECURITY_QUESTIONS.filter((q) => q !== q2).map((q) => (
                                <option key={q} value={q}>{q}</option>
                            ))}
                        </select>
                        <input
                            id="profile-setup-answer-1"
                            name="security_answer_1"
                            autoComplete="off"
                            required
                            value={a1}
                            onChange={(e) => setA1(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-primary/50"
                            placeholder="Your answer"
                            type="text"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="profile-setup-question-2" className="text-xs font-black uppercase tracking-widest text-slate-400">Security Question 2</label>
                        <select
                            id="profile-setup-question-2"
                            name="security_question_2"
                            autoComplete="off"
                            required
                            value={q2}
                            onChange={(e) => setQ2(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary/50"
                        >
                            <option value="" disabled>Select a question...</option>
                            {SECURITY_QUESTIONS.filter((q) => q !== q1).map((q) => (
                                <option key={q} value={q}>{q}</option>
                            ))}
                        </select>
                        <input
                            id="profile-setup-answer-2"
                            name="security_answer_2"
                            autoComplete="off"
                            required
                            value={a2}
                            onChange={(e) => setA2(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-primary/50"
                            placeholder="Your answer"
                            type="text"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 font-black text-white disabled:opacity-60"
                    >
                        <CheckCircle2 size={18} />
                        {saving ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </motion.div>

            <AnimatePresence>
                {showPendingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-2xl text-center"
                        >
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 animate-pulse">
                                <Shield size={40} className="stroke-[2.5]" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                                Registration Received!
                            </h3>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">
                                Verification Pending
                            </p>
                            
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                                Your security questions have been configured successfully. As part of our clinical security and compliance protocols, your Diagnostic Center registration is currently pending review by the administrator. Once approved, you will be able to sign in to your dashboard.
                            </p>
                            
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login', { replace: true });
                                }}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-600/10"
                            >
                                Back to Login
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileSetup;
