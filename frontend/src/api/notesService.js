// frontend/src/api/notesService.js
import { apiWithCookies } from './baseApi';


export async function getNotes(courseId, chapterId) {
  const res = await apiWithCookies.get(`/notes/?courseId=${courseId}&chapterId=${chapterId}`);
  return res.data;
}

export async function addNote(courseId, chapterId, text) {
  const res = await apiWithCookies.post("/notes/", { courseId, chapterId, text });
  return res.data;
}

export async function updateNote(noteId, text) {
  const res = await apiWithCookies.put(`/notes/${noteId}`, { text });
  return res.data;
}

export async function deleteNote(noteId) {
  const res = await apiWithCookies.delete(`/notes/${noteId}`);
  return res.data;
}
