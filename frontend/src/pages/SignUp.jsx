import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Eye,
    User,
    Stethoscope,
    UserPlus,
    ShieldCheck,
    ChevronLeft,
    Activity,
    Mail,
    Lock,
    Calendar,
    Fingerprint,
    Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
    const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
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

            // Call register with extra fields
            await register(name, email, password, role, age);

            if (role === 'doctor') {
                navigate('/doctor-registration');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="font-display bg-white text-slate-900 antialiased min-h-screen overflow-hidden">
            <div className="flex min-h-screen w-full">
                {/* Left Side Branding */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hidden lg:flex lg:w-5/12 bg-primary relative overflow-hidden flex-col justify-between p-16"
                    style={{ background: "linear-gradient(135deg, #137fec 0%, #0a56a3 100%)" }}
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
                <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#f8fafc] overflow-y-auto">
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
                            <p className="text-lg font-medium text-slate-500">Join the next generation of AI-powered ophthalmology.</p>
                        </div>

                        {error && <div className="p-4 mb-8 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl">{error}</div>}

                        <div className="space-y-10">
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Identity</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Patient Role Card */}
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        onClick={() => setRole('patient')}
                                        className={`cursor-pointer group relative p-6 rounded-3xl transition-all duration-300 shadow-sm ${role === 'patient'
                                            ? 'border-slate-900 bg-white ring-4 ring-primary/20'
                                            : 'border-white bg-white/40 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-5">
                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${role === 'patient' ? 'bg-slate-100 text-black shadow-lg shadow-slate-200/50' : 'bg-slate-100 text-slate-400'}`}>
                                                <User size={24} strokeWidth={2.5} />
                                            </div>
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${role === 'patient' ? 'bg-primary border-slate-900' : 'border-slate-200'}`}>
                                                {role === 'patient' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-lg">Patient</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">Securely access your clinical markers and eye health data.</p>
                                    </motion.div>

                                    {/* Doctor Role Card */}
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        onClick={() => setRole('doctor')}
                                        className={`cursor-pointer group relative p-6 rounded-3xl  transition-all duration-300 shadow-sm ${role === 'doctor'
                                            ? 'border-slate-900 bg-white ring-4 ring-primary/20'
                                            : 'border-white bg-white/40 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-5">
                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${role === 'doctor' ? 'bg-slate-100 text-black shadow-lg shadow-slate-200/50' : 'bg-slate-100 text-slate-400'}`}>
                                                <Stethoscope size={24} strokeWidth={2.5} />
                                            </div>
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${role === 'doctor' ? 'bg-primary border-slate-900' : 'border-slate-200'}`}>
                                                {role === 'doctor' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-lg">Clinician</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">Advanced screening tools and HIPAA patient management.</p>
                                    </motion.div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                            <input
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
                                        <label className="text-[10px]  text-slate-700 uppercase tracking-widest ml-1">DOB</label>
                                        <div className="relative group">
                                            <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Connection</label>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <input
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <input
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

                            <div className="text-center">
                                <p className="text-slate-500 font-bold">
                                    Already registered?{' '}
                                    <Link to="/login" className="text-primary font-black hover:underline hover:underline-offset-4 transition-all">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="mt-16 flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-full w-fit mx-auto shadow-sm border border-slate-100">
                            <ShieldCheck className="text-green-500" size={20} strokeWidth={2.5} />
                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Certified HIPAA Secure Environment</span>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Register;
