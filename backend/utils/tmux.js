/**
 * Tmux Command Wrappers
 * Provides utility functions for interacting with tmux
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Check if tmux is available
 */
async function isTmuxAvailable() {
  try {
    await execAsync('which tmux');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * List all tmux sessions
 * @returns {Promise<Array>} Array of session objects
 */
async function listSessions() {
  try {
    const { stdout } = await execAsync('tmux list-sessions -F json 2>/dev/null');
    const sessions = stdout
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.error('Failed to parse session:', line);
          return null;
        }
      })
      .filter(Boolean);
    return sessions;
  } catch (error) {
    // No sessions or tmux not running
    if (error.message.includes('no server running')) {
      return [];
    }
    throw error;
  }
}

/**
 * List panes in a specific session
 * @param {string} sessionName - Name of the session
 * @returns {Promise<Array>} Array of pane objects
 */
async function listPanes(sessionName) {
  try {
    const format = '#{session_name}:#{window_index}.#{pane_index}|#{pane_width}x#{pane_height}|#{pane_current_command}|#{pane_title}';
    const { stdout } = await execAsync(
      `tmux list-panes -s -t "${sessionName}" -F '${format}'`
    );

    const panes = stdout
      .trim()
      .split('\n')
      .map(line => {
        const [id, size, command, title] = line.split('|');
        const [width, height] = size.split('x');
        return {
          id,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          command,
          title: title || command,
        };
      });

    return panes;
  } catch (error) {
    console.error(`Failed to list panes for session ${sessionName}:`, error.message);
    throw error;
  }
}

/**
 * List all panes across all sessions
 * @returns {Promise<Array>} Array of pane objects with session info
 */
async function listAllPanes() {
  try {
    const format = '#{session_name}:#{window_index}.#{pane_index}|#{pane_width}x#{pane_height}|#{pane_current_command}|#{pane_title}|#{session_name}';
    const { stdout } = await execAsync(`tmux list-panes -a -F '${format}'`);

    const panes = stdout
      .trim()
      .split('\n')
      .map(line => {
        const [id, size, command, title, sessionName] = line.split('|');
        const [width, height] = size.split('x');
        return {
          id,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          command,
          title: title || command,
          sessionName,
        };
      });

    return panes;
  } catch (error) {
    console.error('Failed to list all panes:', error.message);
    return [];
  }
}

/**
 * Capture pane content
 * @param {string} paneId - Pane identifier (e.g., "0:0.0")
 * @param {number} lines - Number of lines to capture (default: 1000)
 * @returns {Promise<string>} Pane content
 */
async function capturePane(paneId, lines = 1000) {
  try {
    const { stdout } = await execAsync(
      `tmux capture-pane -t "${paneId}" -p -S -${lines} -e`
    );
    return stdout;
  } catch (error) {
    console.error(`Failed to capture pane ${paneId}:`, error.message);
    throw error;
  }
}

/**
 * Send keys to a pane
 * @param {string} paneId - Pane identifier
 * @param {string} keys - Keys to send
 * @param {boolean} literal - If true, send keys literally without Enter
 * @returns {Promise<void>}
 */
async function sendKeys(paneId, keys, literal = false) {
  try {
    // Escape special characters
    const escapedKeys = keys.replace(/"/g, '\\"');
    const enterKey = literal ? '' : ' Enter';
    await execAsync(`tmux send-keys -t "${paneId}" "${escapedKeys}"${enterKey}`);
  } catch (error) {
    console.error(`Failed to send keys to pane ${paneId}:`, error.message);
    throw error;
  }
}

/**
 * Split a pane
 * @param {string} paneId - Pane identifier
 * @param {string} direction - 'horizontal' or 'vertical'
 * @returns {Promise<void>}
 */
async function splitPane(paneId, direction = 'horizontal') {
  try {
    const flag = direction === 'horizontal' ? '-h' : '-v';
    await execAsync(`tmux split-window ${flag} -t "${paneId}"`);
  } catch (error) {
    console.error(`Failed to split pane ${paneId}:`, error.message);
    throw error;
  }
}

/**
 * Kill a pane
 * @param {string} paneId - Pane identifier
 * @returns {Promise<void>}
 */
async function killPane(paneId) {
  try {
    await execAsync(`tmux kill-pane -t "${paneId}"`);
  } catch (error) {
    console.error(`Failed to kill pane ${paneId}:`, error.message);
    throw error;
  }
}

/**
 * Get pane information
 * @param {string} paneId - Pane identifier
 * @returns {Promise<Object>} Pane information
 */
async function getPaneInfo(paneId) {
  try {
    const { stdout } = await execAsync(
      `tmux display-message -p -t "${paneId}" '#{pane_width}x#{pane_height}|#{pane_title}|#{pane_current_command}'`
    );
    const [size, title, command] = stdout.trim().split('|');
    const [width, height] = size.split('x');

    return {
      id: paneId,
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      title,
      command,
    };
  } catch (error) {
    console.error(`Failed to get pane info for ${paneId}:`, error.message);
    throw error;
  }
}

/**
 * Create a new tmux session
 * @param {string} sessionName - Name for the new session
 * @param {string} startDirectory - Starting directory (optional)
 * @returns {Promise<void>}
 */
async function createSession(sessionName, startDirectory = null) {
  try {
    const dirFlag = startDirectory ? `-c "${startDirectory}"` : '';
    await execAsync(`tmux new-session -d -s "${sessionName}" ${dirFlag}`);
  } catch (error) {
    console.error(`Failed to create session ${sessionName}:`, error.message);
    throw error;
  }
}

/**
 * Kill a tmux session
 * @param {string} sessionName - Name of the session to kill
 * @returns {Promise<void>}
 */
async function killSession(sessionName) {
  try {
    await execAsync(`tmux kill-session -t "${sessionName}"`);
  } catch (error) {
    console.error(`Failed to kill session ${sessionName}:`, error.message);
    throw error;
  }
}

/**
 * Resize a pane
 * @param {string} paneId - Pane identifier
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @param {number} amount - Number of cells to resize
 * @returns {Promise<void>}
 */
async function resizePane(paneId, direction, amount = 5) {
  try {
    const directionMap = {
      up: '-U',
      down: '-D',
      left: '-L',
      right: '-R',
    };
    const flag = directionMap[direction];
    if (!flag) {
      throw new Error(`Invalid direction: ${direction}`);
    }
    await execAsync(`tmux resize-pane -t "${paneId}" ${flag} ${amount}`);
  } catch (error) {
    console.error(`Failed to resize pane ${paneId}:`, error.message);
    throw error;
  }
}

module.exports = {
  isTmuxAvailable,
  listSessions,
  listPanes,
  listAllPanes,
  capturePane,
  sendKeys,
  splitPane,
  killPane,
  getPaneInfo,
  createSession,
  killSession,
  resizePane,
};
