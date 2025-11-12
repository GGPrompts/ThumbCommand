# ThumbCommand - Implementation Plan

This document outlines the detailed implementation plan based on our conversation.

## Core Concept

Build a mobile-optimized web dashboard that provides:
1. Visual interface to tmux sessions running in Termux
2. Claude Code integration with live output streaming
3. Visual command scheduler (shadcn calendar → termux-job-scheduler)
4. Termux API controls (notifications, sensors, battery, etc.)

## Key Technical Insights

### tmux Capture Commands

```bash
# List sessions
tmux list-sessions -F json

# List panes with details
tmux list-panes -s -t session_name -F '#{session_name}:#{window_index}.#{pane_index} #{pane_width}x#{pane_height} #{pane_current_command} #{pane_title}'

# Capture pane content (THE KEY!)
tmux capture-pane -t pane_id -p -S -1000  # Last 1000 lines

# Send commands to pane
tmux send-keys -t pane_id "command" Enter

# Get pane info
tmux display-message -p -t pane_id '#{pane_width}x#{pane_height} #{pane_title}'

# Split panes
tmux split-window -h  # horizontal
tmux split-window -v  # vertical
```

### Termux API Integration

Key commands we'll wrap in API endpoints:
- `termux-notification` - Android notifications with action buttons
- `termux-battery-status` - Real-time battery monitoring
- `termux-job-scheduler` - Schedule commands to run periodically
- `termux-toast` - Quick popup messages
- `termux-vibrate` - Haptic feedback
- `termux-dialog` - Native Android input dialogs
- `termux-clipboard-set/get` - Clipboard integration
- `termux-wifi-connectioninfo` - Network status

### Claude Code Execution

```javascript
// Execute Claude with streaming output
const claude = spawn('claude', ['-p', prompt, '--project', projectPath]);

claude.stdout.on('data', (data) => {
  socket.emit('claude-output', data.toString());
});

claude.stderr.on('data', (data) => {
  socket.emit('claude-error', data.toString());
});
```

## Architecture Details

### Frontend Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Dashboard home
│   ├── tmux/
│   │   ├── page.tsx            # tmux panes grid view
│   │   └── [paneId]/
│   │       └── page.tsx        # Individual pane detail
│   ├── claude/
│   │   ├── page.tsx            # Claude prompt interface
│   │   └── history/
│   │       └── page.tsx        # Prompt history
│   ├── schedule/
│   │   ├── page.tsx            # Calendar scheduler
│   │   └── jobs/
│   │       └── page.tsx        # Job list/management
│   ├── terminal/
│   │   └── page.tsx            # Command execution interface
│   └── api/                    # API client functions
│       └── route.ts
├── components/
│   ├── ui/                     # shadcn components
│   ├── dashboard/
│   │   ├── TmuxGrid.tsx        # Grid of tmux panes
│   │   ├── BatteryWidget.tsx   # Battery status display
│   │   ├── QuickActions.tsx    # Common command buttons
│   │   └── SystemStatus.tsx    # WiFi, sensors, etc.
│   ├── tmux/
│   │   ├── PaneCard.tsx        # Individual pane view
│   │   ├── PaneControls.tsx    # Split, kill, resize buttons
│   │   ├── SessionSwitcher.tsx # Tab bar for sessions
│   │   └── CommandInput.tsx    # Send keys to pane
│   ├── claude/
│   │   ├── PromptEditor.tsx    # Textarea with formatting
│   │   ├── OutputStream.tsx    # Live Claude output
│   │   ├── ProjectSelector.tsx # Dropdown for project
│   │   └── PromptHistory.tsx   # Previous prompts list
│   ├── schedule/
│   │   ├── ScheduleCalendar.tsx # shadcn calendar
│   │   ├── JobForm.tsx         # Create/edit job form
│   │   ├── JobList.tsx         # List of scheduled jobs
│   │   └── JobCard.tsx         # Individual job display
│   └── terminal/
│       ├── TerminalView.tsx    # xterm.js integration
│       └── CommandHistory.tsx  # Previous commands
├── lib/
│   ├── api.ts                  # API client (fetch wrappers)
│   ├── socket.ts               # Socket.io client setup
│   └── utils.ts                # Helper functions
└── hooks/
    ├── useTmuxPane.ts          # Hook for pane data
    ├── useClaudeStream.ts      # Hook for Claude output
    └── useBattery.ts           # Hook for battery status
