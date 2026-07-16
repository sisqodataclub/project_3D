// frontend/src/services/pdfService.js
import pdfApi from '../pdfApi';

// ============================================================
// Authentication APIs (public – no API key required)
// ============================================================

/**
 * Request a magic login link sent to the user's email.
 */
export const apiRequestLogin = async (email) => {
  const res = await pdfApi.post('/pdf/api/request-login/', { email });
  return res.data;
};

/**
 * Verify the magic link code and retrieve user info + API key.
 */
export const apiVerifyLogin = async (code) => {
  const res = await pdfApi.post('/pdf/api/verify-login/', { code });
  // Store the API key and user data upon successful verification
  if (res.data.success && res.data.user) {
    localStorage.setItem('pdf_api_key', res.data.user.api_key);
    localStorage.setItem('pdf_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

/**
 * Log out – clear local storage.
 */
export const apiLogout = () => {
  localStorage.removeItem('pdf_api_key');
  localStorage.removeItem('pdf_user');
};

// ============================================================
// User Info API (requires API key)
// ============================================================

/**
 * Fetch the current user's info (stats, preferences, etc.)
 */
export const apiGetUserInfo = async () => {
  const res = await pdfApi.get('/pdf/api/user/info/');
  // Update stored user data with fresh stats
  if (res.data) {
    const currentUser = JSON.parse(localStorage.getItem('pdf_user') || '{}');
    localStorage.setItem('pdf_user', JSON.stringify({ ...currentUser, ...res.data }));
  }
  return res.data;
};

// ============================================================
// PDF Generation APIs (require API key)
// ============================================================

/**
 * Generate a PDF from HTML/CSS/context data.
 * Returns a Blob (binary PDF data).
 */
export const apiGeneratePDF = async (params) => {
  const res = await pdfApi.post('/pdf/api/pdf/generate/', params, {
    responseType: 'blob',
  });
  return res.data;
};

/**
 * List all available PDF templates.
 */
export const apiListTemplates = async () => {
  const res = await pdfApi.get('/pdf/api/pdf/templates/');
  return res.data;
};

/**
 * Check the status of an async PDF generation job.
 */
export const apiGetStatus = async (exportId) => {
  const res = await pdfApi.get(`/pdf/api/pdf/status/${exportId}/`);
  return res.data;
};

// ============================================================
// File Upload API (requires API key)
// ============================================================

/**
 * Upload a document (docx, md, txt, html) and convert it to PDF.
 * Returns a Blob (binary PDF data).
 */
export const apiUploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  const res = await pdfApi.post('/pdf/api/pdf/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });
  return res.data;
};

// ============================================================
// Helper: Refresh user info after a conversion/upload
// ============================================================

/**
 * Call this after generating a PDF to refresh the user stats in the background.
 */
export const refreshUserStats = async () => {
  try {
    await apiGetUserInfo();
  } catch (error) {
    // Silently fail – stats will update on next page load
    console.debug('Could not refresh user stats:', error.message);
  }
};
