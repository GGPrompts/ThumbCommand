# Mobile Debugging Guide for ThumbCommand

## Access URLs

**Network URL (use this on mobile):**
```
http://192.168.1.152:3000
```

**Local URL (if on same device):**
```
http://localhost:3000
```

## How to Access Browser Console on Mobile

### Android Chrome
1. Open Chrome on your computer
2. Go to `chrome://inspect`
3. Connect your phone via USB (enable USB debugging)
4. Your mobile browser will appear in the list
5. Click "Inspect" to see console logs

### Android Firefox
1. Open Firefox on your phone
2. Type `about:config` in the address bar
3. Search for `devtools.debugger.remote-enabled`
4. Set it to `true`
5. Connect via Firefox Developer Tools on desktop

### Simple Alternative: Use Eruda
Add this script to see console on mobile:
```javascript
// Paste this in browser address bar (mobile):
javascript:(function(){var script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/eruda';document.body.appendChild(script);script.onload=function(){eruda.init()}})();
```

## What I Fixed

1. **Added Error Boundary**
   - Shows errors visually if app crashes
   - Red error screen with details
   - Reload button

2. **Added Network Access**
   - Server now listens on `0.0.0.0`
   - Accessible from other devices on same network

3. **Added Error Logging**
   - All errors logged to console
   - Unhandled promise rejections caught
   - Startup message logged

## Troubleshooting White Screen

### Check 1: Can you access the server?
```bash
# From Termux, run:
curl http://localhost:3000

# You should see HTML
```

### Check 2: Is JavaScript loading?
Look for this in browser:
- Press and hold on the white screen
- If you see "Reload Page" button, that means error boundary is working

### Check 3: Check network connectivity
Make sure:
- Phone and Termux are on same WiFi network
- No firewall blocking port 3000
- Try http://192.168.1.152:3000 in mobile browser

### Check 4: Try localhost (if on same device)
If you're using a mobile browser on the same phone as Termux:
```
http://localhost:3000
```

## Quick Fixes

### Fix 1: Clear browser cache
1. Go to browser settings
2. Clear cache and data
3. Reload page

### Fix 2: Try different browser
- Chrome
- Firefox
- Brave
- Any modern browser

### Fix 3: Check if backend is running
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok",...}
```

### Fix 4: Restart servers
```bash
# Kill all servers
pkill -f "vite"
pkill -f "node server.js"

# Restart backend
cd /data/data/com.termux/files/home/ThumbCommand/backend
node server.js &

# Restart frontend
cd /data/data/com.termux/files/home/ThumbCommand/frontend-vite
npm run dev
```

## Expected Behavior

When working correctly, you should see:
1. **Beautiful gradient background** (dark gray to black)
2. **"ThumbCommand" title** in large white text
3. **6 colorful feature cards**:
   - Green: tmux Control
   - Blue: Claude Code
   - Purple: Job Scheduler
   - Orange: Terminal
   - Cyan: Termux API
   - Pink: System Status

## If You See Error Boundary

The error boundary will show:
- Red "Oops! Something went wrong" heading
- Error details in a green-text terminal box
- "Reload Page" button

This means the app loaded but encountered an error. The error details will tell us what's wrong.

## Getting Help

If still stuck, check:
1. Is Vite server running? (should see "ready in XXXms")
2. Is backend running? (port 3001)
3. Can you curl localhost:3000 from Termux?
4. Are you on the same WiFi network?

## Current Server Status

Frontend: http://192.168.1.152:3000 ✅
Backend:  http://localhost:3001 ✅

Both servers are running and ready!