```

### Backend Structure

```
backend/
├── server.js                   # Express + Socket.io setup
├── routes/
│   ├── tmux.js                 # tmux-related endpoints
│   ├── claude.js               # Claude Code execution
│   ├── schedule.js             # Job scheduling
│   ├── termux.js               # Termux API wrappers
│   └── execute.js              # Generic command execution
├── utils/
│   ├── tmux.js                 # tmux command wrappers
│   ├── termux-api.js           # Termux API functions
│   └── claude.js               # Claude execution helpers
├── middleware/
│   ├── auth.js                 # Optional authentication
│   └── error.js                # Error handling
└── websocket/
    ├── tmux-stream.js          # Live pane updates
    ├── claude-stream.js        # Claude output streaming
    └── command-stream.js       # Command execution streaming
```

## Implementation Steps

### Step 1: Project Initialization

```bash
# Create Next.js app
cd ThumbCommand
npx create-next-app@latest frontend --typescript --tailwind --app

# Initialize shadcn-ui
cd frontend
npx shadcn@latest init

# Install backend dependencies
mkdir backend
cd backend
npm init -y
npm install express socket.io cors
npm install -D nodemon

# Add components
npx shadcn@latest add button card input calendar scroll-area tabs dialog
```

### Step 2: Basic tmux Integration

**Backend Route** (`backend/routes/tmux.js`):
```javascript
const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const router = express.Router();
const execAsync = promisify(exec);

// List all sessions
router.get('/sessions', async (req, res) => {
  try {
    const { stdout } = await execAsync('tmux list-sessions -F json');
    const sessions = stdout.trim().split('\n')
      .filter(line => line)
      .map(JSON.parse);
    res.json(sessions);
  } catch (error) {
    res.json([]); // No sessions
  }
});

