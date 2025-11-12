# Termux API Reference Guide

**Last Updated**: October 30, 2025
**Use Case**: Building Go/Bubbletea TUI tools for Termux with native Android integration

---

## Overview

Termux API provides access to Android device features from the command line. This enables building TUI applications that interact with phone hardware, notifications, sensors, and more - perfect for building automation tools that run 24/7 in the background.

### Key Insight for TUI Development

**Termux runs in background by default** (unless explicitly exited), making it perfect for:
- Always-on automation workers
- Background task processors
- Scheduled jobs with phone integration
- Voice-controlled workflows
- Notification-driven interactions

---

## Installation

```bash
# Install Termux API package
pkg install termux-api

# Also requires Termux:API app from F-Droid or Google Play
# Install from: https://f-droid.org/packages/com.termux.api/
```

---

## Complete API Reference

### 🔔 Notifications & Alerts

#### `termux-notification`
Display Android notifications with interactive buttons.

```bash
# Basic notification
termux-notification \
  --title "Task Complete" \
  --content "Your build finished successfully"

# With action buttons
termux-notification \
  --id "worker-123" \
  --title "🤖 AI Worker" \
  --content "Task #456 complete - 3 files changed" \
  --button1 "View PR" \
  --button1-action "termux-open-url https://github.com/user/repo/pull/123" \
  --button2 "Copy URL" \
  --button2-action "termux-clipboard-set https://github.com/..."

# Persistent notification (stays until dismissed)
termux-notification --ongoing \
  --title "Worker Active" \
  --content "Processing tasks..."

# With priority
termux-notification --priority high \
  --title "Critical Error" \
  --content "Build failed"

# With custom icon
termux-notification --icon sync \
  --title "Syncing Projects"

# Remove notification by ID
termux-notification-remove worker-123

# List active notifications
termux-notification-list
```

