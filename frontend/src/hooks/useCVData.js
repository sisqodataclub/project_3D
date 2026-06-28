import { useState, useEffect } from 'react';
import { useHVT } from '../context/HVTContext'; // <-- changed from useAuth
import * as cvService from '../services/cvService';

export function useCVData() {
  const { token, isAuthenticated } = useHVT(); // <-- changed from useAuth

  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on mount or auth change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && token) {
          const [resumesData, appsData] = await Promise.all([
            cvService.apiFetchResumes(token),
            cvService.apiFetchApplications(token)
          ]);
          setResumes(Array.isArray(resumesData) ? resumesData : []);
          setApplications(Array.isArray(appsData) ? appsData : []);
        } else {
          setResumes(cvService.localGetResumes());
          setApplications(cvService.localGetApplications());
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, token]);

  // ---- Resume CRUD ----
  const createResume = async (data) => {
    try {
      if (isAuthenticated && token) {
        const newResume = await cvService.apiCreateResume(data, token);
        setResumes(prev => [...prev, newResume]);
        return newResume;
      } else {
        const newResume = { 
          ...data, 
          id: cvService.genLocalId(), 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const updated = [...resumes, newResume];
        setResumes(updated);
        cvService.localSetResumes(updated);
        return newResume;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateResume = async (id, data) => {
    try {
      if (isAuthenticated && token) {
        const updated = await cvService.apiUpdateResume(id, data, token);
        setResumes(prev => prev.map(r => r.id === id ? updated : r));
        return updated;
      } else {
        const updatedList = resumes.map(r => 
          r.id === id ? { ...r, ...data, updated_at: new Date().toISOString() } : r
        );
        setResumes(updatedList);
        cvService.localSetResumes(updatedList);
        return updatedList.find(r => r.id === id);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteResume = async (id) => {
    try {
      if (isAuthenticated && token) {
        await cvService.apiDeleteResume(id, token);
        setResumes(prev => prev.filter(r => r.id !== id));
      } else {
        const updated = resumes.filter(r => r.id !== id);
        setResumes(updated);
        cvService.localSetResumes(updated);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchResume = async (id) => {
    try {
      if (isAuthenticated && token) {
        return await cvService.apiFetchResume(id, token);
      } else {
        return resumes.find(r => r.id === id) || null;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ---- Application CRUD ----
  const createApplication = async (data) => {
    try {
      if (isAuthenticated && token) {
        const newApp = await cvService.apiCreateApplication(data, token);
        setApplications(prev => [...prev, newApp]);
        return newApp;
      } else {
        const newApp = { 
          ...data, 
          id: cvService.genLocalId(), 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const updated = [...applications, newApp];
        setApplications(updated);
        cvService.localSetApplications(updated);
        return newApp;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchApplication = async (id) => {
    try {
      if (isAuthenticated && token) {
        return await cvService.apiFetchApplication(id, token);
      } else {
        return applications.find(a => a.id === id) || null;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ---- Migration ----
  const migrateGuestData = async () => {
    if (!isAuthenticated || !token) return;

    try {
      // Upload local resumes
      for (const resume of resumes) {
        const { id, created_at, updated_at, ...cleanData } = resume;
        await cvService.apiCreateResume(cleanData, token);
      }
      // Upload local applications
      for (const app of applications) {
        const { id, created_at, updated_at, ...cleanData } = app;
        await cvService.apiCreateApplication(cleanData, token);
      }
      // Clear local storage
      cvService.clearGuestData();
      // Reload server data
      const [resumesData, appsData] = await Promise.all([
        cvService.apiFetchResumes(token),
        cvService.apiFetchApplications(token)
      ]);
      setResumes(resumesData);
      setApplications(appsData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    resumes,
    applications,
    loading,
    error,
    createResume,
    updateResume,
    deleteResume,
    fetchResume,
    createApplication,
    fetchApplication,
    migrateGuestData,
    isAuthenticated,
    hasGuestData: resumes.length > 0 || applications.length > 0
  };
}
