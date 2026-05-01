# ميزة أمر cd المحسنة (Enhanced cd Command Feature)

## نظرة عامة
تم إضافة دعم محسّن لأمر `cd` (Change Directory) في نظام Template Commands، مما يسمح بالتنقل بين المجلدات بدون عرض أي نص output.

## المشكلة المحلولة

### السلوك السابق
عندما كان المستخدم يكتب أمر `cd`:
```bash
cd projects
```
كان النظام يعامله كأمر عادي ويحاول عرض output نصي له.

### السلوك الجديد (المحسّن)
الآن عند كتابة أمر `cd`:
```bash
cd projects
```
النظام يقوم بـ:
1. ✅ اكتشاف أن الأمر هو أمر تنقل (navigation command)
2. ✅ تحديث المسار الحالي (current working directory)
3. ✅ إضافة المجلد إلى المسار
4. ✅ عدم عرض أي output نصي
5. ✅ عرض المسار الجديد مباشرة في الـ prompt

### مثال على التنفيذ

**قبل:**
```bash
user@host:/home/user$ cd projects
[output text or error]
user@host:/home/user$ 
```

**بعد:**
```bash
user@host:/home/user$ cd projects
user@host:~/projects$
```

## التطبيق التقني

### 1. Backend (`CYBackend/src/controllers/ctfController.js`)

#### إضافة معالجة خاصة لأمر cd

```javascript
// SPECIAL HANDLING FOR cd COMMAND (Navigation)
if (cmdName === 'cd') {
  // دالة تحليل المسارات
  const resolvePath = (current, target) => {
    // معالجة المسارات المطلقة والنسبية
    // دعم .. و . و ~
  };
  
  const cwd = currentPath || lvl.initialDirectory || '/home/user';
  const target = args[0] || '/home/user';
  const newPath = resolvePath(cwd, target);
  
  // إرجاع استجابة خاصة
  return res.status(200).json({ 
    success: true, 
    output: '', // بدون output
    isNavigation: true, 
    newPath: newPath 
  });
}
```

#### استجابة Backend للأمر `cd`

```json
{
  "success": true,
  "output": "",
  "isNavigation": true,
  "newPath": "/home/user/projects"
}
```

### 2. Frontend (`CYFrontend/src/pages/terminal.ts`)

#### معالجة استجابة أمر cd

```typescript
// في وظيفة execute() في createTerminalEngine
if (resp && resp.isNavigation && resp.newPath) {
  // تحديث المسار الحالي
  cwd = resp.newPath;
  
  // إنشاء prompt جديد بدون أي output
  const newPromptPath = cwd.replace('/home/user', '~');
  const newPrompt = `${USERNAME}@${HOSTNAME}:${newPromptPath}$ ${cmd}`;
  
  // إرجاع الـ prompt فقط
  return [{ type: 'prompt', text: newPrompt }];
}
```

### 3. Template جديد (`CYBackend/src/config/commandTemplates.js`)

تم إضافة template جديد لأمر cd:

```javascript
{
  templateId: 'cd_navigation',
  name: 'Change Directory Command',
  baseCommand: 'cd',
  defaultOutput: '',
  fields: ['allowedPaths', 'blockedPaths'],
  description: 'Navigate to directories (special navigation command)',
}
```

## الميزات المدعومة

### 1. المسارات المطلقة
```bash
user@host:~$ cd /etc
user@host:/etc$

user@host:/etc$ cd /home/user/documents
user@host:~/documents$
```

### 2. المسارات النسبية
```bash
user@host:~$ cd projects
user@host:~/projects$

user@host:~/projects/code$ cd ../documents
user@host:~/documents$
```

### 3. رموز المسارات
- **`.`** - المجلد الحالي
  ```bash
  user@host:~$ cd .
  user@host:~$
  ```

- **`..`** - المجلد الأب
  ```bash
  user@host:~/projects/code$ cd ..
  user@host:~/projects$
  ```

- **`~`** - مجلد المستخدم الرئيسي
  ```bash
  user@host:/etc$ cd ~
  user@host:~$
  ```

- **المجلد الفارغ** (تفترض `/home/user`)
  ```bash
  user@host:/$ cd
  user@host:~$
  ```

