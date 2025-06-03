// frontend/debug_frontend/src/api/notesService.js
import axios from 'axios';
import authService from './authService';

const API_BASE = '/api/notes';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth headers
api.interceptors.request.use(
  (config) => {
    const headers = authService.getAuthHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export async function getNotes(courseId, chapterId) {
  const res = await axios.get(`${API_BASE}/?courseId=${courseId}&chapterId=${chapterId}`);
  return res.data;
}

export async function addNote(courseId, chapterId, text) {
  const res = await axios.post(API_BASE, { courseId, chapterId, text });
  return res.data;
}

export async function updateNote(noteId, text) {
  const res = await axios.put(`${API_BASE}/${noteId}`, { text });
  return res.data;
}

export async function deleteNote(noteId) {
  const res = await axios.delete(`${API_BASE}/${noteId}`);
  return res.data;
}
