import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext'; // Adjusted path

/**
 * Custom hook to subscribe to WebSocket messages from NotificationContext.
 * @param {function(any): void} callback - The function to execute when a message is received.
 *                                        It will be called with the parsed message data.
 */
export const useWebSocketListener = (callback) => {
  const { addListener, isConnected } = useNotification(); // Get addListener and isConnected from context

  useEffect(() => {
    if (!callback || typeof callback !== 'function') {
      console.warn('useWebSocketListener: Callback is not a function or not provided.');
      return;
    }

    // Only add listener if WebSocket is connected or expected to connect
    // The NotificationContext handles the actual connection logic.
    // This hook just registers the interest in messages.
    const unsubscribe = addListener(callback);

    // Cleanup function to remove the listener when the component unmounts
    // or when the callback changes.
    return () => {
      unsubscribe();
    };
  }, [callback, addListener]); // Re-subscribe if the callback or addListener function changes

  // Optionally, you can return isConnected if components need to know the socket status directly
  // For example: return { isConnected };
  // However, typically components just care about messages, not the connection state itself here.
};

