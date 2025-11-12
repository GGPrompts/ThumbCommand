import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Terminal as TerminalIcon, Send, Trash2 } from "lucide-react";

interface CommandEntry {
  id: number;
  command: string;
  output: string;
  error?: string;
  timestamp: Date;
}

export default function Terminal() {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState("~");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    // Listen for streaming output
    socket.on("command-output", (data: { id: number; output: string }) => {
      setHistory(prev =>
        prev.map(entry =>
          entry.id === data.id
            ? { ...entry, output: entry.output + data.output }
            : entry
        )
      );
    });

    socket.on("command-error", (data: { id: number; error: string }) => {
      setHistory(prev =>
        prev.map(entry =>
          entry.id === data.id
            ? { ...entry, error: (entry.error || "") + data.error }
            : entry
        )
      );
    });

    socket.on("command-complete", (data: { id: number; exitCode: number }) => {
      setLoading(false);
      console.log("Command completed with exit code:", data.exitCode);
    });

    return () => {
      socket.off("command-output");
      socket.off("command-error");
      socket.off("command-complete");
    };
  }, [socket]);

  useEffect(() => {
    // Scroll to bottom when history updates
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async () => {
    if (!command.trim()) return;

    const id = Date.now();
    const newEntry: CommandEntry = {
      id,
      command,
      output: "",
      timestamp: new Date(),
    };

    setHistory(prev => [...prev, newEntry]);
    setLoading(true);

    try {
      // Send command to backend
      socket.emit("execute-command", { id, command, cwd });

      // Also use REST API as fallback
      const result = await api.executeCommand(command, cwd);

      setHistory(prev =>
        prev.map(entry =>
          entry.id === id
            ? { ...entry, output: result.output, error: result.error }
            : entry
        )
      );
    } catch (err) {
      setHistory(prev =>
        prev.map(entry =>
          entry.id === id
            ? { ...entry, error: "Failed to execute command" }
            : entry
        )
      );
    } finally {
      setLoading(false);
      setCommand("");
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const commands = history.map(h => h.command);
      if (historyIndex < commands.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commands[commands.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const commands = history.map(h => h.command);
        setCommand(commands[commands.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Terminal</h1>
          <Button
            onClick={clearHistory}
            variant="outline"
            size="sm"
            className="border-orange-600 text-orange-400 hover:bg-orange-600/20"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-400">
              <TerminalIcon className="mr-2 h-5 w-5" />
              Command Execution
            </CardTitle>
            <p className="text-xs text-zinc-500">Working directory: {cwd}</p>
          </CardHeader>
          <CardContent>
            {/* Terminal Output */}
            <ScrollArea
              ref={scrollRef}
              className="h-[500px] w-full rounded border border-zinc-800 bg-black p-4 mb-4"
            >
              {history.length === 0 ? (
                <p className="text-zinc-600 font-mono text-sm">
                  No commands executed yet. Type a command below to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map(entry => (
                    <div key={entry.id} className="font-mono text-sm">
                      <div className="text-green-400">
                        $ {entry.command}
                      </div>
                      {entry.output && (
                        <pre className="mt-2 text-zinc-300 whitespace-pre-wrap">
                          {entry.output}
                        </pre>
                      )}
                      {entry.error && (
                        <pre className="mt-2 text-red-400 whitespace-pre-wrap">
                          {entry.error}
                        </pre>
                      )}
                      <div className="mt-1 text-xs text-zinc-600">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="text-zinc-500 font-mono text-sm animate-pulse">
                      Executing...
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Command Input */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-md px-3">
                <span className="text-green-400 font-mono">$</span>
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter command (e.g., ls -la, pwd, echo 'hello')"
                  disabled={loading}
                  className="border-0 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                onClick={executeCommand}
                disabled={loading || !command.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              <p>Tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Press Enter to execute command</li>
                <li>Use Arrow Up/Down to navigate command history</li>
                <li>Commands execute in the Termux environment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
