// frontend/src/services/pdfService.js
import pdfApi from '../pdfApi';

// ============================================================
// Authentication APIs (public)
// ============================================================

export const apiRequestLogin = async (email) => {
  const res = await pdfApi.post('/pdf/api/request-login/', { email });
  return res.data;
};

export const apiVerifyLogin = async (code) => {
  const res = await pdfApi.post('/pdf/api/verify-login/', { code });
  return res.data;
};

export const apiLogout = () => {
  localStorage.removeItem('pdf_api_key');
  localStorage.removeItem('pdf_user');
};

// ============================================================
// PDF Generation APIs (require API key)
// ============================================================

export const apiGeneratePDF = async (params) => {
  const res = await pdfApi.post('/pdf/api/pdf/generate/', params, {
    responseType: 'blob',
  });
  return res.data;
};

export const apiListTemplates = async () => {
  const res = await pdfApi.get('/pdf/api/pdf/templates/');
  return res.data;
};

export const apiGetStatus = async (exportId) => {
  const res = await pdfApi.get(`/pdf/api/pdf/status/${exportId}/`);
  return res.data;
};

// ============================================================
// 🆕 File Upload
// ============================================================

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
