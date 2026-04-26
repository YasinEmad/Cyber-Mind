import React, { useState, useEffect, useRef, useCallback, useContext, createContext, useReducer } from 'react';
import './LinuxPage.css';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface FileSystemNode {
  type: 'file' | 'dir';
  children?: string[];
  content?: string;
}

interface FileSystem {
  [path: string]: FileSystemNode;
}

interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'ls-output' | 'clear';
  text?: string;
  items?: { name: string; isDir: boolean }[];
}

interface WindowState {
  id: number;
  appId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  zIndex: number;
  entering?: boolean;
}

interface OSState {
  windows: WindowState[];
  zCounter: number;
  activeWindow: number | null;
  notification?: string;
}

interface OSAction {
  type: 'OPEN_WINDOW' | 'CLOSE_WINDOW' | 'MINIMIZE_WINDOW' | 'FOCUS_WINDOW' | 'MOVE_WINDOW' | 'RESIZE_WINDOW' | 'CLEAR_ENTERING' | 'SET_NOTIFICATION';
  id?: number;
  appId?: string;
  title?: string;
  forceNew?: boolean;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  notification?: string;
}

interface OSContextType {
  fs: FileSystem;
  setFs: React.Dispatch<React.SetStateAction<FileSystem>>;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const USERNAME = 'user';
const HOSTNAME = 'ubuntu';
const VERSION = '24.04 LTS';

// ─── VIRTUAL FILE SYSTEM ─────────────────────────────────────────────────────
const initialFS: FileSystem = {
  '/': { type: 'dir', children: ['home', 'etc', 'usr', 'var', 'tmp', 'dev'] },
  '/home': { type: 'dir', children: ['user'] },
  '/home/user': { type: 'dir', children: ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos', '.bashrc', '.profile'] },
  '/home/user/Desktop': { type: 'dir', children: ['readme.txt', 'todo.txt'] },
  '/home/user/Documents': { type: 'dir', children: ['notes.txt', 'resume.pdf', 'projects'] },
  '/home/user/Documents/projects': { type: 'dir', children: ['webapp', 'scripts'] },
  '/home/user/Documents/projects/webapp': { type: 'dir', children: ['index.html', 'app.js', 'style.css'] },
  '/home/user/Documents/projects/scripts': { type: 'dir', children: ['backup.sh', 'deploy.sh'] },
  '/home/user/Downloads': { type: 'dir', children: ['ubuntu-24.04.iso', 'wallpaper.png'] },
  '/home/user/Pictures': { type: 'dir', children: ['screenshot.png', 'avatar.jpg'] },
  '/home/user/Music': { type: 'dir', children: [] },
  '/home/user/Videos': { type: 'dir', children: [] },
  '/etc': { type: 'dir', children: ['passwd', 'hosts', 'fstab', 'hostname'] },
  '/usr': { type: 'dir', children: ['bin', 'lib', 'share'] },
  '/usr/bin': { type: 'dir', children: ['bash', 'python3', 'node', 'git', 'vim'] },
  '/usr/lib': { type: 'dir', children: [] },
  '/usr/share': { type: 'dir', children: [] },
  '/var': { type: 'dir', children: ['log', 'cache'] },
  '/var/log': { type: 'dir', children: ['syslog', 'auth.log'] },
  '/var/cache': { type: 'dir', children: [] },
  '/tmp': { type: 'dir', children: [] },
  '/dev': { type: 'dir', children: ['null', 'zero', 'random'] },
  // Files
  '/home/user/.bashrc': { type: 'file', content: '# ~/.bashrc: executed by bash for non-login shells.\nexport PS1="\\u@\\h:\\w\\$ "\nexport PATH="$HOME/.local/bin:$PATH"\nalias ll=\'ls -alF\'\nalias la=\'ls -A\'\nalias l=\'ls -CF\'' },
  '/home/user/.profile': { type: 'file', content: '# ~/.profile: executed by the command interpreter for login shells.\nif [ -n "$BASH_VERSION" ]; then\n  if [ -f "$HOME/.bashrc" ]; then\n    . "$HOME/.bashrc"\n  fi\nfi' },
  '/home/user/Desktop/readme.txt': { type: 'file', content: 'Welcome to Ubuntu 24.04 LTS!\n\nThis is a simulated Ubuntu desktop environment running in your browser.\nYou can open the Terminal to explore the virtual file system.\n\nTry these commands:\n  ls, cd, pwd, mkdir, touch, cat, echo, help\n\nEnjoy!' },
  '/home/user/Desktop/todo.txt': { type: 'file', content: 'TODO List\n=========\n[ ] Update system packages\n[ ] Configure SSH keys\n[ ] Set up development environment\n[ ] Install VS Code\n[x] Install Ubuntu\n[x] Configure network' },
  '/home/user/Documents/notes.txt': { type: 'file', content: 'Meeting Notes - Q4 Planning\n============================\nDate: 2024-11-15\n\n- Discussed roadmap for next quarter\n- Assigned tasks to team members\n- Set deadlines for major milestones\n\nAction Items:\n1. Review codebase\n2. Write documentation\n3. Deploy to production' },
  '/home/user/Documents/resume.pdf': { type: 'file', content: '[Binary PDF file - cannot display in terminal]' },
  '/home/user/Documents/projects/webapp/index.html': { type: 'file', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Web App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <script src="app.js"><\/script>\n</body>\n</html>' },
  '/home/user/Documents/projects/webapp/app.js': { type: 'file', content: '// Main application entry point\nconsole.log("App initialized");\n\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("DOM ready");\n});' },
  '/home/user/Documents/projects/webapp/style.css': { type: 'file', content: 'body {\n  margin: 0;\n  font-family: sans-serif;\n  background: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n  padding: 20px;\n}' },
  '/home/user/Documents/projects/scripts/backup.sh': { type: 'file', content: '#!/bin/bash\n# Backup script\necho "Starting backup..."\ntar -czf backup_$(date +%Y%m%d).tar.gz ~/Documents\necho "Backup complete!"' },
  '/home/user/Documents/projects/scripts/deploy.sh': { type: 'file', content: '#!/bin/bash\n# Deploy script\necho "Deploying application..."\ngit pull origin main\nnpm install\nnpm run build\necho "Deployment complete!"' },
  '/etc/hostname': { type: 'file', content: 'ubuntu' },
  '/etc/hosts': { type: 'file', content: '127.0.0.1\tlocalhost\n127.0.1.1\tubuntu\n::1\t\tlocalhost ip6-localhost ip6-loopback' },
  '/etc/passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:Ubuntu User:/home/user:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin' },
  '/etc/fstab': { type: 'file', content: '# /etc/fstab: static file system information.\nUUID=xxx / ext4 errors=remount-ro 0 1\nUUID=yyy /boot/efi vfat umask=0077 0 1' },
  '/var/log/syslog': { type: 'file', content: 'Nov 15 10:00:01 ubuntu kernel: [    0.000000] Booting Linux on physical CPU 0x0\nNov 15 10:00:01 ubuntu kernel: [    0.000000] Linux version 6.8.0-45-generic\nNov 15 10:00:02 ubuntu systemd[1]: Started System Logging Service.\nNov 15 10:00:03 ubuntu NetworkManager[852]: <info> NetworkManager activated.' },
  '/var/log/auth.log': { type: 'file', content: 'Nov 15 10:05:01 ubuntu sudo: user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/usr/bin/apt update\nNov 15 10:05:45 ubuntu sshd[1234]: Accepted publickey for user from 192.168.1.100' },
  '/dev/null': { type: 'file', content: '' },
  '/dev/zero': { type: 'file', content: '[Device file - outputs null bytes]' },
  '/dev/random': { type: 'file', content: '[Device file - outputs random bytes]' },
  '/home/user/Downloads/ubuntu-24.04.iso': { type: 'file', content: '[Binary ISO file - 1.5GB]' },
  '/home/user/Downloads/wallpaper.png': { type: 'file', content: '[Binary image file]' },
  '/home/user/Pictures/screenshot.png': { type: 'file', content: '[Binary image file]' },
  '/home/user/Pictures/avatar.jpg': { type: 'file', content: '[Binary image file]' },
  '/usr/bin/bash': { type: 'file', content: '[Binary executable]' },
  '/usr/bin/python3': { type: 'file', content: '[Binary executable]' },
  '/usr/bin/node': { type: 'file', content: '[Binary executable]' },
  '/usr/bin/git': { type: 'file', content: '[Binary executable]' },
  '/usr/bin/vim': { type: 'file', content: '[Binary executable]' },
};

// ─── TERMINAL ENGINE ─────────────────────────────────────────────────────────
function resolvePath(current: string, target: string): string {
  if (!target) return current;
  let parts: string[];
  let base: string;
  if (target.startsWith('/')) { base = '/'; parts = target.split('/').filter(Boolean); }
  else { base = current; parts = target.split('/').filter(Boolean); }
  let path = base === '/' ? '' : base;
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') {
      const segs = path.split('/').filter(Boolean);
      segs.pop();
      path = '/' + segs.join('/');
      if (path === '/') path = '';
    } else {
      path = path + '/' + p;
    }
  }
  return path === '' ? '/' : path;
}

