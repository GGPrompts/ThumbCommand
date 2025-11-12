# ThumbCommand Backend

Express + Socket.io backend server for ThumbCommand dashboard.

## Features

- **Tmux Integration**: Full tmux session and pane control
- **Real-time Streaming**: Live pane content updates via WebSocket
- **RESTful API**: Clean REST endpoints for all operations
- **Error Handling**: Comprehensive error handling middleware
- **CORS Enabled**: Ready for frontend integration

## Project Structure

```
backend/
├── server.js              # Main Express + Socket.io server
├── routes/
│   └── tmux.js           # Tmux API endpoints
├── utils/
│   └── tmux.js           # Tmux command wrappers
├── middleware/
│   └── error.js          # Error handling middleware
├── websocket/
│   └── tmux-stream.js    # WebSocket handlers for live streaming
├── package.json
├── .env.example
└── README.md
```

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Health & Info

- `GET /` - API information and available endpoints
- `GET /health` - Health check with uptime
- `GET /api/stats` - WebSocket statistics

### Tmux Operations

All tmux endpoints are prefixed with `/api/tmux`:

#### Sessions
- `GET /api/tmux/sessions` - List all tmux sessions
- `POST /api/tmux/create-session` - Create a new session
  - Body: `{ sessionName, startDirectory? }`
- `POST /api/tmux/kill-session` - Kill a session
  - Body: `{ sessionName }`

#### Panes
- `GET /api/tmux/panes` - List all panes across all sessions
- `GET /api/tmux/panes/:session` - List panes in a specific session
- `GET /api/tmux/pane-info/:paneId` - Get pane information
- `GET /api/tmux/capture/:paneId?lines=1000` - Capture pane content

#### Pane Control
- `POST /api/tmux/send-keys` - Send keys to a pane
  - Body: `{ paneId, keys, literal? }`
- `POST /api/tmux/split` - Split a pane
  - Body: `{ paneId, direction: 'horizontal' | 'vertical' }`
- `POST /api/tmux/kill-pane` - Kill a pane
  - Body: `{ paneId }`
- `POST /api/tmux/resize-pane` - Resize a pane
  - Body: `{ paneId, direction: 'up'|'down'|'left'|'right', amount? }`

#### Utility
- `GET /api/tmux/check` - Check if tmux is available

## WebSocket Events

Connect to `ws://localhost:3001` using Socket.io client.

### Client → Server

- `subscribe-pane` - Subscribe to pane updates
  - Payload: `paneId` (string)
- `unsubscribe-pane` - Unsubscribe from pane updates
  - Payload: `paneId` (string)
- `refresh-pane` - Request immediate pane refresh
  - Payload: `paneId` (string)

### Server → Client

- `tmux-pane-{paneId}` - Pane content update
  - Payload: `content` (string)
- `tmux-pane-closed-{paneId}` - Pane was closed
- `error` - Error occurred
  - Payload: `{ message }`

## Tmux Utility Functions

The `utils/tmux.js` module provides:

- `isTmuxAvailable()` - Check if tmux is installed
- `listSessions()` - Get all sessions
- `listPanes(sessionName)` - Get panes in a session
- `listAllPanes()` - Get all panes
- `capturePane(paneId, lines)` - Capture pane content
- `sendKeys(paneId, keys, literal)` - Send keys to pane
- `splitPane(paneId, direction)` - Split a pane
- `killPane(paneId)` - Kill a pane
- `getPaneInfo(paneId)` - Get pane details
- `createSession(name, dir)` - Create new session
- `killSession(name)` - Kill a session
- `resizePane(paneId, direction, amount)` - Resize pane

## WebSocket Streaming

The `websocket/tmux-stream.js` module handles real-time pane streaming:

- Automatic subscription management
- Efficient polling (only for subscribed panes)
- Change detection (only emit on content change)
- Automatic cleanup on disconnect
- Multi-client support

### How it Works

1. Client subscribes to a pane via `subscribe-pane` event
2. Server starts polling that pane every 1 second
3. On content change, server emits update to all subscribed clients
4. When last client unsubscribes, polling stops
5. Automatic cleanup on client disconnect

## Error Handling

All routes use centralized error handling:

- `404` for undefined routes
- `500` for server errors
- JSON error responses with stack traces in development
- Consistent error format: `{ error: string, stack?: string }`

## Testing

### Test Server Startup
```bash
node server.js
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# List tmux sessions
curl http://localhost:3001/api/tmux/sessions

# Check tmux availability
curl http://localhost:3001/api/tmux/check

# Capture pane content
curl http://localhost:3001/api/tmux/capture/0:0.0

# Send keys to pane
curl -X POST http://localhost:3001/api/tmux/send-keys \
  -H "Content-Type: application/json" \
  -d '{"paneId":"0:0.0","keys":"echo hello"}'
```

### Test WebSocket
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('subscribe-pane', '0:0.0');
});

socket.on('tmux-pane-0:0.0', (content) => {
  console.log('Pane content:', content);
});
```

## Dependencies

- **express** (^5.1.0) - Web framework
- **socket.io** (^4.8.1) - WebSocket library
- **cors** (^2.8.5) - CORS middleware

### Dev Dependencies

- **nodemon** (^3.1.11) - Auto-restart on file changes

## Production Considerations

1. **Environment Variables**: Set `NODE_ENV=production`
2. **CORS**: Update CORS settings to restrict origins
3. **Rate Limiting**: Add rate limiting middleware
4. **Authentication**: Add auth middleware if needed
5. **Logging**: Use proper logging library (Winston, Pino)
6. **Process Manager**: Use PM2 or systemd
7. **Monitoring**: Add health checks and metrics

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use: `lsof -i :3001`
- Verify tmux is installed: `which tmux`

### WebSocket not connecting
- Check CORS settings in server.js
- Verify Socket.io client version matches server

### Pane capture fails
- Ensure tmux is running: `tmux ls`
- Verify pane ID format: `session:window.pane` (e.g., `0:0.0`)

## License

MIT
