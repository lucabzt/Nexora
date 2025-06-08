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

  createCourse: async (data, onProgress, onError, onComplete) => {
    let ws; // WebSocket instance

    try {
      console.log('[WebSocket] Initiating createCourse POST request');
      // Step 1: Make the initial POST request to get the task_id
      const response = await apiWithCookies.post('/courses/create', data);

      if (response.status !== 202 || !response.data.task_id) {
        console.error('[WebSocket] Failed to initiate course creation task.', response);
        if (typeof onError === 'function') {
          onError({ message: 'Failed to start course creation process.', details: response.data });
        }
        return; // Exit if task_id is not received
      }

      const taskId = response.data.task_id;
      console.log(`[WebSocket] Task ID received: ${taskId}. Connecting to WebSocket.`);

      // Step 2: Construct WebSocket URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let wsHost = window.location.host; // Default to current host
      if (apiWithCookies.defaults.baseURL) {
          try {
            // Ensure baseURL is absolute or correctly relative for URL constructor
            const base = apiWithCookies.defaults.baseURL.startsWith('/') ? window.location.origin : undefined;
            const apiUrl = new URL(apiWithCookies.defaults.baseURL, base);
            wsHost = apiUrl.host;
          } catch (e) {
            console.warn('[WebSocket] Could not parse baseURL for WebSocket host, defaulting to window.location.host. baseURL:', apiWithCookies.defaults.baseURL, e);
          }
      }
      
      const wsUrl = `${wsProtocol}//${wsHost}/api/courses/ws/course_progress/${taskId}`;
      console.log(`[WebSocket] Connecting to: ${wsUrl}`);
      
      // Step 3: Establish WebSocket connection
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[WebSocket] Connection opened for task_id: ${taskId}`);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message);

          switch (message.type) {
            case 'course_info':
            case 'chapter':
              if (typeof onProgress === 'function') {
                onProgress(message); // Pass the whole message (includes type and data)
              }
              break;
            case 'complete':
              if (typeof onComplete === 'function') {
                onComplete(message.data);
              }
              console.log('[WebSocket] Course creation complete. Closing WebSocket.');
              ws.close(1000, "Course creation complete");
              break;
            case 'error':
              console.error('[WebSocket] Error message from server:', message.data);
              if (typeof onError === 'function') {
                onError(message.data);
              }
              ws.close(1000, "Error received from server");
              break;
            default:
              console.warn('[WebSocket] Received unknown message type:', message.type, message);
          }
        } catch (e) {
          console.error('[WebSocket] Error parsing message from server:', event.data, e);
          if (typeof onError === 'function') {
            onError({ message: 'Error processing message from server.', details: e.toString(), rawData: event.data });
          }
        }
      };

      ws.onerror = (errorEvent) => {
        console.error('[WebSocket] Connection error:', errorEvent);
        if (typeof onError === 'function') {
          onError({ message: 'WebSocket connection error. The connection attempt failed or was dropped.' });
        }
        if (ws && ws.readyState !== WebSocket.CLOSED) {
            ws.close();
        }
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Connection closed for task_id: ${taskId}. Code: ${event.code}, Reason: ${event.reason}, Was Clean: ${event.wasClean}`);
        // Avoid duplicate error calls if 'complete' or 'error' types already handled closure.
        if (event.reason !== "Course creation complete" && event.reason !== "Error received from server") {
            if (!event.wasClean || event.code !== 1000) { // 1000 is normal closure
                if (typeof onError === 'function') {
                    onError({ message: `WebSocket connection closed unexpectedly. Code: ${event.code}, Reason: '${event.reason || 'No reason provided'}'` });
                }
            }
        }
      };

    } catch (error) { // This catch block is for the initial POST request or WebSocket constructor errors
      console.error('[WebSocket] Error in createCourse (initial POST or WebSocket setup):', error);
      if (typeof onError === 'function') {
        let errorMessage = 'Course creation failed during setup.';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        onError({ message: errorMessage, details: error });
      }
      if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
        ws.close();
      }
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