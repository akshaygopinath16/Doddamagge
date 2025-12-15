import api from './api';

export const dashboardService = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    getActivityData: async () => {
        const response = await api.get('/dashboard/activity');
        return response.data;
    }
};
