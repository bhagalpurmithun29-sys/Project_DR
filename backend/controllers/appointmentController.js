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
        const patientId = req.user.patientId; // Assuming req.user has patientId for patient role

        if (!patientId) {
            return res.status(403).json({ success: false, message: 'Only patients can book appointments.' });
        }

        // Validate date is not in past
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
            return res.status(400).json({ success: false, message: 'Cannot book appointments in the past.' });
        }

        // Check for double booking
        const existing = await Appointment.findOne({ doctorId, date, time });
        if (existing) {
            return res.status(400).json({ success: false, message: 'This time slot is already booked for this doctor.' });
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
        const patient = await Patient.findById(patientId);
        await Notification.create({
            recipientId: doctorId,
            recipientType: 'Doctor',
            title: 'New Appointment Request',
            message: `You have a new appointment request from ${patient.name} for ${date} at ${time}.`,
            type: 'Appointment'
        });

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
        const appointments = await Appointment.find({ patientId: req.params.id })
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
        const appointments = await Appointment.find({ doctorId: req.params.id })
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
        // if (appointment.doctorId.toString() !== req.user.doctorId.toString()) {
        //     return res.status(403).json({ success: false, message: 'Unauthorized to update this appointment.' });
        // }

        appointment.status = status;
        await appointment.save();

        // Notify Patient
        await Notification.create({
            recipientId: appointment.patientId,
            recipientType: 'Patient',
            title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your appointment for ${appointment.date} at ${appointment.time} has been ${status}.`,
            type: 'Appointment'
        });

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
