import { challenges as defaultChallenges } from '../pages/ctfLevels';

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────
export interface FileSystemNode {
  type: 'file' | 'dir';
  children?: string[];
  content?: string;
}

export interface FileSystem {
  [path: string]: FileSystemNode;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const USERNAME = 'user';
export const HOSTNAME = 'ubuntu';
export const VERSION = '24.04 LTS';

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
  if (target.startsWith('/')) {
    base = '/';
    parts = target.split('/').filter(Boolean);
  } else {
    base = current;
    parts = target.split('/').filter(Boolean);
  }
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

// ─── CTF UTILITIES ───────────────────────────────────────────────────────────
export function getCTFFS(level: number, challengesParam?: Record<number, any>): FileSystem {
  // Use provided challenges or fall back to default (local) challenges
  const challenges = challengesParam || defaultChallenges;
  const fs = JSON.parse(JSON.stringify(initialFS)) as FileSystem;
  challenges[level]?.fsMods(fs);
  return fs;
}