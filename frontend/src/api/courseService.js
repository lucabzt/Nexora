import { apiWithCookies } from './baseApi';

// Debounce helper function
const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export const courseService = {
  // Get all courses for current user
  getPublicCourses: async () => {
    const response = await apiWithCookies.get('/courses/public');
    return response.data;
  },

  updateCoursePublicStatus: async (courseId, isPublic) => {
    const response = await apiWithCookies.patch(`/courses/${courseId}/public`, { is_public: isPublic });
    return response.data;
  },

  // Get all courses for current user
  getUserCourses: async () => {
    const response = await apiWithCookies.get('/courses/');
    console.log('getUserCourses response:', response.data);
    return response.data;
  },

  // Get a course by ID
  getCourseById: async (courseId) =>
    (await apiWithCookies.get(`/courses/${courseId}`)).data,

  // Get all courses with pagination
  getCourseChapters: async (courseId) => {
    const chapters = (await apiWithCookies.get(`/courses/${courseId}/chapters`)).data;
    if (!chapters || chapters.length === 0) return [];
    
    // Sort chapters by index to ensure correct order
    const sortedChapters = chapters.sort((a, b) => a.index - b.index);
    
    // Find the first missing index and remove everything from that point onwards
    const result = [];
    let expectedIndex = 1;
    
    for (const chapter of sortedChapters) {
      if (chapter.index === expectedIndex) {
        result.push(chapter);
        expectedIndex++;
      } else {
        // Found a gap, stop here
        break;
      }
    }
    
    return result;
  },

  // Get a specific chapter by ID
  getChapter: async (courseId, chapterId) =>
    (await apiWithCookies.get(`/courses/${courseId}/chapters/${chapterId}`)).data,

  // Get questions for a specific chapter with full QuestionResponse data
  getChapterQuestions: async (courseId, chapterId) =>
    (await apiWithCookies.get(`/chapters/${courseId}/chapters/${chapterId}`)).data,

  // save mc answer
  saveMCAnswer: async (courseId, chapterId, questionId, usersAnswer) => {
    const params = new URLSearchParams();
    params.append('users_answer', usersAnswer);
    return (await apiWithCookies.get(
      `/chapters/${courseId}/chapters/${chapterId}/${questionId}/save?${params.toString()}`
    )).data;
  },

  // Get feedback for an open text question
  getQuestionFeedback: async (courseId, chapterId, questionId, userAnswer) => {
    return (await apiWithCookies.get(
      `/chapters/${courseId}/chapters/${chapterId}/${questionId}/feedback?users_answer=${encodeURIComponent(userAnswer)}`
    )).data;
  },

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

  // Delete a document by ID
  deleteDocument: async (fileId) => {
    await apiWithCookies.delete(`/files/documents/${fileId}`);
  },

  // Delete an image by ID
  deleteImage: async (imageId) => {
    await apiWithCookies.delete(`/files/images/${imageId}`);
  },

};

export default courseService;