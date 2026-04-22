const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    getAllAppointments,
    updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(createAppointment)
    .get(getAllAppointments);

router.get('/patient/:id', getPatientAppointments);
router.get('/doctor/:id', getDoctorAppointments);
router.patch('/:id', updateAppointmentStatus);

module.exports = router;
