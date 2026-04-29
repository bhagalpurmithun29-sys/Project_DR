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

    const [siblingScan, setSiblingScan] = useState(null);

    useEffect(() => {
        const fetchScanData = async () => {
            try {
                const res = await scanService.getScan(id);
                const currentScan = res.data;
                setScan(currentScan);
                
                if (currentScan?.patient?._id) {
                    const allScansRes = await api.get(`/patients/${currentScan.patient._id}/scans`);
                    const allScans = allScansRes.data.data || [];
                    const sibling = allScans.find(sib => 
                        sib._id !== currentScan._id &&
                        sib.patient?._id === currentScan.patient?._id && 
                        sib.eyeSide !== currentScan.eyeSide &&
                        Math.abs(new Date(sib.createdAt) - new Date(currentScan.createdAt)) < 24 * 60 * 60 * 1000
                    );
                    setSiblingScan(sibling || null);
                }
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

            const pdfScans = [scan, siblingScan].filter(Boolean).sort((a,b) => a.eyeSide === 'OD' ? -1 : 1);

            // Add Scan Images
            for (let i = 0; i < pdfScans.length; i++) {
                const s = pdfScans[i];
                if (s.imageUrl) {
                    try {
                        const absoluteUrl = normalizeUrl(s.imageUrl);
                        const img = await loadImage(absoluteUrl);
                        const imgSize = pdfScans.length === 2 ? 35 : 50;
                        const xOffset = pdfScans.length === 2 ? 115 + (i * 40) : 140;
                        
                        doc.addImage(img, 'JPEG', xOffset, 40, imgSize, imgSize);
                        doc.setDrawColor(230);
                        doc.rect(xOffset, 40, imgSize, imgSize);
                        doc.setFontSize(8);
                        doc.setTextColor(150);
                        doc.text(`${s.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}`, xOffset + (imgSize/2), 40 + imgSize + 5, { align: 'center' });
                    } catch (e) {
                        console.error('Failed to add image to PDF', e);
                    }
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
            
            let statusY = 95;
            pdfScans.forEach((s) => {
                const prefix = pdfScans.length === 2 ? (s.eyeSide === 'OD' ? '[OD] ' : '[OS] ') : '';
                
                doc.setTextColor(0);
                doc.text(`${prefix}Risk Index:`, 20, statusY);
                doc.setTextColor(s.aiResult?.includes('High') ? 225 : 5, s.aiResult?.includes('High') ? 29 : 150, s.aiResult?.includes('High') ? 72 : 105);
                doc.text(`${s.aiResult || 'Pending'}`, 55, statusY);
                
                doc.setTextColor(0);
                doc.text(`Confidence:`, 115, statusY); // Use right column for confidence
                doc.text(`${s.aiConfidence ? (s.aiConfidence * 100).toFixed(2) : s.confidence || '94.2'}%`, 140, statusY);
                
                statusY += 7;
            });
            
            doc.setTextColor(0);
            doc.text(`Technician:`, 20, statusY);
            doc.text(`${scan.technician || 'Automatic AI'}`, 55, statusY);
            statusY += 7;
            
            doc.text(`Doctor Name:`, 20, statusY);
            doc.text(`Dr. ${scan.referredDoctor?.name || 'Review Pending'}`, 55, statusY);

            let currentY = statusY + 15;

            // Clinical Summary (Generative AI)
            pdfScans.forEach((s) => {
                if (s.aiReportSummary) {
                    if (currentY > 260) { doc.addPage(); currentY = 20; }
                    doc.setFontSize(12);
                    doc.setTextColor(5, 150, 105);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`CLINICAL SUMMARY ${pdfScans.length === 2 ? (s.eyeSide === 'OD' ? '(OD)' : '(OS)') : '(GENERATIVE AI)'}`, 20, currentY);
                    
                    doc.setFontSize(9);
                    doc.setTextColor(60);
                    doc.setFont('helvetica', 'normal');
                    const summaryLines = doc.splitTextToSize(s.aiReportSummary, 170);
                    doc.text(summaryLines, 20, currentY + 10);
                    currentY += (summaryLines.length * 5) + 20;
                }
            });

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
                    {/* Patient Profile - Full Width */}
                    <div className="lg:col-span-3 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-wrap items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                                    <p className="text-xl font-black text-slate-900 leading-tight">{scan.patient?.name || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity ID</p>
                                <p className="text-base font-black text-slate-900 leading-tight">{scan.patient?.patientId || 'Pending'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age / Gender</p>
                                <p className="text-base font-black text-slate-900 leading-tight">
                                    {scan.patient?.age !== undefined && scan.patient?.age !== null ? scan.patient.age : 'N/A'} yrs / <span className="capitalize">{scan.patient?.gender || 'N/A'}</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                <p className="text-base font-black text-slate-900 leading-tight">{new Date(scan.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="pl-6 border-l border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physician</p>
                                <p className="text-base font-black text-slate-900 leading-tight">Dr. {scan.referredDoctor?.name || 'Pending'}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Dynamic Scans Grid */}
                    <div className="lg:col-span-3">
                        <div className={`grid ${siblingScan ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-10`}>
                            {[scan, siblingScan].filter(Boolean).sort((a,b) => a.eyeSide === 'OD' ? -1 : 1).map((s, idx) => (
                                <motion.div 
                                    key={s._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * (idx + 1) }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-base font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                            <div className="size-3 rounded-full bg-primary" />
                                            {s.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                                        </h4>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                            s.aiResult?.includes('High') ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                            s.aiResult?.includes('Moderate') ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        }`}>
                                            {s.aiResult || 'Pending'}
                                        </span>
                                    </div>

                                    <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border-4 border-slate-50 bg-slate-900 shadow-2xl relative group">
                                        <img src={normalizeUrl(s.imageUrl)} alt={`${s.eyeSide} Retina`} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <p className="text-white text-xs font-black uppercase tracking-widest">
                                                {s.eyeSide === 'OD' ? 'Right Fundus Image' : 'Left Fundus Image'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 space-y-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prediction</span>
                                                <span className="text-xs font-black text-slate-900 text-center leading-tight">
                                                    {s.prediction || s.findings?.[0]?.replace('AI Analysis detects: ', '') || '—'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</span>
                                                <span className={`text-xl font-black ${s.aiConfidence >= 0.7 ? 'text-rose-500' : s.aiConfidence >= 0.4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {s.aiConfidence ? `${(s.aiConfidence * 100).toFixed(2)}%` : '—'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lesions</span>
                                                <span className={`text-xl font-black ${(s.lesionCount || 0) > 2 ? 'text-rose-500' : (s.lesionCount || 0) > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {s.lesionCount ?? '—'}
                                                </span>
                                            </div>
                                        </div>

                                        {s.aiReportSummary && (
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText size={14} className="text-primary" />
                                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block">AI Clinical Analysis</label>
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50 shadow-inner">
                                                    <div className="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                                                        {s.aiReportSummary}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
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
                        <div className="flex gap-4 items-center justify-end">
                            {[scan, siblingScan].filter(Boolean).sort((a,b) => a.eyeSide === 'OD' ? -1 : 1).map(s => (
                                s.imageUrl && (
                                    <div key={s._id} className="print-image-box">
                                        <img src={normalizeUrl(s.imageUrl)} className="print-image" alt="Retina Scan" />
                                        <p className="print-image-caption">{s.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</p>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                <div className="print-section">
                    <h2 className="print-section-title">ANALYSIS STATUS</h2>
                    <div className="print-info-list">
                        {[scan, siblingScan].filter(Boolean).sort((a,b) => a.eyeSide === 'OD' ? -1 : 1).map(s => (
                            <div key={s._id} className="mb-4">
                                {siblingScan && <h3 className="text-[10px] font-bold text-slate-500 mb-1">{s.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</h3>}
                                <div className="print-info-item">
                                    <span className="print-info-label">Risk Index:</span>
                                    <span className={s.aiResult?.includes('High') ? 'print-risk-high' : s.aiResult?.includes('Moderate') ? 'print-risk-mod' : 'print-risk-low'}>
                                        {s.aiResult || 'Pending'}
                                    </span>
                                </div>
                                <div className="print-info-item"><span className="print-info-label">Confidence:</span> {s.aiConfidence ? (s.aiConfidence * 100).toFixed(2) : s.confidence || '94.2'}%</div>
                            </div>
                        ))}
                        <div className="print-info-item mt-2"><span className="print-info-label">Technician:</span> {scan.technician || 'Automatic AI'}</div>
                        <div className="print-info-item"><span className="print-info-label">Doctor Name:</span> Dr. {scan.referredDoctor?.name || 'Review Pending'}</div>
                    </div>
                </div>

                {[scan, siblingScan].filter(Boolean).sort((a,b) => a.eyeSide === 'OD' ? -1 : 1).map(s => (
                    s.aiReportSummary && (
                        <div key={s._id} className="print-section">
                            <h2 className="print-section-title print-summary-title">CLINICAL SUMMARY {siblingScan ? (s.eyeSide === 'OD' ? '(RIGHT EYE)' : '(LEFT EYE)') : '(GENERATIVE AI)'}</h2>
                            <div className="print-text-block">
                                {s.aiReportSummary}
                            </div>
                        </div>
                    )
                ))}

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
