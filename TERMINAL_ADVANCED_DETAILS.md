# تفاصيل متقدمة في معالجة الأوامر

## 🔍 التفاصيل العميقة

### 1. آلية تدفق البيانات (Data Flow)

#### المرحلة 1: الإدخال
```
┌─────────────────────────────────────────────┐
│ <input> في LinuxComponents.tsx              │
│ value={input}                               │
│ onChange={e => setInput(e.target.value)}   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ onKey event (Ctrl+Enter أو Enter)          │
│ if (e.key === 'Enter') { run(input); }    │
└─────────────────────────────────────────────┘
                      ↓
        ┌─────────────────────────┐
        │ run(cmd: string)        │
        │ - إعادة تعيين input    │
        │ - تنفيذ engine.execute |
        └─────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ engine.execute(cmd, ...)                    │
│ - معالجة الأوامر                           │
│ - إرجاع TerminalLine[]                     │
└─────────────────────────────────────────────┘
                      ↓
        ┌─────────────────────────┐
        │ setLines(prev => [...]) │
        │ - إضافة النتائج        │
        │ - إعادة الرسم           │
        └─────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ العرض النهائي على الشاشة                  │
│ {lines.map((l) => ...)}                     │
└─────────────────────────────────────────────┘
```

---

### 2. آلية حل المسارات (Path Resolution)

#### الحالة 1: مسار مطلق
```typescript
resolvePath('/home/user', '/etc/passwd')
// 1. يبدأ بـ '/' → مطلق
// 2. base = '/'
// 3. parts = ['etc', 'passwd']
// 4. النتيجة: '/etc/passwd'
```

#### الحالة 2: مسار نسبي
```typescript
resolvePath('/home/user/Documents', 'projects/webapp')
// 1. لا يبدأ بـ '/' → نسبي
// 2. base = '/home/user/Documents'
// 3. parts = ['projects', 'webapp']
// 4. path = '/home/user/Documents' + '/projects' + '/webapp'
// 5. النتيجة: '/home/user/Documents/projects/webapp'
```

#### الحالة 3: مسار مع ..
```typescript
resolvePath('/home/user/Documents/projects', '..')
// 1. base = '/home/user/Documents/projects'
// 2. parts = ['..']
// 3. عند رؤية '..': pop() من segs = ['home', 'user', 'Documents']
// 4. النتيجة: '/home/user/Documents'
```

#### الحالة 4: مسار مع .
```typescript
resolvePath('/home/user/Documents', './projects')
// 1. base = '/home/user/Documents'
// 2. parts = ['.', 'projects']
// 3. عند رؤية '.': تجاهل (continue)
// 4. النتيجة: '/home/user/Documents/projects'
```

---

### 3. نمط State Management في القيادة

#### الحفاظ على المتغيرات المحلية (Closures)

```typescript
export function createTerminalEngine(initialCwd = '/home/user', challengesParam?: Record<number, any>) {
  // ✅ هذه متغيرات محلية في الإغلاق (closure)
  // تبقى طوال عمر محرك Terminal
  let cwd = initialCwd;
  let history: string[] = [];
  let env: { [key: string]: string } = { ... };
  
  return {
    // يمكن لهذه الدوال الوصول إلى المتغيرات أعلاه
    getCwd: (): string => cwd,
    getHistory: (): string[] => [...history],
    async execute(...) {
      // يمكن تعديل cwd و history هنا
      cwd = newPath;
      history.push(trimmed);
    }
  }
}
```

**المميزات:**
- المتغيرات لا تُعاد تهيئتها مع كل استدعاء
- الحالة مستقلة عن React state
- أسرع من setState المتكرر

---

#### التعديل الآمن لـ FileSystem

```typescript
// ❌ خطأ: التعديل المباشر
fs['/home/user/newfile.txt'] = { type: 'file', content: '' };

// ✅ صحيح: استخدام setState
setFs((prev) => ({
  ...prev,
  ['/home/user/newfile.txt']: { type: 'file', content: '' },
}));
```

**السبب:**
- React لا يكتشف التغييرات المباشرة
- setState يخبر React بإعادة الرسم
- يحافظ على عدم التوازن (immutability)

---

### 4. آلية Context API

#### التعريف:
```typescript
// os.ts
export interface OSContextType {
  fs: FileSystem;                                    // الملفات الحالية
  setFs: React.Dispatch<React.SetStateAction<FileSystem>>;
  isCTFMode: boolean;                              // في وضع المسابقة؟
  currentLevel: number;                            // رقم المستوى
  setCtfNotification: React.Dispatch<...>;         // إظهار الإشعارات
  challenges?: Record<number, any>;                // بيانات المستويات
}

export const OSContext = React.createContext<OSContextType | null>(null);
```

