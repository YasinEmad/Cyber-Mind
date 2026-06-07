# CTF System Context-Aware Command Resolution Refactoring

## Executive Summary

This refactoring solves a critical design flaw where commands stored with duplicate names could not support path-aware behavior. The system now enables **same command name → different behavior depending on filesystem context**.

---

## Problem Statement (Before)

```javascript
// BAD: Uses .find() - returns FIRST match only
matched = commands.find((c) => c.name === 'ls');
// Result: Ignores additional 'ls' entries with different path rules
```

```javascript
// BAD: Deduplicates by name ALONE
const key = (c.name || '').trim();
if (seen.has(key)) continue; // Removes context-aware variants
```

---

## Solution Architecture

### 1. Context-Aware Command Resolver

**Location**: [CYBackend/src/controllers/ctfExecutionController.js](CYBackend/src/controllers/ctfExecutionController.js#L14)

```javascript
const resolveContextAwareCommand = (candidates, cmdName, currentPath) => {
  // Scoring algorithm:
  // +100: exact match in outputByPath[currentPath]
  // +50:  currentPath in allowedPaths
  // -100: currentPath in blockedPaths
  // Returns: highest scoring command (deterministic)
}
```

**Key Features**:
- Filters candidates by name (like `.find()` but returns array)
- Scores each candidate based on path specificity
- Deterministic: ties broken by first occurrence
- Backward compatible: falls through to default if no path match

---

### 2. Updated Data Model

Commands now support **Option A (recommended)**: Path-aware output via `outputByPath` object.

#### Command Schema with Path-Aware Behavior

```json
{
  "name": "ls",
  "outputByPath": {
    "/home/user/Desktop": "file1.txt file2.txt readme.md",
    "/home/user/Documents": "notes.txt resume.pdf projects/",
    "/home/user/Documents/projects": "webapp/ scripts/ backup.tar"
  },
  "defaultOutput": "Desktop Documents Downloads Music Pictures Videos",
  "allowedPaths": ["/home/user", "/home/user/Desktop", "/home/user/Documents"],
  "blockedPaths": ["/etc", "/root"]
}
```

#### Backward Compatible Format

Old commands still work (using `output` field):

```json
{
  "name": "cat",
  "output": "File contents here",
  "allowedPaths": ["/home/user/Documents"]
}
```

---

### 3. Output Resolution Strategy

**Location**: [CYBackend/src/controllers/ctfExecutionController.js](CYBackend/src/controllers/ctfExecutionController.js#L230-L260)

Follows priority order:

1. **Exact path match** → `outputByPath[currentPath]` (highest priority)
2. **Default** → `defaultOutput`
3. **Legacy** → `output` (backward compatibility)
4. **Fallback** → empty string

```javascript
// Example: User in /home/user/Desktop, runs 'ls'
if (command.outputByPath && command.outputByPath['/home/user/Desktop']) {
  return 'file1.txt file2.txt readme.md'; // Exact path match
}
```

---

### 4. Context-Aware Deduplication

**Location**: [CYBackend/src/scripts/cleanupCTFLevels.js](CYBackend/src/scripts/cleanupCTFLevels.js#L70-L128)

Only removes duplicates if **ALL** of these match:

```
name + allowedPaths + blockedPaths + output configuration
```

#### Composite Key Example

```javascript
// Command A
{
  name: "ls",
  allowedPaths: ["/home/user/Desktop"],
  blockedPaths: [],
  outputByPath: { "/home/user/Desktop": "file1 file2" }
}

// Command B
{
  name: "ls",
  allowedPaths: ["/home/user/Documents"],
  blockedPaths: [],
  outputByPath: { "/home/user/Documents": "notes.txt report.pdf" }
}

// Result: BOTH preserved (different allowedPaths)
// Key A: "ls||[/home/user/Desktop]||||{Desktop output}"
// Key B: "ls||[/home/user/Documents]||||{Documents output}"
```

---

## Usage Examples

### Example 1: Path-Aware `ls` Command

**Setup**: Three `ls` commands, different outputs per directory

```json
[
  {
    "name": "ls",
    "outputByPath": {
      "/home/user": "Desktop Documents Downloads",
      "/home/user/Desktop": "readme.txt todo.txt",
      "/home/user/Documents": "notes.txt resume.pdf projects/"
    },
    "defaultOutput": "Desktop Documents Downloads"
  }
]
```

**Execution**:

```bash
# User in /home/user/Desktop
$ ls
→ Returns: "readme.txt todo.txt"  (matched outputByPath['/home/user/Desktop'])

# User in /home/user/Documents  
$ ls
→ Returns: "notes.txt resume.pdf projects/"  (matched outputByPath['/home/user/Documents'])

# User in /home/user (root level)
$ ls
→ Returns: "Desktop Documents Downloads"  (matched outputByPath['/home/user'])

# User in /etc (not in outputByPath)
$ ls
→ Returns: "Desktop Documents Downloads"  (fallback to defaultOutput)
```

---

### Example 2: Permission-Based Command Behavior

**Setup**: Same command name, different permissions per path

```json
[
  {
    "name": "cat",
    "output": "Secret flag: FLAG{desktop_secret}",
    "allowedPaths": ["/home/user/Desktop"],
    "blockedPaths": []
  },
  {
    "name": "cat",
    "output": "Permission denied",
    "allowedPaths": [],
    "blockedPaths": ["/etc", "/root"]
  },
  {
    "name": "cat",
    "output": "General file contents",
    "allowedPaths": ["/home/user/Documents"],
    "blockedPaths": []
  }
]
```

**Scoring during resolution**:

```
At /home/user/Desktop:
  - Option 1: score = +50 (in allowedPaths) → SELECTED
  - Option 2: score = 0
  - Option 3: score = 0

At /etc:
  - Option 1: score = 0
  - Option 2: score = -100 (in blockedPaths) → SKIP
  - Option 3: score = 0 → FALLBACK (permission denied)

At /home/user/Documents:
  - Option 1: score = 0
  - Option 2: score = 0
  - Option 3: score = +50 (in allowedPaths) → SELECTED
```

---

### Example 3: Multi-Directory File Search

**Setup**: `grep` with different behavior per path

```json
[
  {
    "name": "grep",
    "outputByPath": {
      "/home/user/Documents": "file1.txt:malware_definition",
      "/var/log": "2024-01-15 attack detected",
      "/etc/passwd": "root:x:0:0"
    },
    "defaultOutput": "grep: command not found",
    "allowedPaths": ["/home/user", "/var/log", "/etc"],
    "blockedPaths": ["/root"]
  }
]
```

---

## Implementation Details

### Command Resolution Flow

```
┌─────────────────────────────────────────┐
│ User executes: ls                       │
│ Current path: /home/user/Desktop        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 1. Get all level commands (templates,   │
│    explicit commands, custom commands)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. Filter candidates with name='ls'     │
│    Result: [ls1, ls2, ls3]              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 3. Score each candidate:                │
│    ls1: +100 (outputByPath match)       │
│    ls2: +50 (allowedPaths match)        │
│    ls3: 0 (no match)                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 4. Select highest score (ls1)           │
│    Resolve output: outputByPath[path]   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 5. Validate permissions:                │
│    - Check blockedPaths                 │
│    - Check allowedPaths (if specified)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 6. Return output or "Permission denied" │
└─────────────────────────────────────────┘
```

---

## Backward Compatibility

All existing commands continue to work without modification:

```javascript
// OLD format (still supported)
{
  "name": "ps",
  "output": "PID TTY TIME CMD",
  "allowedPaths": ["/home/user"]
}

// Resolved as:
// 1. No outputByPath → skip to step 2
// 2. No defaultOutput → skip to step 3  
// 3. Use output field → "PID TTY TIME CMD"
```

---

## Files Modified

### 1. [CYBackend/src/controllers/ctfExecutionController.js](CYBackend/src/controllers/ctfExecutionController.js)

**Changes**:
- Added `resolveContextAwareCommand()` helper (lines 14-95)
- Replaced `.find()` with context-aware resolver for templates (lines 180-194)
- Replaced `.find()` with context-aware resolver for commands (line 196)
- Replaced `.find()` with context-aware resolver for customCommands (line 200)
- Updated output resolution with path-aware priority (lines 230-260)

**Impact**: Commands now resolve based on context; multiple commands with same name supported

---

### 2. [CYBackend/src/scripts/cleanupCTFLevels.js](CYBackend/src/scripts/cleanupCTFLevels.js)

**Changes**:
- Replaced single-field deduplication (line 85: `const key = (c.name || '').trim()`)
- Added composite key deduplication (lines 82-128)
- Key now includes: name + allowedPaths + blockedPaths + output

**Impact**: Path-aware command variants are preserved; only true duplicates removed

---

## Testing Recommendations

### Unit Tests

```javascript
describe('resolveContextAwareCommand', () => {
  it('returns exact path match with highest score', () => {
    const commands = [
      { name: 'ls', outputByPath: { '/home/user/Desktop': 'file1' } },
      { name: 'ls', allowedPaths: ['/home/user/Desktop'] }
    ];
    const result = resolveContextAwareCommand(commands, 'ls', '/home/user/Desktop');
    assert.equal(result.outputByPath['/home/user/Desktop'], 'file1');
  });

  it('fallback to defaultOutput when no path match', () => {
    const commands = [
      { name: 'ls', defaultOutput: 'fallback', outputByPath: {} }
    ];
    const result = resolveContextAwareCommand(commands, 'ls', '/unknown');
    assert.equal(result.defaultOutput, 'fallback');
  });

  it('respects blockedPaths with negative score', () => {
    const commands = [
      { name: 'cat', output: 'allowed' },
      { name: 'cat', output: 'blocked', blockedPaths: ['/etc'] }
    ];
    const result = resolveContextAwareCommand(commands, 'cat', '/etc');
    assert.equal(result.output, 'allowed'); // blocked scored -100
  });
});
```

### Integration Tests

```javascript
describe('CTF Command Execution', () => {
  it('executes different commands in different paths', async () => {
    // Setup level with path-aware ls
    // Call ls in /home/user/Desktop
    // Assert: desktop-specific output
    // Call ls in /home/user/Documents
    // Assert: documents-specific output
  });

  it('cleanup preserves path-aware variants', async () => {
    // Create level with 3 ls commands (different paths)
    // Run cleanup script
    // Assert: all 3 ls commands preserved
  });
});
```

---

## Performance Impact

- **Negligible**: Scoring loop runs only for commands with matching names
- **Example**: 100 commands, 3 with name='ls' → 3 iterations max
- **Memory**: Composite key strings (~100 bytes each) only in cleanup script

---

## Migration Guide

### No action required for existing levels

Old commands work as-is. To enable path-aware behavior:

### Step 1: Update command definition

**Before**:
```json
{ "name": "ls", "output": "Desktop Documents" }
```

**After**:
```json
{
  "name": "ls",
  "outputByPath": {
    "/home/user": "Desktop Documents",
    "/home/user/Desktop": "readme.txt"
  },
  "defaultOutput": "Desktop Documents"
}
```

### Step 2: Run cleanup script

```bash
node CYBackend/src/scripts/cleanupCTFLevels.js
```

### Step 3: Test command execution

Verify different output for same command in different paths

---

## Debug Logging

Enable debug logs to see resolution process:

```javascript
// In ctfExecutionController.js
console.debug('CTF execute - context-aware resolution', {
  cmdName: 'ls',
  currentPath: '/home/user/Desktop',
  candidateCount: 3,
  scores: [
    { score: 100, name: 'ls' },
    { score: 50, name: 'ls' },
    { score: 0, name: 'ls' }
  ],
  selected: 'ls' // (first one with score 100)
});
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Command lookup | `.find()` (first match) | Scoring algorithm (best match) |
| Multiple same names | Not supported | Fully supported |
| Path awareness | Single output field | Path-specific + default |
| Deduplication | By name only | By name + paths + output |
| Backward compat | N/A | Full support |
| Permission scoring | Binary (allow/deny) | Continuous (-100 to +100) |

---

## Constraints Met

✅ No API structure broken  
✅ Backward compatible with existing templates  
✅ Deterministic command resolution  
✅ Path-aware behavior enabled  
✅ Inline comments explaining strategy  
✅ No external documentation required  