## معالجة الأخطاء

### أمثلة على رسائل الخطأ

```bash
# مجلد غير موجود
user@host:~$ cd nonexistent
cd: nonexistent: No such file or directory
user@host:~$

# الملف موجود لكنه ليس مجلد
user@host:~$ cd filename.txt
cd: filename.txt: Not a directory
user@host:~$

# مسار غير صحيح
user@host:~$ cd /invalid/path
cd: /invalid/path: No such file or directory
user@host:~$
```

## المسارات المسموحة والممنوعة

يمكن استخدام `allowedPaths` و `blockedPaths` مع أمر cd:

```javascript
// مثال: التنقل مسموح فقط في مجلد معين
{
  name: 'cd',
  allowedPaths: ['/home/user', '/home/user/safe']
}

// مثال: منع التنقل إلى مجلد معين
{
  name: 'cd',
  blockedPaths: ['/etc', '/root', '/sys']
}
```

## المقارنة مع الأوامر الأخرى

| الأمر | Output | التأثير | نوع التحديث |
|------|--------|--------|-----------|
| `pwd` | ✅ عرض المسار | لا يتغير المسار | عرض فقط |
| `ls` | ✅ عرض الملفات | لا يتغير المسار | عرض فقط |
| `cd` | ❌ بدون output | تحديث المسار | تحديث + عرض prompt |
| `mkdir` | ❌ بدون output | إنشاء مجلد | عملية إنشاء |
| `touch` | ❌ بدون output | إنشاء ملف | عملية إنشاء |

## اختبار الميزة

### اختبار سريع

1. **في Local Mode (بدون Backend):**
   ```bash
   cd projects
   cd ..
   cd /home/user
   cd ~
   ```

2. **في CTF Mode (مع Backend):**
   - يتم إرسال الأمر إلى Backend
   - Backend يحل المسار ويرد `{ isNavigation: true, newPath: ... }`
   - Frontend يحدّث المسار المحلي

3. **مع القيود:**
   - اختبار `allowedPaths` و `blockedPaths`
   - التأكد من رفع الأوامر الممنوعة بخطأ

## الملفات المعدّلة

1. **`CYBackend/src/config/commandTemplates.js`**
   - إضافة template جديد `cd_navigation`

2. **`CYBackend/src/controllers/ctfController.js`**
   - إضافة معالجة خاصة لأمر `cd` في دالة `executeCTFCommand`
   - إضافة دالة `resolvePath` متطابقة مع Frontend

3. **`CYFrontend/src/pages/terminal.ts`**
   - إضافة معالجة لاستجابة `isNavigation` من Backend
   - تحديث `cwd` عند استقبال استجابة cd

## ملاحظات مهمة

1. ✅ **توافقية المسارات**: دالة `resolvePath` في Frontend و Backend متطابقة تماماً
2. ✅ **بدون Output**: أمر cd لا يطبع أي output، فقط تحديث prompt
3. ✅ **دعم جميع الحالات**: المسارات المطلقة والنسبية والرموز
4. ✅ **معالجة الأخطاء**: إرجاع رسائل خطأ واضحة عند الفشل
5. ✅ **بدون إعادة تحميل صفحة**: التحديث يتم بسلاسة بدون reload

## المزايا الإضافية

- 🚀 **سرعة أفضل**: لا حاجة لانتظار عرض output غير ضروري
- 📝 **تجربة مستخدم أفضل**: يشعر الـ terminal أكثر حقيقية
- 🔄 **تتبع دقيق**: Frontend يحافظ على المسار الحالي تلقائياً
- 🛡️ **أمان**: دعم `allowedPaths` و `blockedPaths` كما الأوامر الأخرى

## الخطوات التالية (اختيارية)

1. إضافة معالجة لرموز خاصة مثل `-` (المجلد السابق)
2. دعم متغيرات البيئة في المسارات
3. إضافة auto-completion للمسارات
4. حفظ سجل المجلدات المزارة (تاريخ cd)

---

**تاريخ التطبيق**: 2026-05-01
**الإصدار**: 1.0
**الحالة**: جاهز للاستخدام ✅
