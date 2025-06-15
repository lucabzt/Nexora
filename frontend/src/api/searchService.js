import { apiWithCookies } from './baseApi';

/**
 * @typedef {Object} SearchResult
 * @property {string} id - The unique identifier of the result
 * @property {'course'|'chapter'} type - The type of the result (course or chapter)
 * @property {string} title - The title of the course or chapter
 * @property {string} [course_id] - Required for chapter type, the ID of the parent course
 * @property {string} [course_title] - Optional, the title of the parent course (for chapters)
 * @property {string} [summary] - Optional, a summary or description
 */

/**
 * Search for courses and chapters with the given query
 * @param {string} query - The search query string (minimum 2 characters)
 * @returns {Promise<SearchResult[]>} A promise that resolves to an array of search results
 * @throws {Error} If there's a network error or server error (except 400 Bad Request)
 * @example
 * const results = await searchCoursesAndChapters('math');
 * results.forEach(result => {
 *   console.log(`${result.type}: ${result.title}`);
 * });
 */
export const searchCoursesAndChapters = async (query) => {
  const trimmedQuery = query?.trim() || '';
  
  // Validate input
  if (trimmedQuery.length < 2) {
    console.debug('Search query too short, returning empty results');
    return [];
  }
  
  try {
    console.debug(`Searching for: "${trimmedQuery}"`);
    const response = await apiWithCookies.get('/search/', {
      params: { 
        query: trimmedQuery,
        // Add cache buster to prevent caching of search results
        _: Date.now()
      },
      // Add timeout to prevent hanging requests
      timeout: 10000,
      // send cookies
      withCredentials: true,
      // Don't retry failed requests automatically
      'axios-retry': {
        retries: 1,
        retryDelay: 500
      }
    });
    
    // Validate response format
    if (!Array.isArray(response?.data)) {
      console.warn('Invalid search response format:', response?.data);
      return [];
    }
    
    // Filter out any invalid results
    const validResults = response.data.filter(result => 
      result && 
      typeof result === 'object' &&
      result.id && 
      result.type && 
      result.title &&
      (result.type === 'course' || (result.type === 'chapter' && result.course_id))
    );
    
    console.debug(`Found ${validResults.length} valid search results`);
    return validResults;
    
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with a status code outside 2xx
      if (error.response.status === 400) {
        console.debug('Bad request, likely due to invalid query');
        return [];
      }
      console.error(`Search failed with status ${error.response.status}:`, error.response.data);
      throw new Error(`Search failed: ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server:', error.request);
      throw new Error('Search service is not responding. Please check your connection.');
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      console.error('Search request timed out');
      throw new Error('Search request timed out. Please try again.');
    } else {
      // Something else went wrong
      console.error('Search error:', error.message);
      throw new Error(`Search failed: ${error.message}`);
    }
  }
};

/**
 * Get the URL to navigate to for a search result
 * @param {SearchResult} result - The search result object
 * @returns {string} The URL path to navigate to the result
 * @example
 * const url = getResultUrl({ type: 'course', id: '123' });
 * // Returns: "/courses/123"
 */
export const getResultUrl = (result) => {
  if (!result?.type || !result.id) {
    console.warn('Invalid search result:', result);
    return '#';
  }
  
  try {
    if (result.type === 'course') {
      return `/dashboard/courses/${encodeURIComponent(result.id)}`;
    } 
    
    if (result.type === 'chapter' && result.course_id) {
      return `/dashboard/courses/${encodeURIComponent(result.course_id)}/chapters/${encodeURIComponent(result.id)}`;
    }
    
    console.warn('Unknown result type or missing required fields:', result);
    return '#';
  } catch (error) {
    console.error('Error generating result URL:', error);
    return '#';
  }
};

// For backward compatibility
export default {
  searchCoursesAndChapters,
  getResultUrl,
};
