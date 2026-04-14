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
    },

    getAllPatients: async () => {
        const response = await api.get('/patients');
        return response.data;
    },
    createPatient: async (patientData) => {
        const response = await api.post('/patients', patientData);
        return response.data;
    },
    uploadPatientPhoto: async (id, formData) => {
        const response = await api.post(`/patients/${id}/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default patientService;
