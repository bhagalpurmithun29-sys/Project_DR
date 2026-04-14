import api from './api';

const doctorService = {
    saveProfile: async (profileData) => {
        const response = await api.post('/doctors/profile', profileData);
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/doctors/profile');
        return response.data;
    },
    uploadProfilePhoto: async (formData) => {
        const response = await api.post('/doctors/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default doctorService;
