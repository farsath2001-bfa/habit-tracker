import api from './api';

export const getHabits = () => api.get('/habits').then((res) => res.data);

export const getHabit = (id) => api.get(`/habits/${id}`).then((res) => res.data);

export const createHabit = (data) => api.post('/habits', data).then((res) => res.data);

export const updateHabit = (id, data) => api.put(`/habits/${id}`, data).then((res) => res.data);

export const deleteHabit = (id) => api.delete(`/habits/${id}`).then((res) => res.data);

export const setHabitArchived = (id, archived) =>
  api.put(`/habits/${id}`, { archived }).then((res) => res.data);