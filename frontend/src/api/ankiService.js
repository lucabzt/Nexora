// /frontend/src/api/ankiService.js

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

    // Extract meaningful error message
    let errorMessage = 'An unexpected error occurred';
    if (error.response) {
      if (error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.statusText) {
        errorMessage = error.response.statusText;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Anki Service API Error:', error.response || error);

    // Create a new error with our custom message
    const customError = new Error(errorMessage);
    customError.originalError = error;
    return Promise.reject(customError);
  }
);

export const ankiService = {
  /**
   * Upload a PDF document for processing
   * @param {File} file - The PDF file to upload
   * @returns {Promise<Object>} Document information with ID
   */
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/anki/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate a summary and analysis of the uploaded PDF
   * @param {Object} config - Configuration for analysis
   * @returns {Promise<Object>} Analysis summary
   */
  generateSummary: async (config) => {
    try {
      const response = await api.post('/anki/analyze', {
        document_id: config.document_id,
        type: config.type,
        title: config.title,
        description: config.description,
        difficulty: config.difficulty,
        chapter_mode: config.chapter_mode,
        slides_per_chapter: config.slides_per_chapter,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Start the Anki deck generation process
   * @param {Object} config - Configuration for deck generation
   * @returns {Promise<Object>} Task information with task_id
   */
  generateAnkiDeck: async (config) => {
    try {
      const response = await api.post('/anki/generate', {
        document_id: config.document_id,
        type: config.type,
        title: config.title,
        description: config.description,
        difficulty: config.difficulty,
        chapter_mode: config.chapter_mode,
        slides_per_chapter: config.slides_per_chapter,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get the status of an Anki generation task
   * @param {string} taskId - The task ID
   * @returns {Promise<Object>} Task status and progress
   */
  getTaskStatus: async (taskId) => {
    try {
      const response = await api.get(`/anki/tasks/${taskId}/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download the generated Anki deck file
   * @param {string} taskId - The task ID
   * @returns {Promise<Blob>} The .apkg file blob
   */
  downloadAnkiDeck: async (taskId) => {
    try {
      const response = await api.get(`/anki/tasks/${taskId}/download`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get the download URL for an Anki deck
   * @param {string} taskId - The task ID
   * @returns {string} Download URL
   */
  getDownloadUrl: (taskId) => {
    const headers = authService.getAuthHeader();
    const authParam = headers.Authorization ? `?token=${headers.Authorization.replace('Bearer ', '')}` : '';
    return `${API_URL}/anki/tasks/${taskId}/download${authParam}`;
  },

  /**
   * Get user's processing history
   * @param {number} limit - Number of recent tasks to fetch
   * @returns {Promise<Array>} Array of processing tasks
   */
  getProcessingHistory: async (limit = 10) => {
    try {
      const response = await api.get(`/anki/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a processing task and its files
   * @param {string} taskId - The task ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/anki/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel a running processing task
   * @param {string} taskId - The task ID to cancel
   * @returns {Promise<Object>} Cancellation confirmation
   */
  cancelTask: async (taskId) => {
    try {
      const response = await api.post(`/anki/tasks/${taskId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get detailed information about a completed task
   * @param {string} taskId - The task ID
   * @returns {Promise<Object>} Task details including statistics
   */
  getTaskDetails: async (taskId) => {
    try {
      const response = await api.get(`/anki/tasks/${taskId}/details`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retry a failed task
   * @param {string} taskId - The task ID to retry
   * @returns {Promise<Object>} New task information
   */
  retryTask: async (taskId) => {
    try {
      const response = await api.post(`/anki/tasks/${taskId}/retry`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get supported file types and limits
   * @returns {Promise<Object>} File upload configuration
   */
  getUploadConfig: async () => {
    try {
      const response = await api.get('/anki/config');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Validate PDF before upload
   * @param {File} file - The file to validate
   * @returns {Promise<Object>} Validation result
   */
  validatePDF: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/anki/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get processing statistics for the user
   * @returns {Promise<Object>} User processing statistics
   */
  getUserStats: async () => {
    try {
      const response = await api.get('/anki/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default ankiService;