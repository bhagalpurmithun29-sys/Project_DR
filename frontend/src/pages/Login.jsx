import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  ShieldCheck,
  ChevronLeft,
  Activity,
  X,
  KeyRound,
  Hash,
  CheckCircle2,
  Loader2,
  CopyCheck
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from '@react-oauth/google';
import { getApiErrorMessage } from "../services/api";
import Toast from "../components/Toast";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// ────────────────────────────────────────────────────────────

export default function Login() {
  const [role, setRole] = useState("doctor"); // 'doctor' | 'patient' | 'diagnosis_center'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    setError("");
    try {
      // loginWithGoogle expects (token, role)
      const res = await loginWithGoogle(tokenResponse.access_token, role);
      if (res?.data?.requiresSecuritySetup) {
        const nextRoute = role === 'doctor'
          ? '/doctor-dashboard'
          : role === 'diagnosis_center'
            ? '/diagnosis-center/'
            : '/dashboard';
        navigate('/profile-setup', { state: { nextRoute } });
        return;
      }
      const userRole = res?.data?.role;
      
      const targetPath = userRole === 'doctor' || userRole === 'technician'
        ? "/doctor-dashboard"
        : userRole === 'diagnosis_center'
          ? "/diagnosis-center/"
          : "/dashboard";

      navigate(targetPath, { state: { loginSuccess: true } });
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Google Login failed.");
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    redirect_uri: window.location.origin,
    onError: () => {
      const msg = "Google Login was unsuccessful";
      setError(msg);
      showToast(msg, 'error');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // AuthContext.login() returns res.data directly, so role lives at res.role (not res.data.role)
      const res = await login(email, password, role);
      const userRole = res?.data?.role;
      const targetPath = userRole === 'doctor' || userRole === 'technician' 
        ? "/doctor-dashboard" 
        : userRole === 'diagnosis_center' 
          ? "/diagnosis-center/" 
          : "/dashboard";
      
      navigate(targetPath, { state: { loginSuccess: true } });
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Failed to login");
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="font-display bg-main text-slate-900 antialiased h-screen overflow-hidden">
      <div className="flex h-screen w-full">
        {/* ── LEFT PANEL ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative hidden flex-col justify-between overflow-hidden p-16 lg:flex lg:w-1/2"
          style={{ background: "linear-gradient(135deg, #059669 0%, #022c22 100%)" }}
        >
          {/* Animated SVG decorative background */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <motion.svg
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="400" cy="400" r="300" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
              <circle cx="400" cy="400" r="200" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <path d="M400 100 Q 450 400 400 700" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
              <path d="M100 400 Q 400 450 700 400" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
            </motion.svg>
          </div>

          <Link to="/" className="relative z-10 flex items-center gap-3 w-fit group">
            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md transition-transform group-hover:scale-110">
              <Activity className="text-white" size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase italic">RetinaAI</h2>
          </Link>

          <div className="relative z-10 space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md"
            >
              <h1 className="mb-8 text-6xl font-black leading-[1.1] tracking-tight text-white">
                The future of <br />
                <span className="text-white/70 italic">eye diagnostics</span> is here.
              </h1>
              <div className="mb-10 h-1.5 w-24 rounded-full bg-white/20" />
              <blockquote className="border-l-4 border-white/30 pl-8 text-2xl font-bold italic leading-relaxed text-white/80">
                "Precision imaging for proactive care. Built by clinicians, powered by science."
              </blockquote>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
            <span>© 2024 RetinaAI Systems Inc.</span>
            <div className="flex gap-4">
              <a href="#" className="transition-colors hover:text-white">Privacy</a>
              <a href="#" className="transition-colors hover:text-white">Terms</a>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-pulse" />
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex w-full items-center justify-center bg-main p-6 lg:w-1/2 lg:p-12 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-[460px]">
            {/* Back Button */}
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-6 group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="mb-6">
              <h2 className="mb-2 text-3xl font-black tracking-tight text-slate-900">
                {role === 'doctor' ? 'Provider Portal' : role === 'diagnosis_center' ? 'Diagnosis Center portal' : 'Patients Portal'}
              </h2>
              <p className="text-base font-medium text-slate-500">
                {role === 'doctor'
                  ? 'Welcome back, Doctor.'
                  : role === 'diagnosis_center'
                    ? 'Sign in to manage your facility.'
                    : 'View your health history.'}
              </p>
            </div>

            {/* Role Switcher — 3 tabs */}
            <div className="mb-6 flex items-center p-1.5 bg-slate-200/50 rounded-2xl h-12 shadow-inner gap-1">
              {[
                { id: 'doctor', label: 'Clinician' },
                { id: 'patient', label: 'Patient' },
                { id: 'diagnosis_center', label: 'Center' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setRole(id); setError(''); }}
                  className={`relative flex-1 h-full flex items-center justify-center text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${role === id
                    ? 'bg-white text-primary shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {role === id && (
                    <motion.span
                      layoutId="roleUnderline"
                      className="absolute inset-0 bg-white rounded-xl shadow-md"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-white"
              >
                {error && <div className="p-3 mb-6 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl leading-snug">{error}</div>}


                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">
                      {role === "doctor" ? "Work Email" : "Email Address"}
                    </label>
                    <div className="relative group">
                      <Mail
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                        size={20}
                      />
                      <input
                        id="login-email"
                        name="email"
                        autoComplete="email"
                        required
                        type="email"
                        placeholder="clinician@retinaai.health"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 py-4 pl-14 pr-6 text-slate-900 font-bold outline-none transition-all focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label htmlFor="login-password" className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                      <Link
                        to="/forgot-password"
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline hover:underline-offset-4"
                      >
                        Forgot Access?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                        size={20}
                      />
                      <input
                        id="login-password"
                        name="password"
                        autoComplete="current-password"
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 py-4 pl-14 pr-14 text-slate-900 font-bold outline-none transition-all focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-1">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-5 w-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">
                      Keep me signed in
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 font-black text-white shadow-2xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-1 active:translate-y-0"
                  >
                    <span>Sign In</span>
                    <ArrowRight size={22} />
                  </button>
                </form>

                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span className="bg-white px-4">Sign in with Google</span>
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-1">

                  <button 
                    type="button"
                    disabled={googleLoading}
                    onClick={() => googleLoginHandler()}
                    className="flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3.5 transition-all hover:bg-slate-50 hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <Loader2 className="animate-spin text-primary" size={20} />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span className="text-xs font-black text-slate-600">
                      {googleLoading ? 'Connecting...' : 'Sign in with Google'}
                    </span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 font-bold">
                New to RetinaAI?{" "}
                <Link to="/register" className="font-black text-primary hover:underline hover:underline-offset-4">
                  Create Account
                </Link>
              </p>
            </div>


          </div>
        </div>
      </div>
      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
