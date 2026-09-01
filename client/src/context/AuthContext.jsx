import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import { registerUnauthorizedHandler, getErrorMessage } from '../services/api';

const TOKEN_KEY = 'habit_tracker_token';
const USER_KEY = 'habit_tracker_user';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const persistSession = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    try {
      localStorage.setItem(TOKEN_KEY, jwt);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (e) {
      // ignore storage errors (private mode, etc.)
    }
  };

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const logout = useCallback(
    (options = {}) => {
      clearSession();
      if (options.showToast !== false) {
        toast.success('Logged out successfully');
      }
      navigate('/login');
    },
    [clearSession, navigate]
  );

  // Wire up the axios 401 handler once
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clearSession();
      toast.error('Your session has expired. Please log in again.');
      navigate('/login');
    });
  }, [clearSession, navigate]);

  // Verify the stored token is still valid on first load
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await authService.getMe();
        setUser((prev) => ({ ...prev, ...profile }));
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        } catch (e) {
          // ignore
        }
      } catch (error) {
        // registerUnauthorizedHandler already handles a 401 redirect
      } finally {
        setLoading(false);
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const { token: jwt, ...userData } = data;
    persistSession(userData, jwt);
    return userData;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    const { token: jwt, ...userData } = data;
    persistSession(userData, jwt);
    return userData;
  };

  const updateProfile = async (payload) => {
    const updated = await authService.updateMe(payload);
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(merged));
      } catch (e) {
        // ignore
      }
      return merged;
    });
    return updated;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    register,
    logout,
    updateProfile,
    getErrorMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
