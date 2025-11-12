# ThumbCommand

Mobile-optimized web dashboard for tmux, Termux, and Claude Code - built for ARM64 Android devices running Termux.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Termux%20%7C%20Android-green.svg)

## Overview

ThumbCommand is a beautiful, mobile-first web interface that brings powerful terminal management to your fingertips. Control tmux sessions, execute commands, and manage your Termux environment with an intuitive touch-friendly UI.

### Why ThumbCommand?

- **Termux Compatible**: Built specifically for ARM64 Android, works perfectly in Termux
- **Mobile-First**: Touch-optimized interface designed for thumb navigation
- **Real-time Updates**: WebSocket integration for live tmux session monitoring
- **PWA Ready**: Install as a standalone app on your device
- **Beautiful Design**: Dark theme with gradient backgrounds and colorful cards

## Features

### ✅ Currently Available

- **Dashboard**: Beautiful landing page with feature navigation
- **tmux Control**: View sessions, monitor panes, send commands, kill panes
- **Terminal**: Execute commands with history and real-time output

### 🚧 Coming Soon

- **Claude Code Integration**
- **Job Scheduler**
- **Termux API Controls**
- **System Status Dashboard**

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Backend**: Express + Socket.io + Node.js
- **APIs**: tmux, Termux API, Claude Code

## Why Vite?

Next.js doesn't work on Termux (ARM64 Android) due to missing SWC binaries. Vite provides the same beautiful design with full compatibility.

## Quick Start

```bash
# Backend
cd backend && npm install && node server.js

# Frontend (in new terminal)
cd frontend-vite && npm install && npm run dev
```

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

## Documentation

- [Implementation Plan](docs/PLAN.md)
- [Migration Summary](docs/MIGRATION_SUMMARY.md)
- [Startup Guide](docs/STARTUP.md)
- [Mobile Debug](docs/MOBILE_DEBUG.md)

## License

MIT License

---

**Built with ❤️ for Termux users**
