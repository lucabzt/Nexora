import { apiWithCookies } from './baseApi';

export const chatService = {
  // Send a message to the AI assistant and get streaming response
  sendMessage: async (courseId, chapterId, message, onProgress) => {
    try {
      // Note: The backend expects the chapterId in the URL path
      const url = `/chat/${chapterId}`;
      
      // Create the request body matching the backend's ChatRequest model
      const requestBody = JSON.stringify({
        message: message  // The backend expects a 'message' field
      });
      
      // Log the request details
      console.log('Sending request to:', `${apiWithCookies.defaults.baseURL}${url}`);
      console.log('Request body:', requestBody);
      
      // Set up headers
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      };
      
      // Add authorization header if it exists
      if (apiWithCookies.defaults.headers.common?.Authorization) {
        headers['Authorization'] = apiWithCookies.defaults.headers.common.Authorization;
      }
      
      // Make the request using fetch
      const response = await fetch(`${apiWithCookies.defaults.baseURL}${url}`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: requestBody
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      if (!response.ok) {
        let errorData;
        let errorText;
        
        try {
          // Try to get the error response as text
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

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk of data
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete SSE messages
          const lines = buffer.split('\n');
          buffer = '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim(); // Remove 'data: ' prefix and trim
              
              if (data === '[DONE]') {
                if (onProgress) onProgress({ done: true });
                return;
              }
              
              if (data) {
                try {
                  const parsedData = JSON.parse(data);
                  if (onProgress) onProgress(parsedData);
                } catch (e) {
                  console.error('Error parsing SSE message:', e, data);
                  // If parsing fails, send the raw data as content
                  if (onProgress) onProgress({ content: data });
                }
              }
            } else if (line.trim() !== '') {
              // If it's not an empty line, keep it in the buffer for the next chunk
              buffer += line + '\n';
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        throw error;
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