#### الاستخدام في المكون:
```typescript
// LinuxComponents.tsx
export function TerminalApp() {
  const context = useContext(OSContext) as OSContextType;
  if (!context) throw new Error('OSContext not found');
  
  const { fs, setFs, isCTFMode, currentLevel, setCtfNotification, challenges } = context;
  
  // الآن لدينا جميع البيانات المشتركة
  const fsRef = useRef(fs);
  fsRef.current = fs;  // تحديث المرجع مع كل تغيير
}
```

---

### 5. آلية صيغة الـ Output

#### `output()` helper function:

```typescript
const output = (lines: (string | TerminalLine)[]): TerminalLine[] => [
  { type: 'prompt', text: prompt },  // دائماً عرض الأمر أولاً
  ...lines.map((l: string | TerminalLine) =>
    // تحويل النصوص إلى objects
    typeof l === 'string' ? { type: 'output' as const, text: l } : l
  ),
];
```

**المثال:**
```typescript
// الإدخال
output(['Line 1', 'Line 2', { type: 'custom', text: 'Line 3' }])

// الإخراج
[
  { type: 'prompt', text: 'user@ubuntu:~$ cat file.txt' },
  { type: 'output', text: 'Line 1' },
  { type: 'output', text: 'Line 2' },
  { type: 'custom', text: 'Line 3' },
]
```

---

### 6. معالجة الخطأ

#### نمط `err()` function:

```typescript
const err = (msg: string): TerminalLine[] =>
  output([{ type: 'error', text: `${command}: ${msg}` }]);

// الاستخدام
if (!args[0]) return err('missing file operand');
// النتيجة:
// [
//   { type: 'prompt', text: '...' },
//   { type: 'error', text: 'cat: missing file operand' },
// ]
```

---

### 7. آلية الـ CTF Mode Detection

#### في execute():
```typescript
if (isCTFMode) {
  // مسار 1: تنفيذ على Backend
  const resp = await ctfService.executeCTFCommand(...);
  ...
} else if (Array.isArray(levelCmds) && levelCmds.length > 0) {
  // مسار 2: أوامر مخصصة من القالب
  const matched = levelCmds.find(...);
  ...
}

// مسار 3: الأوامر المدمجة
switch (command) {
  case 'pwd': ...
  case 'ls': ...
  // ...
}
```

---

### 8. أنماط التعديل على نظام الملفات

#### Pattern 1: إضافة ملف/مجلد
```typescript
setFs((prev) => ({
  ...prev,
  [parentPath]: { 
    ...parent, 
    children: [...(parent.children || []), name]  // إضافة الاسم
  },
  [newPath]: { type: 'file'|'dir', ... },         // إنشاء العقدة
}));
```

#### Pattern 2: حذف ملف/مجلد
```typescript
setFs((prev) => {
  const next = { ...prev };
  
  // 1. تحديث المجلد الأب
  next[parentPath] = {
    ...next[parentPath],
    children: (next[parentPath]?.children || []).filter((c) => c !== nodeName),
  };
  
  // 2. حذف العقدة
  delete next[targetPath];
  
  return next;
});
```

#### Pattern 3: نقل ملف
```typescript
setFs((prev) => {
  const next = { ...prev };
  
  // 1. من المصدر
  next[srcParent] = {
    ...next[srcParent],
    children: (next[srcParent]?.children || []).filter((c) => c !== srcName),
  };
  
  // 2. إلى الوجهة
  next[dstParent] = {
    ...next[dstParent],
    children: [...(next[dstParent]?.children || []), dstName],
  };
  
  // 3. انقل البيانات
  next[dst] = srcNode;
  delete next[src];
  
  return next;
});
```

---

### 9. معالجة الأوامر المخصصة (Custom Commands)

#### بنية أمر مخصص:
```typescript
interface CustomCommand {
  name: string;                    // اسم الأمر (مثل: "list-files")
  output: string;                  // النتيجة المتوقعة
  allowedPaths?: string[];         // مسارات مسموحة (مثل: ["/home/user"])
  blockedPaths?: string[];         // مسارات ممنوعة (مثل: ["/etc"])
}
```

#### المطابقة:
```typescript
const matched = levelCmds.find((c: any) => {
  const stored = String(c.name).trim();     // "list-files" (من القالب)
  const full = trimmed;                      // "list-files" (ما كتبه المستخدم)
  const base = command;                      // "list-files" (الأمر الأول فقط)
  return stored === full || stored === base; // المطابقة
});
```

#### التحقق من الأذونات:
```typescript
// الممنوعة لها الأولوية
if (Array.isArray(blocked) && blocked.some((p: string) => 
  cwd === p ||           // المسار الحالي مطابق تماماً
  cwd.startsWith(p + '/') // أو داخل المسار الممنوع
)) {
  return err('Permission denied');
}

// ثم التحقق من المسموحة (إن وجدت)
if (Array.isArray(allowed) && allowed.length > 0) {
  const ok = allowed.some((p: string) => 
    cwd === p || cwd.startsWith(p + '/')
  );
  if (!ok) return err('Permission denied');
}
```