// List panes in session
router.get('/panes/:session', async (req, res) => {
  const { session } = req.params;
  try {
    const cmd = `tmux list-panes -s -t ${session} -F '#{session_name}:#{window_index}.#{pane_index}|#{pane_width}x#{pane_height}|#{pane_current_command}|#{pane_title}'`;
    const { stdout } = await execAsync(cmd);

    const panes = stdout.trim().split('\n').map(line => {
      const [id, size, command, title] = line.split('|');
      const [width, height] = size.split('x');
      return {
        id,
        width: parseInt(width),
        height: parseInt(height),
        command,
        title
      };
    });

    res.json(panes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Capture pane content
router.get('/capture/:paneId', async (req, res) => {
  const { paneId } = req.params;
  const lines = req.query.lines || 1000;

  try {
    const { stdout } = await execAsync(
      `tmux capture-pane -t ${paneId} -p -S -${lines} -e`
    );
    res.json({ content: stdout, paneId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send keys to pane
router.post('/send-keys', async (req, res) => {
  const { paneId, keys } = req.body;

  try {
    const escapedKeys = keys.replace(/"/g, '\\"');
    await execAsync(`tmux send-keys -t ${paneId} "${escapedKeys}" Enter`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Frontend Component** (`frontend/components/tmux/PaneCard.tsx`):
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface PaneCardProps {
  pane: {
    id: string
    command: string
    title: string
    width: number
    height: number
  }
}

export function PaneCard({ pane }: PaneCardProps) {
  const [content, setContent] = useState('')
  const [command, setCommand] = useState('')

  useEffect(() => {
    const fetchContent = async () => {
      const res = await fetch(`http://localhost:3001/api/tmux/capture/${pane.id}`)
      const data = await res.json()
      setContent(data.content)
    }

    fetchContent()
    const interval = setInterval(fetchContent, 1000)
    return () => clearInterval(interval)
  }, [pane.id])

  const sendCommand = async () => {
    await fetch('http://localhost:3001/api/tmux/send-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paneId: pane.id, keys: command })
    })
    setCommand('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {pane.command} - {pane.id}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full rounded border p-2 font-mono text-xs bg-black text-green-400">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </ScrollArea>

        <div className="flex gap-2 mt-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Send command..."
            onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
          />
          <Button onClick={sendCommand}>Send</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 3: Claude Integration

**Backend Route** (`backend/routes/claude.js`):
```javascript
const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

// Execute Claude prompt
router.post('/prompt', (req, res) => {
  const { prompt, project, mode } = req.body;

  const args = ['-p', prompt];
  if (project) args.push('--project', project);
  if (mode) args.push('--permission-mode', mode);

  const claude = spawn('claude', args, { cwd: project });

  const io = req.app.get('io');
  const sessionId = Math.random().toString(36);

  claude.stdout.on('data', (data) => {
    io.emit(`claude-output-${sessionId}`, data.toString());
  });

  claude.stderr.on('data', (data) => {
    io.emit(`claude-error-${sessionId}`, data.toString());
  });

  claude.on('close', (code) => {
    io.emit(`claude-done-${sessionId}`, { code });
  });

  res.json({ sessionId });
});

module.exports = router;
```

### Step 4: Scheduler with Calendar

**Backend Route** (`backend/routes/schedule.js`):
```javascript
const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const router = express.Router();
const execAsync = promisify(exec);

// Create scheduled job
router.post('/create', async (req, res) => {
  const { command, datetime, repeat, conditions } = req.body;

  try {
    // Build termux-job-scheduler command
    let cmd = 'termux-job-scheduler --script-path /path/to/script.sh';

    if (repeat === 'daily') {
      const ms = 24 * 60 * 60 * 1000;
      cmd += ` --period-ms ${ms}`;
    } else if (datetime) {
      cmd += ` --trigger-at "${datetime}"`;
    }

    if (conditions?.battery) cmd += ' --battery-not-low';
    if (conditions?.charging) cmd += ' --charging';
    if (conditions?.wifi) cmd += ' --network any';

    const { stdout } = await execAsync(cmd);
    res.json({ success: true, output: stdout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List scheduled jobs
router.get('/jobs', async (req, res) => {
  try {
    const { stdout } = await execAsync('termux-job-scheduler --show');
    res.json({ jobs: stdout });
  } catch (error) {
    res.json({ jobs: [] });
  }
});

module.exports = router;
```

### Step 5: Termux API Wrappers

**Backend Utility** (`backend/utils/termux-api.js`):
```javascript
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function notify(title, content, options = {}) {
  let cmd = `termux-notification --title "${title}" --content "${content}"`;

  if (options.id) cmd += ` --id ${options.id}`;
  if (options.ongoing) cmd += ' --ongoing';
  if (options.priority) cmd += ` --priority ${options.priority}`;

  if (options.button1) {
    cmd += ` --button1 "${options.button1}"`;
    cmd += ` --button1-action "${options.button1Action}"`;
  }

  await execAsync(cmd);
}

async function getBatteryStatus() {
  const { stdout } = await execAsync('termux-battery-status');
  return JSON.parse(stdout);
}

async function toast(message, long = false) {
  const flag = long ? '-l' : '-s';
  await execAsync(`termux-toast ${flag} "${message}"`);
}

async function vibrate(duration = 1000) {
  await execAsync(`termux-vibrate -d ${duration}`);
}

module.exports = {
  notify,
  getBatteryStatus,
  toast,
  vibrate
};
```

## Mobile Optimization

### Responsive Grid for Panes
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {panes.map(pane => <PaneCard key={pane.id} pane={pane} />)}
</div>
```

### Touch-Friendly Controls
- Large tap targets (min 44x44px)
- Swipe gestures for navigation
- Bottom navigation bar (easier to reach with thumb)
- Floating action button for common actions

### PWA Configuration
```json
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // your config
})
```

## Performance Considerations

1. **Polling vs WebSocket**: Use WebSocket for active panes, polling for background
2. **Debounce Updates**: Don't update pane content more than 1x/second
3. **Lazy Loading**: Only fetch content for visible panes
4. **Battery Awareness**: Reduce update frequency on low battery
5. **Caching**: Cache tmux session list, only refresh on user action

## Next Steps

1. Choose to start with Phase 1 (basic setup)
2. Set up project dependencies
3. Create minimal tmux viewer
4. Iterate from there

---

**This plan captures our entire conversation. Ready to build when you are!**
