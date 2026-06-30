// src/hooks/useCVData.js
import { useState, useEffect } from 'react';
import { useHVT } from '../context/HVTContext';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export function useCVData() {
  const { isAuthenticated, accessToken } = useHVT();
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasGuestData, setHasGuestData] = useState(false);

  // Load data based on auth state
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isAuthenticated && accessToken) {
        try {
          const [resumesRes, appsRes] = await Promise.all([
            fetch(`${API_BASE}/resumes/`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch(`${API_BASE}/applications/`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
          ]);
          if (resumesRes.ok && appsRes.ok) {
            const resumesData = await resumesRes.json();
            const appsData = await appsRes.json();
            setResumes(resumesData.results || []);
            setApplications(appsData.results || []);
          } else {
            console.error('Failed to fetch server data');
            setResumes([]);
            setApplications([]);
          }
          setHasGuestData(false);
        } catch (e) {
          console.error(e);
          setResumes([]);
          setApplications([]);
          setHasGuestData(false);
        }
      } else {
        const guestR = JSON.parse(localStorage.getItem('guest_resumes') || '[]');
        const guestA = JSON.parse(localStorage.getItem('guest_applications') || '[]');
        setResumes(guestR);
        setApplications(guestA);
        setHasGuestData(guestR.length > 0 || guestA.length > 0);
      }
      setLoading(false);
    };
    loadData();
  }, [isAuthenticated, accessToken]);

  // ---- Create Resume ----
  const createResume = async (data) => {
    if (isAuthenticated) {
      const res = await fetch(`${API_BASE}/resumes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newResume = await res.json();
        setResumes((prev) => [...prev, newResume]);
        return newResume;
      } else {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to create resume');
      }
    } else {
      const guestResumes = JSON.parse(localStorage.getItem('guest_resumes') || '[]');
      const newResume = {
        ...data,
        id: `guest_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      guestResumes.push(newResume);
      localStorage.setItem('guest_resumes', JSON.stringify(guestResumes));
      setResumes(guestResumes);
      setHasGuestData(true);
      return newResume;
    }
  };

  // ---- Update Resume ----
  const updateResume = async (id, data) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/resumes/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update resume');
    }
    const updated = await res.json();
    setResumes(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  // ---- Delete Resume (optional) ----
  const deleteResume = async (id) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/resumes/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to delete resume');
    }
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  // ---- Create Application ----
  const createApplication = async (data) => {
    if (isAuthenticated) {
      const res = await fetch(`${API_BASE}/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newApp = await res.json();
        setApplications((prev) => [...prev, newApp]);
        return newApp;
      } else {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to create application');
      }
    } else {
      const guestApps = JSON.parse(localStorage.getItem('guest_applications') || '[]');
      const newApp = {
        ...data,
        id: `guest_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      guestApps.push(newApp);
      localStorage.setItem('guest_applications', JSON.stringify(guestApps));
      setApplications(guestApps);
      setHasGuestData(true);
      return newApp;
    }
  };

  // ---- Migrate Guest Data ----
  const migrateGuestData = async () => {
    if (!isAuthenticated) return;
    const guestR = JSON.parse(localStorage.getItem('guest_resumes') || '[]');
    const guestA = JSON.parse(localStorage.getItem('guest_applications') || '[]');
    if (guestR.length === 0 && guestA.length === 0) return;
    try {
      for (const r of guestR) {
        const { id, created_at, ...data } = r;
        await fetch(`${API_BASE}/resumes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        });
      }
      for (const a of guestA) {
        const { id, created_at, ...data } = a;
        await fetch(`${API_BASE}/applications/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        });
      }
      localStorage.removeItem('guest_resumes');
      localStorage.removeItem('guest_applications');
      // Refresh server data
      const [rRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/resumes/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${API_BASE}/applications/`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);
      if (rRes.ok && aRes.ok) {
        const rd = await rRes.json();
        const ad = await aRes.json();
        setResumes(rd.results || []);
        setApplications(ad.results || []);
      }
    } catch (e) {
      console.error(e);
      throw new Error('Migration failed');
    }
  };

  return {
    resumes,
    applications,
    loading,
    createResume,
    updateResume,
    deleteResume,
    createApplication,
    migrateGuestData,
    hasGuestData,
  };
}
