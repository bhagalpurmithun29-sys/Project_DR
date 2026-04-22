import api from './api';

const appointmentService = {
    createAppointment: async (data) => {
        try {
            const response = await api.post('/appointments', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getPatientAppointments: async (patientId) => {
        try {
            const response = await api.get(`/appointments/patient/${patientId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getDoctorAppointments: async (doctorId) => {
        try {
            const response = await api.get(`/appointments/doctor/${doctorId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getAllAppointments: async () => {
        try {
            const response = await api.get('/appointments');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateStatus: async (id, status) => {
        try {
            const response = await api.patch(`/appointments/${id}`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default appointmentService;
