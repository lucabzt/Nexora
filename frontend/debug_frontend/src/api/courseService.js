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
  },  // Create a course with streaming response
  createCourse: async (data, onProgress) => {
    try {
      let lastProcessedLength = 0; // Track the length of the processed part of the stream
      console.log('[Streaming] Initializing createCourse call');
      
      await api.post('/courses/create', data, {
        responseType: 'text',
        timeout: 300000, // 5 minute timeout for course creation
        onDownloadProgress: (progressEvent) => {
          // --- Start Enhanced Debugging ---
          console.log('[Streaming] --- Debugging progressEvent Start ---');
          console.log('[Streaming] Raw progressEvent object:', progressEvent); 

          try {
            console.log('[Streaming] progressEvent keys:', Object.keys(progressEvent));
          } catch (e) {
            console.warn('[Streaming] Could not get Object.keys(progressEvent) - it might not be a plain object or might be null.', e);
          }
          console.log('[Streaming] progressEvent.loaded:', progressEvent.loaded);
          console.log('[Streaming] progressEvent.total:', progressEvent.total);
          console.log('[Streaming] progressEvent.lengthComputable:', progressEvent.lengthComputable);
          console.log('[Streaming] progressEvent.event type:', typeof progressEvent.event);
          if (progressEvent.event) {
            console.log('[Streaming] progressEvent.event object:', progressEvent.event);
            try {
              console.log('[Streaming] progressEvent.event keys:', Object.keys(progressEvent.event));
            } catch (e) {
              console.warn('[Streaming] Could not get Object.keys(progressEvent.event)', e);
            }
            console.log('[Streaming] progressEvent.event.target type:', typeof progressEvent.event.target);
            if (progressEvent.event.target) {
              console.log('[Streaming] progressEvent.event.target object:', progressEvent.event.target);
              try {
                console.log('[Streaming] progressEvent.event.target keys:', Object.keys(progressEvent.event.target));
              } catch(e) {
                console.warn('[Streaming] Could not get Object.keys(progressEvent.event.target)', e);
              }
              console.log('[Streaming] progressEvent.event.target.responseText type:', typeof progressEvent.event.target.responseText);
            } else {
              console.log('[Streaming] progressEvent.event.target is null or undefined.');
            }
          } else {
            console.log('[Streaming] progressEvent.event is null or undefined.');
          }


          console.log('[Streaming] --- Checking progressEvent.target (legacy) ---');
          console.log('[Streaming] typeof progressEvent.target:', typeof progressEvent.target);
          if (progressEvent.target) {
            console.log('[Streaming] progressEvent.target object:', progressEvent.target);
            try {
              console.log('[Streaming] progressEvent.target keys:', Object.keys(progressEvent.target));
            } catch (e) {
              console.warn('[Streaming] Could not get Object.keys(progressEvent.target)', e);
            }
            console.log('[Streaming] progressEvent.target.responseText type:', typeof progressEvent.target.responseText);
            console.log('[Streaming] progressEvent.target.status:', progressEvent.target.status);
            console.log('[Streaming] progressEvent.target.readyState:', progressEvent.target.readyState);
          } else {
            console.log('[Streaming] progressEvent.target is null or undefined.');
          }

          console.log('[Streaming] --- Checking progressEvent.currentTarget (legacy) ---');
          console.log('[Streaming] typeof progressEvent.currentTarget:', typeof progressEvent.currentTarget);
          if (progressEvent.currentTarget) {
            console.log('[Streaming] progressEvent.currentTarget object:', progressEvent.currentTarget);
            try {
              console.log('[Streaming] progressEvent.currentTarget keys:', Object.keys(progressEvent.currentTarget));
            } catch (e) {
              console.warn('[Streaming] Could not get Object.keys(progressEvent.currentTarget)', e);
            }
          } else {
            console.log('[Streaming] progressEvent.currentTarget is null or undefined.');
          }
          // --- End Enhanced Debugging ---

          console.log('[Streaming] onDownloadProgress triggered (event details logged above).');
          
          let responseText = null;
          console.log('[Streaming] Attempting to access responseText...');

          if (progressEvent.event && progressEvent.event.target && typeof progressEvent.event.target.responseText === 'string') {
            responseText = progressEvent.event.target.responseText;
            console.log('[Streaming] Accessed responseText from progressEvent.event.target.responseText. Length:', responseText.length);
          } else if (progressEvent.target && typeof progressEvent.target.responseText === 'string') {
            responseText = progressEvent.target.responseText;
            console.warn('[Streaming] Accessed responseText from progressEvent.target.responseText (legacy). Length:', responseText.length);
          } else if (typeof progressEvent.responseText === 'string') { 
            responseText = progressEvent.responseText;
            console.warn('[Streaming] Accessed responseText directly from progressEvent.responseText (fallback). Length:', responseText.length);
          } else {
            console.warn('[Streaming] Could not find responseText. Detailed progressEvent logged above.');
            console.log('[Streaming] progressEvent.event:', progressEvent.event);
            if(progressEvent.event) console.log('[Streaming] progressEvent.event.target:', progressEvent.event.target);
            if(progressEvent.event && progressEvent.event.target) console.log('[Streaming] progressEvent.event.target.responseText:', progressEvent.event.target.responseText);
          }
          
          console.log('[Streaming] Current full responseText (first 200 chars):', responseText ? responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '') : 'null or not a string');

          if (responseText && typeof onProgress === 'function') {
            console.log('[Streaming] Processing responseText. lastProcessedLength:', lastProcessedLength);
            const newData = responseText.substring(lastProcessedLength);
            console.log('[Streaming] newData chunk (first 200 chars):', newData.substring(0, 200) + (newData.length > 200 ? '...' : ''));
            
            if (newData.length === 0) {
              console.log('[Streaming] No new data in this chunk. Skipping further processing for this event.');
            } else {
              console.log('[Streaming] Splitting newData by actual newline character \'\\n\'');
              const lines = newData.split('\\n').filter(line => line.trim());
              console.log('[Streaming] Number of new lines found:', lines.length, 'Lines (first 3):', lines.slice(0,3).map(l => l.substring(0,100) + (l.length > 100 ? '...' : '')));
              
              let processedAnyLine = false;
              lines.forEach((line, index) => { 
                console.log(`[Streaming] Attempting to process line ${index}: "${line.substring(0,100) + (line.length > 100 ? '...' : '')}"`);
                if (line.trim() === '') {
                  console.log(`[Streaming] Line ${index} is empty or whitespace. Skipping.`);
                  return;
                }
                try {
                  const parsedData = JSON.parse(line);
                  console.log(`[Streaming] Successfully parsed JSON for line ${index}:`, parsedData);
                  if (typeof onProgress === 'function') {
                    onProgress(parsedData);
                    console.log(`[Streaming] onProgress callback executed for line ${index}.`);
                    processedAnyLine = true;
                  } else {
                    console.warn(`[Streaming] onProgress is not a function. Cannot process parsed data for line ${index}.`);
                  }
                } catch (e) {
                  console.error('[Streaming] Error parsing JSON from line:', e, 'Problematic Line:', line);
                  if (typeof onProgress === 'function') {
                    onProgress({
                      type: 'error',
                      data: {
                        message: `Error parsing streaming data for line: ${line.substring(0,100)}...` 
                      }
                    });
                    console.warn(`[Streaming] onProgress callback executed with error for line ${index}.`);
                  }
                }
              });

              if (processedAnyLine || responseText.length > lastProcessedLength) {
                 // Update lastProcessedLength only if we actually processed new data or if the total length increased,
                 // to handle cases where the last chunk might not have a newline yet.
                lastProcessedLength = responseText.length; 
                console.log('[Streaming] Updated lastProcessedLength to:', lastProcessedLength);
              } else {
                console.log('[Streaming] lastProcessedLength remains unchanged:', lastProcessedLength, 'responseText length:', responseText.length);
              }
            }
          } else {
            console.log('[Streaming] Skipping processing: responseText is invalid or onProgress is not a function.');
            if (!responseText) console.log('[Streaming] Reason: responseText is null, empty, or not a string.');
            if (typeof onProgress !== 'function') console.log('[Streaming] Reason: onProgress is not a function (current type: ' + typeof onProgress + ').');
          }
          console.log('[Streaming] --- Debugging progressEvent End ---');
        }
      });
      
      console.log('[Streaming] api.post call finished');
      return true; // Success indicator
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