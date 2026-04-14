import React, { useState } from 'react';
import {
  Eye,
  Check,
  UserCircle,
  Upload,
  GraduationCap,
  Plus,
  FileText,
  Trash2,
  UploadCloud,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Activity,
  Award,
  MapPin,
  Briefcase
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import doctorService from '../services/doctorService';
import { motion, AnimatePresence } from "framer-motion";

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    country: '',
    experience: '',
    specialization: '',
    email: '',
    phoneNumber: '',
    photo: null
  });

  const [degrees, setDegrees] = useState([
    { id: 1, title: '', institution: '' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDegreeChange = (id, field, value) => {
    setDegrees(prev => prev.map(deg => deg.id === id ? { ...deg, [field]: value } : deg));
  };

  const addDegree = () => {
    setDegrees(prev => [...prev, { id: Date.now(), title: '', institution: '' }]);
  };

  const removeDegree = (id) => {
    if (degrees.length > 1) {
      setDegrees(prev => prev.filter(deg => deg.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Strict Email Validation (alphabet, number, @)
    const emailRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
        setError('Invalid professional email. It must contain letters, numbers, and a valid @ domain.');
        setLoading(false);
        return;
    }

    try {
      const profileData = {
        ...formData,
        degrees: degrees.map(({ title, institution }) => ({ title, institution }))
      };
      await doctorService.saveProfile(profileData);
      navigate('/doctor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-main font-display text-slate-900 antialiased overflow-x-hidden">
      {/* Header */}
      <header className="w-full bg-white/70 backdrop-blur-xl border-b border-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight italic uppercase">RetinaAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2 of 3</span>
          <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline hover:underline-offset-4">Security Center</button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-16 max-w-4xl mx-auto">
          {[
            { step: 1, label: "Basic Setup", status: "complete" },
            { step: 2, label: "Credentials", status: "active" },
            { step: 3, label: "Final Review", status: "pending" }
          ].map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center gap-3 group">
                <div className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 font-black shadow-lg ${s.status === 'complete' ? 'bg-primary text-white shadow-primary/20' :
                  s.status === 'active' ? 'bg-primary text-white shadow-primary/20 scale-110 ring-4 ring-primary/10' :
                    'bg-white text-slate-300 border-2 border-slate-100'
                  }`}>
                  {s.status === 'complete' ? <Check size={22} strokeWidth={3} /> : s.step}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${s.status === 'active' ? 'text-primary' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className="h-0.5 flex-1 mx-4 bg-slate-100 relative overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: i === 0 ? 1 : 0 }}
                    className="absolute inset-0 bg-primary origin-left transition-transform duration-1000"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 italic">Verify <span className="text-primary not-italic">Clinical Credentials</span></h1>
          <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">
            Authentication of medical licenses ensures the highest standard of patient care and data security within our network.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden"
        >
          <div className="p-10 border-b border-slate-50 bg-main/50 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Professional Dossier</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Medical Identity Verification</p>
            </div>
            <Award className="text-primary/20" size={40} />
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-12">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100"
              >
                Verification Failure: {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Photo Upload */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <input
                  type="file"
                  id="doctor-photo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, photo: file }));
                    }
                  }}
                />
                <motion.div
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  onClick={() => document.getElementById('doctor-photo-upload').click()}
                  className="w-56 h-72 rounded-3xl bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center relative group cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden mb-6 shadow-inner"
                >
                  {formData.photo ? (
                    <img
                      src={URL.createObjectURL(formData.photo)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle size={64} strokeWidth={1} className="text-slate-200 group-hover:text-primary/20 transition-colors" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-md p-4 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={18} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Click here to upload photo</span>
                  </div>
                </motion.div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center leading-relaxed max-w-[200px]">
                  Official Clinical Portrait (JPG/PNG, Max 5MB)
                </p>
              </div>

              {/* Main Info */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">License Identifier</label>
                  <div className="relative group">
                    <Award size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm focus:bg-white"
                      placeholder="MD-8827731"
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Registration Region</label>
                  <div className="relative group">
                    <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm focus:bg-white appearance-none"
                    >
                      <option value="">Select Jurisdiction</option>
                      <option value="us">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="ca">Canada</option>
                      <option value="au">Australia</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Clinical Experience</label>
                  <div className="relative group">
                    <Briefcase size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm focus:bg-white appearance-none"
                    >
                      <option value="">Experience Range</option>
                      <option value="0-5">0-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10-20">10-20 years</option>
                      <option value="20+">20+ years</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Specialization</label>
                  <div className="relative group">
                    <Activity size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm focus:bg-white appearance-none"
                    >
                      <option value="">Primary Focus</option>
                      <option value="general">General Ophthalmology</option>
                      <option value="retina">Medical Retina</option>
                      <option value="surgery">Vitreoretinal Surgery</option>
                      <option value="pediatric">Pediatric Ophthalmology</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email ID</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm focus:bg-white"
                      placeholder="doctor@professional.com"
                      type="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                    </div>
                    <input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm focus:bg-white"
                      placeholder="+91 98765 43210"
                      type="tel"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Degrees Section */}
            <div className="pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <GraduationCap size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Academic Foundations</h3>
                </div>
                <button type="button" onClick={addDegree} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline hover:underline-offset-4 flex items-center gap-2 group">
                  <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                  Append Qualification
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {degrees.map((deg) => (
                    <motion.div
                      key={deg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 rounded-3xl border-2 border-slate-50 bg-slate-50 shadow-sm flex items-start gap-4 transition-all hover:bg-white hover:border-slate-100"
                    >
                      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-slate-400">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          required
                          className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 placeholder:text-slate-300"
                          placeholder="Qualification Name"
                          type="text"
                          value={deg.title}
                          onChange={(e) => handleDegreeChange(deg.id, 'title', e.target.value)}
                        />
                        <input
                          required
                          className="w-full bg-transparent border-none p-0 text-xs font-bold text-slate-500 focus:ring-0 placeholder:text-slate-300"
                          placeholder="Issuing Medical School"
                          type="text"
                          value={deg.institution}
                          onChange={(e) => handleDegreeChange(deg.id, 'institution', e.target.value)}
                        />
                      </div>
                      {degrees.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDegree(deg.id)}
                          className="text-slate-200 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={addDegree}
                  className="p-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white/40 flex items-center justify-center group hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center py-2 text-center">
                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-3">
                      <UploadCloud size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary">Add further credential</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="order-2 sm:order-1 px-8 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
              >
                <ArrowLeft size={18} />
                Previous step
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`order-1 sm:order-2 w-full sm:w-auto px-12 py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 hover:-translate-y-1'}`}
              >
                <span>{loading ? 'Encrypting Data...' : 'Finalize Profile'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Secure Badge */}
        <div className="mt-12 flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-full w-fit mx-auto shadow-sm border border-slate-100">
          <ShieldCheck className="text-primary" size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">E2EE Medical Data Vault Active</span>
        </div>
      </main>

      <footer className="mt-auto py-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
        © 2024 RetinaAI Systems Inc. / Enterprise Clinical License v2.4.1
      </footer>
    </div>
  );
};

export default DoctorRegistration;