---

### 10. التكامل مع Backend - التفاصيل

#### الطلب الكامل:
```typescript
// من ctfService.ts
const response = await axiosInstance.post(`${API_BASE_URL}/execute`, {
  level: 1,                        // مستوى CTF
  command: "cat flag.txt",         // الأمر
  currentPath: "/home/user",       // 🔑 المسار الحالي
  sessionState: {},                // حالة الجلسة (للحفظ بين الأوامر)
});
```

#### المسار في الـ Backend:
```
POST /api/ctf/execute
  ↓
ChallengeController.executeCTFCommand()
  ↓
challengeService.executeCommand(level, cmd, currentPath)
  ↓
تنفيذ الأمر في سياق المستوى والمسار
  ↓
إرجاع النتيجة للـ Frontend
```

#### الاستجابة:
```json
{
  "success": true,
  "output": "محتوى الملف",
  "message": "تم التنفيذ بنجاح"
}
```

---

## 🧩 أمثلة عملية متقدمة

### مثال 1: تنفيذ أمر mkdir مع تحديث الـ UI

```typescript
case 'mkdir': {
  if (!args[0]) return err('missing operand');
  
  // 1. حل المسار
  const newPath = resolvePath(cwd, args[0]);
  
  // 2. التحقق من عدم الوجود
  if (fs[newPath]) return err(`cannot create directory '${args[0]}': File exists`);
  
  // 3. الحصول على المجلد الأب
  const parentParts = newPath.split('/');
  const parentPath = parentParts.slice(0, -1).join('/') || '/';
  const dirName = parentParts[parentParts.length - 1];
  
  const parent = fs[parentPath];
  if (!parent || parent.type !== 'dir')
    return err(`cannot create directory '${args[0]}': No such file or directory`);
  
  // 4. تحديث نظام الملفات
  // - إضافة الاسم للمجلد الأب
  // - إنشاء المجلد الجديد
  setFs((prev) => ({
    ...prev,
    [parentPath]: { ...parent, children: [...(parent.children || []), dirName] },
    [newPath]: { type: 'dir', children: [] },
  }));
  
  // 5. إرجاع prompt فقط (النجاح الصامت)
  return [{ type: 'prompt', text: prompt }];
}
```

**الخطوات:**
1. ✅ التحقق من المعاملات
2. ✅ حل المسار النسبي
3. ✅ التحقق من الصحة
4. ✅ تحديث الحالة
5. ✅ إرجاع النتيجة

---

### مثال 2: أمر grep مع البحث في المحتوى

```typescript
case 'grep': {
  if (args.length < 2) return err('usage: grep PATTERN FILE');
  
  // 1. استخراج النمط والملف
  const pattern = args[0];                           // "needle"
  const filePath = resolvePath(cwd, args[args.length - 1]);  // "/path/to/file"
  
  // 2. الحصول على الملف
  const fileNode = fs[filePath];
  if (!fileNode || fileNode.type !== 'file')
    return err(`${args[args.length - 1]}: No such file or directory`);
  
  // 3. البحث عن النمط
  const matches = (fileNode.content || '')
    .split('\n')                           // تقسيم إلى أسطر
    .filter((l: string) => l.includes(pattern));  // تصفية النطابقات
  
  // 4. إرجاع النتائج
  return output(matches.map((l: string) => ({ 
    type: 'output' as const, 
    text: l 
  })));
}
```

**المنطق:**
- `filter()` تبقي على الأسطر التي تحتوي على النمط
- `.includes()` بحث بسيط (ليس regex)
- النتائج تُعرض سطراً واحداً لكل نطابقة

---

### مثال 3: أمر submit في CTF Mode

```typescript
case 'submit': {
  // 1. التحقق من أن التطبيق في CTF mode
  if (!isCTFMode) return err('CTF mode not active.');
  
  // 2. التحقق من المعاملات
  if (args.length === 0) return err('usage: submit <flag>');
  
  // 3. الحصول على العلم
  const flag = args[0];
  
  // 4. المقارنة مع الحل الصحيح
  if (flag === challenges[currentLevel]?.flag) {
    // ✅ صحيح!
    setCtfNotification('Congratulations! Level completed.');
  } else {
    // ❌ خطأ!
    return err('Incorrect flag.');
  }
  
  break;
}
```

**النقاط:**
- `setCtfNotification()` تظهر رسالة نجاح
- المقارنة الدقيقة للعلم
- لا يُرجع سطر جديد عند النجاح (break فقط)

---

### مثال 4: معالجة المسارات النسبية في ls

