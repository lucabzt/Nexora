// frontend/debug_frontend/src/api/notesService.js
import axios from 'axios';

const API_BASE = '/api/notes';

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
