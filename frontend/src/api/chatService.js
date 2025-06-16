import { apiWithCookies } from './baseApi';

export const chatService = {
  // Send a message to the AI assistant and get streaming response
  sendMessage: async (courseId, chapterId, message, onProgress) => {
    try {
      // Note: The backend expects the chapterId in the URL path
      const url = `/chat/${chapterId}`;
      
      // Create the request body
      const requestBody = { message };
      
      // Log the request details
      console.log('Sending request to:', `${apiWithCookies.defaults.baseURL}${url}`);
      console.log('Request body:', requestBody);
      
      // Make the request using the axios instance with credentials
      const response = await apiWithCookies.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (!response.ok) {
        let errorData;
        let errorText;
        try {
          // First try to get the response as text
          errorText = await response.text();
          console.log('Raw error response:', errorText);
          
          // Try to parse as JSON
          try {
            errorData = JSON.parse(errorText);
            console.error('Chat API error response (parsed):', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
          } catch (parseError) {
            console.error('Chat API error (non-JSON response):', {
              status: response.status,
              statusText: response.statusText,
              responseText: errorText
            });
            errorData = { detail: errorText };
          }
        } catch (e) {
          console.error('Error processing error response:', e);
          errorData = { detail: 'Failed to process error response' };
        }
        
        // Create a more detailed error message
        const errorMessage = errorData.detail || 
                             (errorData.error && errorData.error.message) || 
                             `HTTP error! status: ${response.status}`;
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        error.rawResponse = errorText;
        console.error('Throwing error:', error);
        throw error;
      }

      if (!response.body) {
        throw new Error('Response body is not readable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk of data
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete SSE messages
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n\n')) !== -1) {
          const message = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 2);

          if (message.startsWith('data: ')) {
            const data = message.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              if (onProgress) onProgress({ done: true });
              return;
            }

            try {
              const parsedData = JSON.parse(data);
              if (onProgress) onProgress(parsedData);
            } catch (e) {
              console.error('Error parsing SSE message:', e, data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  },
  
  // Get chat history for a specific chapter
  getChatHistory: async (courseId, chapterId) => {
    try {
      const response = await apiWithCookies.get(`/chat/history/${courseId}/${chapterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }
};

export default chatService;
