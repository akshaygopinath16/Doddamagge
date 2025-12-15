import api from './api';

export const paymentService = {
    getAll: async () => {
        const response = await api.get('/payments');
        return response.data;
    },

    create: async (paymentData) => {
        const response = await api.post('/payments', paymentData);
        return response.data;
    },

    update: async (id, paymentData) => {
        const response = await api.put(`/payments/${id}`, paymentData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/payments/${id}`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/payments/${id}/status`, { status });
        return response.data;
    }
};
