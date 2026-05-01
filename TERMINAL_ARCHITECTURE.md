# البنية المعمارية والمخططات

## 🏗️ المعمارية العامة

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LinuxComponents.tsx (TerminalApp)                       │   │
│  │  - عرض المدخلات والمخرجات                              │   │
│  │  - معالجة أحداث لوحة المفاتيح                           │   │
│  │  - إدارة سجل الأوامر                                    │   │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │ استخدام                                     │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │  terminal.ts (createTerminalEngine)                      │   │
│  │  - تحليل الأوامر                                        │   │
│  │  - تنفيذ الأوامر محلياً                                 │   │
│  │  - إدارة الحالة (cwd, history, env)                    │   │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │                                              │
│          ┌────────▼────────┐                                     │
│          │ Local Commands  │  (pwd, ls, cd, etc)                │
│          └─────────────────┘                                     │
│                   │                                              │
│          ┌────────▼────────────────┐                             │
│          │  Backend CTF Mode?      │                             │
│          │  (isCTFMode === true)   │                             │
│          └────────────────────────┘                              │
│                   │                                              │
│          YES│      │ NO                                          │
│            │      │                                              │
│            ▼      ▼                                              │
│  ┌────────────────────┐        ┌──────────────────┐             │
│  │  ctfService        │        │ Builtin Commands │             │
│  │  .executeCTFCommand│        │ or Custom        │             │
│  └────────────────────┘        │ Templates        │             │
│            │                   └──────────────────┘             │
│            │                                                    │
│  ┌─────────┘                                                    │
│  │ HTTP POST /api/ctf/execute                                  │
│  ▼                                                              │
└─────────────────────────────────────────────────────────────────┘
                      │
                      │
┌─────────────────────▼─────────────────────────────────────────┐
│                      Backend (Node.js)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ChallengeController.executeCTFCommand()                │ │
│  │  - معالجة الأمر والمسار الحالي                         │ │
│  │  - اتصال بـ ChallengeService                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ChallengeService.executeCommand()                      │ │
│  │  - تنفيذ الأمر في سياق CTF                             │ │
│  │  - إدارة نظام الملفات الافتراضي للمستوى               │ │
│  │  - إدارة الجلسات والحالة                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Database (MongoDB)                                             │
│  - CTF Levels                                                   │
│  - Command Templates                                            │
│  - User Progress                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 دورة حياة الأمر (Command Lifecycle)

```
1. المدخل (Input)
   └─ User types: "cat ~/Documents/notes.txt"

2. المعالجة (Processing)
   ├─ Parse: command="cat", args=["~/Documents/notes.txt"]
   ├─ Resolve: "~/Documents/notes.txt" → "/home/user/Documents/notes.txt"
   └─ Create prompt: "user@ubuntu:~/Documents$ cat ~/Documents/notes.txt"

3. التنفيذ (Execution)
   ├─ Check: Is CTF Mode?
   │  ├─ YES: Send to Backend
   │  │  └─ POST /api/ctf/execute
   │  │     ├─ level: 1
   │  │     ├─ command: "cat ~/Documents/notes.txt"
   │  │     └─ currentPath: "/home/user/Documents"
   │  │
   │  └─ NO: Execute locally
   │     ├─ Check: Custom template?
   │     │  └─ YES: Use template output
   │     │
   │     └─ NO: Builtin command?
   │        ├─ pwd: return cwd
   │        ├─ cat: read file content
   │        ├─ ls: list directory
   │        └─ ... (switch statement)

4. تنسيق النتيجة (Result Formatting)
   └─ TerminalLine[] {
        type: 'prompt'  → "user@ubuntu:~/Documents$ cat ~/Documents/notes.txt"
        type: 'output'  → "Meeting Notes - Q4 Planning"
        type: 'output'  → "============================"
        type: 'output'  → "..."
      }

5. العرض (Display)
   └─ setLines(prev => [...prev, ...result])
      └─ React renders the new lines
         └─ User sees the result

6. التنظيف (Cleanup)
   └─ setInput('')
      └─ setHistIdx(-1)
         └─ Ready for next command
```

---

## 📊 هياكل البيانات

### 1. FileSystem Structure

```typescript
type FileSystem = {
  [path: string]: FileSystemNode
}

// مثال:
{
  '/': {
    type: 'dir',
    children: ['home', 'etc', 'usr']
  },
  '/home': {
    type: 'dir',
    children: ['user']
  },
  '/home/user': {
    type: 'dir',
    children: ['Desktop', 'Documents', '.bashrc']
  },
  '/home/user/Desktop': {
    type: 'dir',
    children: ['readme.txt']
  },
  '/home/user/Desktop/readme.txt': {
    type: 'file',
    content: 'Welcome to Ubuntu!'
  },
  '/home/user/.bashrc': {
    type: 'file',
    content: '# bashrc config...'
  }
}
```

**الخصائص:**
- المفتاح: المسار الكامل (`/path/to/file`)
- `type`: `'file'` أو `'dir'`
- `children`: مصفوفة الأسماء (للمجلدات فقط)
- `content`: محتوى النص (للملفات فقط)

