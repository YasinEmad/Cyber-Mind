# Template Creation: Quick Guide for Admins

## What Changed?

### ❌ Old Process (Before)
```
1. Click "New" Template button
2. Manually type Template ID (e.g., "cmd_ssh_v1")
3. Type Template Name
4. Enter Base Command
5. Configure Fields
6. Click "Create"
```

**Problems:**
- Prone to typos and errors
- Admins might accidentally use duplicate IDs
- Time-consuming to come up with IDs
- No standardized format

---

### ✅ New Process (Now)
```
1. Click "New" Template button
2. Enter Template Name (e.g., "SSH Command Template")
3. Enter Base Command (e.g., "ssh {user}@{host}")
4. Configure Fields
5. Click "Create"
6. ✓ ID is auto-generated & shown in success message
```

**Benefits:**
- No manual ID entry needed
- IDs are guaranteed unique
- Faster template creation
- Consistent ID format across all templates

---

## Step-by-Step: Creating a Template

### 1. Open Admin Panel
   - Navigate to Admin Settings
   - Click on "Command Templates"

### 2. Click "New" Button
   - The template form appears
   - Notice: **No Template ID field!**
   - Instead, you'll see: "Will be auto-generated" ✓

### 3. Fill in Required Information
   - **Name:** Enter a descriptive name (e.g., "SSH Connection")
   - **Base Command:** Enter the base command template (e.g., "ssh {user}@{host}")
   - **Fields:** List the placeholders to fill (e.g., "user, host")
   - **Commands (Optional):** Add predefined command outputs
   - **Description (Optional):** Add helpful info about this template

### 4. Click "Create"
   - Template is created successfully
   - **Success notification appears** showing:
     ```
     ✓ Template created successfully
     Template ID: TMPL_1735689123456_a7f9k2m
     ```
   - The ID is automatically generated and displayed
   - Notification auto-closes after 5 seconds

---

## Understanding Your Template ID

### Format
```
TMPL_<timestamp>_<random>
```

**Example:**
```
TMPL_1735689123456_a7f9k2m
```

### Components
- **TMPL_** → Prefix indicating this is a Template
- **1735689123456** → Timestamp when created (sortable by date)
- **a7f9k2m** → Random component ensuring uniqueness

### Why This Format?
- ✓ Globally unique (no collisions)
- ✓ Chronologically sortable
- ✓ Easy to identify as a template
- ✓ Works well in databases and systems

---

## Editing a Template

### Important: Template ID is Protected
When you edit an existing template:
- The **Template ID field is visible but grayed out**
- You **cannot change the ID**
- This protects template history and references
- You can edit everything else:
  - Name
  - Base Command
  - Fields
  - Commands
  - Description

---

## Visual Guide: Form Appearance

### Creating a New Template
```
┌─────────────────────────────────────┐
│         Command Templates            │
├─────────────────────────────────────┤
│                                      │
│  [New] [Close]                       │
│                                      │
│  Template ID:                        │
│  ┌──────────────────────────────┐   │
│  │ ✓ Will be auto-generated     │   │ ← No input field!
│  └──────────────────────────────┘   │
│                                      │
│  Name:                               │
│  ┌──────────────────────────────┐   │
│  │ [Enter name here]            │   │ ← You type here
│  └──────────────────────────────┘   │
│                                      │
```

### Editing an Existing Template
```
┌─────────────────────────────────────┐
│         Command Templates            │
├─────────────────────────────────────┤
│                                      │
│  Template ID (Auto-generated):       │
│  ┌──────────────────────────────┐   │
│  │ TMPL_1735689123456_a7f9k2m   │   │ ← Read-only, grayed out
│  └──────────────────────────────┘   │
│  (Cannot be changed)                 │
│                                      │
│  Name:                               │
│  ┌──────────────────────────────┐   │
│  │ [You can edit this]          │   │ ← You can modify
│  └──────────────────────────────┘   │
│                                      │
```

---

## Success Notification Example

After creating a template:

```
┌─────────────────────────────────────────┐
│ ✓ Template created successfully         │
│   Template ID: TMPL_1735689123456_a7f9k2m│
└─────────────────────────────────────────┘
       (Auto-closes after 5 seconds)
```

Copy the ID from the notification if needed!

---

## Troubleshooting

### "I don't see the Template ID"
- **When Creating:** This is correct! The ID will be shown after creation.
- **When Editing:** If you don't see it, refresh the page and try again.

### "I need to know the Template ID before creating"
- No problem! Create the template first.
- The ID is shown in the success notification.
- You can edit the template later to see the ID again.

### "The Template ID field is grayed out when editing"
- This is intentional! Template IDs cannot be changed.
- You can still edit the template name and other settings.
- If you need to change the ID, create a new template.

---

## FAQ

**Q: Can I customize the template ID?**
A: No, template IDs are system-generated to ensure uniqueness and prevent conflicts.

**Q: Will my old templates still work?**
A: Yes! This change only affects new templates. Existing templates are unaffected.

**Q: How are these IDs unique?**
A: They use a combination of creation timestamp + random data, making collisions nearly impossible.

**Q: Can I export the Template ID?**
A: Yes, it's displayed in the success notification and visible in the template list.

**Q: What if I need to change a template ID?**
A: Create a new template instead. Old templates can be deleted if no longer needed.

---

## Best Practices

1. ✓ Use descriptive **Names** (the ID is system-managed)
2. ✓ Add **Descriptions** to help other admins
3. ✓ Test templates before deploying to users
4. ✓ Keep template names consistent and organized
5. ✓ Document which templates are used for what

---

**Questions?** Check the full implementation guide in `TEMPLATE_ID_AUTO_GENERATION.md`
