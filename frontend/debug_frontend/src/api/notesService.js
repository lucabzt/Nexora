// frontend/debug_frontend/src/api/notesService.js
import axios from 'axios';
import authService from './authService';

const API_URL = '/api/notes';

// Create axios instance with error handling and auth headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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


export async function getNotes(courseId, chapterId) {
  const res = await api.get(`/?courseId=${courseId}&chapterId=${chapterId}`);
  return res.data;
}

export async function addNote(courseId, chapterId, text) {
  const res = await api.post("/", { courseId, chapterId, text });
  return res.data;
}

export async function updateNote(noteId, text) {
  const res = await api.put(`/${noteId}`, { text });
  return res.data;
}

export async function deleteNote(noteId) {
  const res = await api.delete(`/${noteId}`);
  return res.data;
}
