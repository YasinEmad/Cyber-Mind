import React from 'react';
import { FileSystem, resolvePath, USERNAME, HOSTNAME } from './filesystem';
import { challenges as defaultChallenges } from './ctfLevels';

export interface TerminalLine {
  type: string;
  text?: string;
  items?: { name: string; isDir: boolean }[];
}

// ─── TERMINAL ENGINE ─────────────────────────────────────────────────────────
export function createTerminalEngine(initialCwd = '/home/user', challengesParam?: Record<number, any>) {
  // Use provided challenges or fall back to default (local) challenges
  const challenges = challengesParam || defaultChallenges;
  let cwd = initialCwd;
  let history: string[] = [];
  let env: { [key: string]: string } = {
    USER: USERNAME,
    HOME: '/home/user',
    SHELL: '/bin/bash',
    TERM: 'xterm-256color',
    PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  };

  return {
    getCwd: (): string => cwd,
    getHistory: (): string[] => [...history],
    async execute(
      cmd: string,
      fsRef: FileSystem,
      setFs: React.Dispatch<React.SetStateAction<FileSystem>>,
      isCTFMode: boolean,
      currentLevel: number,
      setCtfNotification: React.Dispatch<React.SetStateAction<string | null>>
    ): Promise<TerminalLine[]> {
      const trimmed = cmd.trim();
      if (!trimmed) return [];
      history.push(trimmed);

      const parts = trimmed.split(/\s+/);
      const command = parts[0];
      const args = parts.slice(1);
      const fs = fsRef;

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

      // When in CTF mode, delegate execution to backend (single source of truth)
      if (isCTFMode) {
        try {
          // Import ctfService lazily to avoid circular deps
          // Use the API to execute this command on backend with current path
          // @ts-ignore - dynamic import resolved at build
          const { ctfService } = require('../api/ctfService');
          const resp = await ctfService.executeCTFCommand(currentLevel, trimmed, cwd, {});
          if (resp && resp.output !== undefined) {
            if (resp.success) return output([{ type: 'output', text: String(resp.output) }]);
            return err(String(resp.output));
          }
        } catch (e) {
          return err('Execution failed');
        }
      }

      // If not in CTF backend mode but the challenge defines custom commands (templates), use them.
      const levelCmds = challenges[currentLevel] && challenges[currentLevel].commands ? challenges[currentLevel].commands : null;
      if (!isCTFMode && Array.isArray(levelCmds) && levelCmds.length > 0) {
        // Try to match either full command or base name
        const matched = levelCmds.find((c: any) => (c.name === trimmed) || (c.name === command));
        if (matched) {
          const allowed = Array.isArray(matched.allowedPaths) ? matched.allowedPaths : undefined;
          const blocked = Array.isArray(matched.blockedPaths) ? matched.blockedPaths : undefined;
          // Blocked precedence
          if (Array.isArray(blocked) && blocked.some((p: string) => cwd === p || cwd.startsWith(p + '/'))) {
            return err('Permission denied');
          }
          if (Array.isArray(allowed) && allowed.length > 0) {
            const ok = allowed.some((p: string) => cwd === p || cwd.startsWith(p + '/'));
            if (!ok) return err('Permission denied');
          }
          const out = matched.output || '';
          return output([{ type: 'output', text: String(out) }]);
        }
      }

      switch (command) {
        case 'pwd':
          return output([{ type: 'output', text: cwd }]);

        case 'ls': {
          const flags = args.filter((arg) => arg.startsWith('-'));
          const targets = args.filter((arg) => !arg.startsWith('-'));
          const targetArg = targets[0];
          const showHidden = flags.includes('-a') || flags.includes('-la') || flags.includes('-al');
          const longFlag = flags.includes('-l') || flags.includes('-la') || flags.includes('-al');
          const target = targetArg ? resolvePath(cwd, targetArg) : cwd;
          const node = fs[target];
          if (!node)
            return err(`cannot access '${targetArg || args[0]}': No such file or directory`);
          if (node.type === 'file') return output([{ type: 'output', text: targetArg || target }]);
          const children = node.children || [];
          if (children.length === 0) return output([]);
          const visibleChildren = showHidden
            ? children
            : children.filter((c: string) => !c.startsWith('.'));
          if (longFlag) {
            const lines = ['total ' + visibleChildren.length * 4];
            visibleChildren.forEach((c: string) => {
              const childPath = (target === '/' ? '' : target) + '/' + c;
              const child = fs[childPath];
              const isDir = child && child.type === 'dir';
              const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
              const size = isDir ? 4096 : child?.content?.length || 0;
              lines.push(
                `${perm}  1 ${USERNAME} ${USERNAME} ${String(size).padStart(8)} Nov 15 10:00 ${
                  isDir ? '\x1b[34m' + c + '\x1b[0m' : c
                }`
              );
            });
            return output(lines.map((l) => ({ type: 'output', text: l })));
          }
          return output([
            {
              type: 'ls-output',
              items: visibleChildren.map((c: string) => {
                const childPath = (target === '/' ? '' : target) + '/' + c;
                const child = fs[childPath];
                return { name: c, isDir: child && child.type === 'dir' };
              }),
            },
          ]);
        }

        case 'cd': {
          const target = args[0] || '/home/user';
          const newPath = resolvePath(cwd, target);
          const node = fs[newPath];
          if (!node) return err(`${args[0]}: No such file or directory`);
          if (node.type !== 'dir') return err(`${args[0]}: Not a directory`);
          cwd = newPath;
          return [{ type: 'prompt', text: prompt }];
        }

        case 'mkdir': {
          if (!args[0]) return err('missing operand');
          const newPath = resolvePath(cwd, args[0]);
          if (fs[newPath]) return err(`cannot create directory '${args[0]}': File exists`);
          const parentParts = newPath.split('/');
          const parentPath = parentParts.slice(0, -1).join('/') || '/';
          const dirName = parentParts[parentParts.length - 1];
          const parent = fs[parentPath];
          if (!parent || parent.type !== 'dir')
            return err(`cannot create directory '${args[0]}': No such file or directory`);
          setFs((prev) => ({
            ...prev,
            [parentPath]: { ...parent, children: [...(parent.children || []), dirName] },
            [newPath]: { type: 'dir', children: [] },
          }));
          return [{ type: 'prompt', text: prompt }];
        }

        case 'touch': {
          if (!args[0]) return err('missing file operand');
          const newPath = resolvePath(cwd, args[0]);
          if (fs[newPath]) return [{ type: 'prompt', text: prompt }];
          const parentParts = newPath.split('/');
          const parentPath = parentParts.slice(0, -1).join('/') || '/';
          const fileName = parentParts[parentParts.length - 1];
          const parent = fs[parentPath];
          if (!parent || parent.type !== 'dir')
            return err(`cannot touch '${args[0]}': No such file or directory`);
          setFs((prev) => ({
            ...prev,
            [parentPath]: { ...parent, children: [...(parent.children || []), fileName] },
            [newPath]: { type: 'file', content: '' },
          }));
          return [{ type: 'prompt', text: prompt }];
        }

        case 'rm': {
          if (!args[0]) return err('missing operand');
          const targetPath = resolvePath(cwd, args[0]);
          const node2 = fs[targetPath];
          if (!node2) return err(`cannot remove '${args[0]}': No such file or directory`);
          if (
            node2.type === 'dir' &&
            !args.includes('-r') &&
            !args.includes('-rf')
          )
            return err(`cannot remove '${args[0]}': Is a directory`);
          const parentParts2 = targetPath.split('/');
          const parentPath2 = parentParts2.slice(0, -1).join('/') || '/';
          const nodeName = parentParts2[parentParts2.length - 1];
          setFs((prev) => {
            const next = { ...prev };
            const par = {
              ...next[parentPath2],
              children: (next[parentPath2]?.children || []).filter((c) => c !== nodeName),
            };
            next[parentPath2] = par;
            delete next[targetPath];
            return next;
          });
          return [{ type: 'prompt', text: prompt }];
        }

        case 'cat': {
          if (!args[0]) return err('missing file operand');
          const targetPath = resolvePath(cwd, args[0]);
          const node3 = fs[targetPath];
          if (!node3) return err(`${args[0]}: No such file or directory`);
          if (node3.type === 'dir') return err(`${args[0]}: Is a directory`);
          const contentLines = (node3.content || '').split('\n');
          return output(contentLines.map((l: string) => ({ type: 'output' as const, text: l })));
        }

        case 'echo': {
          const msg = args.join(' ').replace(/^['"]|['"]$/g, '');
          return output([{ type: 'output', text: msg }]);
        }

        case 'clear':
          return [{ type: 'clear' }];

        case 'whoami':
          return output([{ type: 'output', text: USERNAME }]);

        case 'date':
          return output([{ type: 'output', text: new Date().toString() }]);

        case 'uname': {
          const flag = args[0];
          if (flag === '-a')
            return output([
              {
                type: 'output',
                text: `Linux ${HOSTNAME} 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Fri Sep 27 14:36:45 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux`,
              },
            ]);
          if (flag === '-r')
            return output([{ type: 'output', text: '6.8.0-45-generic' }]);
          return output([{ type: 'output', text: 'Linux' }]);
        }

        case 'history': {
          const lines3 = history.map((h: string, i: number) => ({
            type: 'output' as const,
            text: `  ${String(i + 1).padStart(4)}  ${h}`,
          }));
          return output(lines3);
        }

        case 'env':
        case 'printenv': {
          const envLines = Object.entries(env).map(([k, v]) => ({
            type: 'output' as const,
            text: `${k}=${v}`,
          }));
          return output(envLines);
        }

        case 'export': {
          if (args[0] && args[0].includes('=')) {
            const [k, ...v] = args[0].split('=');
            env[k] = v.join('=');
          }
          return [{ type: 'prompt', text: prompt }];
        }

        case 'cp':
          return err('cp: missing destination file operand');

        case 'mv': {
          if (args.length < 2) return err('mv: missing destination file operand');
          const src = resolvePath(cwd, args[0]);
          const dst = resolvePath(cwd, args[1]);
          const srcNode = fs[src];
          if (!srcNode)
            return err(`cannot stat '${args[0]}': No such file or directory`);
          setFs((prev) => {
            const next = { ...prev };
            const srcParts = src.split('/');
            const srcName = srcParts[srcParts.length - 1];
            const srcParent = srcParts.slice(0, -1).join('/') || '/';
            next[srcParent] = {
              ...next[srcParent],
              children: (next[srcParent]?.children || []).filter((c) => c !== srcName),
            };
            const dstParts = dst.split('/');
            const dstName = dstParts[dstParts.length - 1];
            const dstParent = dstParts.slice(0, -1).join('/') || '/';
            if (next[dstParent])
              next[dstParent] = {
                ...next[dstParent],
                children: [...(next[dstParent]?.children || []), dstName],
              };
            next[dst] = srcNode;
            delete next[src];
            return next;
          });
          return [{ type: 'prompt', text: prompt }];
        }

        case 'grep': {
          if (args.length < 2) return err('usage: grep PATTERN FILE');
          const pattern = args[0];
          const filePath = resolvePath(cwd, args[args.length - 1]);
          const fileNode = fs[filePath];
          if (!fileNode || fileNode.type !== 'file')
            return err(`${args[args.length - 1]}: No such file or directory`);
          const matches = (fileNode.content || '')
            .split('\n')
            .filter((l: string) => l.includes(pattern));
          return output(matches.map((l: string) => ({ type: 'output' as const, text: l })));
        }

        case 'wc': {
          if (!args[0]) return err('missing file operand');
          const fp = resolvePath(cwd, args[0]);
          const fn2 = fs[fp];
          if (!fn2 || fn2.type !== 'file')
            return err(`${args[0]}: No such file or directory`);
          const content = fn2.content || '';
          const lineCount = content.split('\n').length;
          const wordCount = content.split(/\s+/).filter(Boolean).length;
          const charCount = content.length;
          return output([
            {
              type: 'output' as const,
              text: ` ${lineCount} ${wordCount} ${charCount} ${args[0]}`,
            },
          ]);
        }

        case 'find': {
          const results = Object.keys(fs).filter((k) => k.startsWith(cwd));
          return output(
            results.map((r) => ({
              type: 'output',
              text: r.replace(cwd === '/' ? '' : cwd, '.') || '.',
            }))
          );
        }

        case 'which': {
          if (!args[0]) return err('missing argument');
          const binPath = '/usr/bin/' + args[0];
          if (fs[binPath]) return output([{ type: 'output', text: binPath }]);
          return output([{ type: 'error', text: args[0] + ' not found' }]);
        }

        case 'man':
          return output([
            { type: 'output', text: `What manual page do you want? Use 'help' for built-in commands.` },
          ]);

        case 'sudo': {
          if (args[0] === 'apt' || args[0] === 'apt-get') {
            return output([
              { type: 'output', text: '[sudo] password for user: ' },
              { type: 'output', text: 'Reading package lists... Done' },
              { type: 'output', text: 'Building dependency tree... Done' },
              {
                type: 'output',
                text: '0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.',
              },
            ]);
          }
          return err('sudo: command not found in sandbox');
        }

        case 'apt':
        case 'apt-get':
          return output([
            {
              type: 'output',
              text: 'E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)',
            },
          ]);

        case 'python3':
        case 'python':
          if (args[0] === '--version' || args[0] === '-V')
            return output([{ type: 'output', text: 'Python 3.12.3' }]);
          return output([
            {
              type: 'output',
              text: 'Python 3.12.3 (simulated)\nType "exit()" or Ctrl+D to exit.',
            },
          ]);

        case 'node':
          if (args[0] === '--version' || args[0] === '-v')
            return output([{ type: 'output', text: 'v20.17.0' }]);
          return output([
            { type: 'output', text: 'Welcome to Node.js v20.17.0 (simulated).' },
          ]);

        case 'git': {
          const sub = args[0];
          if (sub === '--version')
            return output([{ type: 'output', text: 'git version 2.43.0' }]);
          if (sub === 'status')
            return output([
              {
                type: 'output',
                text: 'On branch main\nnothing to commit, working tree clean',
              },
            ]);
          if (sub === 'log')
            return output([
              { type: 'output', text: 'commit a1b2c3d4e5f6 (HEAD -> main)' },
              { type: 'output', text: 'Author: User <user@ubuntu>' },
              { type: 'output', text: 'Date:   Thu Nov 14 10:00:00 2024' },
              { type: 'output', text: '' },
              { type: 'output', text: '    Initial commit' },
            ]);
          return output([
            { type: 'output', text: `git ${args.join(' ')}: simulated` },
          ]);
        }

        case 'ls-colors':
        case 'dircolors':
          return output([{ type: 'output', text: 'Colors enabled' }]);

        case 'help': {
          const baseCommands = [
            { type: 'output', text: 'Available commands:' },
            { type: 'output', text: '' },
            { type: 'output', text: '  File System:' },
            { type: 'output', text: '    pwd           Print working directory' },
            { type: 'output', text: '    ls [-la]       List directory contents' },
            { type: 'output', text: '    cd [DIR]       Change directory' },
            { type: 'output', text: '    mkdir DIR      Create directory' },
            { type: 'output', text: '    touch FILE     Create empty file' },
            { type: 'output', text: '    rm [-r] PATH   Remove file/directory' },
            { type: 'output', text: '    mv SRC DST     Move/rename file' },
            { type: 'output', text: '    cat FILE       Display file contents' },
            { type: 'output', text: '    find            Find files' },
            { type: 'output', text: '' },
            { type: 'output', text: '  Text Processing:' },
            { type: 'output', text: '    echo [TEXT]    Display text' },
            { type: 'output', text: '    grep PAT FILE  Search file for pattern' },
            { type: 'output', text: '    wc FILE        Word count' },
            { type: 'output', text: '' },
            { type: 'output', text: '  System:' },
            { type: 'output', text: '    whoami         Current username' },
            { type: 'output', text: '    date           Current date and time' },
            { type: 'output', text: '    uname [-a/-r]  System information' },
            { type: 'output', text: '    history        Command history' },
            { type: 'output', text: '    env            Environment variables' },
            { type: 'output', text: '    which CMD      Locate a command' },
            { type: 'output', text: '    clear           Clear terminal' },
            { type: 'output', text: '' },
            { type: 'output', text: '  Tools:' },
            { type: 'output', text: '    git [CMD]      Git version control' },
            { type: 'output', text: '    python3        Python interpreter' },
            { type: 'output', text: '    node           Node.js runtime' },
          ];
          if (isCTFMode) {
            baseCommands.push(
              { type: 'output' as const, text: '' },
              { type: 'output' as const, text: '  CTF:' },
              { type: 'output' as const, text: '    submit FLAG    Submit flag for current level' },
              { type: 'output' as const, text: '    hint           Show hint for current level' }
            );
          }
          return output(baseCommands);
        }

        case 'submit': {
          if (!isCTFMode) return err('CTF mode not active.');
          if (args.length === 0) return err('usage: submit <flag>');
          const flag = args[0];
          if (flag === challenges[currentLevel]?.flag) {
            setCtfNotification('Congratulations! Level completed.');
          } else {
            return err('Incorrect flag.');
          }
          break;
        }

        case 'hint': {
          if (!isCTFMode) return err('CTF mode not active.');
          const hs = challenges[currentLevel]?.hints;
          const hintText = Array.isArray(hs) ? hs[0] : hs || 'No hint available.';
          return output([{ type: 'output', text: hintText }]);
        }

        default:
          if (trimmed.startsWith('#')) return [{ type: 'prompt', text: prompt }];
          return [
            { type: 'prompt', text: prompt },
            { type: 'error', text: `${command}: command not found` },
          ];
      }
      return [];
    },
  };
}
