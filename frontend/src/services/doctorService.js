import api from './api';

const doctorService = {
    saveProfile: async (profileData) => {
        const response = await api.post('/doctors/profile', profileData);
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/doctors/profile');
        return response.data;
    }
};

export default doctorService;
