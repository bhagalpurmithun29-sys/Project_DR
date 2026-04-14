import api from './api';

const scanService = {
    createScan: async (formData) => {
        const response = await api.post('/scans', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    getScans: async () => {
        const response = await api.get('/scans');
        return response.data;
    },
    getScan: async (id) => {
        const response = await api.get(`/scans/${id}`);
        return response.data;
    },
    updateScan: async (id, scanData) => {
        const response = await api.put(`/scans/${id}`, scanData);
        return response.data;
    },
    analyzeScan: async (id) => {
        const response = await api.post(`/scans/${id}/analyze`);
        return response.data;
    }
};

export default scanService;
