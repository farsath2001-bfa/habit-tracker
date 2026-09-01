import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the Bearer token (if present) to every outgoing request
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('habit_tracker_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // localStorage unavailable - proceed without auth header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// A 401 only means "log the user out" if we actually sent a token -
// otherwise it's just an unauthenticated request to a protected route
// (e.g. loading the app before login) and we should not force a redirect loop.
let onUnauthorized = null;
export const registerUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      let hadToken = false;
      try {
        hadToken = Boolean(localStorage.getItem('habit_tracker_token'));
      } catch (e) {
        hadToken = false;
      }
      if (hadToken && typeof onUnauthorized === 'function') {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

/** Pulls a clean human-readable message out of an Axios error. */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  return error?.response?.data?.message || error?.message || fallback;
};

export default api;
