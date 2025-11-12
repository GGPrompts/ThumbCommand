import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, TmuxSession, TmuxPane } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCw, Terminal, Send, Trash2 } from "lucide-react";

export default function TmuxViewer() {
  const [sessions, setSessions] = useState<TmuxSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [panes, setPanes] = useState<TmuxPane[]>([]);
  const [paneContents, setPaneContents] = useState<Record<string, string>>({});
  const [commands, setCommands] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchPanes(selectedSession);
      const interval = setInterval(() => fetchPanes(selectedSession), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const data = await api.tmux.getSessions();
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0].session_name);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tmux sessions. Is tmux running?");
      setLoading(false);
    }
  };

  const fetchPanes = async (session: string) => {
    try {
      const data = await api.tmux.getPanes(session);
      setPanes(data);

      // Fetch content for each pane
      for (const pane of data) {
        const content = await api.tmux.capturePane(pane.id);
        setPaneContents(prev => ({ ...prev, [pane.id]: content.content }));
      }
    } catch (err) {
      console.error("Failed to fetch panes:", err);
    }
  };

  const sendCommand = async (paneId: string) => {
    const command = commands[paneId];
    if (!command) return;

    try {
      await api.tmux.sendKeys(paneId, command);
      setCommands(prev => ({ ...prev, [paneId]: "" }));
      // Refresh pane content immediately
      setTimeout(() => {
        if (selectedSession) fetchPanes(selectedSession);
      }, 500);
    } catch (err) {
      console.error("Failed to send command:", err);
    }
  };

  const killPane = async (paneId: string) => {
    try {
      await api.tmux.killPane(paneId);
      if (selectedSession) fetchPanes(selectedSession);
    } catch (err) {
      console.error("Failed to kill pane:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-4 flex items-center justify-center">
        <p className="text-white">Loading tmux sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-4">
        <div className="mx-auto max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-4 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Card className="border-red-800 bg-red-900/20">
            <CardHeader>
              <CardTitle className="text-red-400">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">tmux Viewer</h1>
          <Button
            onClick={() => selectedSession && fetchPanes(selectedSession)}
            variant="outline"
            size="sm"
            className="border-green-600 text-green-400 hover:bg-green-600/20"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Session Tabs */}
        {sessions.length > 0 && (
          <Tabs value={selectedSession} onValueChange={setSelectedSession} className="mb-6">
            <TabsList className="bg-zinc-800 border-zinc-700">
              {sessions.map(session => (
                <TabsTrigger
                  key={session.session_name}
                  value={session.session_name}
                  className="data-[state=active]:bg-green-600"
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  {session.session_name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Panes Grid */}
        {panes.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">No panes found in this session</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {panes.map(pane => (
              <Card key={pane.id} className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-green-400">
                      {pane.command} - {pane.id}
                    </CardTitle>
                    <Button
                      onClick={() => killPane(pane.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {pane.width}x{pane.height} | {pane.title}
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 w-full rounded border border-zinc-800 bg-black p-3">
                    <pre className="font-mono text-xs text-green-400 whitespace-pre-wrap">
                      {paneContents[pane.id] || "Loading..."}
                    </pre>
                  </ScrollArea>

                  <div className="mt-4 flex gap-2">
                    <Input
                      value={commands[pane.id] || ""}
                      onChange={(e) => setCommands(prev => ({ ...prev, [pane.id]: e.target.value }))}
                      placeholder="Enter command..."
                      onKeyDown={(e) => e.key === "Enter" && sendCommand(pane.id)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <Button
                      onClick={() => sendCommand(pane.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