```typescript
case 'ls': {
  const targets = args.filter((arg) => !arg.startsWith('-'));
  const targetArg = targets[0];
  
  // 1. تحديد المسار المراد عرضه
  // إذا لم يعطِ المستخدم مسار، استخدم المجلد الحالي
  const target = targetArg ? resolvePath(cwd, targetArg) : cwd;
  
  // 2. الحصول على المجلد
  const node = fs[target];
  
  // 3. التحقق من الوجود
  if (!node)
    return err(`cannot access '${targetArg || args[0]}': No such file or directory`);
  
  // 4. إذا كان ملف، اعرض اسمه فقط
  if (node.type === 'file') 
    return output([{ type: 'output', text: targetArg || target }]);
  
  // 5. إذا كان مجلد، اعرض محتوياته
  const children = node.children || [];
  const visibleChildren = children.filter((c: string) => !c.startsWith('.'));
  
  return output([{
    type: 'ls-output',
    items: visibleChildren.map((c: string) => ({
      name: c,
      isDir: fs[(target === '/' ? '' : target) + '/' + c]?.type === 'dir',
    })),
  }]);
}
```

**الخطوات:**
1. تحليل المعاملات
2. حل المسار (نسبي أو مطلق)
3. التحقق من الوجود
4. التمييز بين الملفات والمجلدات
5. العرض المناسب

---

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. المسار لا يُحل بشكل صحيح
```typescript
// ✅ التشخيص
console.log('Resolving:', { current: cwd, target: args[0] });
console.log('Result:', resolvePath(cwd, args[0]));

// يجب أن تكون النتيجة مسار حقيقي موجود في fs
```

#### 2. الملف لا يُحدّث
```typescript
// ❌ خطأ: لا تعدّل مباشرة
fs['/path/file'] = newData;

// ✅ صحيح: استخدم setFs
setFs((prev) => ({
  ...prev,
  ['/path/file']: newData,
}));
```

#### 3. Backend لا يعيد النتيجة
```typescript
// تحقق من الاستجابة
if (resp && resp.output !== undefined) {
  // تمام
} else {
  // مشكلة - ربما Backend لم يرجع output
  console.log('Backend response:', resp);
}
```

#### 4. التاريخ لا يعمل
```typescript
// تأكد من أن المحرك محفوظ في ref
const engineRef = useRef(createTerminalEngine(...));

// لا تُنشئ محرك جديد في كل render
useEffect(() => {
  // يمكنك تحديثه هنا فقط عند الحاجة
}, [dependencies]);
```

---

## 🎓 أفضل الممارسات

### 1. دائماً استخدم resolvePath
```typescript
// ✅ صحيح
const path = resolvePath(cwd, userInput);

// ❌ خطأ
const path = cwd + '/' + userInput;
```

### 2. تحقق من الوجود قبل الوصول
```typescript
// ✅ صحيح
if (!fs[path]) return err('No such file');

// ❌ خطأ
const node = fs[path];  // قد يكون undefined
console.log(node.content);  // خطأ!
```

### 3. استخدم filter للملفات المخفية
```typescript
// ✅ صحيح
const visible = children.filter((c: string) => !c.startsWith('.'));

// ❌ ناقص
const visible = children;  // يعرض الملفات المخفية دائماً
```

### 4. دائماً نسّق القيم في الإخراج
```typescript
// ✅ صحيح
return output([{ type: 'output', text: String(result) }]);

// ❌ قد يفشل
return output([{ type: 'output', text: result }]);  // إذا كان non-string
```

### 5. للـ CTF Mode، ثق في Backend
```typescript
// ✅ صحيح: تفويض كامل
if (isCTFMode) {
  const resp = await ctfService.executeCTFCommand(...);
  return output([{ type: 'output', text: String(resp.output) }]);
}

// ❌ خطأ: محاولة تكرار المنطق
if (isCTFMode) {
  // ... محاولة تنفيذ الأمر محلياً
}
```

---

## 📈 الأداء والتحسينات

### 1. تخزين المسارات المحسوبة مسبقاً
```typescript
// بدل حساب المسار في كل مرة
const cachedPaths = useMemo(() => ({
  home: resolvePath(cwd, '~'),
  documents: resolvePath(cwd, '~/Documents'),
}), [cwd]);
```

### 2. تجميع تحديثات FileSystem
```typescript
// بدل عدة setFs calls
setFs((prev) => {
  const next = { ...prev };
  // عدّل عدة أماكن
  next[path1] = ...;
  next[path2] = ...;
  next[path3] = ...;
  return next;
});
```

### 3. تقليل إعادة الرسم
```typescript
// لا تحدّث lines إذا لم تتغير
if (result.length > 0) {
  setLines(prev => [...prev, ...result]);
}
```

---

