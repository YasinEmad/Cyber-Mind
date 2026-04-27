import React from 'react';

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────
export interface FileSystemNode {
  type: 'file' | 'dir';
  children?: string[];
  content?: string;
}

export interface FileSystem {
  [path: string]: FileSystemNode;
}

export interface TerminalLine {
  type: string;
  text?: string;
  items?: { name: string; isDir: boolean }[];
}

export interface WindowState {
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

export interface OSState {
  windows: WindowState[];
  zCounter: number;
  activeWindow: number | null;
  notification?: string;
}

export interface OSAction {
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

export interface OSContextType {
  fs: FileSystem;
  setFs: React.Dispatch<React.SetStateAction<FileSystem>>;
  isCTFMode: boolean;
  currentLevel: number;
  setCtfNotification: React.Dispatch<React.SetStateAction<string | null>>;
}

export const OSContext = React.createContext<OSContextType | null>(null);

export interface Challenge {
  description: string;
  hint: string;
  flag: string;
  fsMods: (fs: FileSystem) => void;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const USERNAME = 'user';
export const HOSTNAME = 'ubuntu';
export const VERSION = '24.04 LTS';

// ─── CTF CHALLENGES ──────────────────────────────────────────────────────────
export const challenges: Record<number, Challenge> = {
 1: {
  description: 'Find the hidden file in the Desktop folder that contains the flag.',
  hint: 'Use ls -a to reveal hidden files.',
  flag: 'CTF{navigation_master}',
  fsMods: (fs: FileSystem) => {
    const hiddenPath = '/home/user/Desktop/.hidden_flag.txt';
    fs[hiddenPath] = { type: 'file', content: 'CTF{navigation_master}' };

    const desktop = fs['/home/user/Desktop'];

    if (
      desktop &&
      desktop.type === 'dir' &&
      desktop.children &&
      !desktop.children.includes('.hidden_flag.txt')
    ) {
      desktop.children = [...desktop.children, '.hidden_flag.txt'];
    }
  }
}
};

// ─── VIRTUAL FILE SYSTEM ─────────────────────────────────────────────────────
export const initialFS: FileSystem = {
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

// ─── PATH UTILITIES ──────────────────────────────────────────────────────────
export function resolvePath(current: string, target: string): string {
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

// ─── TERMINAL ENGINE ─────────────────────────────────────────────────────────
export function createTerminalEngine(initialCwd = '/home/user') {
  let cwd = initialCwd;
  let history: string[] = [];
  let env: { [key: string]: string } = { 
    USER: USERNAME, 
    HOME: '/home/user', 
    SHELL: '/bin/bash', 
    TERM: 'xterm-256color', 
    PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' 
  };

  return {
    getCwd: (): string => cwd,
    getHistory: (): string[] => [...history],
    execute(cmd: string, fsRef: FileSystem, setFs: React.Dispatch<React.SetStateAction<FileSystem>>, isCTFMode: boolean, currentLevel: number, setCtfNotification: React.Dispatch<React.SetStateAction<string | null>>): TerminalLine[] {
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
          const flags = args.filter(arg => arg.startsWith('-'));
          const targets = args.filter(arg => !arg.startsWith('-'));
          const targetArg = targets[0];
          const showHidden = flags.includes('-a') || flags.includes('-la') || flags.includes('-al');
          const longFlag = flags.includes('-l') || flags.includes('-la') || flags.includes('-al');
          const target = targetArg ? resolvePath(cwd, targetArg) : cwd;
          const node = fs[target];
          if (!node) return err(`cannot access '${targetArg || args[0]}': No such file or directory`);
          if (node.type === 'file') return output([{ type: 'output', text: targetArg || target }]);
          const children = node.children || [];
          if (children.length === 0) return output([]);
          const visibleChildren = showHidden ? children : children.filter((c: string) => !c.startsWith('.'));
          if (longFlag) {
            const lines = ['total ' + visibleChildren.length * 4];
            visibleChildren.forEach((c: string) => {
              const childPath = (target === '/' ? '' : target) + '/' + c;
              const child = fs[childPath];
              const isDir = child && child.type === 'dir';
              const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
              const size = isDir ? 4096 : (child?.content?.length || 0);
              lines.push(`${perm}  1 ${USERNAME} ${USERNAME} ${String(size).padStart(8)} Nov 15 10:00 ${isDir ? '\x1b[34m' + c + '\x1b[0m' : c}`);
            });
            return output(lines.map(l => ({ type: 'output', text: l })));
          }
          return output([{ type: 'ls-output', items: visibleChildren.map((c: string) => {
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
          return output([{ type: 'output', text: challenges[currentLevel]?.hint || 'No hint available.' }]);
        }

        default:
          if (trimmed.startsWith('#')) return [{ type: 'prompt', text: prompt }];
          return [{ type: 'prompt', text: prompt }, { type: 'error', text: `${command}: command not found` }];
      }
      return [];
    }
  };
}

// ─── OS REDUCER ───────────────────────────────────────────────────────────────
export const appDefaults: { [key: string]: { w: number; h: number } } = {
  terminal: { w: 800, h: 500 },
  files: { w: 900, h: 550 },
  settings: { w: 850, h: 580 },
  about: { w: 600, h: 450 },
  browser: { w: 1000, h: 650 },
};

export const appMeta: { [key: string]: { title: string; icon: string; color: string } } = {
  terminal: { title: 'Terminal', icon: '⬛', color: '#2d2d2d' },
  files: { title: 'Files', icon: '📁', color: '#e95420' },
  settings: { title: 'Settings', icon: '⚙️', color: '#4a4a4a' },
  about: { title: 'About This System', icon: 'ℹ️', color: '#1d6996' },
  browser: { title: 'Browser', icon: '🌐', color: '#1565c0' },
};

export function osReducer(state: OSState, action: OSAction): OSState {
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

export function getCTFFS(level: number): FileSystem {
  const fs = JSON.parse(JSON.stringify(initialFS)) as FileSystem;
  challenges[level]?.fsMods(fs);
  return fs;
}
