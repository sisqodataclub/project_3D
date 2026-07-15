// frontend/src/services/pdfService.js
import pdfApi from "../pdfApi";

// ============================================================
// Authentication APIs (public – no API key needed)
// ============================================================

/**
 * Request a magic login link.
 */
export const apiRequestLogin = async (email) => {
  const res = await pdfApi.post("/pdf/api/request-login/", { email });
  return res.data;
};

/**
 * Verify a magic login code and retrieve the user's API key.
 */
export const apiVerifyLogin = async (code) => {
  const res = await pdfApi.post("/pdf/api/verify-login/", { code });
  return res.data;
};

/**
 * Log out (clear local storage).
 */
export const apiLogout = () => {
  localStorage.removeItem('pdf_api_key');
  localStorage.removeItem('pdf_user');
};

// ============================================================
// PDF Generation APIs (require API key – handled by interceptor)
// ============================================================

/**
 * Generate a PDF.
 * @param {Object} params - { template_slug?, html?, context, css, filename, async_mode }
 * @returns {Promise<Blob>} - The PDF as a Blob
 */
export const apiGeneratePDF = async (params) => {
  const res = await pdfApi.post("/pdf/api/pdf/generate/", params, {
    responseType: "blob", // Important: we want binary data
  });
  return res.data;
};

/**
 * List all available PDF templates.
 */
export const apiListTemplates = async () => {
  const res = await pdfApi.get("/pdf/api/pdf/templates/");
  return res.data;
};

/**
 * Check the status of an async PDF generation job.
 */
export const apiGetStatus = async (exportId) => {
  const res = await pdfApi.get(`/pdf/api/pdf/status/${exportId}/`);
  return res.data;
};
