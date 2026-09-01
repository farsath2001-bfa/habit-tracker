import api from './api';

export const getCompletions = (params = {}) =>
  api.get('/completions', { params }).then((res) => res.data);

export const upsertCompletion = (data) =>
  api.post('/completions', data).then((res) => res.data);
