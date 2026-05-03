import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    User,
    Stethoscope,
    UserPlus,
    ChevronLeft,
    Activity,
    Mail,
    Lock,
    Calendar,
    Building2,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useGoogleLogin } from '@react-oauth/google';
import { getApiErrorMessage } from '../services/api';

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const Register = () => {
    const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);
    const { register, loginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    // ── Google Sign-Up Handler ──
    const handleGoogleSignupSuccess = async (tokenResponse) => {
        setGoogleLoading(true);
        setError('');
        try {
            const res = await loginWithGoogle(tokenResponse.access_token, role);
            if (res?.data?.requiresSecuritySetup) {
                // New user — route to profile setup, then to role-specific dashboard
                const nextRoute = role === 'doctor'
                    ? '/doctor-registration'
                    : role === 'diagnosis_center'
                        ? '/diagnosis-center/'
                        : '/dashboard';
                navigate('/profile-setup', { state: { nextRoute } });
                return;
            }
            // Existing user signed in via Google — route directly to dashboard
            const userRole = res?.data?.role;
            if (userRole === 'doctor' || userRole === 'technician') {
                navigate('/doctor-dashboard');
            } else if (userRole === 'diagnosis_center') {
                navigate('/diagnosis-center/');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(getApiErrorMessage(err, 'Google Sign-Up failed. Please try again.'));
        } finally {
            setGoogleLoading(false);
        }
    };

    const googleSignupHandler = useGoogleLogin({
        onSuccess: handleGoogleSignupSuccess,
        redirect_uri: window.location.origin,
        onError: () => setError('Google Sign-Up was unsuccessful. Please try again.'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Strict Validation Regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

        if (!emailRegex.test(email)) {
            setError('Please provide a valid email address.');
            return;
        }

        if (!passwordRegex.test(password)) {
            setError('Password must be 8-12 characters and include uppercase, lowercase, numbers, and a special character.');
            return;
        }

        try {
            // Calculate age from dob
            let age = 0;
            if (dob) {
                const birthDate = new Date(dob);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            await register(name, email, password, role, age);
            const nextRoute = role === 'doctor'
                ? '/doctor-registration'
                : role === 'diagnosis_center'
                    ? '/diagnosis-center/'
                    : '/dashboard';
            navigate('/profile-setup', { state: { nextRoute } });
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to register'));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    return (
        <div className="font-display bg-main text-slate-900 antialiased h-screen overflow-hidden">
            <div className="flex h-screen w-full">
                {/* Left Side Branding */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hidden lg:flex lg:w-5/12 bg-primary relative overflow-hidden flex-col justify-between p-16"
                    style={{ background: "linear-gradient(135deg, #059669 0%, #022c22 100%)" }}
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <motion.svg
                            animate={{ rotate: -360 }}
                            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                            height="100%" viewBox="0 0 800 800" width="100%" xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="400" cy="400" fill="none" opacity="0.5" r="300" stroke="white" strokeWidth="1"></circle>
                            <circle cx="400" cy="400" fill="none" opacity="0.3" r="200" stroke="white" strokeWidth="0.5"></circle>
                            <path d="M400 100 Q 450 400 400 700" fill="none" opacity="0.2" stroke="white" strokeWidth="0.5"></path>
                            <path d="M100 400 Q 400 450 700 400" fill="none" opacity="0.2" stroke="white" strokeWidth="0.5"></path>
                        </motion.svg>
                    </div>

                    <Link to="/" className="relative z-10 flex items-center gap-3 w-fit group">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md transition-transform group-hover:scale-110">
                            <Activity className="text-white" size={28} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-white text-xl font-black tracking-tight italic uppercase">RetinaAI</h2>
                    </Link>

                    <div className="relative z-10">
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white text-7xl font-black leading-[1.05] tracking-tight max-w-sm"
                        >
                            Elevating <br />
                            <span className="text-white/70 italic">patient outcomes</span> with AI.
                        </motion.h1>
                        <div className="mt-8 h-1.5 w-24 bg-white/20 rounded-full" />
                    </div>

                    <div className="relative z-10 flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span>© 2024 RetinaAI Systems Inc.</span>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">HIPAA</a>
                        </div>
                    </div>

                    <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-pulse"></div>
                </motion.div>

                {/* Right Side Form */}
                <div className="w-full lg:w-7/12 flex flex-col items-center p-6 sm:p-12 lg:p-16 bg-main overflow-y-auto custom-scrollbar">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full max-w-[580px]"
                    >
                        {/* Back Button */}
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-10 group">
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Login
                        </Link>

                        <div className="mb-10">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Create Account</h2>
                            <p className="text-lg font-medium text-slate-500">Join the next generation of AI-powered Retina.</p>
                        </div>

                        {error && <div className="p-4 mb-8 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl">{error}</div>}

                        <div className="space-y-10">
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Identity</h3>
                                {/* Role Cards — 3 columns */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Patient */}
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        onClick={() => setRole('patient')}
                                        className={`cursor-pointer group relative p-5 rounded-3xl transition-all duration-300 shadow-sm ${role === 'patient'
                                            ? 'border-slate-900 bg-white ring-4 ring-primary/20'
                                            : 'border-white bg-white/40 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${role === 'patient' ? 'bg-slate-100 text-black shadow-lg shadow-slate-200/50' : 'bg-slate-100 text-slate-400'}`}>
                                                <User size={22} strokeWidth={2.5} />
                                            </div>
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${role === 'patient' ? 'bg-primary border-slate-900' : 'border-slate-200'}`}>
                                                {role === 'patient' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-base">Patient</h4>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1 leading-relaxed">Access your eye health data and reports.</p>
                                    </motion.div>

                                    {/* Doctor */}
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        onClick={() => setRole('doctor')}
                                        className={`cursor-pointer group relative p-5 rounded-3xl transition-all duration-300 shadow-sm ${role === 'doctor'
                                            ? 'border-slate-900 bg-white ring-4 ring-primary/20'
                                            : 'border-white bg-white/40 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${role === 'doctor' ? 'bg-slate-100 text-black shadow-lg shadow-slate-200/50' : 'bg-slate-100 text-slate-400'}`}>
                                                <Stethoscope size={22} strokeWidth={2.5} />
                                            </div>
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${role === 'doctor' ? 'bg-primary border-slate-900' : 'border-slate-200'}`}>
                                                {role === 'doctor' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-base">Clinician</h4>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1 leading-relaxed">Advanced screening tools and patient management.</p>
                                    </motion.div>

                                    {/* Diagnosis Center */}
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        onClick={() => setRole('diagnosis_center')}
                                        className={`cursor-pointer group relative p-5 rounded-3xl transition-all duration-300 shadow-sm ${role === 'diagnosis_center'
                                            ? 'border-slate-900 bg-white ring-4 ring-primary/20'
                                            : 'border-white bg-white/40 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${role === 'diagnosis_center' ? 'bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'bg-slate-100 text-slate-400'}`}>
                                                <Building2 size={22} strokeWidth={2.5} />
                                            </div>
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${role === 'diagnosis_center' ? 'bg-primary border-slate-900' : 'border-slate-200'}`}>
                                                {role === 'diagnosis_center' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-base">Diagnosis Center</h4>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1 leading-relaxed">Register your diagnosis center, lab, or hospital facility.</p>
                                    </motion.div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="signup-full-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                            <input
                                                id="signup-full-name"
                                                name="name"
                                                autoComplete="name"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary/20 outline-none transition-all shadow-sm"
                                                placeholder="Dr. John Doe"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="signup-dob" className="text-[10px]  text-slate-700 uppercase tracking-widest ml-1">DOB</label>
                                        <div className="relative group">
                                            <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                id="signup-dob"
                                                name="dob"
                                                autoComplete="bday"
                                                required
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-400 font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary/20 outline-none transition-all shadow-sm"
                                                type="date"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="signup-email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Connection</label>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <input
                                            id="signup-email"
                                            name="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary/20 outline-none transition-all shadow-sm"
                                            placeholder="clinician@example.com"
                                            type="email"
                                        />
                                    </div>
                                </div>



                                <div className="space-y-2">
                                    <label htmlFor="signup-password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <input
                                            id="signup-password"
                                            name="password"
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary/20 outline-none transition-all shadow-sm"
                                            placeholder="••••••••"
                                            type="password"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <motion.button
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3"
                                    >
                                        <span>Sign Up</span>
                                        <UserPlus size={22} strokeWidth={2.5} />
                                    </motion.button>
                                </div>
                            </form>

                            {/* ── OR Divider ── */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <span className="bg-main px-4">Or sign up with</span>
                                </div>
                            </div>

                            {/* ── Google Sign-Up Button ── */}
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                disabled={googleLoading}
                                onClick={() => googleSignupHandler()}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {googleLoading ? (
                                    <Loader2 className="animate-spin text-primary" size={20} />
                                ) : (
                                    <GoogleIcon />
                                )}
                                <span className="text-sm">
                                    {googleLoading ? 'Creating account...' : 'Sign up with Google'}
                                </span>
                            </motion.button>

                            <div className="text-center">
                                <p className="text-slate-500 font-bold">
                                    Already registered?{' '}
                                    <Link to="/login" className="text-primary font-black hover:underline hover:underline-offset-4 transition-all">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>



                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Register;
