import api from './api';

export const userService = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    updateRole: async (id, role) => {
        const response = await api.put(`/users/${id}/role`, { role });
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    toggleStatus: async (id) => {
        const response = await api.patch(`/users/${id}/status`);
        return response.data;
    }
};
