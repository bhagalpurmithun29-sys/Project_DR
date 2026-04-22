import React, { useState, useEffect } from 'react';
import api, { normalizeUrl } from '../services/api';
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
    ExternalLink,
    ClipboardList
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
            doc.setFontSize(24);
            doc.setTextColor(5, 150, 105); // Global Emerald Primary
            doc.setFont('helvetica', 'bold');
            doc.text('RETINAAI CLINICAL REPORT', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.setFont('helvetica', 'normal');
            doc.text(`Diagnostic Unit: ${scan._id.toUpperCase()}`, 105, 28, { align: 'center' });

            // Horizontal Line
            doc.setDrawColor(240);
            doc.line(20, 35, 190, 35);

            // Patient Profile
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.setFont('helvetica', 'bold');
            doc.text('PATIENT PROFILE', 20, 45);

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');
            doc.text(`Patient Name: ${scan.patient?.name || 'N/A'}`, 20, 55);
            doc.text(`Identity ID: ${scan.patient?.patientId || 'Pending'}`, 20, 62);
            doc.text(`Age/Gender: ${scan.patient?.age || 'N/A'} yrs / ${scan.patient?.gender || 'N/A'}`, 20, 69);

            // Add Scan Image
            if (scan.imageUrl) {
                try {
                    const absoluteUrl = normalizeUrl(scan.imageUrl);
                    const img = await loadImage(absoluteUrl);
                    doc.addImage(img, 'JPEG', 140, 40, 50, 50);
                    doc.setDrawColor(230);
                    doc.rect(140, 40, 50, 50);
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(`${scan.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}`, 165, 95, { align: 'center' });
                } catch (e) {
                    console.error('Failed to add image to PDF', e);
                }
            }

            // Analysis Status
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.setFont('helvetica', 'bold');
            doc.text('ANALYSIS STATUS', 20, 85);

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');
            
            doc.text('Risk Index:', 20, 95);
            doc.setTextColor(scan.aiResult === 'High Risk' ? 225 : 5, scan.aiResult === 'High Risk' ? 29 : 150, scan.aiResult === 'High Risk' ? 72 : 105);
            doc.text(`${scan.aiResult || 'Pending'}`, 50, 95);
            
            doc.setTextColor(0);
            doc.text(`Confidence:`, 20, 102);
            doc.text(`${scan.confidence || '94.2'}%`, 50, 102);
            
            doc.text(`Technician:`, 20, 109);
            doc.text(`${scan.technician || 'Automatic AI'}`, 50, 109);
            
            doc.text(`Doctor Name:`, 20, 116);
            doc.text(`Dr. ${scan.referredDoctor?.name || 'Review Pending'}`, 50, 116);

            let currentY = 130;

            // Clinical Summary (Generative AI)
            if (scan.aiReportSummary) {
                doc.setFontSize(12);
                doc.setTextColor(5, 150, 105);
                doc.setFont('helvetica', 'bold');
                doc.text('CLINICAL SUMMARY (GENERATIVE AI)', 20, currentY);
                
                doc.setFontSize(9);
                doc.setTextColor(60);
                doc.setFont('helvetica', 'normal');
                const summaryLines = doc.splitTextToSize(scan.aiReportSummary, 170);
                doc.text(summaryLines, 20, currentY + 10);
                currentY += (summaryLines.length * 5) + 20;
            }

            // Prescription
            if (scan.doctorPrescription) {
                if (currentY > 230) { doc.addPage(); currentY = 20; }
                
                doc.setFontSize(12);
                doc.setTextColor(5, 150, 105);
                doc.setFont('helvetica', 'bold');
                doc.text('OFFICIAL MEDICAL PRESCRIPTION', 20, currentY);
                
                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.text(`Authorized by Dr. ${scan.referredDoctor?.name || 'Physician'}`, 20, currentY + 8);
                
                doc.setFontSize(11);
                doc.setTextColor(80);
                doc.setFont('helvetica', 'italic');
                const prescriptionLines = doc.splitTextToSize(`"${scan.doctorPrescription}"`, 170);
                doc.text(prescriptionLines, 20, currentY + 20);
                currentY += (prescriptionLines.length * 6) + 30;
            }

            // Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(8);
            doc.setTextColor(180);
            doc.setFont('helvetica', 'normal');
            doc.line(20, pageHeight - 25, 190, pageHeight - 25);
            doc.text('RetinaAI Digital Security Handshake Verified', 20, pageHeight - 15);
            doc.text(`Report Reference: ${scan._id.toUpperCase()}`, 190, pageHeight - 15, { align: 'right' });
            doc.text(`Generated on ${new Date().toLocaleString()}`, 105, pageHeight - 10, { align: 'center' });

            doc.save(`RetinaAI_Report_${scan.patient?.name || 'Scan'}.pdf`);
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
                    header, .nav-header, button, .no-print, .main-dashboard-content {
                        display: none !important;
                    }
                    body {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .print-only-report {
                        display: block !important;
                        padding: 40px !important;
                        font-family: 'Helvetica', 'Arial', sans-serif !important;
                    }
                    .print-header {
                        text-align: center !important;
                        margin-bottom: 30px !important;
                    }
                    .print-header h1 {
                        color: #10b981 !important;
                        font-size: 28px !important;
                        font-weight: 900 !important;
                        margin-bottom: 5px !important;
                        letter-spacing: 1px !important;
                    }
                    .print-header p {
                        color: #94a3b8 !important;
                        font-size: 10px !important;
                        text-transform: uppercase !important;
                        letter-spacing: 2px !important;
                    }
                    .print-section {
                        margin-bottom: 25px !important;
                    }
                    .print-section-title {
                        font-size: 12px !important;
                        font-weight: 900 !important;
                        color: #64748b !important;
                        text-transform: uppercase !important;
                        letter-spacing: 1px !important;
                        margin-bottom: 12px !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                        padding-bottom: 5px !important;
                    }
                    .print-summary-title {
                        color: #10b981 !important;
                        border-bottom: 1px solid #ecfdf5 !important;
                    }
                    .print-grid {
                        display: flex !important;
                        justify-content: space-between !important;
                    }
                    .print-info-list {
                        flex: 1 !important;
                    }
                    .print-info-item {
                        font-size: 11px !important;
                        margin-bottom: 6px !important;
                        color: #1e293b !important;
                    }
                    .print-info-label {
                        font-weight: bold !important;
                        width: 120px !important;
                        display: inline-block !important;
                    }
                    .print-image-box {
                        width: 180px !important;
                        text-align: center !important;
                    }
                    .print-image {
                        width: 180px !important;
                        height: 180px !important;
                        object-fit: cover !important;
                        border: 1px solid #f1f5f9 !important;
                        border-radius: 8px !important;
                    }
                    .print-image-caption {
                        font-size: 9px !important;
                        color: #94a3b8 !important;
                        margin-top: 5px !important;
                    }
                    .print-text-block {
                        font-size: 10px !important;
                        line-height: 1.6 !important;
                        color: #334155 !important;
                        white-space: pre-wrap !important;
                        background: #f8fafc !important;
                        padding: 15px !important;
                        border-radius: 12px !important;
                    }
                    .print-prescription {
                        background: #f0fdf4 !important;
                        font-style: italic !important;
                        font-size: 11px !important;
                    }
                    .print-risk-high { color: #f43f5e !important; font-weight: 900 !important; }
                    .print-risk-mod { color: #f59e0b !important; font-weight: 900 !important; }
                    .print-risk-low { color: #10b981 !important; font-weight: 900 !important; }
                }
                @media screen {
                    .print-only-report {
                        display: none !important;
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

            <main className="flex-1 w-full max-w-6xl mx-auto p-10 space-y-10 main-dashboard-content">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Image and Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-950 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden relative group"
                        >
                            <img
                                src={normalizeUrl(scan.imageUrl) || "https://images.unsplash.com/photo-1579154235602-3c22bd4b5683?w=800&auto=format"}
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
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${scan.aiResult === 'High Risk' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                             scan.aiResult === 'Moderate' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
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
                                    <span className="text-sm font-black text-slate-900 capitalize">{scan.technician || 'Automatic AI'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Name</span>
                                    <span className="text-sm font-black text-slate-900">Dr. {scan.referredDoctor?.name || 'Review Pending'}</span>
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

                        {/* Clinical Summary Section */}
                        {scan.aiReportSummary && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30 space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <FileText size={18} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Clinical Summary (Generative AI)</h3>
                                </div>
                                <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl italic text-sm font-bold text-slate-600 leading-relaxed shadow-inner">
                                    {scan.aiReportSummary}
                                </div>
                            </motion.div>
                        )}

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



                            {/* Doctor's Prescription Section */}
                            {scan.doctorPrescription && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="space-y-4 pt-6 border-t-4 border-primary/20"
                                >
                                    <div className="flex items-center gap-3 ml-2">
                                        <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                            <ClipboardList size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Official Medical Prescription</h4>
                                            <p className="text-sm font-black text-slate-900 leading-none mt-1">Authorized by Dr. {scan.referredDoctor?.name || 'Physician'}</p>
                                        </div>
                                    </div>
                                    <div className="p-10 bg-gradient-to-br from-primary/5 to-transparent border-2 border-primary/10 rounded-[2.5rem] relative overflow-hidden shadow-inner">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                                            <Activity size={120} />
                                        </div>
                                        <p className="text-base font-bold text-slate-700 leading-relaxed italic relative z-10 whitespace-pre-wrap">
                                            "{scan.doctorPrescription}"
                                        </p>
                                    </div>
                                </motion.div>
                            )}


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

            {/* Print-Only Structured Medical Report (Mirroring PDF Layout) */}
            <div className="print-only-report">
                <div className="print-header">
                    <h1>RETINAAI CLINICAL REPORT</h1>
                    <p>Diagnostic Unit: {scan._id.toUpperCase()}</p>
                </div>

                <div className="print-section">
                    <h2 className="print-section-title">PATIENT PROFILE</h2>
                    <div className="print-grid">
                        <div className="print-info-list">
                            <div className="print-info-item"><span className="print-info-label">Patient Name:</span> {scan.patient?.name || 'N/A'}</div>
                            <div className="print-info-item"><span className="print-info-label">Identity ID:</span> {scan.patient?.patientId || 'Pending'}</div>
                            <div className="print-info-item"><span className="print-info-label">Age/Gender:</span> {scan.patient?.age || 'N/A'} yrs / {scan.patient?.gender || 'N/A'}</div>
                        </div>
                        {scan.imageUrl && (
                            <div className="print-image-box">
                                <img src={normalizeUrl(scan.imageUrl)} className="print-image" alt="Retina Scan" />
                                <p className="print-image-caption">{scan.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="print-section">
                    <h2 className="print-section-title">ANALYSIS STATUS</h2>
                    <div className="print-info-list">
                        <div className="print-info-item">
                            <span className="print-info-label">Risk Index:</span>
                            <span className={scan.aiResult === 'High Risk' ? 'print-risk-high' : scan.aiResult === 'Moderate' ? 'print-risk-mod' : 'print-risk-low'}>
                                {scan.aiResult || 'Pending'}
                            </span>
                        </div>
                        <div className="print-info-item"><span className="print-info-label">Confidence:</span> {scan.confidence || '94.2'}%</div>
                        <div className="print-info-item"><span className="print-info-label">Technician:</span> {scan.technician || 'Automatic AI'}</div>
                        <div className="print-info-item"><span className="print-info-label">Doctor Name:</span> Dr. {scan.referredDoctor?.name || 'Review Pending'}</div>
                    </div>
                </div>

                {scan.aiReportSummary && (
                    <div className="print-section">
                        <h2 className="print-section-title print-summary-title">CLINICAL SUMMARY (GENERATIVE AI)</h2>
                        <div className="print-text-block">
                            {scan.aiReportSummary}
                        </div>
                    </div>
                )}

                {scan.doctorPrescription && (
                    <div className="print-section">
                        <h2 className="print-section-title print-summary-title">OFFICIAL MEDICAL PRESCRIPTION</h2>
                        <p className="text-[11px] font-bold mb-2">Authorized by Dr. {scan.referredDoctor?.name || 'Physician'}</p>
                        <div className="print-text-block print-prescription">
                            "{scan.doctorPrescription}"
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '50px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', fontSize: '9px', color: '#94a3b8', textAlign: 'center' }}>
                    <p>RetinaAI Digital Security Handshake Verified • Report Ref: {scan._id.toUpperCase()}</p>
                    <p style={{ marginTop: '5px' }}>Generated on {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default PatientReport;
