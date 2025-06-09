import { apiWithCookies } from './baseApi';

export const courseService = {
  // Get all courses for current user
  getUserCourses: async () => {
    try {
      const response = await apiWithCookies.get('/courses/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await apiWithCookies.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get chapters for a course
  getCourseChapters: async (courseId) => {
    try {
      const response = await apiWithCookies.get(`/courses/${courseId}/chapters`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific chapter by ID
  getChapter: async (courseId, chapterId) => {
    try {
      // Use the actual chapter ID, not index
      const response = await apiWithCookies.get(`/courses/${courseId}/chapters/${chapterId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quizzes for a course
  getCourseQuizzes: async (courseId) => {
    try {
      const response = await apiWithCookies.get(`/courses/${courseId}/quizzes`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a demo course (deprecated, use createCourse instead)
  createDemoCourse: async (data) => {
    try {
      const response = await apiWithCookies.post('/courses/new_demo', data);
      return response.data;
    } catch (error) {
      throw error;
    }
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

    try {
      console.log('[POST] Initiating createCourse POST request');
      // Step 1: Make the initial POST request to get the course data (including ID)
      const response = await apiWithCookies.post('/courses/create', data);

      // Directly return the response data, which should include the course_id
      // The backend should now return the course_id directly in the POST response
      // if it's not a long-running task anymore.
      console.log('[POST] Course creation request successful, response:', response.data);
      return response.data; 

      // All WebSocket related logic below is removed.
      /*
      if (response.status !== 202 || !response.data.task_id) { ... }
      const taskId = response.data.task_id;
      ...
      ws = new WebSocket(wsUrl);
      ...
      ws.onopen = () => { ... };
      ws.onmessage = (event) => { ... };
      ws.onerror = (errorEvent) => { ... };
      ws.onclose = (event) => { ... };
      */

    } catch (error) { 
      console.error('[POST] Error in createCourse (initial POST):', error);
      // Let the calling component handle the error based on the thrown error object
      throw error; 
      /*
      if (typeof onError === 'function') { ... }
      if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
        ws.close();
      }
      */
    }
  },

  // Upload a document and get document ID
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiWithCookies.post('/files/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data; // Contains document ID and other info
    } catch (error) {
      throw error;
    }
  },

  // Upload an image and get image ID
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiWithCookies.post('/files/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data; // Contains image ID and other info
    } catch (error) {
      throw error;
    }
  },

  // Mark a chapter as complete
  markChapterComplete: async (courseId, chapterId) => {
    try {
      // Use the actual chapter ID, not index
      const response = await apiWithCookies.patch(`/courses/${courseId}/chapters/${chapterId}/complete`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default courseService;