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

  // Create a course with streaming response
  createCourse: async (data, onProgress) => {
    try {
      let lastProcessedLength = 0; // Track the length of the raw responseText processed
      let lineBuffer = ""; // Buffer for accumulating parts of lines across progress events
      console.log('[Streaming] Initializing createCourse call');
      
      await apiWithCookies.post('/courses/create', data, {
        responseType: 'text',
        timeout: 1800000, // 30 minute timeout for course creation
        onDownloadProgress: (progressEvent) => {
          // console.log('[Streaming] onDownloadProgress triggered.');
          
          let currentResponseText = "";
          if (progressEvent.event && progressEvent.event.target && typeof progressEvent.event.target.responseText === 'string') {
            currentResponseText = progressEvent.event.target.responseText;
          } else if (progressEvent.target && typeof progressEvent.target.responseText === 'string') {
            currentResponseText = progressEvent.target.responseText; // Legacy path
          } else if (typeof progressEvent.responseText === 'string') {
            currentResponseText = progressEvent.responseText; // Fallback
          } else {
            console.warn('[Streaming] Could not find responseText in progressEvent.');
            return; // Cannot process if no text
          }

          // Get only the new part of the stream text
          const newTextChunk = currentResponseText.substring(lastProcessedLength);
          lineBuffer += newTextChunk;
          lastProcessedLength = currentResponseText.length; // Update for the next event

          let newlinePos;
          // Process all complete lines from the buffer
          while ((newlinePos = lineBuffer.indexOf('\n')) !== -1) {
            const lineToProcess = lineBuffer.substring(0, newlinePos);
            lineBuffer = lineBuffer.substring(newlinePos + 1); // Keep the remainder in buffer

            const trimmedLine = lineToProcess.trim();
            if (trimmedLine === "") {
              // console.log('[Streaming] Skipping empty line.');
              continue;
            }

            // console.log(`[Streaming] Attempting to process line: "${trimmedLine.substring(0, 150)}${trimmedLine.length > 150 ? '...' : ''}"`);
            try {
              const parsedData = JSON.parse(trimmedLine);
              // console.log('[Streaming] Successfully parsed JSON:', parsedData);
              if (typeof onProgress === 'function') {
                onProgress(parsedData); // Call as before, assuming onProgress expects the direct JSON object
              }
            } catch (e) {
              console.error(`[Streaming] Error parsing JSON from line: "${trimmedLine.substring(0,150)}${trimmedLine.length > 150 ? '...' : ''}"`, e);
              if (typeof onProgress === 'function') {
                onProgress({
                  type: 'error',
                  data: {
                    message: `Error parsing streaming data. Line content (first 100 chars): "${trimmedLine.substring(0, 100)}${trimmedLine.length > 100 ? '...' : ''}"`, 
                    originalLine: trimmedLine, // Provide the problematic line
                    errorDetails: e.toString()
                  }
                });
              }
            }
          }
          // After the loop, lineBuffer contains any trailing part of a line (if no newline at the end of the current chunk).
          // This will be prepended to the new data in the next onDownloadProgress event.
        }
      });
      
      // After the stream is fully downloaded (Axios promise resolved),
      // check if there's any remaining data in lineBuffer.
      // This handles cases where the last JSON object in the stream might not be followed by a newline.
      if (lineBuffer.trim() !== "") {
        const trimmedFinalBuffer = lineBuffer.trim();
        console.log('[Streaming] Processing remaining data in buffer after stream completion:', trimmedFinalBuffer.substring(0,150));
        try {
          const parsedData = JSON.parse(trimmedFinalBuffer);
          if (typeof onProgress === 'function') {
            onProgress(parsedData);
          }
        } catch (e) {
          console.error(`[Streaming] Error parsing remaining JSON from buffer: "${trimmedFinalBuffer.substring(0,150)}${trimmedFinalBuffer.length > 150 ? '...' : ''}"`, e);
          if (typeof onProgress === 'function') {
            onProgress({
              type: 'error',
              data: {
                message: `Error parsing final streaming data. Buffer content (first 100 chars): "${trimmedFinalBuffer.substring(0, 100)}${trimmedFinalBuffer.length > 100 ? '...' : ''}"`, 
                originalLine: trimmedFinalBuffer,
                errorDetails: e.toString()
              }
            });
          }
        }
        lineBuffer = ""; // Clear buffer
      }

      console.log('[Streaming] createCourse call finished successfully.');
      return true; // Success indicator, or perhaps some final status from the stream if applicable
    } catch (error) {
      console.error('[Streaming] Course creation error:', error);
      console.error('[Streaming] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack
      });
      
      // Handle different types of errors
      let errorMessage = 'Course creation failed';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Course creation timed out. Please try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle streaming errors
      if (typeof onProgress === 'function') {
        onProgress({
          type: 'error',
          data: {
            message: errorMessage
          }
        });
      }
      throw error;
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