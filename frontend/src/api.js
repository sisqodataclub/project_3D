// frontend/src/api.js
import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Change this from the old "/choreo-apis/..." path to your actual backend domain
const apiUrl = "https://api.franciscodes.com"; 

const api = axios.create({
  // It will use VITE_API_URL if it exists in your .env, otherwise it defaults to api.franciscodes.com
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
