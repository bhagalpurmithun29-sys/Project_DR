import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileIncompleteBanner = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-10 mt-6 mb-2"
        >
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-amber-500/40 transition-all shadow-xl shadow-amber-500/5">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

                <div className="flex items-center gap-5 relative z-10">
                    <div className="size-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <UserPlus size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Professional Profile Incomplete
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                        </h4>
                        <p className="text-sm font-bold text-slate-500 tracking-tight mt-1">
                            Your clinical identity has not been fully synchronized. Complete your registration to unlock advanced diagnostic tools and patient history.
                        </p>
                    </div>
                </div>

                <Link
                    to="/doctor-registration"
                    className="relative z-10 h-14 px-8 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-900/20 active:scale-95 group/btn"
                >
                    Initialize Identity
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
};

export default ProfileIncompleteBanner;
