# Linux Commands Reference — File System Documentation

> **Template Name:** Linux Commands Reference
> **Description:** Comprehensive Ubuntu 24.04 LTS command reference with simulated environment
> **Template ID:** `tmpl_linux_commands_v1`

---

## Directory Structure

```
/
├── home/
│   └── user/
│       ├── Desktop/
│       │   ├── readme.txt
│       │   └── todo.txt
│       ├── Documents/
│       │   ├── notes.txt
│       │   ├── resume.pdf
│       │   └── projects/
│       │       ├── scripts/
│       │       └── webapp/
│       │           ├── app.js
│       │           ├── index.html
│       │           └── style.css
│       ├── Downloads/
│       ├── Music/
│       ├── Pictures/
│       └── Videos/
├── etc/           [BLOCKED]
├── usr/           [BLOCKED]
├── var/           [BLOCKED]
├── dev/           [BLOCKED]
└── tmp/
```

---

## Allowed Paths (accessible file system nodes)

| # | Path | Notes |
|---|------|-------|
| 1 | `/` | Root — top-level listing only |
| 2 | `/home` | Parent of user home |
| 3 | `/home/user` | Home directory |
| 4 | `/home/user/Desktop` | Desktop folder |
| 5 | `/home/user/Documents` | Documents folder |
| 6 | `/home/user/Documents/projects` | Projects folder |
| 7 | `/home/user/Documents/projects/webapp` | Webapp project folder |
| 8 | `/tmp` | Temporary directory |

---

## Blocked Paths (no access allowed)

| Path | Reason |
|------|--------|
| `/etc` | System configuration — sensitive |
| `/usr` | System binaries and libraries |
| `/var` | System logs and variable data |
| `/dev` | Device files |

---

## Files and Their Contents

### `/home/user/Desktop/readme.txt`

```
Welcome to Ubuntu 24.04 LTS!

This is a simulated Ubuntu desktop environment running in your browser.
Try: ls, cd, pwd, mkdir, touch, cat, echo, help
```

### `/home/user/Desktop/todo.txt`

```
TODO List
=========
[ ] Update system packages
[ ] Configure SSH keys
[x] Install Ubuntu
[x] Configure network
```

### `/home/user/Documents/notes.txt`

```
Meeting Notes - Q4 Planning
Date: 2024-11-15
- Discussed roadmap
- Assigned tasks
Action Items:
1. Review codebase
2. Write docs
3. Deploy
```

### `/home/user/Documents/resume.pdf`

```
[Binary PDF file - cannot display in terminal]
```

### `/home/user/Documents/projects/webapp/app.js`

```
console.log("App initialized");
```

### `/home/user/Documents/projects/webapp/index.html`

Standard HTML file (content implied by context).

### `/home/user/Documents/projects/webapp/style.css`

Standard CSS stylesheet (content implied by context).

### `/home/user/Documents/projects/scripts/`

Empty directory.

### `/home/user/Documents/projects/webapp/`

Contains `app.js`, `index.html`, `style.css`.

### `/tmp/`

Empty directory.

---

## Hidden Files

| Path | Description |
|------|-------------|
| `/home/user/.bashrc` | Shell configuration |
| `/home/user/.profile` | Profile script |

---

## Commands Available at Each Path

### Anywhere (global commands)

| Command | Output |
|---------|--------|
| `help` | Lists all available commands |
| `whoami` | `user` |
| `id` | `uid=1000(user) gid=1000(user) groups=1000(user)` |
| `uname` | `Linux` |
| `df` | `Filesystem   Size  Used  Avail  Use%  Mounted on\n/dev/sda1     50G   18G    30G   38%  /` |
| `ps` | `PID   TTY      TIME  CMD\n1024  pts/0  00:00:00  bash\n1035  pts/0  00:00:01  node` |
| `top` | `top is interactive and not supported in this template. Use 'ps' for a static process list.` |
| `curl` | `HTTP/1.1 200 OK\nContent-Type: text/html\n...sample response...` |
| `wget` | `--2026-06-07 12:00:00-- http://example.com/\nResolving example.com... done\nSaving to: 'index.html'` |
| `ssh` | `Permission denied (publickey).` |

### `/`

| Command | Output |
|---------|--------|
| `ls` | `home etc usr var tmp dev` |
| `pwd` | `/` |

### `/home`

| Command | Output |
|---------|--------|
| `ls` | `user` |
| `pwd` | `/home` |

### `/home/user`

| Command | Output |
|---------|--------|
| `ls` | `Desktop Documents Downloads Music Pictures Videos .bashrc .profile` |
| `pwd` | `/home/user` |
| `cd` | Silent success (blocked: `/etc`, `/usr`, `/var`, `/dev`) |
| `mkdir` | `Created directory '/home/user/new-folder'` |
| `touch` | `Created file '/home/user/notes-new.txt'` |
| `echo` | `Hello world` |
| `find` | `./Desktop\n./Documents\n./Downloads\n./Music\n./Pictures\n./Videos` |
| `du` | `4.0K   /home/user/Desktop\n12K    /home/user/Documents\n24K    /home/user/Documents/projects/webapp` |

