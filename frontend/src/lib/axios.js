// lib/axios.js
import axios from "axios";

// Create axios instance with correct configuration
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://fypms-m9rx.onrender.com/api/v1",
  withCredentials: true, // ✅ CRITICAL: This sends cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);
    console.log("Request data:", config.data);
    console.log("With credentials:", config.withCredentials);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response from:", response.config.url);
    console.log("Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("API Error Details:", {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    return Promise.reject(error);
  }
);