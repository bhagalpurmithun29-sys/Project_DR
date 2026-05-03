import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Activity,
  ShieldCheck,
  ChevronLeft,
  KeyRound,
  CheckCircle2,
  Loader2,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
export default function ForgotPassword() {

  // Password reset flow
  const [pwStep, setPwStep] = useState(1); // 1 = email, 2 = questions, 3 = new password, 4 = success
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const handleGetQuestions = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/security-questions', { email });
      if (res.data.success) {
        setQuestions(res.data.data);
        setPwStep(2);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to find account.' });
    } finally { setLoading(false); }
  };

  // Step 2: Verify Answers
  const handleVerifyAnswers = async (e) => {
    e.preventDefault();
    if (!a1 || !a2) { setMsg({ type: 'error', text: 'Please answer both questions.' }); return; }

    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/verify-security-questions', {
        email,
        answers: [a1, a2]
      });
      if (res.data.success) {
        setResetToken(res.data.resetToken);
        setMsg({ type: 'success', text: 'Identity verified. You can now reset your password.' });
        setPwStep(3);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Verification failed.' });
    } finally { setLoading(false); }
  };

  // Step 3: Reset Password
  const handleResetPw = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    if (newPw.length < 8) { setMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return; }

    setLoading(true); setMsg({ type: '', text: '' });
    try {
      await api.post('/auth/reset-password', { email, code: resetToken, newPassword: newPw });
      setPwStep(4);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Reset failed.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="font-display bg-main text-slate-900 antialiased min-h-screen overflow-hidden">
      <div className="flex min-h-screen w-full">
        {/* ── LEFT PANEL ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative hidden flex-col justify-between overflow-hidden p-16 lg:flex lg:w-1/2"
          style={{ background: "linear-gradient(135deg, #059669 0%, #022c22 100%)" }}
        >
          {/* Animated SVG decorative background */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <motion.svg animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
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

          <div className="relative z-10 space-y-8 max-w-md">
            <h1 className="mb-8 text-5xl font-black leading-[1.1] tracking-tight text-white">
              Account <br />
              <span className="text-white/70 italic">Recovery</span>
            </h1>
            <div className="mb-10 h-1.5 w-24 rounded-full bg-white/20" />
            <blockquote className="border-l-4 border-white/30 pl-8 text-xl font-bold italic leading-relaxed text-white/80">
              "To protect your medical records, complete identity verification securely."
            </blockquote>
          </div>

          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-pulse" />
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex w-full items-center justify-center bg-main p-6 sm:p-12 lg:w-1/2 lg:p-24 overflow-y-auto">
          <div className="w-full max-w-[460px]">
            {/* Back Button */}
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-12 group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>

            <div className="mb-8">
              <h2 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                Recovery
              </h2>
              <p className="text-lg font-medium text-slate-500">
                Regain access to your RetinaAI account.
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-white"
              >
                {/* ── PASSWORD RESET FLOW ── */}
                <div className="space-y-6">
                  {msg.text && (
                    <div className={`p-4 mb-2 text-sm font-bold rounded-2xl border flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                      {msg.type === 'success' && <CheckCircle2 size={16} />}
                      {msg.text}
                    </div>
                  )}

                  {pwStep === 1 && (
                    <form onSubmit={handleGetQuestions} className="space-y-6">
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        Enter the email address associated with your account to verify your identity.
                      </p>
                      <div className="space-y-2">
                        <label htmlFor="forgot-email" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                          <input id="forgot-email" name="email" autoComplete="email" required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 py-4 pl-14 pr-6 text-slate-900 font-bold outline-none transition-all focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 shadow-sm" />
                        </div>
                      </div>
                      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-black text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 disabled:opacity-70">
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Continue <ArrowRight size={20} /></>}
                      </button>
                    </form>
                  )}

                  {pwStep === 2 && (
                    <form onSubmit={handleVerifyAnswers} className="space-y-6">
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        Answer the security questions you selected during registration securely.
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="forgot-answer-1" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Question 1</label>
                          <p className="text-sm font-bold text-slate-700 bg-slate-100/50 px-4 py-3 rounded-xl border border-slate-100 flex items-center gap-2"><HelpCircle size={16} className="text-primary" /> {questions[0]}</p>
                          <input id="forgot-answer-1" name="security_answer_1" autoComplete="off" required type="text" placeholder="Your Answer" value={a1} onChange={(e) => setA1(e.target.value)}
                            className="w-full mt-2 rounded-xl border-2 border-slate-100 bg-white py-3 px-4 text-slate-900 font-bold outline-none transition-all focus:border-primary/20 focus:ring-4 focus:ring-primary/5 shadow-sm" />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="forgot-answer-2" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Question 2</label>
                          <p className="text-sm font-bold text-slate-700 bg-slate-100/50 px-4 py-3 rounded-xl border border-slate-100 flex items-center gap-2"><HelpCircle size={16} className="text-primary" /> {questions[1]}</p>
                          <input id="forgot-answer-2" name="security_answer_2" autoComplete="off" required type="text" placeholder="Your Answer" value={a2} onChange={(e) => setA2(e.target.value)}
                            className="w-full mt-2 rounded-xl border-2 border-slate-100 bg-white py-3 px-4 text-slate-900 font-bold outline-none transition-all focus:border-primary/20 focus:ring-4 focus:ring-primary/5 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setPwStep(1)} className="flex-1 rounded-2xl border-2 border-slate-200 py-4 font-black text-slate-500 hover:bg-slate-50 transition-all">Back</button>
                        <button type="submit" disabled={loading} className="flex-[2] flex justify-center items-center gap-2 rounded-2xl bg-primary py-4 font-black text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 disabled:opacity-70">
                          {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify Identity'}
                        </button>
                      </div>
                    </form>
                  )}

                  {pwStep === 3 && (
                    <form onSubmit={handleResetPw} className="space-y-6">
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        Enter your new secure password below to regain access.
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="forgot-new-password" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">New Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input id="forgot-new-password" name="new_password" autoComplete="new-password" required type="password" placeholder="••••••••" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 py-4 pl-14 pr-6 text-slate-900 font-bold outline-none transition-all focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 shadow-sm" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="forgot-confirm-password" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input id="forgot-confirm-password" name="confirm_password" autoComplete="new-password" required type="password" placeholder="••••••••" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 py-4 pl-14 pr-6 text-slate-900 font-bold outline-none transition-all focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 shadow-sm" />
                          </div>
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-black text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 disabled:opacity-70">
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Set New Password'}
                      </button>
                    </form>
                  )}

                  {pwStep === 4 && (
                    <div className="text-center space-y-6 py-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary border-4 border-primary/20 shadow-xl shadow-primary/20">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900">Password Reset!</h3>
                        <p className="text-slate-500 font-medium pb-4">Your password has been changed securely. You can now log back in.</p>
                      </div>
                      <Link to="/login" className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-black text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90">
                        Return to Login
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>


          </div>
        </div>
      </div>
    </div>
  );
}
