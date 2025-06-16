import { apiWithCookies } from './baseApi';

export const chatService = {
  // Send a message to the AI assistant and get streaming response
  sendMessage: async (courseId, chapterId, message, onProgress) => {
    try {
      const response = await fetch(`${apiWithCookies.defaults.baseURL}/chat/${chapterId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...apiWithCookies.defaults.headers.common,
        },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to send message');
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
