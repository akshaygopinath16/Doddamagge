import api from './api';

export const eventService = {
    getAll: async () => {
        const response = await api.get('/events');
        return response.data;
    },

    create: async (eventData) => {
        const response = await api.post('/events', eventData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },

    update: async (id, eventData) => {
        const response = await api.put(`/events/${id}`, eventData);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/events/${id}/status`, { status });
        return response.data;
    }
};
