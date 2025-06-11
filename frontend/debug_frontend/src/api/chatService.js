import { apiWithCookies } from './baseApi';

export const chatService = {
  // Send a message to the AI assistant and get streaming response
  sendMessage: async (courseId, chapterId, message, onProgress) => {
    try {
      let lastProcessedLength = 0;
      console.log('[ChatStreaming] Initializing chat message');
      
      // Payload for the chat request
      const data = {
        course_id: courseId,
        chapter_id: chapterId,
        message: message
      };
      
      await apiWithCookies.post('/chat/message', data, {
        responseType: 'text',
        timeout: 60000, // 1 minute timeout
        onDownloadProgress: (progressEvent) => {
          console.log('[ChatStreaming] onDownloadProgress triggered');
          
          let responseText = null;
          
          // Try to access the response text from different possible locations
          if (progressEvent.event && progressEvent.event.target && typeof progressEvent.event.target.responseText === 'string') {
            responseText = progressEvent.event.target.responseText;
          } else if (progressEvent.target && typeof progressEvent.target.responseText === 'string') {
            responseText = progressEvent.target.responseText;
          } else if (typeof progressEvent.responseText === 'string') { 
            responseText = progressEvent.responseText;
          }
          
          if (responseText && typeof onProgress === 'function') {
            const newData = responseText.substring(lastProcessedLength);
            
            if (newData.length > 0) {
              const lines = newData.split('\\n').filter(line => line.trim() !== '');
              
              lines.forEach(line => {
                const trimmedLine = line.trim();
                try {
                  const parsedData = JSON.parse(trimmedLine);
                  if (typeof onProgress === 'function') {
                    onProgress(parsedData);
                  }
                } catch (e) {
                  console.error('[ChatStreaming] Error parsing JSON from line:', e);
                  if (typeof onProgress === 'function') {
                    onProgress({
                      type: 'error',
                      data: {
                        message: `Error parsing streaming data` 
                      }
                    });
                  }
                }
              });
              
              lastProcessedLength = responseText.length;
            }
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('[ChatStreaming] Chat error:', error);
      
      let errorMessage = 'Chat request failed';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
  
  // Get chat history for a specific chapter
  getChatHistory: async (courseId, chapterId) => {
    try {
      const response = await apiWithCookies.get(`/chat/history/${courseId}/${chapterId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default chatService;
