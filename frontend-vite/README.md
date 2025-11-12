# ThumbCommand Frontend (Vite)

Mobile-optimized web dashboard for tmux, Termux, and Claude Code built with Vite + React + TypeScript.

## Why Vite instead of Next.js?

Next.js doesn't work on Termux (ARM64 Android) due to missing SWC binaries. This Vite-based frontend provides the same beautiful design and functionality with full Termux compatibility.

## Features

- **tmux Control**: View and interact with tmux sessions and panes in real-time
- **Terminal**: Execute commands directly from the web interface with history
- **Dark Theme**: Beautiful dark gradient design optimized for mobile
- **PWA Ready**: Install as a Progressive Web App on your device
- **Real-time Updates**: WebSocket integration for live streaming
- **Mobile Optimized**: Touch-friendly interface with responsive design

## Tech Stack

- **Vite** - Lightning-fast build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Vite PWA Plugin** - Progressive Web App support

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

### 3. Start Backend Server

In a separate terminal:

```bash
cd ../backend
node server.js
```

The backend runs on: http://localhost:3001

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend-vite/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts        # Backend API client
│   │   ├── socket.ts     # Socket.io setup
│   │   └── utils.ts      # Helper functions
│   ├── pages/
│   │   ├── Dashboard.tsx # Home page with feature cards
│   │   ├── TmuxViewer.tsx # tmux session/pane viewer
│   │   └── Terminal.tsx  # Command execution interface
│   ├── App.tsx           # Router setup
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles + Tailwind
├── public/               # Static assets
├── vite.config.ts        # Vite configuration with PWA
└── tailwind.config.js    # Tailwind configuration
```

## Pages

### Dashboard (/)
Beautiful landing page with feature cards for:
- tmux Control (green)
- Claude Code (blue) - Coming soon
- Job Scheduler (purple) - Coming soon
- Terminal (orange)
- Termux API (cyan) - Coming soon
- System Status (pink) - Coming soon

### tmux Viewer (/tmux)
- View all tmux sessions in tabs
- See all panes in a grid layout
- Live streaming of pane content (updates every 2s)
- Send commands to any pane
- Kill panes
- Beautiful terminal-like display with green text on black background

### Terminal (/terminal)
- Execute shell commands
- View command history
- Real-time output streaming
- Command history navigation (Arrow Up/Down)
- Clean, mobile-friendly interface

## Backend API Integration

The frontend connects to the backend at `http://localhost:3001/api`. All requests are proxied through Vite's dev server.

### Available Endpoints

- `GET /api/tmux/sessions` - List all tmux sessions
- `GET /api/tmux/panes/:session` - Get panes in a session
- `GET /api/tmux/capture/:paneId` - Capture pane content
- `POST /api/tmux/send-keys` - Send keys to a pane
- `DELETE /api/tmux/kill-pane/:paneId` - Kill a pane
- `POST /api/execute` - Execute shell command
- `GET /health` - Health check

### WebSocket Events

- `command-output` - Streaming command output
- `command-error` - Command errors
- `command-complete` - Command completion

## Mobile Optimization

- Responsive grid layouts (1 col mobile, 2 cols tablet, 3 cols desktop)
- Touch-friendly buttons and inputs
- Bottom navigation for easy thumb access
- Smooth scrolling and animations
- PWA support for home screen installation

## PWA Features

The app can be installed as a Progressive Web App:

1. Open in Chrome/Edge on Android
2. Tap "Add to Home Screen"
3. Use as a standalone app

PWA configuration in `vite.config.ts`:
- Offline support with service worker
- API response caching
- App manifest with icons
- Auto-updates

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR - edit files and see changes immediately without page refresh.

### Path Aliases

Use `@/` to import from `src/`:

```tsx
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
```

## Production Build

```bash
npm run build
```

This creates an optimized build in `dist/` with:
- Minified JS and CSS
- Code splitting
- Tree shaking
- Service worker for PWA
- Optimized assets

Serve the build:

```bash
npm run preview
```

## Troubleshooting

### Port 3000 already in use

```bash
pkill -f "vite"
npm run dev -- --port 3002
```

### Backend not connecting

Make sure the backend is running on port 3001:

```bash
cd ../backend
node server.js
```

---

**Built with Vite, React, shadcn/ui, and Tailwind CSS**
