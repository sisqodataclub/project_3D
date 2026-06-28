// src/context/HVTContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const HVTContext = createContext();

// ✅ Use your backend proxy endpoints – API key stays on the server
const API_BASE = 'https://api.franciscodes.com/cv/api/auth';

export const HVTProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hvt_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUserInfo(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserInfo = async (tok) => {
    try {
      const res = await fetch(`${API_BASE}/me/`, {
        headers: {
          'Authorization': `Bearer ${tok}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Login failed');
    }
    const data = await res.json();
    const { access } = data;
    localStorage.setItem('hvt_token', access);
    setToken(access);
    await fetchUserInfo(access);
    return data;
  };

  const register = async (email, password1, password2) => {
    const res = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password1, password2 })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return res.json();
  };

  const logout = () => {
    localStorage.removeItem('hvt_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <HVTContext.Provider value={value}>
      {children}
    </HVTContext.Provider>
  );
};

export const useHVT = () => {
  const context = useContext(HVTContext);
  if (!context) {
    throw new Error('useHVT must be used within a HVTProvider');
  }
  return context;
};
