import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Custom hook for WebSocket connection
 * @param {string} searchId - Search ID to subscribe to
 * @param {function} onPriceUpdate - Callback when price update is received
 */
export const useWebSocket = (searchId, onPriceUpdate) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!searchId) {
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);

      // Subscribe to search updates
      socket.emit('subscribe_search', {
        searchId,
        type: 'flights', // This will be dynamic based on search type
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Subscription confirmation
    socket.on('subscribed', (data) => {
      console.log('📌 Subscribed to search:', data);
    });

    // Price update event
    socket.on('price_update', (data) => {
      console.log('💰 Price update received:', data);
      setLastUpdate(new Date().toISOString());
      if (onPriceUpdate) {
        onPriceUpdate(data);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socket && socket.connected) {
        socket.emit('unsubscribe_search', { searchId });
        socket.disconnect();
      }
    };
  }, [searchId, onPriceUpdate]);

  // Function to manually subscribe to a search
  const subscribe = (searchId, type) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('subscribe_search', { searchId, type });
    }
  };

  // Function to manually unsubscribe from a search
  const unsubscribe = (searchId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('unsubscribe_search', { searchId });
    }
  };

  return {
    isConnected,
    lastUpdate,
    subscribe,
    unsubscribe,
  };
};

