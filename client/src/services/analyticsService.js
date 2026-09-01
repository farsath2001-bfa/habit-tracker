import api from './api';

export const getDashboardAnalytics = () =>
  api.get('/analytics/dashboard').then((res) => res.data);

export const getWeeklyAnalytics = () => api.get('/analytics/weekly').then((res) => res.data);

export const getMonthlyAnalytics = (year, month) =>
  api
    .get('/analytics/monthly', { params: { year, month } })
    .then((res) => res.data);

export const getStreakAnalytics = () => api.get('/analytics/streaks').then((res) => res.data);
