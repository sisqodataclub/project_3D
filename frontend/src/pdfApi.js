// frontend/src/pdfApi.js
import axios from "axios";

const apiUrl = "https://api.franciscodes.com";

const pdfApi = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// Request Interceptor: Add API Key to every request
// ============================================================
pdfApi.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('pdf_api_key');
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response Interceptor: Handle API key expiry (403)
// ============================================================
pdfApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 403 and it's likely due to expired/invalid API key
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || '';
      if (
        errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('invalid') ||
        errorMessage.toLowerCase().includes('not found')
      ) {
        // Clear stored credentials and redirect to login
        localStorage.removeItem('pdf_api_key');
        localStorage.removeItem('pdf_user');
        // Redirect to PDF login page
        if (window.location.pathname !== '/pdf/login') {
          window.location.href = '/pdf/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default pdfApi;
