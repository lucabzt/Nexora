import { apiWithCookies } from './baseApi';

export const courseService = {
  // Get all courses for current user
  getUserCourses: async () =>
    (await apiWithCookies.get('/courses/')).data,

  // Get a course by ID
  getCourseById: async (courseId) =>
    (await apiWithCookies.get(`/courses/${courseId}`)).data,

  // Get all courses with pagination
  getCourseChapters: async (courseId) =>
    (await apiWithCookies.get(`/courses/${courseId}/chapters`)).data,

  // Get a specific chapter by ID
  getChapter: async (courseId, chapterId) =>
    (await apiWithCookies.get(`/courses/${courseId}/chapters/${chapterId}`)).data,

  // Mark a chapter as complete
  markChapterComplete: async (courseId, chapterId) =>
      // Use the actual chapter ID, not index
    (await apiWithCookies.patch(`/courses/${courseId}/chapters/${chapterId}/complete`)).data,

  getFiles: async (courseId) =>
  (await apiWithCookies.get(`/files/documents?course_id=${courseId}`)).data,

  downloadFile: async (fileId) => {
    const response = await apiWithCookies.get(`/files/documents/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadImage: async (imageId) => {
    const response = await apiWithCookies.get(`/files/images/${imageId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getImages: async (courseId) =>
    (await apiWithCookies.get(`/files/images?course_id=${courseId}`)).data,

  // Update a course's title and description
  updateCourse: async (courseId, title, description) => {
    const params = new URLSearchParams();
    if (title !== undefined) {
      params.append('title', title);
    }
    if (description !== undefined) {
      params.append('description', description);
    }
    const response = await apiWithCookies.put(`/courses/${courseId}?${params.toString()}`);
    return response.data;
  },

  // Delete a course by ID
  deleteCourse: async (courseId) => {
    try {
      const response = await apiWithCookies.delete(`/courses/${courseId}`);
      // Check for 204 No Content or other success statuses without a body
      if (response.status === 204) {
        return { message: 'Course deleted successfully' };
      }
      return response.data;
    } catch (error) {
      console.error(`Error deleting course ${courseId}:`, error.response || error);
      throw error;
    }
  },

  createCourse: async (data) => { // Removed onProgress, onError, onComplete
    // let ws; // WebSocket instance - REMOVED
    console.log('[POST] Initiating createCourse POST request');
    // Step 1: Make the initial POST request to get the course data (including ID)
    const response = await apiWithCookies.post('/courses/create', data);
    console.log('[POST] Course creation request successful, response:', response.data);
    return response.data; 
  },

  // Upload a document and get document ID
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiWithCookies.post('/files/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data; // Contains document ID and other info
  },

  // Upload an image and get image ID
uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiWithCookies.post('/files/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data; // Contains image ID and other info
  },



};

export default courseService;