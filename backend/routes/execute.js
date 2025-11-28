/**
 * Command execution routes
 */

const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

// Execute a command
router.post('/', (req, res) => {
  const { command, cwd } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  const workingDir = cwd || process.env.HOME || '/data/data/com.termux/files/home';

  // Use spawn with shell option
  const child = spawn(command, {
    cwd: workingDir,
    shell: true,
    timeout: 30000,
    env: process.env,
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  child.on('error', (error) => {
    res.json({
      output: stdout,
      error: error.message,
      exitCode: 1,
    });
  });

  child.on('close', (code) => {
    res.json({
      output: stdout,
      error: stderr || null,
      exitCode: code || 0,
    });
  });
});

module.exports = router;
