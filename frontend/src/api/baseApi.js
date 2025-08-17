import axios from 'axios';

const API_URL = '/api';


// --- Instanz mit Cookies (für Auth) ---
export const apiWithCookies = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Beispiel: Auth-Interceptor mit Auto-Refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

apiWithCookies.interceptors.response.use(
  response => {
    // Return the response as-is, preserving the responseType
    return response;
  },
  async (error) => {
    // Let 429 (Too Many Requests) errors pass through to be handled by the component
    if (error.response?.status === 429) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Preserve the original responseType when retrying
          if (originalRequest.responseType) {
            originalRequest.responseType = originalRequest.responseType;
          }
          return apiWithCookies(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/auth/refresh', null, { withCredentials: true });
        processQueue(null);
        // Preserve the original responseType when retrying
        if (originalRequest.responseType) {
          originalRequest.responseType = originalRequest.responseType;
        }
        return apiWithCookies(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== 'undefined' && 
            window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// --- Instanz ohne Cookies (public/endpoints) ---
export const apiWithoutCookies = axios.create({
  baseURL: API_URL,
  withCredentials: false,          // Keine Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});