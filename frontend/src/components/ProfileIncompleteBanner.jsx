import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileIncompleteBanner = ({ percentage = 0, role = 'doctor', onClick }) => {
    const isDoctor = role === 'doctor';
    const isPatient = role === 'patient';
    const isCenter = role === 'center';

    const config = {
        title: isDoctor ? 'Clinical Profile Status' : isPatient ? 'Patient Profile Status' : 'Center Verification Status',
        subtitle: isDoctor 
            ? 'Your professional clinical identity is currently at'
            : isPatient 
            ? 'Your patient health profile is currently at'
            : 'Your diagnostic center profile is currently at',
        desc: isDoctor
            ? 'Complete your profile to verify your credentials and access the full diagnostic suite.'
            : isPatient
            ? 'Complete your profile details to unlock advanced health tracking and AI-driven diagnostic features.'
            : 'Complete your center registration to start syncing scan data and managing clinical records.',
        link: isDoctor ? '/doctor-profile' : isPatient ? '/profile-setup' : '/diagnosis-center/settings',
        btnText: isDoctor ? 'complete profile' : isPatient ? 'complete profile' : 'complete registration'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 lg:mx-10 mt-6 mb-2"
        >
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-amber-500/40 transition-all shadow-2xl shadow-amber-500/10">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

                <div className="flex items-center gap-6 relative z-10 flex-1">
                    <div className="relative">
                        <div className="size-20 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-2xl shadow-amber-500/40 border-4 border-white/50">
                            <UserPlus size={32} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-white text-amber-500 flex items-center justify-center font-black text-xs shadow-lg border border-amber-500/10">
                            {percentage}%
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            {config.title}: <span className="text-amber-600">{percentage}% Complete</span>
                            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                        </h4>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight mt-1 max-w-2xl">
                            {config.subtitle} <span className="text-amber-600 font-black">{percentage}%</span>. {config.desc}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mt-4 w-full max-w-md h-2.5 bg-amber-500/10 rounded-full overflow-hidden border border-amber-500/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                <Link
                    to={config.link}
                    onClick={(e) => {
                        if (onClick) {
                            e.preventDefault();
                            onClick();
                        }
                    }}
                    className="relative z-10 h-16 px-10 bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] flex items-center gap-4 hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-2xl shadow-slate-900/30 active:scale-95 group/btn"
                >
                    {config.btnText}
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
};

export default ProfileIncompleteBanner;
