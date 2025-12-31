import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:54321",
});

// The Interceptor: This runs before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("polarify_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;