---

### 2. TerminalLine Structure

```typescript
interface TerminalLine {
  type: string;                              // نوع السطر
  text?: string;                             // النص
  items?: { name: string; isDir: boolean }[]; // قائمة الملفات (ls-output)
}

// الأمثلة:
[
  // سطر الأمر
  {
    type: 'prompt',
    text: 'user@ubuntu:~/Documents$ cat notes.txt'
  },
  
  // النتيجة العادية
  {
    type: 'output',
    text: 'Meeting Notes'
  },
  
  // رسالة خطأ
  {
    type: 'error',
    text: 'cat: file not found'
  },
  
  // قائمة ملفات (مع ألوان خاصة)
  {
    type: 'ls-output',
    items: [
      { name: 'Desktop', isDir: true },
      { name: 'Documents', isDir: true },
      { name: '.bashrc', isDir: false }
    ]
  },
  
  // مسح Terminal
  {
    type: 'clear'
  }
]
```

---

### 3. Challenge Structure

```typescript
interface Challenge {
  flag: string;                    // العلم الصحيح
  hints?: string[];               // التلميحات
  commands?: CustomCommand[];      // الأوامر المخصصة
  fsMods?: (fs: FileSystem) => void;  // تعديلات نظام الملفات
}

interface CustomCommand {
  name: string;                    // اسم الأمر
  output: string;                  // النتيجة المتوقعة
  allowedPaths?: string[];        // مسارات مسموحة
  blockedPaths?: string[];        // مسارات ممنوعة
}
```

---

### 4. OSContextType Structure

```typescript
interface OSContextType {
  fs: FileSystem;                  // نظام الملفات الحالي
  setFs: React.Dispatch<React.SetStateAction<FileSystem>>;
  isCTFMode: boolean;             // في وضع المسابقة؟
  currentLevel: number;            // رقم المستوى الحالي
  setCtfNotification: React.Dispatch<React.SetStateAction<string | null>>;
  challenges?: Record<number, any>; // بيانات جميع المستويات
}
```

---

### 5. TerminalEngine State

```typescript
// حالة داخلية في createTerminalEngine
{
  cwd: '/home/user/Documents',     // المجلد الحالي
  history: [                        // سجل الأوامر
    'pwd',
    'ls -la',
    'cat notes.txt',
    'cd Desktop'
  ],
  env: {                           // متغيرات البيئة
    USER: 'user',
    HOME: '/home/user',
    SHELL: '/bin/bash',
    TERM: 'xterm-256color',
    PATH: '/usr/local/sbin:/usr/local/bin:...'
  }
}
```

---

## 🎯 مسارات التنفيذ (Execution Paths)

### المسار 1: أمر محلي بسيط

```
Input: "pwd"
│
├─ Parse: command = "pwd", args = []
│
├─ Not CTF Mode? YES → Skip Backend
│
├─ No custom templates
│
├─ switch(command)
│  └─ case 'pwd':
│     └─ return output([{ type: 'output', text: cwd }])
│
└─ Result: [
     { type: 'prompt', text: 'user@ubuntu:~$ pwd' },
     { type: 'output', text: '/home/user' }
   ]
```

---

### المسار 2: أمر في CTF Mode

```
Input: "ls -la"
│
├─ Parse: command = "ls", args = ["-la"]
│
├─ Is CTF Mode? YES
│  │
│  └─ Call: ctfService.executeCTFCommand(
│       level: 1,
│       command: "ls -la",
│       currentPath: "/home/user"
│     )
│     │
│     └─ Backend returns:
│        {
│          success: true,
│          output: "total 24\ndrwxr-xr-x 5 user user..."
│        }
│
└─ Result: [
     { type: 'prompt', text: 'user@ubuntu:~$ ls -la' },
     { type: 'output', text: 'total 24\ndrwxr-xr-x 5 user user...' }
   ]
```

---

### المسار 3: أمر مخصص من القالب

```
Input: "check-files"
│
├─ Parse: command = "check-files", args = []
│
├─ Not CTF Mode? YES → Skip Backend
│
├─ Find custom template:
│  └─ levelCmds.find(c => c.name === "check-files")
│     │
│     ├─ Found: { name: "check-files", output: "3 files found" }
│     │
│     ├─ Check permissions:
│     │  └─ cwd = "/home/user" (allowed)
│     │
│     └─ Return template output
│
└─ Result: [
     { type: 'prompt', text: 'user@ubuntu:~$ check-files' },
     { type: 'output', text: '3 files found' }
   ]
```

---

### المسار 4: أمر غير موجود

```
Input: "invalidcmd"
│
├─ Parse: command = "invalidcmd", args = []
│
├─ Not CTF Mode? YES → Skip Backend
│
├─ No custom templates
│
├─ switch(command)
│  └─ default:
│     └─ return [
│          { type: 'prompt', text: '...$' },
│          { type: 'error', text: 'invalidcmd: command not found' }
│        ]
│
└─ Result: Two lines (prompt + error)
```

---

## 💾 نمط تحديث الحالة (State Update Pattern)

### قبل: التعديل المباشر ❌

