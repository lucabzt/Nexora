// frontend/magic_patterns/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    return api.post('/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  getMe: () => api.get('/users/me'),
  loginGoogle: () => {
    window.location.href = `${API_BASE_URL}/login/google`;
  }
};

// Files API
export const filesAPI = {
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Courses API
export const coursesAPI = {
  createCourse: (courseData) => {
    return fetch(`${API_BASE_URL}/courses/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(courseData)
    });
  },
  getCourses: () => api.get('/courses/'),
  getCourse: (courseId) => api.get(`/courses/${courseId}`),
  markChapterComplete: (courseId, chapterId) =>
    api.patch(`/courses/${courseId}/chapters/${chapterId}/complete`),
  markChapterIncomplete: (courseId, chapterId) =>
    api.patch(`/courses/${courseId}/chapters/${chapterId}/incomplete`),
  deleteCourse: (courseId) => api.delete(`/courses/${courseId}`)
};

export default api;