// frontend/src/pdfApi.js
import axios from "axios";

// Reuse the same base URL from your existing api.js
const apiUrl = "https://api.franciscodes.com";

const pdfApi = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add the PDF API key from localStorage
pdfApi.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('pdf_api_key');
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default pdfApi;
