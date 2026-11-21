import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bloodConnectToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const API_ENDPOINTS = {
  REGISTER:       "/api/auth/register",
  LOGIN:          "/api/auth/login",
  ME:             "/api/auth/me",
  DONORS:         "/api/donors",
  DONOR_REGISTER: "/api/donors/register",
  DONOR_SEARCH:   "/api/donors/search",
  DONOR_STATS:    "/api/donors/stats",
  REQUESTS:       "/api/requests",
};

export default api;
