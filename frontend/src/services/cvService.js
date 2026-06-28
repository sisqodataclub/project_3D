// ============================================================
// Configuration
// ============================================================
// Use environment variable if available, otherwise fallback to production URL.
const API_BASE = import.meta.env?.VITE_CV_API_BASE || 'https://api.franciscodes.com/cv/api';

// ============================================================
// API Functions (for authenticated users)
// ============================================================

// ---- Resumes ----
export const apiFetchResumes = async (token) => {
  const res = await fetch(`${API_BASE}/resumes/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch resumes');
  }
  return res.json();
};

export const apiCreateResume = async (data, token) => {
  const res = await fetch(`${API_BASE}/resumes/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create resume');
  }
  return res.json();
};

export const apiUpdateResume = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/resumes/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to update resume');
  }
  return res.json();
};

export const apiDeleteResume = async (id, token) => {
  const res = await fetch(`${API_BASE}/resumes/${id}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to delete resume');
  }
};

export const apiFetchResume = async (id, token) => {
  const res = await fetch(`${API_BASE}/resumes/${id}/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch resume');
  }
  return res.json();
};

// ---- Job Applications ----
export const apiFetchApplications = async (token) => {
  const res = await fetch(`${API_BASE}/applications/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch applications');
  }
  return res.json();
};

export const apiCreateApplication = async (data, token) => {
  const res = await fetch(`${API_BASE}/applications/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create application');
  }
  return res.json();
};

export const apiFetchApplication = async (id, token) => {
  const res = await fetch(`${API_BASE}/applications/${id}/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch application');
  }
  return res.json();
};

// ============================================================
// LocalStorage Helpers (for guest users)
// ============================================================

const STORAGE_KEYS = {
  resumes: 'guest_resumes',
  applications: 'guest_applications'
};

let localIdCounter = Date.now();

/**
 * Generate a unique local ID for guest data.
 */
export const genLocalId = () => `local_${localIdCounter++}`;

// ---- Resumes ----
export const localGetResumes = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.resumes) || '[]');
  } catch {
    return [];
  }
};

export const localSetResumes = (data) => {
  localStorage.setItem(STORAGE_KEYS.resumes, JSON.stringify(data));
};

// ---- Applications ----
export const localGetApplications = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.applications) || '[]');
  } catch {
    return [];
  }
};

export const localSetApplications = (data) => {
  localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(data));
};

/**
 * Clear all guest data from localStorage.
 */
export const clearGuestData = () => {
  localStorage.removeItem(STORAGE_KEYS.resumes);
  localStorage.removeItem(STORAGE_KEYS.applications);
};

// ============================================================
// Utility: Check if user has guest data
// ============================================================
export const hasGuestData = () => {
  return localGetResumes().length > 0 || localGetApplications().length > 0;
};
