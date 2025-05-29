import axios from 'axios';
import authService from './authService';

const API_URL = '/api';

// Create axios instance with error handling
const api = axios.create({
  baseURL: API_URL,
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

export const courseService = {
  // Get all courses for current user
  getUserCourses: async () => {
    try {
      const response = await api.get('/courses/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get chapters for a course
  getCourseChapters: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/chapters`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific chapter by ID
  getChapter: async (courseId, chapterId) => {
    try {
      // Use the actual chapter ID, not index
      const response = await api.get(`/courses/${courseId}/chapters/${chapterId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quizzes for a course
  getCourseQuizzes: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/quizzes`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a demo course (deprecated, use createCourse instead)
  createDemoCourse: async (data) => {
    try {
      const response = await api.post('/courses/new_demo', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a course with streaming response
  createCourse: async (data, onProgress) => {
    try {
      const response = await api.post('/courses/create', data, {
        responseType: 'text',
        onDownloadProgress: (progressEvent) => {
          const responseText = progressEvent.currentTarget.response;
          if (responseText && typeof onProgress === 'function') {
            // Split by newlines and parse each line as JSON
            const lines = responseText.split('\n').filter(line => line.trim());
            
            // Process only the last line to avoid duplicate processing
            if (lines.length > 0) {
              try {
                const lastLine = lines[lines.length - 1];
                const data = JSON.parse(lastLine);
                onProgress(data);
              } catch (e) {
                console.error('Error parsing streaming data:', e);
              }
            }
          }
        }
      });
      
      // The full response text contains all JSON objects
      const lines = response.data.split('\n').filter(line => line.trim());
      const parsedResponses = lines.map(line => JSON.parse(line));
      return parsedResponses;
    } catch (error) {
      throw error;
    }
  },

  // Upload a document and get document ID
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/files/documents', formData, {
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
      
      const response = await api.post('/files/images', formData, {
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
      const response = await api.patch(`/courses/${courseId}/chapters/${chapterId}/complete`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default courseService;