```typescript
// هذا لا يعمل مع React
const newFile = { type: 'file', content: 'Hello' };
fs['/home/user/newfile.txt'] = newFile;
// React لا يكتشف التغيير!
```

---

### بعد: استخدام setState ✅

```typescript
setFs((prev) => ({
  ...prev,                              // نسخ الحالة السابقة
  ['/home/user/newfile.txt']: {        // إضافة/تعديل المفتاح الجديد
    type: 'file',
    content: 'Hello'
  }
}));
// React يكتشف التغيير ويعيد الرسم!
```

---

## 🔐 تدفق الأمان (Security Flow)

### في أوامر مخصصة:

```
User Input: "secret-command"
│
├─ Parse command name
│
├─ Find matching template
│
├─ Check: Is current path in blockedPaths?
│  ├─ YES: Return error "Permission denied"
│  └─ NO: Continue
│
├─ Check: Does template have allowedPaths?
│  ├─ YES: Is cwd in allowedPaths?
│  │  ├─ YES: Execute
│  │  └─ NO: Return error "Permission denied"
│  └─ NO: Execute (no restriction)
│
└─ Execute and return output
```

### في CTF Mode:

```
User Input: "any command"
│
├─ Send to Backend with:
│  ├─ level (معرّف المستوى)
│  ├─ command (الأمر)
│  ├─ currentPath (المسار الحالي)
│  └─ sessionState (حالة الجلسة)
│
├─ Backend validates:
│  ├─ Is user authorized for this level?
│  ├─ Is path allowed in this level's context?
│  ├─ Does command have access to requested files?
│  └─ More security checks...
│
└─ Backend returns result
```

---

## 🎨 نظام الألوان (Color System)

```css
/* linuxComponents.tsx */

.terminal-bg {
  background: /* terminal background */;
  color: /* foreground */;
}

.type-prompt {
  color: #22c55e;  /* أخضر */
  font-weight: bold;
}

.type-output {
  color: #d1d5db;  /* رمادي فاتح */
}

.type-error {
  color: #f87171;  /* أحمر */
}

.type-ls-output .isDir {
  color: #60a5fa;  /* أزرق */
  font-weight: bold;
}

.type-ls-output .isFile {
  color: #d1d5db;  /* رمادي */
}
```

---

## 🧵 تدفق المراجع والتحديثات (Refs & Updates)

```typescript
// في TerminalApp component:

const engineRef = useRef(createTerminalEngine('/home/user', challenges));
const fsRef = useRef(fs);
const inputRef = useRef<HTMLInputElement>(null);
const bottomRef = useRef<HTMLDivElement>(null);

// قبل كل استخدام، تأكد من التحديث:
fsRef.current = fs;  // ✅ تحديث مع كل render

// استخدم fsRef.current (وليس fs) في execute
await engine.execute(cmd, fsRef.current, setFs, ...);

// هذا يضمن أن engine يستخدم أحدث نسخة من FileSystem
```

**المميزات:**
- `engineRef`: محرك Terminal طويل الأجل (لا يُعاد إنشاؤه)
- `fsRef`: مرجع آخر للـ FileSystem الحالي
- `inputRef`: للتركيز على حقل الإدخال
- `bottomRef`: للتمرير التلقائي للأسفل

---

## 📈 تدفق البيانات الكامل (Complete Data Flow)

```
1. USER INTERACTION
   User types in <input>
        │
        ▼
   onChange event → setInput(value)
        │
        ▼
   onKeyDown event → Check if Enter
        │
        ▼

2. COMMAND SUBMISSION
   run(input)
        │
        ├─ Store current fs in fsRef.current
        ├─ Call engine.execute(input, fsRef, setFs, ...)
        │
        ▼

3. COMMAND EXECUTION
   execute(cmd, fsRef, setFs, ...)
        │
        ├─ Parse: command, args
        ├─ Check: isCTFMode?
        │  ├─ YES → Call Backend API
        │  │
        │  └─ NO → Check templates/builtins
        │     ├─ Match found? YES → Execute
        │     │
        │     └─ Builtin? YES → Execute
        │
        ├─ Get result: TerminalLine[]
        │
        ▼

4. STATE UPDATE
   setLines(prev => [...prev, ...result])
        │
        ▼

5. RE-RENDER
   React renders new lines
        │
        ▼

6. CLEANUP
   setInput('')
   setHistIdx(-1)
        │
        ▼

7. READY FOR NEXT
   User sees result and can type again
```

---

## 🚀 تحسينات الأداء المقترحة

### 1. Memoization
```typescript
const memoizedPrompt = useMemo(() => getPrompt(), [engineRef.current.getCwd()]);
```

### 2. Virtualization للأسطر الكثيرة
```typescript
// استخدم react-window للقائمة الطويلة جداً
import { FixedSizeList } from 'react-window';
```

### 3. Web Workers للعمليات الثقيلة
```typescript
// للعمليات الثقيلة على FileSystem
const worker = new Worker('terminal-worker.js');
```

### 4. Debouncing للمدخلات
```typescript
const debouncedRun = debounce(run, 100);
```

---

