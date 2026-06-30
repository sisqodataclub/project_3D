// src/hooks/useCVData.js
import { useState, useEffect } from 'react';
import { useHVT } from '../context/HVTContext';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export function useCVData() {
  const { isAuthenticated, accessToken, user } = useHVT();
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasGuestData, setHasGuestData] = useState(false);

  // ---- Load guest data when not authenticated ----
  useEffect(() => {
    if (!isAuthenticated) {
      const guestResumes = JSON.parse(localStorage.getItem('guest_resumes') || '[]');
      const guestApps = JSON.parse(localStorage.getItem('guest_applications') || '[]');
      setResumes(guestResumes);
      setApplications(guestApps);
      setHasGuestData(guestResumes.length > 0 || guestApps.length > 0);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ---- Load server data when authenticated ----
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const fetchData = async () => {
        setLoading(true);
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
            setResumes(resumesData);
            setApplications(appsData);
            // Check for guest data that hasn't been migrated
            const guestResumes = JSON.parse(localStorage.getItem('guest_resumes') || '[]');
            const guestApps = JSON.parse(localStorage.getItem('guest_applications') || '[]');
            setHasGuestData(guestResumes.length > 0 || guestApps.length > 0);
          } else {
            // Handle error
            console.error('Failed to fetch server data');
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated, accessToken]); // Re-fetch when auth changes

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
      } else {
        throw new Error('Failed to create resume');
      }
    } else {
      // Guest mode – store in localStorage
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
    }
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
      } else {
        throw new Error('Failed to create application');
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
    }
  };

  // ---- Migrate Guest Data ----
  const migrateGuestData = async () => {
    if (!isAuthenticated) return;
    const guestResumes = JSON.parse(localStorage.getItem('guest_resumes') || '[]');
    const guestApps = JSON.parse(localStorage.getItem('guest_applications') || '[]');

    if (guestResumes.length === 0 && guestApps.length === 0) {
      setHasGuestData(false);
      return;
    }

    try {
      // Migrate resumes
      for (const resume of guestResumes) {
        const { id, created_at, ...resumeData } = resume;
        await fetch(`${API_BASE}/resumes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(resumeData),
        });
      }
      // Migrate applications
      for (const app of guestApps) {
        const { id, created_at, ...appData } = app;
        await fetch(`${API_BASE}/applications/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(appData),
        });
      }

      // Clear guest data
      localStorage.removeItem('guest_resumes');
      localStorage.removeItem('guest_applications');
      setHasGuestData(false);

      // Refresh server data to get the migrated items
      const [resumesRes, appsRes] = await Promise.all([
        fetch(`${API_BASE}/resumes/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_BASE}/applications/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);
      if (resumesRes.ok && appsRes.ok) {
        setResumes(await resumesRes.json());
        setApplications(await appsRes.json());
      }
    } catch (e) {
      console.error(e);
      throw new Error('Migration failed');
    }
  };

  // ---- Reset data when user logs out ----
  useEffect(() => {
    if (!isAuthenticated) {
      // When logged out, we load guest data (if any)
      const guestResumes = JSON.parse(localStorage.getItem('guest_resumes') || '[]');
      const guestApps = JSON.parse(localStorage.getItem('guest_applications') || '[]');
      setResumes(guestResumes);
      setApplications(guestApps);
      setHasGuestData(guestResumes.length > 0 || guestApps.length > 0);
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    resumes,
    applications,
    loading,
    createResume,
    createApplication,
    migrateGuestData,
    hasGuestData,
  };
}
