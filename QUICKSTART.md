# ThumbCommand - Quick Start Guide

A mobile-friendly web dashboard for tmux, Termux, and Claude Code.

## Project Status

✅ **Phase 1 Complete** - Next.js frontend foundation
✅ **Phase 2 Complete** - Express backend with tmux integration
🚧 **Phase 3 Pending** - Additional routes and components

## Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm start
```

The server will start on `http://localhost:3001`

### 2. Start the Frontend (in a new terminal/pane)

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Open in Browser

Navigate to `http://localhost:3000` to see the ThumbCommand dashboard.

## What's Working Now

### Backend (Phase 2)
- ✅ Complete tmux API (12 endpoints)
- ✅ Real-time WebSocket streaming for pane updates
- ✅ Session management (create, list, kill)
- ✅ Pane control (split, capture, send keys, resize)
- ✅ Health checks and monitoring

### Frontend (Phase 1)
- ✅ Modern dashboard UI with 6 feature cards
- ✅ Complete API client with typed endpoints
- ✅ Socket.io integration for real-time updates
- ✅ Custom React hooks (useTmuxPane, useClaudeStream, useBattery)
- ✅ shadcn-ui components
- ✅ Mobile-optimized responsive design
- ✅ PWA-ready configuration

## Testing the Backend

### Check if tmux is available
```bash
curl http://localhost:3001/api/tmux/check
```

### List tmux sessions
```bash
curl http://localhost:3001/api/tmux/sessions
```

### Create a test session
```bash
curl -X POST http://localhost:3001/api/tmux/create-session \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"test-session"}'
```

### List all panes
```bash
curl http://localhost:3001/api/tmux/panes
```

### Capture pane content
```bash
# Replace 0:0.0 with your actual pane ID
curl http://localhost:3001/api/tmux/capture/0:0.0
```

### Send keys to a pane
```bash
curl -X POST http://localhost:3001/api/tmux/send-keys \
  -H "Content-Type: application/json" \
  -d '{"paneId":"0:0.0","keys":"echo Hello from ThumbCommand"}'
```

## Project Structure

```
ThumbCommand/
├── frontend/              # Next.js 16 with TypeScript
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # API client & Socket.io
│   ├── hooks/            # Custom React hooks
│   └── package.json
│
├── backend/              # Express + Socket.io
│   ├── server.js        # Main server file
│   ├── routes/          # API routes
│   ├── utils/           # Command wrappers
│   ├── middleware/      # Error handling
│   ├── websocket/       # Real-time handlers
│   └── package.json
│
├── docs/                # Documentation
│   └── PLAN.md         # Complete implementation plan
│
├── PHASE1_COMPLETE.md  # Frontend completion summary
├── PHASE2_COMPLETE.md  # Backend completion summary
└── QUICKSTART.md       # This file
```

## Development Workflow

### Running Both Servers Simultaneously

**Option 1: Using tmux (recommended)**
```bash
# Create a new tmux session
tmux new -s thumbcommand

# Split the window
tmux split-window -h

# In left pane - start backend
cd backend && npm run dev

# In right pane - start frontend
# (use Ctrl+B then arrow key to switch panes)
cd frontend && npm run dev
```

**Option 2: Using separate terminals**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Development Mode Features

- **Backend**: Auto-restarts on file changes (nodemon)
- **Frontend**: Hot module reloading (Next.js)
- **Real-time**: WebSocket updates on pane changes

## What to Build Next (Phase 3)

### Priority 1: Tmux Components
1. `components/tmux/PaneCard.tsx` - Display pane with content
2. `components/tmux/SessionSwitcher.tsx` - Switch between sessions
3. `app/tmux/page.tsx` - Tmux dashboard page

### Priority 2: Additional Backend Routes
1. `routes/claude.js` - Claude Code integration
2. `routes/schedule.js` - Job scheduling
3. `routes/termux.js` - Termux API wrappers
4. `routes/terminal.js` - Command execution

### Priority 3: Component Development
1. Claude prompt interface
2. Calendar scheduler
3. Terminal emulator integration
4. Battery status widget

## Environment Configuration

### Backend (.env)
```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_DEBUG=true
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is in use: `lsof -i :3001`
- Verify dependencies are installed: `npm install`

### Frontend won't start
- Check if port 3000 is in use: `lsof -i :3000`
- Clear Next.js cache: `rm -rf .next`

### WebSocket not connecting
- Ensure backend is running
- Check browser console for errors
- Verify Socket.io versions match

### Tmux commands fail
- Verify tmux is installed: `which tmux`
- Check if tmux server is running: `tmux ls`
- Create a test session: `tmux new -s test`

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Socket.io**: https://socket.io/docs
- **tmux Guide**: https://github.com/tmux/tmux/wiki

## Architecture Overview

### Frontend → Backend Communication

1. **REST API** (HTTP)
   - One-time operations (send keys, split pane, create session)
   - Uses `lib/api.ts` client

2. **WebSocket** (Socket.io)
   - Real-time streaming (pane content updates)
   - Uses `lib/socket.ts` client

3. **React Hooks**
   - Abstracts API + WebSocket complexity
   - Provides clean component interface

### Data Flow

```
User Action → React Component → Hook → API/Socket → Backend → tmux
                                                      ↓
                                                   Response
                                                      ↓
Pane Update ← React Component ← Hook ← WebSocket ← Backend ← tmux
```

## Performance

- **Backend**: Polling only for subscribed panes
- **Frontend**: React hooks with automatic cleanup
- **WebSocket**: Change detection prevents unnecessary updates
- **API**: Efficient tmux command execution

## Next Steps

1. Start both servers
2. Open browser to `http://localhost:3000`
3. Click on "Open tmux Dashboard" card
4. Begin building the tmux pane viewer component

**Happy coding!** 🚀
