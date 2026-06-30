// src/context/HVTContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const HVTContext = createContext();

// ✅ Use your backend proxy endpoints – API key stays on the server
const API_BASE = 'https://api.franciscodes.com/cv/api/auth';

export const HVTProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('hvt_access') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('hvt_refresh') || null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // separate for auth

  // Refresh token function
  const refreshAccessToken = async () => {
    if (!refreshToken) return null;
    try {
      const res = await fetch('https://api.franciscodes.com/cv/api/auth/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        const newAccess = data.access;
        localStorage.setItem('hvt_access', newAccess);
        setAccessToken(newAccess);
        return newAccess;
      } else {
        // Refresh failed – logout
        logout();
        return null;
      }
    } catch {
      logout();
      return null;
    }
  };

  // Fetch user info with given token (and retry on 401 with refresh)
  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return true;
      } else if (res.status === 401) {
        // Token expired – try to refresh
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry with new token
          return await fetchUserInfo(newToken);
        } else {
          logout();
          return false;
        }
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  };

  // On mount and when accessToken changes, fetch user
  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      if (accessToken) {
        await fetchUserInfo(accessToken);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
      setLoading(false);
    };
    initAuth();
    // eslint-disable-next-line
  }, []); // only on mount

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Login failed');
    }
    const data = await res.json();
    const { access, refresh } = data;
    localStorage.setItem('hvt_access', access);
    localStorage.setItem('hvt_refresh', refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    await fetchUserInfo(access);
    return data;
  };

  const register = async (email, password1, password2) => {
    const res = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password1, password2 }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return res.json();
  };

  const logout = () => {
    localStorage.removeItem('hvt_access');
    localStorage.removeItem('hvt_refresh');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading: loading || authLoading,
    login,
    register,
    logout,
    isAuthenticated: !!accessToken && !!user,
  };

  return <HVTContext.Provider value={value}>{children}</HVTContext.Provider>;
};

export const useHVT = () => {
  const context = useContext(HVTContext);
  if (!context) {
    throw new Error('useHVT must be used within a HVTProvider');
  }
  return context;
};
