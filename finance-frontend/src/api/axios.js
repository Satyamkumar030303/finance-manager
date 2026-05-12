import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send httpOnly refresh cookie on every request
});

// We store a reference to the auth context refresh function here.
// This avoids circular imports (AuthContext imports api, api needs AuthContext).
let _refreshTokenFn = null;
let _getTokenFn = null;
let _logoutFn = null;

export const setAuthFunctions = ({ refreshToken, getToken, logout }) => {
  _refreshTokenFn = refreshToken;
  _getTokenFn = getToken;
  _logoutFn = logout;
};

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    if (config._skipAuth) return config;
    const token = _getTokenFn?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we're already refreshing to avoid refresh storm
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Response interceptor — on 401, try refresh + retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._skipAuth) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await _refreshTokenFn?.();
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          processQueue(new Error("Session expired"), null);
          _logoutFn?.();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        _logoutFn?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
