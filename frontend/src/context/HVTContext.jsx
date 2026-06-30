// src/context/HVTContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const HVTContext = createContext();
const API_BASE = 'https://api.franciscodes.com/cv/api/auth';

export const HVTProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('hvt_access') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('hvt_refresh') || null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('hvt_access');
    localStorage.removeItem('hvt_refresh');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

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
        // Try refresh
        if (refreshToken) {
          const refreshRes = await fetch(`${API_BASE}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshRes.ok) {
            const { access } = await refreshRes.json();
            localStorage.setItem('hvt_access', access);
            setAccessToken(access);
            return await fetchUserInfo(access);
          }
        }
        logout();
        return false;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        await fetchUserInfo(accessToken);
      }
      setLoading(false);
    };
    init();
    // eslint-disable-next-line
  }, []);

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

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!accessToken && !!user,
  };

  return <HVTContext.Provider value={value}>{children}</HVTContext.Provider>;
};

export const useHVT = () => {
  const context = useContext(HVTContext);
  if (!context) throw new Error('useHVT must be used within HVTProvider');
  return context;
};
