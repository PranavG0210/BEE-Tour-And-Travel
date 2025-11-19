const { Server } = require('socket.io');

let io = null;

/**
 * Initialize WebSocket server
 */
const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle search subscription
    socket.on('subscribe_search', (data) => {
      const { searchId, type, params } = data;
      console.log(`📌 Client ${socket.id} subscribed to search: ${searchId}`);
      
      // Join room for this search
      socket.join(`search:${searchId}`);
      
      socket.emit('subscribed', {
        searchId,
        message: `Subscribed to search ${searchId}`,
      });
    });

    // Handle search unsubscription
    socket.on('unsubscribe_search', (data) => {
      const { searchId } = data;
      console.log(`📌 Client ${socket.id} unsubscribed from search: ${searchId}`);
      
      socket.leave(`search:${searchId}`);
      
      socket.emit('unsubscribed', {
        searchId,
        message: `Unsubscribed from search ${searchId}`,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket server initialized');
  return io;
};

/**
 * Broadcast price update to all clients subscribed to a search
 */
const broadcastPriceUpdate = (searchId, data) => {
  if (!io) {
    console.warn('⚠️  WebSocket server not initialized');
    return;
  }

  io.to(`search:${searchId}`).emit('price_update', {
    searchId,
    ...data,
    timestamp: new Date().toISOString(),
  });

  console.log(`📢 Broadcasted price update for search: ${searchId}`);
};

/**
 * Broadcast to all clients (for general updates)
 */
const broadcastToAll = (event, data) => {
  if (!io) {
    console.warn('⚠️  WebSocket server not initialized');
    return;
  }

  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get WebSocket server instance
 */
const getIO = () => {
  return io;
};

module.exports = {
  initializeWebSocket,
  broadcastPriceUpdate,
  broadcastToAll,
  getIO,
};