**Parameters**:
- `--id <id>` - Unique identifier for updating/removing
- `--title <text>` - Notification title
- `--content <text>` - Notification body
- `--button1/2/3 <text>` - Up to 3 action buttons
- `--button1/2/3-action <command>` - Command to run on button press
- `--ongoing` - Persistent notification (can't swipe away)
- `--priority <level>` - `default`, `high`, `low`, `max`, `min`
- `--icon <name>` - Icon name (e.g., `sync`, `error`, `info`)
- `--vibrate <pattern>` - Vibration pattern in ms (e.g., `100,200,100`)
- `--sound` - Play notification sound

**Use Cases**:
- Task completion alerts
- Progress indicators (ongoing)
- Interactive choices (buttons)
- Error notifications (high priority)

---

#### `termux-toast`
Quick popup messages (brief, non-intrusive).

```bash
# Short toast (2 seconds)
termux-toast "File saved"

# Long toast (4 seconds)
termux-toast -l "Processing complete"

# Custom duration
termux-toast -s "Quick message"
```

**Use Cases**:
- Non-critical status updates
- Confirmations
- Quick feedback

---

#### `termux-vibrate`
Trigger phone vibration.

```bash
# Single vibration (default 1000ms)
termux-vibrate

# Custom duration
termux-vibrate -d 500  # 500ms

# Force vibration even on silent
termux-vibrate -f
```

**Use Cases**:
- Success/failure haptic feedback
- Attention grabber
- Silent notifications

---

### 📅 Background Job Scheduling

#### `termux-job-scheduler`
Schedule scripts to run periodically or at specific times (survives app restart).

```bash
# Run every 30 minutes
termux-job-scheduler \
  --script ~/bin/worker.sh \
  --period-ms 1800000

# Run once at specific time
termux-job-scheduler \
  --script ~/bin/backup.sh \
  --trigger-at "2025-10-31 14:00"

# Require charging
termux-job-scheduler \
  --script ~/bin/heavy-task.sh \
  --period-ms 3600000 \
  --battery-not-low \
  --charging

# Require network
termux-job-scheduler \
  --script ~/bin/sync.sh \
  --period-ms 600000 \
  --network any

# Show all scheduled jobs
termux-job-scheduler --show

# Cancel job by ID
termux-job-scheduler --cancel-all
termux-job-scheduler --cancel 123
```

**Parameters**:
- `--script <path>` - Script to execute
- `--period-ms <ms>` - Repeat interval in milliseconds
- `--trigger-at <time>` - One-time execution time
- `--battery-not-low` - Only run if battery > 15%
- `--charging` - Only run while charging
- `--network <type>` - `any`, `unmetered`, `cellular`, `not_roaming`
- `--idle` - Only run when device is idle
- `--persisted` - Survive device reboot

**Use Cases**:
- AI worker automation (every 30 min)
- Periodic syncing
- Battery-aware heavy tasks
- Network-dependent operations

---

### 🔋 Power Management

#### `termux-wake-lock`
Prevent phone from sleeping.

```bash
# Acquire wake lock
termux-wake-lock

# Release wake lock
termux-wake-unlock
```

**Best Practice**:
```bash
#!/bin/bash
termux-wake-lock
trap "termux-wake-unlock" EXIT  # Always release on exit

# Do work...
```

**Use Cases**:
- Long-running tasks
- Background workers
- File transfers
- Compilations

---

#### `termux-battery-status`
Check battery level and charging status.

```bash
# Get battery info (JSON)
termux-battery-status

# Example output:
{
  "health": "GOOD",
  "percentage": 85,
  "plugged": "PLUGGED_AC",
  "status": "CHARGING",
  "temperature": 25.6,
  "current": -1500000,
  "voltage": 4200
}

# Use in scripts
battery=$(termux-battery-status | jq -r '.percentage')
charging=$(termux-battery-status | jq -r '.status')

if [ "$battery" -lt 20 ] && [ "$charging" != "CHARGING" ]; then
  echo "Low battery, skipping task"
  exit 0
fi
```

**Use Cases**:
- Battery-aware scheduling
- Abort on low power
- Only run intensive tasks when charging

---

### 📋 Clipboard

#### `termux-clipboard-set` / `termux-clipboard-get`
Read/write Android clipboard.

```bash
# Copy to clipboard
echo "https://github.com/repo/pull/123" | termux-clipboard-set

# Read from clipboard
url=$(termux-clipboard-get)

# Copy command output
git log --oneline -1 | termux-clipboard-set
```

**Use Cases**:
- Copy URLs after automation
- Share results with other apps
- Quick data transfer

---

### 💬 Dialog Boxes (User Input)

#### `termux-dialog`
Show native Android dialogs for user input (returns JSON).

```bash
# Confirmation dialog
result=$(termux-dialog confirm \
  -t "Approve PR?" \
  -i "Merge pull request #123?")
choice=$(echo "$result" | jq -r '.text')  # "yes" or "no"

# Text input
result=$(termux-dialog text \
  -t "Commit Message" \
  -i "Enter commit message:")
message=$(echo "$result" | jq -r '.text')

# Password input
result=$(termux-dialog text \
  -t "Enter API Key" \
  -i "API Key:" \
  -p)  # Password mode (hidden)

# Radio buttons (single choice)
result=$(termux-dialog radio \
  -t "Choose Action" \
  -v "Approve,Reject,Review,Cancel")
action=$(echo "$result" | jq -r '.text')

# Checkbox (multiple choice)
result=$(termux-dialog checkbox \
  -t "Select Options" \
  -v "Run Tests,Build,Deploy,Notify")
options=$(echo "$result" | jq -r '.values[]')

# Date picker
result=$(termux-dialog date \
  -t "Select Date" \
  -d "2025-10-30")
date=$(echo "$result" | jq -r '.text')

# Time picker
result=$(termux-dialog time \
  -t "Select Time" \
  -d "14:30")
time=$(echo "$result" | jq -r '.text')

# Spinner (dropdown)
result=$(termux-dialog spinner \
  -t "Choose Model" \
  -v "sonnet,opus,haiku")
model=$(echo "$result" | jq -r '.text')

# Counter
result=$(termux-dialog counter \
  -t "How many tasks?" \
  -r "1,10")  # Range 1-10
count=$(echo "$result" | jq -r '.text')
```

**Parameters**:
- `-t <title>` - Dialog title
- `-i <hint>` - Hint/prompt text
- `-v <values>` - Comma-separated values (for radio/checkbox/spinner)
- `-p` - Password mode (hidden input)
- `-d <default>` - Default value
- `-r <min,max>` - Range for counter

**Use Cases**:
- Interactive TUI workflows
- User approvals
- Configuration input
- Multi-step wizards

---

### 🎤 Voice Input/Output

#### `termux-speech-to-text`
Convert speech to text using Google's speech recognition.

```bash
# Listen and return text
command=$(termux-speech-to-text)

# Use in loop for voice commands
while true; do
  termux-toast "Listening..."
  cmd=$(termux-speech-to-text)

  case "$cmd" in
    *"sync projects"*)
      /sync
      ;;
    *"run worker"*)
      ~/bin/claude-worker.sh
      ;;
    *"stop"*)
      exit 0
      ;;
  esac
done
```

**Use Cases**:
- Voice-controlled automation
- Hands-free operation
- Accessibility features

---

#### `termux-tts-speak`
Text-to-speech output.

```bash
# Basic speech
termux-tts-speak "Task complete"

# With options
termux-tts-speak \
  -e com.google.android.tts \
  -l en-US \
  -p 1.0 \
  -r 1.0 \
  -s STREAM_NOTIFICATION \
  "Your AI worker has finished task number 123"

# List available engines
termux-tts-engines
```

**Parameters**:
- `-e <engine>` - TTS engine (default: system default)
- `-l <locale>` - Language (e.g., `en-US`, `es-ES`)
- `-p <pitch>` - Pitch (0.0-2.0, default 1.0)
- `-r <rate>` - Speed (0.0-2.0, default 1.0)
- `-s <stream>` - Audio stream type

**Use Cases**:
- Completion announcements
- Error alerts
- Status updates
- Accessibility

---

### 📱 SMS (Requires Termux:API app with SMS permissions)

#### `termux-sms-send`
Send SMS messages.

```bash
# Send SMS
termux-sms-send -n "+1234567890" "Task #123 completed"

# Send to multiple numbers
termux-sms-send -n "+1111111111,+2222222222" "Alert message"
```

---

#### `termux-sms-inbox` / `termux-sms-list`
Read SMS messages.

```bash
# Get recent messages
termux-sms-inbox -l 10  # Last 10 messages

# List all conversations
termux-sms-list

# Output is JSON
messages=$(termux-sms-inbox -l 5)
echo "$messages" | jq -r '.[] | "\(.number): \(.body)"'
```

**Use Cases**:
- SMS-based approvals
- Critical alerts
- Remote control via SMS

---

### 📸 Camera & Media

#### `termux-camera-photo`
Take photos.

```bash
# List cameras
termux-camera-info

# Take photo with back camera
termux-camera-photo ~/photo.jpg

# Front camera
termux-camera-photo -c 1 ~/selfie.jpg
```

---

#### `termux-camera-video`
Record video.

```bash
# Record 10 second video
termux-camera-video ~/video.mp4 -d 10
```

**Use Cases**:
- Time-lapse automation
- Security monitoring
- Visual proof of task completion

---

### 📍 Location & Sensors

#### `termux-location`
Get GPS coordinates.

```bash
# Get current location
termux-location

# Example output:
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "altitude": 10.5,
  "accuracy": 20.0,
  "bearing": 45.0,
  "speed": 0.0,
  "provider": "gps"
}

# Use in geofencing
location=$(termux-location)
lat=$(echo "$location" | jq -r '.latitude')
lon=$(echo "$location" | jq -r '.longitude')

# Only run tasks when at specific location (home/office)
if is_at_home "$lat" "$lon"; then
  run_automation
fi
```

---

#### `termux-sensor`
Access device sensors.

```bash
# List available sensors
termux-sensor -l

# Read accelerometer
termux-sensor -s accelerometer

# Continuous reading with delay
termux-sensor -s light -d 1000  # Every 1 second

# All sensors at once
termux-sensor -a
```

**Available sensors**:
- `accelerometer` - Motion detection
- `light` - Ambient light
- `proximity` - Object proximity
- `gyroscope` - Rotation
- `magnetic_field` - Compass
- `pressure` - Barometric pressure
- `temperature` - Device temperature
- `humidity` - Air humidity

**Use Cases**:
- Detect phone movement/activity
- Light-based automation (day/night)
- Environmental monitoring

---

### 🌐 Network & Connectivity

#### `termux-wifi-connectioninfo`
Get WiFi connection details.

```bash
termux-wifi-connectioninfo

# Example output:
{
  "ssid": "MyNetwork",
  "bssid": "00:11:22:33:44:55",
  "ip": "192.168.1.100",
  "mac": "aa:bb:cc:dd:ee:ff",
  "rssi": -45,
  "link_speed_mbps": 866,
  "frequency_mhz": 5180
}

# Only run on specific network
wifi=$(termux-wifi-connectioninfo)
ssid=$(echo "$wifi" | jq -r '.ssid')

if [ "$ssid" == "HomeNetwork" ]; then
  # Safe to run automation at home
  run_worker
fi
```

---

#### `termux-wifi-scaninfo`
Scan for available WiFi networks.

```bash
termux-wifi-scaninfo

# Returns array of networks
networks=$(termux-wifi-scaninfo)
echo "$networks" | jq -r '.[] | "\(.ssid): \(.rssi)dBm"'
```

---

#### `termux-wifi-enable`
Enable/disable WiFi.

```bash
# Enable WiFi
termux-wifi-enable true

# Disable WiFi
termux-wifi-enable false
```

**Use Cases**:
- Network-aware automation
- WiFi-based geofencing
- Automatic network switching

---

### 🔊 Audio & Volume

#### `termux-volume`
Get/set volume levels.

```bash
# Get current volume
termux-volume

# Set music volume (0-15)
termux-volume music 10

# Mute notifications during work
termux-volume notification 0

# Restore after
termux-volume notification 7
```

**Streams**:
- `alarm` - Alarm volume
- `music` - Media playback
- `notification` - Notification sounds
- `ring` - Ringtone
- `system` - System sounds
- `call` - Phone call volume

---

#### `termux-microphone-record`
Record audio.

```bash
# Record 5 seconds
termux-microphone-record -f ~/recording.m4a -d 5

# Continuous recording (Ctrl+C to stop)
termux-microphone-record -f ~/recording.m4a
```

**Use Cases**:
- Voice memos
- Audio logging
- Dictation

---

### 📱 Phone & Telephony

#### `termux-telephony-call`
Make phone call.

```bash
termux-telephony-call "+1234567890"
```

---

#### `termux-telephony-cellinfo`
Get cell tower info.

```bash
termux-telephony-cellinfo

# Returns cell tower data (for location approximation)
```

---

#### `termux-telephony-deviceinfo`
Get device information.

```bash
termux-telephony-deviceinfo

# Example output:
{
  "phone_type": "GSM",
  "network_operator": "Verizon",
  "network_operator_name": "Verizon Wireless",
  "network_country_iso": "us",
  "sim_country_iso": "us",
  "sim_operator": "310995",
  "sim_operator_name": "Verizon"
}
```

---

### 🎨 UI Customization

#### `termux-brightness`
Control screen brightness.

```bash
# Get current brightness (0-255)
termux-brightness

# Set brightness
termux-brightness 128  # Half brightness

# Max brightness for outdoor use
termux-brightness 255

# Min brightness for night
termux-brightness 10
```

---

#### `termux-wallpaper`
Change wallpaper.

```bash
# Set wallpaper from file
termux-wallpaper -f ~/wallpaper.jpg

# Set from URL
termux-wallpaper -u https://example.com/image.jpg

# Lock screen wallpaper
termux-wallpaper -l -f ~/lock.jpg
```

---

#### `termux-torch`
Control flashlight.

```bash
# Turn on
termux-torch on

# Turn off
termux-torch off
```

---

### 🔐 Security & Authentication

#### `termux-fingerprint`
Request fingerprint authentication.

```bash
# Authenticate user
result=$(termux-fingerprint -t "Approve task execution")

# Check result
if echo "$result" | jq -e '.auth_result == "AUTH_RESULT_SUCCESS"' > /dev/null; then
  run_sensitive_operation
else
  echo "Authentication failed"
fi
```

**Use Cases**:
- Secure approvals
- Protected operations
- Multi-factor auth

---

### 📦 Storage & Files

#### `termux-storage-get`
Open file picker dialog.

```bash
# Let user select file
file=$(termux-storage-get ~/selected-file.txt)

echo "User selected: $file"
```

---

#### `termux-share`
Share files to other apps.

```bash
# Share file
termux-share ~/report.pdf

# Share text
echo "Hello!" | termux-share

# Share with specific action
termux-share -a send ~/file.txt

# Share to specific app
termux-share -a send --chooser ~/file.txt
```

**Use Cases**:
- Export results
- Send reports via email
- Share to Slack/Discord

---

#### `termux-download`
Download files using Android's download manager.

```bash
# Download file
termux-download https://example.com/file.zip

# Download with title and description
termux-download \
  -t "Project Backup" \
  -d "Automated backup from worker" \
  https://example.com/backup.tar.gz
```

---

### 📞 Call Log

#### `termux-call-log`
Access call history.

```bash
# Get recent calls
termux-call-log -l 10

# Output is JSON with call history
calls=$(termux-call-log)
echo "$calls" | jq -r '.[] | "\(.name): \(.type) \(.date)"'
```

---

### 💾 SAF (Storage Access Framework)

Access external storage (SD card, USB OTG, cloud storage).

```bash
# List directories
termux-saf-ls <saf-path>

# Read file
termux-saf-read <saf-path>

# Write file
termux-saf-write <saf-path> < input.txt

# Create directory
termux-saf-mkdir <saf-path>

# Remove file/dir
termux-saf-rm <saf-path>

# Get file stats
termux-saf-stat <saf-path>
```

---

## AI Worker Implementation Example

Complete example of a background AI worker with Termux API integration:

```bash
#!/bin/bash
# ~/bin/claude-worker-full.sh

# Acquire wake lock
termux-wake-lock
trap cleanup EXIT

cleanup() {
  termux-wake-unlock
  termux-notification-remove "claude-worker"
}

# Check battery and network
battery=$(termux-battery-status | jq -r '.percentage')
charging=$(termux-battery-status | jq -r '.status')
wifi=$(termux-wifi-connectioninfo | jq -r '.ssid')

# Only run if charging or high battery
if [ "$battery" -lt 20 ] && [ "$charging" != "CHARGING" ]; then
  termux-notification --priority high \
    --title "⚠️ Worker Skipped" \
    --content "Low battery: $battery%"
  exit 0
fi

# Only run on trusted network (optional)
if [ "$wifi" != "HomeNetwork" ]; then
  termux-toast "Not on trusted network, skipping"
  exit 0
fi

# Show ongoing notification
termux-notification --id "claude-worker" --ongoing \
  --title "🤖 AI Worker Active" \
  --content "Checking for tasks..."

# Announce start
termux-tts-speak "Starting AI worker"

# Fetch tasks from GitHub
tasks=$(gh issue list --label "claude-auto" --json number,title,body)
task_count=$(echo "$tasks" | jq 'length')

if [ "$task_count" -eq 0 ]; then
  termux-toast "No tasks found"
  termux-notification-remove "claude-worker"
  exit 0
fi

# Update notification
termux-notification --id "claude-worker" --ongoing \
  --title "🤖 Processing $task_count tasks" \
  --content "Working..."

success_count=0
fail_count=0

# Process each task
echo "$tasks" | jq -c '.[]' | while read -r task; do
  issue_num=$(echo "$task" | jq -r '.number')
  title=$(echo "$task" | jq -r '.title')
  body=$(echo "$task" | jq -r '.body')

  termux-toast "Working on #$issue_num"

  cd ~/TFE || exit 1
  git checkout -b "auto/issue-$issue_num"

  # Execute with Claude Code
  result=$(claude -p "$body" \
    --permission-mode acceptEdits \
    --allowed-tools "Edit Read Write Bash Grep Glob" \
    --output-format json \
    2>&1)

  success=$(echo "$result" | jq -r '.success // false')

  if [ "$success" == "true" ]; then
    # Commit and push
    git add .
    git commit -m "🤖 Auto: $title (#$issue_num)"
    git push origin "auto/issue-$issue_num"

    # Create PR
    pr_url=$(gh pr create \
      --title "🤖 Auto: $title" \
      --body "Automated by Claude Worker. Closes #$issue_num" \
      --label "automated" | tail -1)

    # Update issue
    gh issue edit "$issue_num" \
      --remove-label "claude-auto" \
      --add-label "needs-review"

    ((success_count++))
    termux-vibrate -d 100  # Success vibration

    # Copy PR URL to clipboard
    echo "$pr_url" | termux-clipboard-set
  else
    ((fail_count++))
    termux-vibrate -d 500  # Failure vibration (longer)

    # Post error to issue
    error=$(echo "$result" | jq -r '.error // "Unknown error"')
    gh issue comment "$issue_num" --body "❌ Automation failed: $error"
  fi

  git checkout main
  sleep 5  # Rate limiting
done

# Final notification with action buttons
termux-notification --id "claude-worker-done" \
  --title "✅ AI Worker Complete" \
  --content "$success_count succeeded, $fail_count failed" \
  --priority high \
  --vibrate "100,50,100" \
  --button1 "View PRs" \
  --button1-action "termux-open-url https://github.com/GGPrompts/TFE/pulls" \
  --button2 "View Issues" \
  --button2-action "termux-open-url https://github.com/GGPrompts/TFE/issues"

# Announce completion
if [ "$fail_count" -eq 0 ]; then
  termux-tts-speak "All $success_count tasks completed successfully"
else
  termux-tts-speak "$success_count tasks succeeded, $fail_count failed"
fi

# Copy summary
summary="AI Worker: $success_count/$task_count tasks completed"
echo "$summary" | termux-clipboard-set

termux-toast "$summary"
```

---

## Go/Bubbletea Integration Patterns

### Calling Termux API from Go

```go
package main

import (
    "encoding/json"
    "os/exec"
)

// Send notification
func Notify(title, content string) error {
    cmd := exec.Command("termux-notification",
        "--title", title,
        "--content", content,
    )
    return cmd.Run()
}

// Get battery status
type BatteryStatus struct {
    Health     string  `json:"health"`
    Percentage int     `json:"percentage"`
    Plugged    string  `json:"plugged"`
    Status     string  `json:"status"`
    Temperature float64 `json:"temperature"`
}

func GetBatteryStatus() (*BatteryStatus, error) {
    cmd := exec.Command("termux-battery-status")
    output, err := cmd.Output()
    if err != nil {
        return nil, err
    }

    var status BatteryStatus
    err = json.Unmarshal(output, &status)
    return &status, err
}

// Show toast
func Toast(message string) error {
    cmd := exec.Command("termux-toast", message)
    return cmd.Run()
}

// Vibrate
func Vibrate(duration int) error {
    cmd := exec.Command("termux-vibrate", "-d", fmt.Sprintf("%d", duration))
    return cmd.Run()
}

// Show dialog
type DialogResult struct {
    Code int    `json:"code"`
    Text string `json:"text"`
}

func ShowConfirm(title, message string) (bool, error) {
    cmd := exec.Command("termux-dialog", "confirm",
        "-t", title,
        "-i", message,
    )
    output, err := cmd.Output()
    if err != nil {
        return false, err
    }

    var result DialogResult
    err = json.Unmarshal(output, &result)
    if err != nil {
        return false, err
    }

    return result.Text == "yes", nil
}

// Speech to text
func SpeechToText() (string, error) {
    cmd := exec.Command("termux-speech-to-text")
    output, err := cmd.Output()
    if err != nil {
        return "", err
    }
    return string(output), nil
}

// Text to speech
func Speak(text string) error {
    cmd := exec.Command("termux-tts-speak", text)
    return cmd.Run()
}

// Get location
type Location struct {
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
    Altitude  float64 `json:"altitude"`
    Accuracy  float64 `json:"accuracy"`
}

func GetLocation() (*Location, error) {
    cmd := exec.Command("termux-location")
    output, err := cmd.Output()
    if err != nil {
        return nil, err
    }

    var loc Location
    err = json.Unmarshal(output, &loc)
    return &loc, err
}
```

### Bubbletea TUI with Termux Integration

```go
package main

import (
    "fmt"
    tea "github.com/charmbracelet/bubbletea"
)

type model struct {
    battery     int
    charging    bool
    tasks       []string
    cursor      int
}

type batteryMsg BatteryStatus
type tasksMsg []string

func checkBattery() tea.Msg {
    status, err := GetBatteryStatus()
    if err != nil {
        return nil
    }
    return batteryMsg(*status)
}

func fetchTasks() tea.Msg {
    // Fetch from GitHub API
    tasks := []string{"Task 1", "Task 2", "Task 3"}
    return tasksMsg(tasks)
}

func (m model) Init() tea.Cmd {
    return tea.Batch(
        checkBattery,
        fetchTasks,
        tea.Tick(time.Minute, func(t time.Time) tea.Msg {
            return checkBattery()
        }),
    )
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case batteryMsg:
        m.battery = msg.Percentage
        m.charging = msg.Status == "CHARGING"

    case tasksMsg:
        m.tasks = []string(msg)
        Notify("Tasks Updated", fmt.Sprintf("Found %d tasks", len(m.tasks)))

    case tea.KeyMsg:
        switch msg.String() {
        case "q", "ctrl+c":
            return m, tea.Quit

        case "up":
            if m.cursor > 0 {
                m.cursor--
                Vibrate(50) // Haptic feedback
            }

        case "down":
            if m.cursor < len(m.tasks)-1 {
                m.cursor++
                Vibrate(50)
            }

        case "enter":
            // Process selected task
            Toast(fmt.Sprintf("Processing: %s", m.tasks[m.cursor]))
            Speak("Processing task")
            // ... start task
        }
    }

    return m, nil
}

func (m model) View() string {
    s := fmt.Sprintf("🔋 Battery: %d%% ", m.battery)
    if m.charging {
        s += "⚡\n\n"
    } else {
        s += "\n\n"
    }

    s += "Tasks:\n"
    for i, task := range m.tasks {
        cursor := " "
        if m.cursor == i {
            cursor = ">"
        }
        s += fmt.Sprintf("%s %s\n", cursor, task)
    }

    s += "\nPress q to quit.\n"
    return s
}
```

---

## TUI Design Considerations for Termux

### Screen Size Constraints

Termux keyboard takes significant space - design for **~20 lines visible**.

```go
// Check terminal size
width, height, _ := term.GetSize(int(os.Stdout.Fd()))

// Adjust layout for small screen
maxVisible := height - 5  // Leave room for header/footer
```

### Touch-Friendly UI

```go
// Use mouse events for touch
case tea.MouseMsg:
    if msg.Type == tea.MouseLeft {
        // Handle tap
        m.cursor = msg.Y - headerHeight
    }
```

### Battery-Aware Design

```go
// Reduce refresh rate on low battery
func (m model) tickInterval() time.Duration {
    if m.battery < 20 {
        return time.Second * 5  // Slow updates
    }
    return time.Second  // Normal
}
```

### Background Operation

```go
// Run TUI in background with notifications
func main() {
    if os.Getenv("BACKGROUND") == "1" {
        // Headless mode - use notifications
        RunWorker()
    } else {
        // Interactive TUI mode
        p := tea.NewProgram(initialModel())
        p.Run()
    }
}
```

---

## Project Ideas for Termux TUI

### 1. AI Worker Dashboard
- Live view of running tasks
- Battery/network status
- Quick approve/reject tasks
- Voice commands
- Background mode with notifications

### 2. Project Sync Manager
- One-tap sync all repos
- Show sync status
- Battery-aware scheduling
- Notification on completion

### 3. GitHub Kanban Board TUI
- View/edit project boards
- Drag/drop cards (touch)
- Auto-label for automation
- Voice input for new cards

### 4. System Monitor
- Battery, network, CPU
- Sensor data visualization
- Alert on thresholds
- Historical graphs

### 5. Voice-Controlled File Manager
- TFE with voice commands
- "Open downloads"
- "Delete old files"
- Hands-free operation

---

## Resources

- **Termux Wiki**: https://wiki.termux.com/wiki/Termux:API
- **GitHub**: https://github.com/termux/termux-api
- **Bubbletea**: https://github.com/charmbracelet/bubbletea
- **Go exec package**: https://pkg.go.dev/os/exec

---

## Tips for Tomorrow's Coding Session 🚀

1. **Start simple**: Build basic notification/toast wrappers first
2. **Test each API**: Run commands manually to understand behavior
3. **Battery awareness**: Always check battery before heavy work
4. **Error handling**: Termux API commands can fail silently
5. **JSON parsing**: Most APIs return JSON - use `jq` or Go's `encoding/json`
6. **Wake locks**: Always release wake locks (use `trap` in bash, `defer` in Go)
7. **Permissions**: Some APIs need permissions granted first (SMS, location, etc.)
8. **Small screen**: Design for ~20 visible lines
9. **Touch-friendly**: Large tap targets, mouse event support
10. **Background mode**: Design for both interactive and headless operation

**Use that 50% Claude max wisely - you've got this!** 💪

---

## Changelog

- **2025-10-30**: Initial reference guide created
  - Documented all Termux API commands
  - Added Go integration examples
  - Included Bubbletea patterns
  - Added TUI design considerations for Termux environment
