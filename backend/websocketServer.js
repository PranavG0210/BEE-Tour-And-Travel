const http = require('http');
const { initializeWebSocket } = require('./services/websocketService');
const { startScheduler } = require('./services/schedulerService');

/**
 * Start the WebSocket server as a separate module.
 * @param {import('express').Express} app - Express application instance
 * @returns {import('http').Server} HTTP server instance with WebSocket attached
 */
const startWebSocketServer = (app) => {
  const httpServer = http.createServer(app);

  // Initialize Socket.io on top of HTTP server
  initializeWebSocket(httpServer);

  // Start the price refresh scheduler
  startScheduler();

  return httpServer;
};

module.exports = {
  startWebSocketServer,
};

