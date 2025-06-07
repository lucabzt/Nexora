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
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiWithCookies(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/auth/refresh', null, { withCredentials: true }); // Refresh-Call
        processQueue(null);
        return apiWithCookies(originalRequest); // Ursprünglichen Request wiederholen
      } catch (refreshError) {
        processQueue(refreshError);
        console.error('Token refresh failed. Redirecting to login.', refreshError);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          // You might want to dispatch a global event here that your AuthContext can listen to
          // for a cleaner logout (e.g., clearing user state from context/localStorage).
          // For now, a hard redirect will achieve a similar effect as the app re-initializes.
          window.location.href = '/login';
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