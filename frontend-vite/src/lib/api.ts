const API_BASE = 'http://localhost:3001/api';

export interface TmuxSession {
  session_attached: number;
  session_created: number;
  session_group: string;
  session_id: string;
  session_name: string;
  session_windows: number;
}

export interface TmuxPane {
  id: string;
  width: number;
  height: number;
  command: string;
  title: string;
}

export interface CommandResult {
  output: string;
  error?: string;
  exitCode?: number;
}

export const api = {
  // Tmux operations
  tmux: {
    async getSessions(): Promise<TmuxSession[]> {
      const res = await fetch(`${API_BASE}/tmux/sessions`);
      return res.json();
    },

    async getPanes(session: string): Promise<TmuxPane[]> {
      const res = await fetch(`${API_BASE}/tmux/panes/${session}`);
      return res.json();
    },

    async capturePane(paneId: string, lines: number = 1000): Promise<{ content: string; paneId: string }> {
      const res = await fetch(`${API_BASE}/tmux/capture/${paneId}?lines=${lines}`);
      return res.json();
    },

    async sendKeys(paneId: string, keys: string): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/tmux/send-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paneId, keys }),
      });
      return res.json();
    },

    async splitPane(paneId: string, direction: 'horizontal' | 'vertical'): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/tmux/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paneId, direction }),
      });
      return res.json();
    },

    async killPane(paneId: string): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/tmux/kill-pane/${paneId}`, {
        method: 'DELETE',
      });
      return res.json();
    },
  },

  // Command execution
  async executeCommand(command: string, cwd?: string): Promise<CommandResult> {
    const res = await fetch(`${API_BASE}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, cwd }),
    });
    return res.json();
  },

  // Health check
  async health(): Promise<{ status: string }> {
    const res = await fetch('http://localhost:3001/health');
    return res.json();
  },
};
