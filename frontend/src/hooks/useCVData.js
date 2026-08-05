// frontend/src/hooks/useCVData.js
import { useState, useEffect, useCallback } from 'react';
import { useHVT } from '../context/HVTContext';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export function useCVData() {
  const { isAuthenticated, accessToken } = useHVT();
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasGuestData, setHasGuestData] = useState(false);
  const [filterTag, setFilterTag] = useState('');

  // ---- Load data based on auth state ----
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isAuthenticated && accessToken) {
        try {
          const tagParam = filterTag ? `?tag=${encodeURIComponent(filterTag)}` : '';
          const [resumesRes, appsRes] = await Promise.all([
            fetch(`${API_BASE}/resumes/`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch(`${API_BASE}/applications/${tagParam}`, {
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
  }, [isAuthenticated, accessToken, filterTag]);

  // ---- Get a single resume (memoized) ----
  const getResume = useCallback(async (id) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/resumes/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to fetch resume');
    }
    return await res.json();
  }, [isAuthenticated, accessToken]);

  // ---- Other functions (create, update, delete) remain, but we can also memoize them if needed ----
  const createResume = useCallback(async (data) => {
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
  }, [isAuthenticated, accessToken]);

  const updateResume = useCallback(async (id, data) => {
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
  }, [isAuthenticated, accessToken]);

  const deleteResume = useCallback(async (id) => {
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
  }, [isAuthenticated, accessToken]);

  // ---- Application functions (similarly memoized) ----
  const createApplication = useCallback(async (data) => {
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
  }, [isAuthenticated, accessToken]);

  const updateApplication = useCallback(async (id, data) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/applications/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update application');
    }
    const updated = await res.json();
    setApplications(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, [isAuthenticated, accessToken]);

  // ---- Migrate Guest Data ----
  const migrateGuestData = useCallback(async () => {
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
  }, [isAuthenticated, accessToken]);

  return {
    resumes,
    applications,
    loading,
    filterTag,
    setFilterTag,
    getResume,
    createResume,
    updateResume,
    deleteResume,
    createApplication,
    updateApplication,
    migrateGuestData,
    hasGuestData,
  };
}
