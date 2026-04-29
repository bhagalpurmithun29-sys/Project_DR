const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;
        // Find patient document for this user
        const patientDoc = await Patient.findOne({ user: req.user._id });
        const patientId = patientDoc?._id;

        if (!patientId) {
            return res.status(403).json({ success: false, message: 'Only registered patients can book appointments.' });
        }

        // Validate date is not in past
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
            return res.status(400).json({ success: false, message: 'Cannot book appointments in the past.' });
        }

        // Check for double booking (same doctor, same time slot)
        const existingSlot = await Appointment.findOne({ doctorId, date, time });
        if (existingSlot) {
            return res.status(400).json({ success: false, message: 'This time slot is already booked for this doctor.' });
        }

        // Check if patient already has an active appointment with this doctor
        const existingActive = await Appointment.findOne({
            patientId,
            doctorId,
            status: { $in: ['pending', 'confirmed'] }
        });
        if (existingActive) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active appointment (pending or confirmed) with this doctor. You must wait for it to be completed or cancelled before booking again.'
            });
        }

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            date,
            time,
            reason,
            status: 'pending'
        });

        // Notify Doctor
        const doctor = await Doctor.findById(doctorId);
        if (doctor && doctor.user) {
            await Notification.create({
                user: doctor.user,
                title: 'New Appointment Request',
                message: `You have a new appointment request from ${patientDoc.name} for ${date} at ${time}.`,
                type: 'Appointment',
                relatedId: appointment._id
            });
        }

        res.status(201).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get patient appointments
// @route   GET /api/appointments/patient/:id
// @access  Private
exports.getPatientAppointments = async (req, res) => {
    try {
        let patientId = req.params.id;

        // If "me" is passed, find the current patient's ID
        if (patientId === 'me') {
            const patientDoc = await Patient.findOne({ user: req.user._id });
            if (!patientDoc) return res.status(404).json({ success: false, message: 'Patient profile not found' });
            patientId = patientDoc._id;
        }

        const appointments = await Appointment.find({ patientId })
            .populate('doctorId', 'name specialization photo')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctor/:id
// @access  Private
exports.getDoctorAppointments = async (req, res) => {
    try {
        let doctorId = req.params.id;

        // If "me" is passed, find the current doctor's ID
        if (doctorId === 'me') {
            let doctorDoc = await Doctor.findOne({ user: req.user._id });

            // Auto-create basic profile if missing for a user with 'doctor' role
            if (!doctorDoc && (req.user.role === 'doctor' || req.user.role === 'technician')) {
                doctorDoc = await Doctor.create({
                    user: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    specialization: 'Retina Specialist',
                    licenseNumber: `TEMP-${req.user._id.toString().substring(0, 8)}`,
                    country: 'Unknown',
                    experience: '0',
                    phoneNumber: '0000000000'
                });
            }

            if (!doctorDoc) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
            doctorId = doctorDoc._id;
        }

        const appointments = await Appointment.find({ doctorId })
            .populate('patientId', 'name photo patientId')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all appointments (Center view)
// @route   GET /api/appointments
// @access  Private (Center)
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name')
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id
// @access  Private (Doctor)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        // Only the assigned doctor can update status
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this appointment.' });
        }

        appointment.status = status;
        await appointment.save();

        // Notify Patient
        const patient = await Patient.findById(appointment.patientId);
        if (patient && patient.user) {
            await Notification.create({
                user: patient.user,
                title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Your appointment for ${appointment.date} at ${appointment.time} has been ${status}.`,
                type: 'Appointment',
                relatedId: appointment._id
            });
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
