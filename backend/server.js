/**
 * ThumbCommand Backend Server
 * Express + Socket.io server for tmux, Termux, and Claude Code integration
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import routes
const tmuxRoutes = require('./routes/tmux');
const executeRoutes = require('./routes/execute');

// Import middleware
const { notFoundHandler, errorHandler } = require('./middleware/error');

// Import WebSocket handlers
const { initTmuxStream, getStats } = require('./websocket/tmux-stream');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST'],
  },
});

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/tmux', tmuxRoutes);
app.use('/api/execute', executeRoutes);

// WebSocket stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    tmux: getStats(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ThumbCommand Backend',
    version: '1.0.0',
    description: 'Backend server for tmux, Termux, and Claude Code integration',
    endpoints: {
      health: '/health',
      stats: '/api/stats',
      tmux: '/api/tmux',
    },
    websocket: {
      enabled: true,
      path: '/socket.io',
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize WebSocket handlers
initTmuxStream(io);

// Store io instance in app for routes to access if needed
app.set('io', io);

// Socket.io connection logging
io.on('connection', (socket) => {
  console.log(`Socket.io: Client connected (${socket.id})`);

  socket.on('disconnect', (reason) => {
    console.log(`Socket.io: Client disconnected (${socket.id}) - ${reason}`);
  });
});

// Start server
server.listen(PORT, HOST, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('  ThumbCommand Backend Server');
  console.log('='.repeat(60));
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Server URL:  http://${HOST}:${PORT}`);
  console.log(`  Socket.io:   ws://${HOST}:${PORT}`);
  console.log('='.repeat(60));
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /              - API information`);
  console.log(`  GET  /health        - Health check`);
  console.log(`  GET  /api/stats     - WebSocket statistics`);
  console.log(`  GET  /api/tmux/*    - Tmux operations`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = { app, server, io };
