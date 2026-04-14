const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load env vars
dotenv.config();

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

// Enable CORS
app.use(cors());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── DB-ready guard ──────────────────────────────────────────────────────────
// If MongoDB is not yet connected, return a friendly 503 instead of crashing
app.use('/api', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database not connected. Please check MongoDB Atlas IP whitelist or network access.',
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
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// Database connection — retries every 5s so it auto-recovers once Atlas allows the IP
const connectDB = async () => {
    const tryConnect = async () => {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI);
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
