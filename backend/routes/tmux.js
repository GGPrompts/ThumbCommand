/**
 * Tmux API Routes
 * Endpoints for interacting with tmux sessions and panes
 */

const express = require('express');
const router = express.Router();
const tmux = require('../utils/tmux');

/**
 * GET /api/tmux/sessions
 * List all tmux sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await tmux.listSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tmux/panes/:session
 * List panes in a specific session
 */
router.get('/panes/:session', async (req, res) => {
  try {
    const { session } = req.params;
    const panes = await tmux.listPanes(session);
    res.json(panes);
  } catch (error) {
    console.error(`Error listing panes for session ${req.params.session}:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tmux/panes
 * List all panes across all sessions
 */
router.get('/panes', async (req, res) => {
  try {
    const panes = await tmux.listAllPanes();
    res.json(panes);
  } catch (error) {
    console.error('Error listing all panes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tmux/capture/:paneId
 * Capture content from a specific pane
 * Query params:
 *   - lines: number of lines to capture (default: 1000)
 */
router.get('/capture/:paneId', async (req, res) => {
  try {
    const { paneId } = req.params;
    const lines = parseInt(req.query.lines) || 1000;
    const content = await tmux.capturePane(paneId, lines);
    res.json({ content, paneId });
  } catch (error) {
    console.error(`Error capturing pane ${req.params.paneId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tmux/send-keys
 * Send keys to a specific pane
 * Body:
 *   - paneId: pane identifier
 *   - keys: keys to send
 *   - literal: (optional) if true, don't send Enter key
 */
router.post('/send-keys', async (req, res) => {
  try {
    const { paneId, keys, literal } = req.body;

    if (!paneId || keys === undefined) {
      return res.status(400).json({ error: 'paneId and keys are required' });
    }

    await tmux.sendKeys(paneId, keys, literal);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending keys:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tmux/split
 * Split a pane
 * Body:
 *   - paneId: pane identifier
 *   - direction: 'horizontal' or 'vertical'
 */
router.post('/split', async (req, res) => {
  try {
    const { paneId, direction } = req.body;

    if (!paneId || !direction) {
      return res.status(400).json({ error: 'paneId and direction are required' });
    }

    if (!['horizontal', 'vertical'].includes(direction)) {
      return res.status(400).json({ error: 'direction must be "horizontal" or "vertical"' });
    }

    await tmux.splitPane(paneId, direction);
    res.json({ success: true });
  } catch (error) {
    console.error('Error splitting pane:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tmux/kill-pane
 * Kill a specific pane
 * Body:
 *   - paneId: pane identifier
 */
router.post('/kill-pane', async (req, res) => {
  try {
    const { paneId } = req.body;

    if (!paneId) {
      return res.status(400).json({ error: 'paneId is required' });
    }

    await tmux.killPane(paneId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error killing pane:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tmux/pane-info/:paneId
 * Get information about a specific pane
 */
router.get('/pane-info/:paneId', async (req, res) => {
  try {
    const { paneId } = req.params;
    const info = await tmux.getPaneInfo(paneId);
    res.json(info);
  } catch (error) {
    console.error(`Error getting pane info for ${req.params.paneId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tmux/create-session
 * Create a new tmux session
 * Body:
 *   - sessionName: name for the new session
 *   - startDirectory: (optional) starting directory
 */
router.post('/create-session', async (req, res) => {
  try {
    const { sessionName, startDirectory } = req.body;

    if (!sessionName) {
      return res.status(400).json({ error: 'sessionName is required' });
    }

    await tmux.createSession(sessionName, startDirectory);
    res.json({ success: true, sessionName });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tmux/kill-session
 * Kill a tmux session
 * Body:
 *   - sessionName: name of the session to kill
 */
router.post('/kill-session', async (req, res) => {
  try {
    const { sessionName } = req.body;

    if (!sessionName) {
      return res.status(400).json({ error: 'sessionName is required' });
    }

    await tmux.killSession(sessionName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error killing session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tmux/resize-pane
 * Resize a pane
 * Body:
 *   - paneId: pane identifier
 *   - direction: 'up', 'down', 'left', 'right'
 *   - amount: (optional) number of cells to resize (default: 5)
 */
router.post('/resize-pane', async (req, res) => {
  try {
    const { paneId, direction, amount } = req.body;

    if (!paneId || !direction) {
      return res.status(400).json({ error: 'paneId and direction are required' });
    }

    if (!['up', 'down', 'left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'direction must be "up", "down", "left", or "right"' });
    }

    await tmux.resizePane(paneId, direction, amount);
    res.json({ success: true });
  } catch (error) {
    console.error('Error resizing pane:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tmux/check
 * Check if tmux is available
 */
router.get('/check', async (req, res) => {
  try {
    const available = await tmux.isTmuxAvailable();
    res.json({ available });
  } catch (error) {
    console.error('Error checking tmux availability:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