### `/home/user/Desktop`

| Command | Output |
|---------|--------|
| `ls` | `readme.txt todo.txt` |
| `pwd` | `/home/user/Desktop` |
| `cd` | Silent success (blocked: `/etc`, `/usr`, `/var`, `/dev`) |
| `cat readme.txt` | `Welcome to Ubuntu 24.04 LTS!\nThis is a simulated...` |
| `cat todo.txt` | `TODO List\n=========\n[ ] Update system packages...` |
| `rm` | `Removed '/home/user/Desktop/todo.txt'` |
| `chmod` | `Updated permissions of '/home/user/Desktop/readme.txt'` |

### `/home/user/Documents`

| Command | Output |
|---------|--------|
| `ls` | `notes.txt resume.pdf projects` |
| `pwd` | `/home/user/Documents` |
| `cd` | Silent success (blocked: `/etc`, `/usr`, `/var`, `/dev`) |
| `cat notes.txt` | `Meeting Notes - Q4 Planning\nDate: 2024-11-15...` |
| `cat resume.pdf` | `[Binary PDF file - cannot display in terminal]` |
| `mkdir` | `Created directory '/home/user/Documents/new-folder'` |
| `touch` | `Created file '/home/user/Documents/notes-new.txt'` |
| `cp` | `Copied '/home/user/Documents/notes.txt' to '/tmp/notes.txt'` |
| `mv` | `Renamed '/home/user/Documents/resume.pdf' to '/home/user/Documents/resume-old.pdf'` |
| `find` | `./notes.txt\n./resume.pdf\n./projects` |
| `grep` | `[ ] Update system packages\n[ ] Configure SSH keys` |

### `/home/user/Documents/projects`

| Command | Output |
|---------|--------|
| `ls` | `webapp scripts` |
| `pwd` | `/home/user/Documents/projects` |
| `cd` | Silent success (blocked: `/etc`, `/usr`, `/var`, `/dev`) |
| `find` | `./webapp\n./scripts` |
| `git` | `On branch main\nYour branch is up to date with 'origin/main'.` |
| `node` | `v20.5.0\nWelcome to Node.js!` |
| `python3` | `Python 3.12.0\n>>> print('hello')\nhello` |
| `npm` | `npm notice This is a simulated npm command output` |

### `/home/user/Documents/projects/webapp`

| Command | Output |
|---------|--------|
| `ls` | `app.js index.html style.css` |
| `pwd` | `/home/user/Documents/projects/webapp` |
| `cd` | Silent success (blocked: `/etc`, `/usr`, `/var`, `/dev`) |
| `rm` | `Removed '/home/user/Documents/projects/webapp/style.css'` |
| `cp` | `Copied '/home/user/Documents/projects/webapp/index.html' to '/tmp/index.html'` |
| `mv` | `Renamed '/home/user/Documents/projects/webapp/app.js' to '/home/user/Documents/projects/webapp/app-old.js'` |
| `grep` | `console.log("App initialized");` |
| `chmod` | `Updated permissions of '/home/user/Documents/projects/webapp/app.js'` |
| `chown` | `Updated owner of '/home/user/Documents/projects/webapp/app.js' to user:user` |
| `git` | `On branch main\nYour branch is up to date with 'origin/main'.` |
| `node` | `v20.5.0\nWelcome to Node.js!` |
| `python3` | `Python 3.12.0\n>>> print('hello')\nhello` |
| `npm` | `npm notice This is a simulated npm command output` |

### `/tmp`

| Command | Output |
|---------|--------|
| `ls` | (empty) |
| `pwd` | `/tmp` |
| `cd` | Silent success (blocked: `/etc`, `/usr`, `/var`, `/dev`) |
| `mkdir` | `Created directory '/tmp/new-folder'` |
| `touch` | `Created file '/tmp/notes-new.txt'` |
| `echo` | `Hello world` |
| `rm` | `Removed '/tmp/example.txt'` |

---

## Blocked Paths per Command

| Command | Blocked Paths |
|---------|---------------|
| `cd` (all paths) | `/etc`, `/usr`, `/var`, `/dev` |
| `cat` | `/etc/passwd`, `/etc/hostname`, `/var/log/syslog` |
| `mkdir` | `/etc`, `/usr`, `/var`, `/dev` |
| `touch` | `/etc`, `/usr`, `/var`, `/dev` |
| `rm` | `/`, `/etc`, `/usr`, `/var`, `/dev`, `/home/user/Downloads` |
| `cp` | `/etc`, `/usr`, `/var`, `/dev` |
| `mv` | `/etc`, `/usr`, `/var`, `/dev` |
| `find` | `/etc`, `/usr`, `/var`, `/dev` |
| `chmod` | `/etc`, `/usr`, `/var`, `/dev` |
| `chown` | `/etc`, `/usr`, `/var`, `/dev` |
| `ssh` | `/etc`, `/usr`, `/var`, `/dev` |
| `top` | `/` |
