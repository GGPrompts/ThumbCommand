# ThumbCommand - Quick Start Guide

## Current Status

Both servers are running and ready to use!

### Frontend (Vite)
- URL: http://localhost:3000
- Status: Running in background
- Hot reload: Enabled

### Backend (Express + Socket.io)
- URL: http://localhost:3001
- Status: Running in background
- WebSocket: Active

## Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

## Available Pages

1. **Dashboard** (http://localhost:3000/)
   - Landing page with feature cards
   - Links to all features

2. **tmux Viewer** (http://localhost:3000/tmux)
   - View and control tmux sessions
   - Send commands to panes
   - Live content streaming

3. **Terminal** (http://localhost:3000/terminal)
   - Execute shell commands
   - View command history
   - Real-time output

## Testing tmux Integration

To see the tmux viewer in action, create a tmux session:

```bash
# Create a new tmux session
tmux new -s test

# Split the window
Ctrl+b then "

# Detach from session
Ctrl+b then d

# Now visit http://localhost:3000/tmux to see it!
```

## Commands

### Stop Servers
```bash
# Kill all running servers
pkill -f "node server.js"
pkill -f "vite"
```

### Restart Servers
```bash
# Terminal 1: Backend
cd /data/data/com.termux/files/home/ThumbCommand/backend
node server.js

# Terminal 2: Frontend (in a new terminal)
cd /data/data/com.termux/files/home/ThumbCommand/frontend-vite
npm run dev
```

### Build for Production
```bash
cd /data/data/com.termux/files/home/ThumbCommand/frontend-vite
npm run build
npm run preview
```

## Troubleshooting

### Can't access frontend
```bash
curl http://localhost:3000
```
If this fails, restart the frontend:
```bash
pkill -f "vite"
cd frontend-vite && npm run dev
```

### Can't access backend
```bash
curl http://localhost:3001/health
```
If this fails, restart the backend:
```bash
pkill -f "node server.js"
cd backend && node server.js
```

## What's Next?

The frontend is production-ready! You can:

1. Use it as-is in development mode
2. Build for production (`npm run build`)
3. Install as PWA on your phone
4. Add more features (Claude, Scheduler, etc.)

## Documentation

- Frontend README: `frontend-vite/README.md`
- Migration Summary: `MIGRATION_SUMMARY.md`
- Backend Plan: `docs/PLAN.md`

Enjoy your new Vite-powered ThumbCommand dashboard!