function createTerminalEngine(initialCwd = '/home/user') {
  let cwd = initialCwd;
  let history: string[] = [];
  let env: { [key: string]: string } = { USER: USERNAME, HOME: '/home/user', SHELL: '/bin/bash', TERM: 'xterm-256color', PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' };

  return {
    getCwd: (): string => cwd,
    getHistory: (): string[] => [...history],
    execute(cmd: string, fsRef: FileSystem, setFs: React.Dispatch<React.SetStateAction<FileSystem>>): TerminalLine[] {
      const trimmed = cmd.trim();
      if (!trimmed) return [];
      history.push(trimmed);

      const parts = trimmed.split(/\s+/);
      const command = parts[0];
      const args = parts.slice(1);
      const fs = fsRef;

      const promptPath = cwd.replace('/home/user', '~');
      const prompt = `${USERNAME}@${HOSTNAME}:${promptPath}$ ${cmd}`;

      const output = (lines: (string | TerminalLine)[]): TerminalLine[] => [{ type: 'prompt', text: prompt }, ...lines.map((l: string | TerminalLine) => typeof l === 'string' ? { type: 'output' as const, text: l } : l)];
      const err = (msg: string): TerminalLine[] => output([{ type: 'error', text: `${command}: ${msg}` }]);

      switch (command) {
        case 'pwd': return output([{ type: 'output', text: cwd }]);

        case 'ls': {
          const target = args[0] ? resolvePath(cwd, args[0]) : cwd;
          const node = fs[target];
          if (!node) return err(`cannot access '${args[0]}': No such file or directory`);
          if (node.type === 'file') return output([{ type: 'output', text: args[0] || target }]);
          const children = node.children || [];
          if (children.length === 0) return output([]);
          const longFlag = args.includes('-l') || args.includes('-la') || args.includes('-al') || args.includes('-a');
          if (longFlag) {
            const lines = ['total ' + children.length * 4];
            children.forEach((c: string) => {
              const childPath = (target === '/' ? '' : target) + '/' + c;
              const child = fs[childPath];
              const isDir = child && child.type === 'dir';
              const hidden = c.startsWith('.');
              if (!longFlag && hidden) return;
              const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
              const size = isDir ? 4096 : (child?.content?.length || 0);
              lines.push(`${perm}  1 ${USERNAME} ${USERNAME} ${String(size).padStart(8)} Nov 15 10:00 ${isDir ? '\x1b[34m' + c + '\x1b[0m' : c}`);
            });
            return output(lines.map(l => ({ type: 'output', text: l })));
          }
          const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
          const filteredChildren = showHidden ? children : children.filter((c: string) => !c.startsWith('.'));
          return output([{ type: 'ls-output', items: filteredChildren.map((c: string) => {
            const childPath = (target === '/' ? '' : target) + '/' + c;
            const child = fs[childPath];
            return { name: c, isDir: child && child.type === 'dir' };
          })}]);
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
          if (!parent || parent.type !== 'dir') return err(`cannot create directory '${args[0]}': No such file or directory`);
          setFs(prev => ({
            ...prev,
            [parentPath]: { ...parent, children: [...(parent.children || []), dirName] },
            [newPath]: { type: 'dir', children: [] }
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
          if (!parent || parent.type !== 'dir') return err(`cannot touch '${args[0]}': No such file or directory`);
          setFs(prev => ({
            ...prev,
            [parentPath]: { ...parent, children: [...(parent.children || []), fileName] },
            [newPath]: { type: 'file', content: '' }
          }));
          return [{ type: 'prompt', text: prompt }];
        }

        case 'rm': {
          if (!args[0]) return err('missing operand');
          const targetPath = resolvePath(cwd, args[0]);
          const node2 = fs[targetPath];
          if (!node2) return err(`cannot remove '${args[0]}': No such file or directory`);
          if (node2.type === 'dir' && !args.includes('-r') && !args.includes('-rf')) return err(`cannot remove '${args[0]}': Is a directory`);
          const parentParts2 = targetPath.split('/');
          const parentPath2 = parentParts2.slice(0,-1).join('/') || '/';
          const nodeName = parentParts2[parentParts2.length-1];
          setFs(prev => {
            const next = {...prev};
            const par = {...next[parentPath2], children: (next[parentPath2]?.children||[]).filter(c=>c!==nodeName)};
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

        case 'clear': return [{ type: 'clear' }];

        case 'whoami': return output([{ type: 'output', text: USERNAME }]);

        case 'date': return output([{ type: 'output', text: new Date().toString() }]);

        case 'uname': {
          const flag = args[0];
          if (flag === '-a') return output([{ type: 'output', text: `Linux ${HOSTNAME} 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Fri Sep 27 14:36:45 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux` }]);
          if (flag === '-r') return output([{ type: 'output', text: '6.8.0-45-generic' }]);
          return output([{ type: 'output', text: 'Linux' }]);
        }

        case 'history': {
          const lines3 = history.map((h: string, i: number) => ({ type: 'output' as const, text: `  ${String(i+1).padStart(4)}  ${h}` }));
          return output(lines3);
        }

        case 'env': case 'printenv': {
          const envLines = Object.entries(env).map(([k, v]) => ({ type: 'output' as const, text: `${k}=${v}` }));
          return output(envLines);
        }

        case 'export': {
          if (args[0] && args[0].includes('=')) {
            const [k, ...v] = args[0].split('=');
            env[k] = v.join('=');
          }
          return [{ type: 'prompt', text: prompt }];
        }

        case 'cp': return err('cp: missing destination file operand');

        case 'mv': {
          if (args.length < 2) return err('mv: missing destination file operand');
          const src = resolvePath(cwd, args[0]);
          const dst = resolvePath(cwd, args[1]);
          const srcNode = fs[src];
          if (!srcNode) return err(`cannot stat '${args[0]}': No such file or directory`);
          setFs(prev => {
            const next = {...prev};
            const srcParts = src.split('/'); const srcName = srcParts[srcParts.length-1];
            const srcParent = srcParts.slice(0,-1).join('/')||'/';
            next[srcParent] = {...next[srcParent], children: (next[srcParent]?.children||[]).filter(c=>c!==srcName)};
            const dstParts = dst.split('/'); const dstName = dstParts[dstParts.length-1];
            const dstParent = dstParts.slice(0,-1).join('/')||'/';
            if (next[dstParent]) next[dstParent] = {...next[dstParent], children: [...(next[dstParent]?.children||[]), dstName]};
            next[dst] = srcNode;
            delete next[src];
            return next;
          });
          return [{ type: 'prompt', text: prompt }];
        }

        case 'grep': {
          if (args.length < 2) return err('usage: grep PATTERN FILE');
          const pattern = args[0];
          const filePath = resolvePath(cwd, args[args.length-1]);
          const fileNode = fs[filePath];
          if (!fileNode || fileNode.type !== 'file') return err(`${args[args.length-1]}: No such file or directory`);
          const matches = (fileNode.content||'').split('\n').filter((l: string) => l.includes(pattern));
          return output(matches.map((l: string) => ({ type: 'output' as const, text: l })));
        }

        case 'wc': {
          if (!args[0]) return err('missing file operand');
          const fp = resolvePath(cwd, args[0]);
          const fn2 = fs[fp];
          if (!fn2 || fn2.type !== 'file') return err(`${args[0]}: No such file or directory`);
          const content = fn2.content || '';
          const lineCount = content.split('\n').length;
          const wordCount = content.split(/\s+/).filter(Boolean).length;
          const charCount = content.length;
          return output([{ type: 'output' as const, text: ` ${lineCount} ${wordCount} ${charCount} ${args[0]}` }]);
        }

        case 'find': {
          const results = Object.keys(fs).filter(k => k.startsWith(cwd));
          return output(results.map(r => ({ type: 'output', text: r.replace(cwd === '/' ? '' : cwd, '.') || '.' })));
        }

        case 'which': {
          if (!args[0]) return err('missing argument');
          const binPath = '/usr/bin/' + args[0];
          if (fs[binPath]) return output([{ type: 'output', text: binPath }]);
          return output([{ type: 'error', text: args[0] + ' not found' }]);
        }

        case 'man': return output([{ type: 'output', text: `What manual page do you want? Use 'help' for built-in commands.` }]);

        case 'sudo': {
          if (args[0] === 'apt' || args[0] === 'apt-get') {
            return output([
              { type: 'output', text: '[sudo] password for user: ' },
              { type: 'output', text: 'Reading package lists... Done' },
              { type: 'output', text: 'Building dependency tree... Done' },
              { type: 'output', text: '0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.' }
            ]);
          }
          return err('sudo: command not found in sandbox');
        }

        case 'apt': case 'apt-get': return output([{ type: 'output', text: 'E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)' }]);

        case 'python3': case 'python':
          if (args[0] === '--version' || args[0] === '-V') return output([{ type: 'output', text: 'Python 3.12.3' }]);
          return output([{ type: 'output', text: 'Python 3.12.3 (simulated)\nType "exit()" or Ctrl+D to exit.' }]);

        case 'node':
          if (args[0] === '--version' || args[0] === '-v') return output([{ type: 'output', text: 'v20.17.0' }]);
          return output([{ type: 'output', text: 'Welcome to Node.js v20.17.0 (simulated).' }]);

        case 'git': {
          const sub = args[0];
          if (sub === '--version') return output([{ type: 'output', text: 'git version 2.43.0' }]);
          if (sub === 'status') return output([{ type: 'output', text: 'On branch main\nnothing to commit, working tree clean' }]);
          if (sub === 'log') return output([
            { type: 'output', text: 'commit a1b2c3d4e5f6 (HEAD -> main)' },
            { type: 'output', text: 'Author: User <user@ubuntu>' },
            { type: 'output', text: 'Date:   Thu Nov 14 10:00:00 2024' },
            { type: 'output', text: '' },
            { type: 'output', text: '    Initial commit' }
          ]);
          return output([{ type: 'output', text: `git ${args.join(' ')}: simulated` }]);
        }

        case 'ls-colors': case 'dircolors': return output([{ type: 'output', text: 'Colors enabled' }]);

        case 'help':
          return output([
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
          ]);

        default:
          if (trimmed.startsWith('#')) return [{ type: 'prompt', text: prompt }];
          return [{ type: 'prompt', text: prompt }, { type: 'error', text: `${command}: command not found` }];
      }
    }
  };
}

// ─── OS CONTEXT ──────────────────────────────────────────────────────────────
const OSContext = createContext<OSContextType | null>(null);

function osReducer(state: OSState, action: OSAction): OSState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      if (!action.appId) return state;
      const existing = state.windows.find(w => w.appId === action.appId && !action.forceNew);
      if (existing) {
        return { ...state, windows: state.windows.map(w => w.id === existing.id ? { ...w, minimized: false, zIndex: state.zCounter + 1 } : w), zCounter: state.zCounter + 1, activeWindow: existing.id };
      }
      const id = Date.now() + Math.random();
      const defaults = appDefaults[action.appId] || { w: 800, h: 500 };
      const offset = state.windows.length * 30;
      const newWin: WindowState = { id, appId: action.appId, title: action.title || '', x: 100 + offset, y: 60 + offset, w: defaults.w, h: defaults.h, minimized: false, zIndex: state.zCounter + 1, entering: true };
      return { ...state, windows: [...state.windows, newWin], zCounter: state.zCounter + 1, activeWindow: id };
    }
    case 'CLOSE_WINDOW':
      if (!action.id) return state;
      return { ...state, windows: state.windows.filter(w => w.id !== action.id), activeWindow: state.windows.filter(w => w.id !== action.id).slice(-1)[0]?.id || null };
    case 'MINIMIZE_WINDOW':
      if (!action.id) return state;
      return { ...state, windows: state.windows.map(w => w.id === action.id ? { ...w, minimized: true } : w), activeWindow: null };
    case 'FOCUS_WINDOW':
      if (!action.id) return state;
      return { ...state, windows: state.windows.map(w => w.id === action.id ? { ...w, zIndex: state.zCounter + 1, minimized: false } : w), zCounter: state.zCounter + 1, activeWindow: action.id };
    case 'MOVE_WINDOW':
      if (!action.id) return state;
      return { ...state, windows: state.windows.map(w => w.id === action.id ? { ...w, x: action.x || 0, y: action.y || 0 } : w) };
    case 'RESIZE_WINDOW':
      if (!action.id) return state;
      return { ...state, windows: state.windows.map(w => w.id === action.id ? { ...w, w: Math.max(400, action.w || 400), h: Math.max(300, action.h || 300) } : w) };
    case 'CLEAR_ENTERING':
      if (!action.id) return state;
      return { ...state, windows: state.windows.map(w => w.id === action.id ? { ...w, entering: false } : w) };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.notification };
    default: return state;
  }
}

const appDefaults: { [key: string]: { w: number; h: number } } = {
  terminal: { w: 800, h: 500 },
  files: { w: 900, h: 550 },
  settings: { w: 850, h: 580 },
  about: { w: 600, h: 450 },
  browser: { w: 1000, h: 650 },
};

const appMeta: { [key: string]: { title: string; icon: string; color: string } } = {
  terminal: { title: 'Terminal', icon: '⬛', color: '#2d2d2d' },
  files: { title: 'Files', icon: '📁', color: '#e95420' },
  settings: { title: 'Settings', icon: '⚙️', color: '#4a4a4a' },
  about: { title: 'About This System', icon: 'ℹ️', color: '#1d6996' },
  browser: { title: 'Browser', icon: '🌐', color: '#1565c0' },
};

// ─── BOOT SCREEN ─────────────────────────────────────────────────────────────
function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const msgs = ['Loading kernel modules...', 'Starting system services...', 'Mounting filesystems...', 'Starting network...', 'Starting desktop environment...', 'Welcome!'];
  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const np = Math.min(p + (Math.random() * 8 + 3), 100);
        if (np >= 100) { clearInterval(t); setTimeout(onDone, 700); }
        return np;
      });
    }, 120);
    const pt = setInterval(() => setPhase(p => Math.min(p + 1, msgs.length - 1)), 700);
    return () => { clearInterval(t); clearInterval(pt); };
  }, [onDone]);
  return (
    <div className="boot-screen fixed inset-0 flex flex-col items-center justify-center" style={{background:'#300a24'}}>
      <div className="flex flex-col items-center gap-8">
        <div className="boot-logo">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#e95420" strokeWidth="3"/>
            <circle cx="40" cy="14" r="8" fill="#e95420"/>
            <circle cx="65" cy="57" r="8" fill="#e95420"/>
            <circle cx="15" cy="57" r="8" fill="#e95420"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white text-xl font-light mb-1" style={{fontFamily:'Ubuntu, sans-serif'}}>Ubuntu</p>
          <p className="text-white/50 text-sm">{VERSION}</p>
        </div>
        <div className="w-64">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: progress + '%'}} />
          </div>
        </div>
        <p className="text-white/40 text-xs terminal-font min-h-4">{msgs[phase]}</p>
      </div>
    </div>
  );
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────
function TopBar({ onAppOpen }: { onAppOpen: (appId: string) => void }) {
  const [time, setTime] = useState(new Date());
  const [showSysMenu, setShowSysMenu] = useState(false);
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (d: Date) => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="topbar fixed top-0 left-0 right-0 h-9 flex items-center justify-between px-4 z-50 select-none" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors" onClick={() => onAppOpen('about')}>
          <svg width="16" height="16" viewBox="0 0 80 80" className="opacity-80">
            <circle cx="40" cy="40" r="33" fill="none" stroke="#e95420" strokeWidth="4"/>
            <circle cx="40" cy="15" r="7" fill="#e95420"/>
            <circle cx="63" cy="55" r="7" fill="#e95420"/>
            <circle cx="17" cy="55" r="7" fill="#e95420"/>
          </svg>
          <span className="text-white/80 text-xs font-medium">Activities</span>
        </div>
        <div className="flex gap-1 text-white/60 text-xs">
          {['Files','Terminal','Browser'].map(a => (
            <button key={a} onClick={() => onAppOpen(a.toLowerCase())}
              className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white/90 transition-colors">
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white/70 text-xs clock-text">{fmtDate(time)} {fmt(time)}</span>
        <div className="flex items-center gap-2 text-white/60">
          <span title="Network" className="text-sm">📶</span>
          <span title="Sound" className="text-sm">🔊</span>
          <span title="Battery" className="text-sm">🔋</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowSysMenu(s => !s)}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors">
            <span className="text-white/80 text-xs">{USERNAME}</span>
            <span className="text-white/40 text-xs">▾</span>
          </button>
          {showSysMenu && (
            <div className="context-menu absolute right-0 top-full mt-1 py-1 z-50">
              <div className="px-4 py-2 border-b border-white/10 mb-1">
                <p className="text-white text-sm font-medium">{USERNAME}</p>
                <p className="text-white/40 text-xs">{USERNAME}@{HOSTNAME}</p>
              </div>
              {[['⚙️ Settings', 'settings'], ['ℹ️ About', 'about']].map(([l, a]) => (
                <div key={a} className="context-menu-item" onClick={() => { onAppOpen(a); setShowSysMenu(false); }}>{l}</div>
              ))}
              <div className="context-menu-sep"/>
              <div className="context-menu-item text-red-400" onClick={() => window.location.reload()}>⏻ Power Off</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DOCK ─────────────────────────────────────────────────────────────────────
const dockApps = [
  { id: 'files',    label: 'Files',    emoji: '📁' },
  { id: 'terminal', label: 'Terminal', emoji: '💻' },
  { id: 'browser',  label: 'Browser',  emoji: '🌐' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
  { id: 'about',    label: 'About',    emoji: 'ℹ️' },
];

function Dock({ onAppOpen, openApps }: { onAppOpen: (appId: string) => void; openApps: string[] }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex items-end gap-2 px-4 py-2 rounded-2xl dock-bar"
      style={{transform:'translateX(-50%)'}}>
      {dockApps.map(app => {
        const isOpen = openApps.includes(app.id);
        return (
          <div key={app.id} className="relative dock-item flex flex-col items-center cursor-pointer" onClick={() => onAppOpen(app.id)}>
            <div className="absolute -top-8 left-1/2 dock-tooltip opacity-0 transition-all pointer-events-none bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
              style={{transform:'translateX(-50%)'}}>
              {app.label}
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{background: isOpen ? 'rgba(233,84,32,0.2)' : 'rgba(255,255,255,0.08)', border: isOpen ? '1px solid rgba(233,84,32,0.4)' : '1px solid rgba(255,255,255,0.08)'}}>
              {app.emoji}
            </div>
            {isOpen && <div className="w-1 h-1 rounded-full bg-white/70 mt-1" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── WINDOW MANAGER ──────────────────────────────────────────────────────────
function WindowFrame({ win, dispatch, children, isActive }: {
  win: WindowState;
  dispatch: React.Dispatch<OSAction>;
  children: React.ReactNode;
  isActive: boolean;
}) {
  const startRef = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (win.entering) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_ENTERING', id: win.id }), 300);
      return () => clearTimeout(t);
    }
  }, [win.entering, dispatch, win.id]);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    dispatch({ type: 'FOCUS_WINDOW', id: win.id });
    startRef.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y };
    const onMove = (ev: MouseEvent) => {
      if (!startRef.current) return;
      dispatch({ type: 'MOVE_WINDOW', id: win.id, x: startRef.current.wx + ev.clientX - startRef.current.mx, y: Math.max(36, startRef.current.wy + ev.clientY - startRef.current.my) });
    };
    const onUp = () => { startRef.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => dispatch({ type: 'CLOSE_WINDOW', id: win.id }), 150);
  };

  if (win.minimized) return null;

  return (
    <div className={`fixed rounded-xl overflow-hidden window-shadow ${win.entering ? 'window-entering' : ''} ${leaving ? 'window-leaving' : ''}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.zIndex, outline: isActive ? '1px solid rgba(233,84,32,0.3)' : 'none' }}
      onMouseDown={() => dispatch({ type: 'FOCUS_WINDOW', id: win.id })}>
      {/* Title bar */}
      <div className="window-titlebar h-9 flex items-center px-3 gap-2 cursor-default select-none" onMouseDown={onMouseDown}>
        <div className="no-drag flex items-center gap-1.5">
          <button onClick={handleClose} className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center group transition-colors">
            <span className="opacity-0 group-hover:opacity-100 text-red-900 text-xs leading-none">✕</span>
          </button>
          <button onClick={() => dispatch({ type: 'MINIMIZE_WINDOW', id: win.id })} className="w-3.5 h-3.5 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center group transition-colors">
            <span className="opacity-0 group-hover:opacity-100 text-yellow-900 text-xs leading-none">−</span>
          </button>
          <button className="w-3.5 h-3.5 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center group transition-colors">
            <span className="opacity-0 group-hover:opacity-100 text-green-900 text-xs leading-none">+</span>
          </button>
        </div>
        <div className="flex-1 text-center text-white/70 text-sm font-medium pointer-events-none">{win.title}</div>
        <div className="w-14" />
      </div>
      {/* Content */}
      <div className="overflow-hidden" style={{height: win.h - 36}}>
        {children}
      </div>
    </div>
  );
}

// ─── TERMINAL APP ─────────────────────────────────────────────────────────────
function TerminalApp() {
  const context = useContext(OSContext);
  if (!context) throw new Error('OSContext not found');
  const { fs, setFs } = context;
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: `Ubuntu ${VERSION} (simulated)` },
    { type: 'output', text: `Welcome to Ubuntu! Type 'help' for available commands.` },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const engineRef = useRef(createTerminalEngine());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fsRef = useRef(fs);
  fsRef.current = fs;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const run = (cmd: string) => {
    const engine = engineRef.current;
    const result = engine.execute(cmd, fsRef.current, setFs);
    if (result.some(r => r.type === 'clear')) { setLines([]); }
    else { setLines(prev => [...prev, ...result]); }
    setInput('');
    setHistIdx(-1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { run(input); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const h = engineRef.current.getHistory();
      const ni = Math.min(histIdx + 1, h.length - 1);
      setHistIdx(ni);
      setInput(h[h.length - 1 - ni] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const ni = Math.max(histIdx - 1, -1);
      setHistIdx(ni);
      setInput(ni === -1 ? '' : engineRef.current.getHistory().slice(-(ni+1))[0] || '');
    }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]); }
    if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); setLines(p => [...p, { type: 'prompt', text: getPrompt() + input + '^C' }]); setInput(''); }
  };

  const getPrompt = () => {
    const cwd = engineRef.current.getCwd().replace('/home/user', '~');
    return `${USERNAME}@${HOSTNAME}:${cwd}$ `;
  };

  return (
    <div className="terminal-bg h-full flex flex-col terminal-font text-sm" onClick={() => inputRef.current?.focus()}>
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map((l, i) => (
          <div key={i} className={`leading-5 whitespace-pre-wrap break-all ${l.type==='error' ? 'text-red-400' : l.type==='prompt' ? 'text-green-400' : 'text-gray-200'}`}>
            {l.type==='ls-output'
              ? <div className="flex flex-wrap gap-x-4">
                  {l.items?.map((it,j) => <span key={j} className={it.isDir ? 'text-blue-400 font-bold' : 'text-gray-200'}>{it.name}</span>)}
                </div>
              : l.text}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-400">{getPrompt()}</span>
          <span className="text-gray-200">{input}</span>
          <span className="cursor-blink" />
        </div>
        <div ref={bottomRef} />
      </div>
      <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
        className="opacity-0 absolute w-0 h-0 pointer-events-none" autoFocus />
    </div>
  );
}

// ─── FILE MANAGER ─────────────────────────────────────────────────────────────
function FilesApp() {
  const context = useContext(OSContext);
  if (!context) throw new Error('OSContext not found');
  const { fs } = context;
  const [cwd, setCwd] = useState('/home/user');
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [history, setHistory] = useState<string[]>(['/home/user']);
  const [histIdx, setHistIdx] = useState(0);

  const node = fs[cwd];
  const children = node?.children || [];

  const navigate = (path: string) => {
    const newHist = [...history.slice(0, histIdx + 1), path];
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    setCwd(path);
    setSelected(null);
  };

  const goBack = () => { if (histIdx > 0) { const p = histIdx - 1; setHistIdx(p); setCwd(history[p]); } };
  const goFwd = () => { if (histIdx < history.length - 1) { const p = histIdx + 1; setHistIdx(p); setCwd(history[p]); } };
  const goUp = () => { if (cwd !== '/') { const parts = cwd.split('/'); parts.pop(); navigate(parts.join('/') || '/'); } };

  const getIcon = (name: string, isDir: boolean) => {
    if (isDir) {
      const icons: { [key: string]: string } = { Desktop: '🖥️', Documents: '📄', Downloads: '⬇️', Pictures: '🖼️', Music: '🎵', Videos: '🎬' };
      return icons[name] || '📁';
    }
    const ext = name.split('.').pop()?.toLowerCase();
    const extIcons: { [key: string]: string } = { txt: '📝', md: '📝', pdf: '📋', js: '⚡', ts: '⚡', html: '🌐', css: '🎨', sh: '⚙️', py: '🐍', png: '🖼️', jpg: '🖼️', iso: '💿', json: '{}' };
    return extIcons[ext || ''] || '📄';
  };

  const places = [
    ['/home/user', '🏠', 'Home'], ['/home/user/Desktop', '🖥️', 'Desktop'],
    ['/home/user/Documents', '📄', 'Documents'], ['/home/user/Downloads', '⬇️', 'Downloads'],
    ['/home/user/Pictures', '🖼️', 'Pictures'], ['/home/user/Music', '🎵', 'Music'],
    ['/', '💾', 'Computer']
  ];

  return (
    <div className="flex h-full" style={{background:'#1e1e1e', color:'#ccc'}}>
      {/* Sidebar */}
      <div className="w-44 border-r border-white/10 flex flex-col py-2" style={{background:'#252525'}}>
        <p className="text-white/30 text-xs px-3 mb-1 uppercase tracking-wider">Places</p>
        {places.map(([path, icon, label]) => (
          <div key={path} onClick={() => navigate(path)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm rounded mx-1 ${cwd === path ? 'bg-orange-500/20 text-white' : 'text-white/60 hover:bg-white/5'}`}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 flex items-center gap-2 px-3 border-b border-white/10" style={{background:'#2a2a2a'}}>
          <button onClick={goBack} disabled={histIdx===0} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-1">◀</button>
          <button onClick={goFwd} disabled={histIdx===history.length-1} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-1">▶</button>
          <button onClick={goUp} className="text-white/60 hover:text-white transition-colors px-1">↑</button>
          <div className="flex-1 bg-black/20 rounded px-2 py-0.5 text-white/70 text-xs border border-white/10">{cwd}</div>
          <button onClick={() => setView(v => v==='grid'?'list':'grid')} className="text-white/50 hover:text-white text-sm px-1">{view==='grid'?'≡':'⊞'}</button>
        </div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/5 text-xs text-white/40">
          {cwd.split('/').filter(Boolean).map((part, i, arr) => {
            const path = '/' + arr.slice(0, i + 1).join('/');
            return <React.Fragment key={i}>{i>0&&<span>/</span>}<span onClick={() => navigate(path)} className="hover:text-white/70 cursor-pointer">{part}</span></React.Fragment>;
          })}
          {cwd==='/'&&<span>/ (root)</span>}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {view === 'grid' ? (
            <div className="grid gap-2" style={{gridTemplateColumns:'repeat(auto-fill, minmax(90px,1fr))'}}>
              {children.map((name: string) => {
                const childPath = (cwd==='/'?'':cwd)+'/'+name;
                const child = fs[childPath];
                const isDir = child?.type === 'dir';
                return (
                  <div key={name} onClick={() => setSelected(name)} onDoubleClick={() => isDir && navigate(childPath)}
                    className={`file-item rounded-lg p-2 flex flex-col items-center gap-1 cursor-pointer text-center ${selected===name?'selected':''}`}>
                    <span className="text-3xl">{getIcon(name, isDir)}</span>
                    <span className="text-xs text-white/70 break-all leading-tight">{name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-white/30 text-xs border-b border-white/10"><th className="text-left py-1 px-2">Name</th><th className="text-left py-1 px-2">Type</th><th className="text-left py-1 px-2">Size</th></tr></thead>
              <tbody>
                {children.map((name: string) => {
                  const childPath = (cwd==='/'?'':cwd)+'/'+name;
                  const child = fs[childPath];
                  const isDir = child?.type === 'dir';
                  return (
                    <tr key={name} onClick={() => setSelected(name)} onDoubleClick={() => isDir && navigate(childPath)}
                      className={`file-item cursor-pointer ${selected===name?'selected':''}`}>
                      <td className="py-1 px-2 flex items-center gap-2"><span>{getIcon(name,isDir)}</span><span className={isDir?'text-blue-300':'text-white/80'}>{name}</span></td>
                      <td className="py-1 px-2 text-white/40">{isDir?'Folder':name.split('.').pop()?.toUpperCase()}</td>
                      <td className="py-1 px-2 text-white/40">{isDir?'—':(child?.content?.length||0)+' B'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {children.length === 0 && <p className="text-white/30 text-sm text-center mt-8">Empty folder</p>}
        </div>
        {selected && <div className="px-3 py-1.5 border-t border-white/10 text-xs text-white/40">{selected} selected</div>}
      </div>
    </div>
  );
}

// ─── SETTINGS APP ─────────────────────────────────────────────────────────────
function SettingsApp() {
  const [tab, setTab] = useState('appearance');
  const [wallpaper, setWallpaper] = useState(0);
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(80);
  const [nightLight, setNightLight] = useState(false);
  const [autoUpdates, setAutoUpdates] = useState(true);

  const tabs = [['appearance','🎨','Appearance'],['sound','🔊','Sound'],['display','🖥️','Displays'],['network','🌐','Network'],['privacy','🔒','Privacy'],['updates','🔄','Updates']];
  const wallpapers = ['linear-gradient(135deg,#1a1a2e,#16213e,#0f3460,#533483,#e94560)','linear-gradient(135deg,#0d1117,#161b22,#21262d,#30363d,#6e7681)','linear-gradient(135deg,#0f0c29,#302b63,#24243e)','linear-gradient(135deg,#134e5e,#71b280)','linear-gradient(135deg,#373b44,#4286f4)','linear-gradient(135deg,#1e3c72,#2a5298)'];

  return (
    <div className="flex h-full" style={{background:'#1e1e1e',color:'#ccc'}}>
      <div className="w-48 border-r border-white/10 py-2" style={{background:'#252525'}}>
        <p className="text-white/30 text-xs px-3 mb-2 uppercase tracking-wider">Settings</p>
        {tabs.map(([id,icon,label]) => (
          <div key={id} onClick={() => setTab(id)}
            className={`settings-tab flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${tab===id?'active text-white':'text-white/60'}`}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {tab === 'appearance' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Appearance</h2>
            <div className="mb-6">
              <p className="text-white/60 text-sm mb-3">Wallpaper</p>
              <div className="grid grid-cols-3 gap-2">
                {wallpapers.map((w,i) => (
                  <div key={i} onClick={() => setWallpaper(i)}
                    className={`h-16 rounded-lg cursor-pointer transition-all ${wallpaper===i?'ring-2 ring-orange-500 ring-offset-2 ring-offset-black':''}`}
                    style={{background:w}} />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-white/60 text-sm mb-2">Color Scheme</p>
              <div className="flex gap-2">
                {['Dark','Light','Auto'].map(s => (
                  <button key={s} className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${s==='Dark'?'ubuntu-orange-bg text-white':'text-white/60 bg-white/5 hover:bg-white/10'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'sound' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Sound</h2>
            <div className="space-y-4">
              {[
                { icon: '🔊', label: 'Output Volume', val: volume, set: setVolume },
                { icon: '🎤', label: 'Input Volume', val: 50, set: () => {} }
              ].map(({ icon, label, val, set }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-sm">{icon} {label}</span>
                    <span className="text-white/40 text-sm">{val}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={val} onChange={(e) => set(parseInt(e.target.value))} className="w-full" />
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'display' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Displays</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-sm">💡 Brightness</span>
                  <span className="text-white/40 text-sm">{brightness}%</span>
                </div>
                <input type="range" min="0" max="100" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">🌙 Night Light</span>
                <label className="switch">
                  <input type="checkbox" checked={nightLight} onChange={(e) => setNightLight(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
        {tab === 'network' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Network</h2>
            <p className="text-white/60 text-sm">Connected to Wi-Fi: Ubuntu Network</p>
          </div>
        )}
        {tab === 'privacy' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Privacy</h2>
            <p className="text-white/60 text-sm">Privacy settings coming soon...</p>
          </div>
        )}
        {tab === 'updates' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Updates</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm">Automatic Updates</span>
              <label className="switch">
                <input type="checkbox" checked={autoUpdates} onChange={(e) => setAutoUpdates(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>
            <button className="btn-ubuntu">Check for Updates</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ABOUT APP ─────────────────────────────────────────────────────────────
function AboutApp() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8" style={{background:'#1e1e1e',color:'#ccc'}}>
      <div className="text-center">
        <svg width="120" height="120" viewBox="0 0 80 80" className="mx-auto mb-6">
          <circle cx="40" cy="40" r="35" fill="none" stroke="#e95420" strokeWidth="3"/>
          <circle cx="40" cy="14" r="8" fill="#e95420"/>
          <circle cx="65" cy="57" r="8" fill="#e95420"/>
          <circle cx="15" cy="57" r="8" fill="#e95420"/>
        </svg>
        <h1 className="text-white text-3xl font-light mb-2">Ubuntu</h1>
        <p className="text-white/60 text-lg mb-4">{VERSION}</p>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          This is a simulated Ubuntu desktop environment running in your browser.
          Explore the virtual file system, run commands in the terminal, and enjoy the interface!
        </p>
        <div className="mt-6 text-white/30 text-xs">
          <p>© 2024 Ubuntu Simulation</p>
          <p>Built with React</p>
        </div>
      </div>
    </div>
  );
}

// ─── BROWSER APP ─────────────────────────────────────────────────────────────
function BrowserApp() {
  const [url, setUrl] = useState('https://www.ubuntu.com/');
  const [history, setHistory] = useState<string[]>(['https://www.ubuntu.com/']);
  const [histIdx, setHistIdx] = useState(0);

  const navigate = (newUrl: string) => {
    const newHist = [...history.slice(0, histIdx + 1), newUrl];
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    setUrl(newUrl);
  };

  const goBack = () => { if (histIdx > 0) { const p = histIdx - 1; setHistIdx(p); setUrl(history[p]); } };
  const goFwd = () => { if (histIdx < history.length - 1) { const p = histIdx + 1; setHistIdx(p); setUrl(history[p]); } };
  const reload = () => { /* Simulate reload */ };

  return (
    <div className="h-full flex flex-col" style={{background:'#1e1e1e'}}>
      {/* Toolbar */}
      <div className="h-12 flex items-center gap-2 px-3 border-b border-white/10" style={{background:'#2a2a2a'}}>
        <button onClick={goBack} disabled={histIdx===0} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-2">◀</button>
        <button onClick={goFwd} disabled={histIdx===history.length-1} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-2">▶</button>
        <button onClick={reload} className="text-white/60 hover:text-white transition-colors px-2">🔄</button>
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key==='Enter'&&navigate(url)}
          className="flex-1 bg-black/20 rounded px-3 py-1 text-white/70 text-sm border border-white/10 focus:border-orange-500 focus:outline-none" />
        <button onClick={() => navigate(url)} className="text-white/60 hover:text-white transition-colors px-2">Go</button>
      </div>
      {/* Content */}
      <div className="flex-1 bg-white">
        <iframe src={url} className="w-full h-full border-0" title="Browser" />
      </div>
    </div>
  );
}

// ─── MAIN DESKTOP ────────────────────────────────────────────────────────────
function LinuxDesktop() {
  const [booted, setBooted] = useState(false);
  const [fs, setFs] = useState(initialFS);
  const [state, dispatch] = useReducer(osReducer, {
    windows: [],
    zCounter: 1,
    activeWindow: null,
    notification: undefined,
  });

  const onAppOpen = useCallback((appId: string, forceNew = false) => {
    const title = appMeta[appId]?.title || appId;
    dispatch({ type: 'OPEN_WINDOW', appId, title, forceNew });
  }, []);

  const renderApp = (win: WindowState) => {
    switch (win.appId) {
      case 'terminal': return <TerminalApp />;
      case 'files': return <FilesApp />;
      case 'settings': return <SettingsApp />;
      case 'about': return <AboutApp />;
      case 'browser': return <BrowserApp />;
      default: return <div className="p-4 text-white">App not found</div>;
    }
  };

  if (!booted) return <BootScreen onDone={() => setBooted(true)} />;

  return (
    <OSContext.Provider value={{ fs, setFs }}>
      <div className="linux-page h-screen overflow-hidden relative wallpaper" style={{fontFamily:'Ubuntu, sans-serif'}}>
        <TopBar onAppOpen={onAppOpen} />
        <Dock onAppOpen={onAppOpen} openApps={state.windows.map(w => w.appId)} />
        {state.windows.map(win => (
          <WindowFrame key={win.id} win={win} dispatch={dispatch} isActive={state.activeWindow === win.id}>
            {renderApp(win)}
          </WindowFrame>
        ))}
      </div>
    </OSContext.Provider>
  );
}

export default LinuxDesktop;