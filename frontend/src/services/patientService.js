import api from './api';

const patientService = {
    getPatientProfile: async (id) => {
        const response = await api.get(`/patients/${id}`);
        return response.data;
    },

    getPatientScans: async (id) => {
        const response = await api.get(`/patients/${id}/scans`);
        return response.data;
    },

    getMyProfile: async () => {
        const response = await api.get('/patients/me');
        return response.data;
    }
};

export default patientService;
