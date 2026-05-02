import { USERNAME, HOSTNAME } from './filesystem';
import { challenges as defaultChallenges } from './ctfLevels';

export interface TerminalLine {
  type: string;
  text?: string;
  items?: { name: string; isDir: boolean }[];
}

// ─── TERMINAL ENGINE ─────────────────────────────────────────────────────────
export function createTerminalEngine(
  initialCwd = '/home/user',
  challengesParam?: Record<number, any>,
  ctfExecute?: (level: number, command: string, currentPath: string, sessionState: any) => Promise<any>
) {
  // Use provided challenges or fall back to default (local) challenges
  const challenges = challengesParam || defaultChallenges;
  let cwd = initialCwd;
  let history: string[] = [];

  return {
    getCwd: (): string => cwd,
    getHistory: (): string[] => [...history],
    async execute(
      cmd: string,
      isCTFMode: boolean,
      currentLevel: number
    ): Promise<TerminalLine[]> {
      const trimmed = cmd.trim();
      if (!trimmed) return [];
      history.push(trimmed);

      const parts = trimmed.split(/\s+/);
      const command = parts[0];

      const promptPath = cwd.replace('/home/user', '~');
      const prompt = `${USERNAME}@${HOSTNAME}:${promptPath}$ ${cmd}`;

      const output = (lines: (string | TerminalLine)[]): TerminalLine[] => [
        { type: 'prompt', text: prompt },
        ...lines.map((l: string | TerminalLine) =>
          typeof l === 'string' ? { type: 'output' as const, text: l } : l
        ),
      ];
      const err = (msg: string): TerminalLine[] =>
        output([{ type: 'error', text: `${command}: ${msg}` }]);

      // When in CTF mode, delegate execution to backend via injected callback.
      if (isCTFMode) {
        if (!ctfExecute) {
          return err('CTF backend execution is unavailable');
        }
        try {
          const resp = await ctfExecute(currentLevel, trimmed, cwd, {});
          console.log('CTF execute response:', resp);

          // SPECIAL HANDLING FOR cd COMMAND (Navigation)
          if (resp && resp.isNavigation && resp.newPath) {
            // Update the current working directory without any output
            cwd = resp.newPath;
            const newPromptPath = cwd.replace('/home/user', '~');
            const newPrompt = `${USERNAME}@${HOSTNAME}:${newPromptPath}$ ${cmd}`;
            return [{ type: 'prompt', text: newPrompt }];
          }

          if (resp && resp.output !== undefined) {
            if (resp.success) return output([{ type: 'output', text: String(resp.output) }]);
            return err(String(resp.output));
          }
        } catch (e: any) {
          // Show detailed error when available to help debugging
          try {
            const msg = e?.response?.data?.message || e?.response?.data?.output || e?.message || 'Execution failed';
            console.log('CTF execute error:', e);
            return err(String(msg));
          } catch (inner) {
            return err('Execution failed');
          }
        }
      }

      // If not in CTF backend mode but the challenge defines custom commands (templates), use them.
      const levelCmds = challenges[currentLevel] && challenges[currentLevel].commands ? challenges[currentLevel].commands : null;
      if (!isCTFMode && Array.isArray(levelCmds) && levelCmds.length > 0) {
        // Try to match either full command or base name; trim stored names to tolerate stray spaces
        const matched = levelCmds.find((c: any) => {
          const stored = (c && c.name) ? String(c.name).trim() : '';
          const full = trimmed;
          const base = command;
          return stored === full || stored === base;
        });
        if (matched) {
          const allowed = Array.isArray(matched.allowedPaths) ? matched.allowedPaths : undefined;
          const blocked = Array.isArray(matched.blockedPaths) ? matched.blockedPaths : undefined;
          // Blocked precedence
          if (Array.isArray(blocked) && blocked.some((p: string) => cwd === p)) {
            return err('Permission denied');
          }
          if (Array.isArray(allowed) && allowed.length > 0) {
            const ok = allowed.some((p: string) => cwd === p);
            if (!ok) return err('Permission denied');
          }
          const out = matched.output || '';
          return output([{ type: 'output', text: String(out) }]);
        }
      }

      // No local commands, all handled by backend or templates
      if (trimmed.startsWith('#')) return [{ type: 'prompt', text: prompt }];
      return [
        { type: 'prompt', text: prompt },
        { type: 'error', text: `${command}: command not found` },
      ];
      return [];
    },
  };
}