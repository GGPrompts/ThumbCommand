import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">
            ThumbCommand
          </h1>
          <p className="text-lg text-zinc-400">
            Mobile-friendly dashboard for tmux, Termux & Claude Code
          </p>
        </header>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tmux Integration */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-green-400">tmux Control</CardTitle>
              <CardDescription className="text-zinc-500">
                View and interact with tmux sessions and panes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-400">
                • Live pane content streaming
                <br />
                • Send commands to panes
                <br />
                • Split & manage layouts
                <br />
                • Session switching
              </p>
              <Link to="/tmux">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Open tmux Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Claude Code */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-blue-400">Claude Code</CardTitle>
              <CardDescription className="text-zinc-500">
                Execute Claude Code with live output streaming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-400">
                • Real-time output streaming
                <br />
                • Project selection
                <br />
                • Prompt history
                <br />
                • Multi-mode support
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Job Scheduler */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-purple-400">Job Scheduler</CardTitle>
              <CardDescription className="text-zinc-500">
                Schedule commands with termux-job-scheduler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-400">
                • Visual calendar interface
                <br />
                • Condition-based triggers
                <br />
                • Recurring jobs
                <br />
                • Job management
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Terminal */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-orange-400">Terminal</CardTitle>
              <CardDescription className="text-zinc-500">
                Execute commands directly from the web interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-400">
                • Interactive terminal
                <br />
                • Command history
                <br />
                • Output streaming
                <br />
                • Working directory control
              </p>
              <Link to="/terminal">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Open Terminal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Termux API */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-cyan-400">Termux API</CardTitle>
              <CardDescription className="text-zinc-500">
                Access device features via Termux API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-400">
                • Battery monitoring
                <br />
                • Notifications
                <br />
                • Vibration & Toast
                <br />
                • WiFi status
              </p>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-pink-400">System Status</CardTitle>
              <CardDescription className="text-zinc-500">
                Monitor system resources and health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-400">
                • Battery level & status
                <br />
                • Network connectivity
                <br />
                • Active sessions
                <br />
                • Resource usage
              </p>
              <Button className="w-full bg-pink-600 hover:bg-pink-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Footer */}
        <footer className="mt-12 text-center text-sm text-zinc-500">
          <p>
            Built with Vite, React, shadcn/ui, and Tailwind CSS
            <br />
            Backend: Express + Socket.io | APIs: tmux, Claude Code, Termux
          </p>
        </footer>
      </div>
    </div>
  );
}
