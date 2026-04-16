// lib/axios.js
import axios from "axios";

// ✅ Detect environment
const isProduction = import.meta.env.PROD;

// ✅ Base URL handling
const BASE_URL = isProduction
  ? "https://fypms-m9rx.onrender.com/api/v1"
  : "http://localhost:4000/api/v1";

// ✅ Create axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || BASE_URL,
  withCredentials: true, // required for cookies (auth)
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // prevent hanging requests
});

// ✅ Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Optional: attach token if using JWT (future use)
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    if (!isProduction) {
      console.log("🚀 Request:", {
        url: config.url,
        method: config.method,
        data: config.data,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (!isProduction) {
      console.log("✅ Response:", response.data);
    }
    return response;
  },
  (error) => {
    // Handle global errors
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.warn("🔒 Unauthorized - Redirect to login");
        // Example:
        // window.location.href = "/login";
      }

      if (!isProduction) {
        console.error("❌ API Error:", {
          url: error.config?.url,
          status,
          message: error.response?.data?.message,
        });
      }
    } else {
      console.error("❌ Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);