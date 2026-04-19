const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config();

// Env validation
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter(ev => !process.env[ev]);

if (missingEnv.length > 0) {
    console.error(`\x1b[31m❌ CRITICAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}\x1b[0m`);
    console.warn('\x1b[33m💡 Please check your backend/.env file against backend/.env.example\x1b[0m');
    // We don't exit(1) to allow the app to run in a degraded state (e.g., for deployment debug)
}

// Route files
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const scanRoutes = require('./routes/scanRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const diagnosisCenterRoutes = require('./routes/diagnosisCenterRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS - Optimized for cross-platform deployment (Vercel <-> Render)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Self-Healing: Image Not Found Fallback ──────────────────────────────────
// If a requested upload is missing, serve the placeholder instead of a 404
app.use('/uploads', (req, res, next) => {
    const filename = req.path.replace(/^\//, ''); // Remove leading slash
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        return next();
    }

    if (filename && filename !== 'placeholder.png') {
        console.warn(`⚠️  Missing asset requested: ${filename}. Serving placeholder.`);
        const placeholderPath = path.join(__dirname, 'uploads', 'placeholder.png');
        if (fs.existsSync(placeholderPath)) {
            return res.sendFile(placeholderPath);
        }
    }
    next();
});

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── DB-ready guard ──────────────────────────────────────────────────────────
// If MongoDB is not yet connected, return a friendly 503 instead of crashing
app.use('/api', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database not connected. Please ensure your IP is whitelisted in MongoDB Atlas (Network Access -> Add IP -> Allow Access From Anywhere).',
        });
    }
    next();
});
// ────────────────────────────────────────────────────────────────────────────

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/diagnosis-centers', diagnosisCenterRoutes);

// 404 handler — must be AFTER all routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler — catches unhandled errors from controllers
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(`❌ Server Error: ${err.message}`);
    if (err.stack) console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// Database connection — retries every 5s so it auto-recovers once Atlas allows the IP
const connectDB = async () => {
    const tryConnect = async () => {
        try {
            const uri = process.env.MONGO_URI;
            const host = uri.split('@')[1]?.split('/')[0] || 'Unknown Host';
            console.log(`📡 Attempting to connect to: ${host}...`);
            const conn = await mongoose.connect(uri);
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            console.error(`❌ MongoDB connection failed: ${error.message}`);
            console.log('⏳ Retrying in 5 seconds...');
            setTimeout(tryConnect, 5000);
        }
    };
    tryConnect();
};

const PORT = process.env.PORT || 5001;

// Start server immediately, DB connects in background
connectDB();
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
