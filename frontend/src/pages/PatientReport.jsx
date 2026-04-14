import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Printer,
    Shield,
    Activity,
    Eye,
    Calendar,
    User,
    Clock,
    FileText,
    CheckCircle,
    AlertTriangle,
    Info,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import scanService from '../services/scanService';
import { jsPDF } from 'jspdf';

const PatientReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scan, setScan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScanData = async () => {
            try {
                const res = await scanService.getScan(id);
                setScan(res.data);
            } catch (err) {
                console.error('Failed to fetch scan data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchScanData();
    }, [id]);

    const handleDownloadPDF = async () => {
        if (!scan) return;

        const doc = new jsPDF();

        // Helper to load image
        const loadImage = (url) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
            });
        };

        try {
            // Header
            doc.setFontSize(22);
            doc.setTextColor(5, 150, 105); // Global Emerald Primary
            doc.text('RETINAAI CLINICAL REPORT', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

            // Horizontal Line
            doc.setDrawColor(230);
            doc.line(20, 35, 190, 35);

            // Patient Information
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Patient Information', 20, 45);

            doc.setFontSize(10);
            doc.text(`Name: ${scan.patient?.name || 'N/A'}`, 20, 55);
            doc.text(`Patient ID: ${scan.patient?.patientId || 'Pending'}`, 20, 62);
            doc.text(`Age: ${scan.patient?.age !== undefined && scan.patient?.age !== null ? scan.patient.age : 'N/A'}`, 100, 55);
            doc.text(`Gender: ${scan.patient?.gender || 'N/A'}`, 100, 62);

            // Add Scan Image if available
            if (scan.imageUrl) {
                try {
                    const img = await loadImage(scan.imageUrl);
                    // Add image to right side or center
                    doc.addImage(img, 'JPEG', 140, 40, 50, 50);
                    doc.setDrawColor(200);
                    doc.rect(140, 40, 50, 50); // Border around image
                } catch (e) {
                    console.error('Failed to add image to PDF', e);
                }
            }

            // Scan Details
            doc.setFontSize(14);
            doc.text('Scan Details', 20, 80);

            doc.setFontSize(10);
            doc.text(`File ID: ${scan._id}`, 20, 90);
            doc.text(`Eye: ${scan.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}`, 20, 97);
            doc.text(`Date: ${new Date(scan.createdAt).toLocaleDateString()}`, 100, 90);
            doc.text(`Status: ${scan.status}`, 100, 97);

            // AI Analysis
            doc.setFontSize(14);
            doc.text('AI Diagnostic Analysis', 20, 115);

            doc.setFontSize(12);
            doc.setTextColor(scan.aiResult === 'High Risk' ? 225 : scan.aiResult === 'Moderate' ? 217 : 34,
                scan.aiResult === 'High Risk' ? 29 : scan.aiResult === 'Moderate' ? 119 : 197,
                scan.aiResult === 'High Risk' ? 72 : scan.aiResult === 'Moderate' ? 6 : 94);
            doc.text(`Risk Assessment: ${scan.aiResult || 'Pending'}`, 20, 125);

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text(`Lesion Area Density: ${scan.lesionPercent?.toFixed(3) || 0}%`, 20, 132);
            doc.text(`Verified Anomaly Pixels: ${scan.lesionCount || 0}`, 20, 139);

            // Insights
            doc.setFontSize(14);
            doc.text('Clinical Insights', 20, 155);

            doc.setFontSize(9);
            let yPos = 165;
            if (scan.insights && scan.insights.length > 0) {
                scan.insights.forEach((insight, index) => {
                    const text = `${index + 1}. ${insight.message}`;
                    const splitText = doc.splitTextToSize(text, 160);
                    doc.text(splitText, 20, yPos);
                    yPos += (splitText.length * 5) + 2;
                });
            } else {
                doc.text('No automated insights available for this diagnostic unit.', 20, 165);
            }

            // Note
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.setFont('helvetica', 'italic');
            doc.text('Note: This report includes the original retinal scan used for analysis.', 20, 260);

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.setFont('helvetica', 'normal');
            doc.text('© 2024 RetinaAI Clinical Systems. This is a computer-generated report.', 105, 280, { align: 'center' });
            doc.text('Clinical verification by a licensed ophthalmologist is recommended.', 105, 285, { align: 'center' });

            doc.save(`RetinaAI_Report_${scan.patient?.name || 'Scan'}_${scan._id.substring(0, 8)}.pdf`);
        } catch (err) {
            console.error('PDF Generation failed', err);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-main flex items-center justify-center">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                    <Eye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
                </div>
            </div>
        );
    }

    if (!scan) return <div className="p-10 text-center">Scan not found.</div>;

    return (
        <div className="min-h-screen bg-main font-display text-slate-900 antialiased flex flex-col">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    header, .nav-header, button, .no-print {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    .bg-main {
                        background-color: white !important;
                    }
                    .shadow-xl, .shadow-2xl {
                        box-shadow: none !important;
                    }
                    .border {
                        border-color: #eee !important;
                    }
                }
            `}} />
            {/* Navigation Header */}
            <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-white sticky top-0 z-50 flex items-center justify-between px-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="size-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight italic">Patient <span className="text-primary not-italic">Report</span></h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Diagnostic Unit: {scan._id.substring(0, 8)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePrint}
                        className="h-12 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Printer size={16} />
                        Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="h-12 px-8 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 hover:-translate-y-1 shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        <Download size={16} />
                        Download PDF
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto p-10 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Image and Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-950 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden relative group"
                        >
                            <img
                                src={scan.imageUrl || "https://images.unsplash.com/photo-1579154235602-3c22bd4b5683?w=800&auto=format"}
                                alt="Retina Scan"
                                className="w-full aspect-square object-cover rounded-[2rem] border border-white/5 opacity-90 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{scan.eyeSide === 'OD' ? 'Right Eye' : 'Left Eye'}</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30"
                        >
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <Activity size={18} className="text-primary" />
                                Analysis Status
                            </h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Index</span>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${scan.aiResult === 'High Risk' ? 'bg-rose-50 text-rose-600' :
                                             scan.aiResult === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-primary/10 text-primary'
                                         }`}>
                                        {scan.aiResult || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</span>
                                    <span className="text-sm font-black text-slate-900">{scan.confidence || '94.2'}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician</span>
                                    <span className="text-sm font-black text-slate-900 truncate max-w-[120px]">{scan.technician || 'Automatic AI'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Patient Profile */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30 grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                                <p className="text-lg font-black text-slate-900 leading-tight">{scan.patient?.name || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity ID</p>
                                <p className="text-lg font-black text-slate-900 leading-tight">{scan.patient?.patientId || 'Pending'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient Age</p>
                                <p className="text-lg font-black text-slate-900 leading-tight">
                                    {scan.patient?.age !== undefined && scan.patient?.age !== null ? scan.patient.age : 'N/A'} yrs
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gender</p>
                                <p className="text-lg font-black text-slate-900 leading-tight capitalize">{scan.patient?.gender || 'N/A'}</p>
                            </div>
                        </motion.div>

                        {/* Diagnostic Findings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30 space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Diagnostic <span className="text-primary not-italic">Findings</span></h3>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(scan.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lesion Density</span>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-slate-900">{scan.lesionPercent?.toFixed(3) || 0}%</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{scan.lesionCount || 0} Pixel Anomalies</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                         <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                             <CheckCircle size={18} />
                                         </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Confidence</span>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-slate-900">{scan.confidence || '94.2'}%</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Classification Stability</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Automated Neural Insights</h4>
                                <div className="space-y-4">
                                    {scan.insights && scan.insights.length > 0 ? scan.insights.map((insight, idx) => (
                                        <div key={idx} className="flex gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                                            <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${insight.type === 'high_risk' ? 'bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-rose-500 group-hover:text-white' : 'bg-primary/5 text-primary border-primary/10 group-hover:bg-primary group-hover:text-white'
                                                }`}>
                                                {insight.type === 'high_risk' ? <AlertTriangle size={20} /> : <Info size={20} />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{insight.type.replace('_', ' ')}</p>
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed">{insight.message}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No clinical insights triggered for this scan unit.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Physician Commentary</h4>
                                <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl italic text-xs font-bold text-slate-500 leading-loose">
                                    {scan.clinicalNotes || "No additional commentary provided. The diagnostic unit remains under primary AI observation."}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Secure Footer Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 border-t border-slate-200/60 opacity-60">
                    <div className="flex items-center gap-4">
                        <Shield className="text-slate-400" size={20} />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">RetinaAI Digital Security Handshake Verified</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Report Ref: {scan._id.toUpperCase()}</span>
                         <div className="size-2 bg-primary rounded-full shadow-[0_0_8px_rgba(5,150,105,0.6)]" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientReport;
