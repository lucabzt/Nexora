// /frontend/src/api/ankiService.js

import { apiWithCookies } from './baseApi';

export const ankiService = {
  /**
   * Upload a PDF document for processing
   * @param {File} file - The PDF file to upload
   * @returns {Promise<Object>} Document information with ID
   */
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiWithCookies.post('/anki/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Generate a summary and analysis of the uploaded PDF
   * @param {Object} config - Configuration for analysis
   * @returns {Promise<Object>} Analysis summary
   */
  generateSummary: async (config) =>
    (await apiWithCookies.post('/anki/analyze', {
      document_id: config.document_id,
      config: {
        type: config.type,
        title: config.title,
        difficulty: config.difficulty,
        chapter_mode: config.chapter_mode,
        slides_per_chapter: config.slides_per_chapter,
      }
    })).data,

  /**
   * Start the Anki deck generation process
   * @param {Object} config - Configuration for deck generation
   * @returns {Promise<Object>} Task information with task_id
   */
  generateAnkiDeck: async (config) =>
    (await apiWithCookies.post('/anki/generate', {
      document_id: config.document_id,
      config: {
        type: config.type,
        title: config.title,
        difficulty: config.difficulty,
        chapter_mode: config.chapter_mode,
        slides_per_chapter: config.slides_per_chapter,
      }
    })).data,

  /**
   * Get the status of an Anki generation task
   * @param {string} taskId - The task ID
   * @returns {Promise<Object>} Task status and progress with enhanced tracking
   * @returns {Object} response.task_id - Task identifier
   * @returns {string} response.status - Current task status
   * @returns {number} response.progress_percentage - Overall progress (0-100)
   * @returns {string} response.current_step - Current processing step
   * @returns {Array} response.completed_steps - List of completed steps
   * @returns {string} response.error_message - Error message if failed
   * @returns {string} response.download_url - Download URL if completed
   * @returns {Object} response.step_details - Detailed step information (chunks, questions, etc.)
   * @returns {Array} response.activity_log - Processing activity log with timestamps
   * @returns {Object} response.stats - Processing statistics
   * @returns {string} response.estimated_time_remaining - Estimated completion time
   */
  getTaskStatus: async (taskId) =>
    (await apiWithCookies.get(`/anki/tasks/${taskId}/status`)).data,

  /**
   * Download the generated Anki deck file
   * @param {string} taskId - The task ID
   * @returns {Promise<Blob>} The .apkg file blob
   */
  downloadAnkiDeck: async (taskId) => {
    const response = await apiWithCookies.get(`/anki/tasks/${taskId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get user's processing history
   * @param {number} limit - Number of recent tasks to fetch
   * @returns {Promise<Array>} Array of processing tasks
   */
  getProcessingHistory: async (limit = 10) =>
    (await apiWithCookies.get(`/anki/history?limit=${limit}`)).data,

  /**
   * Delete a processing task and its files
   * @param {string} taskId - The task ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteTask: async (taskId) => {
    const response = await apiWithCookies.delete(`/anki/tasks/${taskId}`);
    // Handle 204 No Content or other success statuses
    if (response.status === 204) {
      return { message: 'Task deleted successfully' };
    }
    return response.data;
  },

  /**
   * Cancel a running processing task
   * @param {string} taskId - The task ID to cancel
   * @returns {Promise<Object>} Cancellation confirmation
   */
  cancelTask: async (taskId) =>
    (await apiWithCookies.post(`/anki/tasks/${taskId}/cancel`)).data,

  /**
   * Get detailed information about a completed task
   * @param {string} taskId - The task ID
   * @returns {Promise<Object>} Task details including statistics
   */
  getTaskDetails: async (taskId) =>
    (await apiWithCookies.get(`/anki/tasks/${taskId}/details`)).data,

  /**
   * Retry a failed task
   * @param {string} taskId - The task ID to retry
   * @returns {Promise<Object>} New task information
   */
  retryTask: async (taskId) =>
    (await apiWithCookies.post(`/anki/tasks/${taskId}/retry`)).data,

  /**
   * Get supported file types and limits
   * @returns {Promise<Object>} File upload configuration
   */
  getUploadConfig: async () =>
    (await apiWithCookies.get('/anki/config')).data,

  /**
   * Validate PDF before upload
   * @param {File} file - The file to validate
   * @returns {Promise<Object>} Validation result
   */
  validatePDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiWithCookies.post('/anki/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get processing statistics for the user
   * @returns {Promise<Object>} User processing statistics
   */
  getUserStats: async () =>
    (await apiWithCookies.get('/anki/stats')).data,
};

export default ankiService;