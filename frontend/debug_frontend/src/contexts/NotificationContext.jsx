import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext'; // Import AuthContext

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const reconnectIntervalRef = useRef(null); // For storing interval ID

  const { userState } = useContext(AuthContext);
  const isAuthenticated = !!userState; // User is authenticated if userState is not null

  const connectWebSocket = () => {
    if (!isAuthenticated || (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)) {
      // Don't connect if not authenticated or already connected
      if (!isAuthenticated) console.log('NotificationService: User not authenticated, WebSocket not connecting.');
      return;
    }

    // Construct WebSocket URL dynamically
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // e.g., localhost:3000 or your_domain.com
    const wsUrl = `${protocol}//${host}/api/notifications/ws`;
    
    console.log(`NotificationService: Attempting to connect to ${wsUrl}`);

    // Ensure previous socket is closed before creating a new one
    if (socketRef.current) {
        socketRef.current.close();
    }

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('NotificationService: WebSocket connected');
      setIsConnected(true);
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('NotificationService: Message received:', data);
        listenersRef.current.forEach((cb) => cb(data));
      } catch (error) {
        console.error('NotificationService: Error parsing message JSON:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('NotificationService: WebSocket error:', error);
      // Note: onclose will usually be called after onerror
    };

    ws.onclose = (event) => {
      console.log('NotificationService: WebSocket disconnected', event.reason, `Code: ${event.code}`);
      setIsConnected(false);
      socketRef.current = null;

      // Implement reconnection logic only if authenticated and not a deliberate close (e.g. 1000 or 1005)
      if (isAuthenticated && event.code !== 1000 && event.code !== 1005) {
        if (!reconnectIntervalRef.current) {
            console.log('NotificationService: Attempting to reconnect in 5 seconds...');
            reconnectIntervalRef.current = setTimeout(() => {
                connectWebSocket();
                reconnectIntervalRef.current = null; // Clear after attempting
            }, 5000);
        }
      }
    };
  };

  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
    } else {
      // If authentication status changes to false, close any existing WebSocket
      if (socketRef.current) {
        console.log('NotificationService: User logged out, closing WebSocket.');
        socketRef.current.close(1000, 'User logged out'); // 1000 is a normal closure
        socketRef.current = null;
        setIsConnected(false);
      }
      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
    }

    return () => {
      if (socketRef.current) {
        console.log('NotificationService: Provider unmounting, closing WebSocket.');
        socketRef.current.close(1000, 'Component unmounting');
        socketRef.current = null;
      }
      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current);
      }
    };
  // Effect now depends on 'isAuthenticated' which is derived from 'userState'
  }, [isAuthenticated]); // Re-run effect if authentication status changes

  const addListener = (callback) => {
    listenersRef.current.add(callback);
    return () => listenersRef.current.delete(callback); // Return an unsubscribe function
  };

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('NotificationService: WebSocket not connected. Cannot send message.');
    }
  };

  return (
    <NotificationContext.Provider value={{ addListener, sendMessage, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the NotificationContext
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
