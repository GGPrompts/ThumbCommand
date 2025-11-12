/**
 * Tmux WebSocket Streaming
 * Handles real-time pane content streaming via Socket.io
 */

const tmux = require('../utils/tmux');

// Store active subscriptions
// Map of paneId -> Set of socket IDs
const paneSubscriptions = new Map();

// Store polling intervals
// Map of paneId -> interval ID
const pollingIntervals = new Map();

/**
 * Initialize tmux streaming handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
function initTmuxStream(io) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    /**
     * Subscribe to a pane's updates
     */
    socket.on('subscribe-pane', async (paneId) => {
      try {
        console.log(`Client ${socket.id} subscribing to pane ${paneId}`);

        // Add socket to pane subscriptions
        if (!paneSubscriptions.has(paneId)) {
          paneSubscriptions.set(paneId, new Set());
        }
        paneSubscriptions.get(paneId).add(socket.id);

        // Join a room for this pane
        socket.join(`pane-${paneId}`);

        // Send initial content
        try {
          const content = await tmux.capturePane(paneId);
          socket.emit(`tmux-pane-${paneId}`, content);
        } catch (error) {
          console.error(`Error capturing initial content for pane ${paneId}:`, error.message);
          socket.emit(`tmux-pane-${paneId}`, '');
        }

        // Start polling for this pane if not already started
        if (!pollingIntervals.has(paneId)) {
          startPanePolling(io, paneId);
        }
      } catch (error) {
        console.error(`Error subscribing to pane ${paneId}:`, error);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Unsubscribe from a pane's updates
     */
    socket.on('unsubscribe-pane', (paneId) => {
      try {
        console.log(`Client ${socket.id} unsubscribing from pane ${paneId}`);

        // Remove socket from pane subscriptions
        if (paneSubscriptions.has(paneId)) {
          paneSubscriptions.get(paneId).delete(socket.id);

          // If no more subscribers, stop polling
          if (paneSubscriptions.get(paneId).size === 0) {
            paneSubscriptions.delete(paneId);
            stopPanePolling(paneId);
          }
        }

        // Leave the room
        socket.leave(`pane-${paneId}`);
      } catch (error) {
        console.error(`Error unsubscribing from pane ${paneId}:`, error);
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Clean up all subscriptions for this socket
      for (const [paneId, subscribers] of paneSubscriptions.entries()) {
        if (subscribers.has(socket.id)) {
          subscribers.delete(socket.id);

          // If no more subscribers, stop polling
          if (subscribers.size === 0) {
            paneSubscriptions.delete(paneId);
            stopPanePolling(paneId);
          }
        }
      }
    });

    /**
     * Request immediate pane refresh
     */
    socket.on('refresh-pane', async (paneId) => {
      try {
        const content = await tmux.capturePane(paneId);
        socket.emit(`tmux-pane-${paneId}`, content);
      } catch (error) {
        console.error(`Error refreshing pane ${paneId}:`, error);
        socket.emit('error', { message: error.message });
      }
    });
  });

  console.log('Tmux streaming initialized');
}

/**
 * Start polling for pane updates
 * @param {SocketIO.Server} io - Socket.io server instance
 * @param {string} paneId - Pane identifier
 */
function startPanePolling(io, paneId) {
  console.log(`Starting polling for pane ${paneId}`);

  let lastContent = '';

  const interval = setInterval(async () => {
    try {
      // Check if there are still subscribers
      if (!paneSubscriptions.has(paneId) || paneSubscriptions.get(paneId).size === 0) {
        stopPanePolling(paneId);
        return;
      }

      // Capture pane content
      const content = await tmux.capturePane(paneId);

      // Only emit if content has changed
      if (content !== lastContent) {
        lastContent = content;
        io.to(`pane-${paneId}`).emit(`tmux-pane-${paneId}`, content);
      }
    } catch (error) {
      // Pane might have been closed
      if (error.message.includes("can't find pane")) {
        console.log(`Pane ${paneId} no longer exists, stopping polling`);
        stopPanePolling(paneId);
        // Notify subscribers that pane is gone
        io.to(`pane-${paneId}`).emit(`tmux-pane-closed-${paneId}`);
      } else {
        console.error(`Error polling pane ${paneId}:`, error.message);
      }
    }
  }, 1000); // Poll every second

  pollingIntervals.set(paneId, interval);
}

/**
 * Stop polling for pane updates
 * @param {string} paneId - Pane identifier
 */
function stopPanePolling(paneId) {
  console.log(`Stopping polling for pane ${paneId}`);

  if (pollingIntervals.has(paneId)) {
    clearInterval(pollingIntervals.get(paneId));
    pollingIntervals.delete(paneId);
  }
}

/**
 * Get current subscription stats (for debugging)
 */
function getStats() {
  return {
    activeSubscriptions: paneSubscriptions.size,
    activePanes: Array.from(paneSubscriptions.keys()),
    totalSubscribers: Array.from(paneSubscriptions.values())
      .reduce((sum, set) => sum + set.size, 0),
  };
}

module.exports = {
  initTmuxStream,
  getStats,
};
