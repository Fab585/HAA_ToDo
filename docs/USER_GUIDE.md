# HABoard User Guide

Welcome to HABoard - your offline-first To-Do app for Home Assistant! This guide will help you get the most out of HABoard.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Tasks](#creating-tasks)
3. [Managing Tasks](#managing-tasks)
4. [Using Tags](#using-tags)
5. [Search and Filters](#search-and-filters)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Offline Mode](#offline-mode)
8. [Tips and Tricks](#tips-and-tricks)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing HABoard

After installation, access HABoard at:
```
http://your-home-assistant-ip:8123/local/haboard/
```

Or navigate through Home Assistant's sidebar (if configured).

### First Look

When you open HABoard, you'll see:
- **Header**: App name, online/offline status, sync button, tags button
- **Search Bar**: Quick search across all tasks
- **Filter Tabs**: Active, Done, All
- **New Task Button**: Create your first task
- **Task List**: Your tasks will appear here

---

## Creating Tasks

### Quick Create

1. Click the **"+ New Task"** button
2. Enter a task title (required)
3. Click **"Create Task"**

That's it! Your task is created and synced.

### Full Task Details

When creating a task, you can add:

#### **Title** (Required)
- What needs to be done
- Example: "Buy groceries"

#### **Notes** (Optional)
- Additional details or context
- Example: "Milk, eggs, bread from Whole Foods"

#### **Due Date** (Optional)
- When the task should be completed
- Click the date field to open date picker
- Shows as "Today", "Tomorrow", or the date

#### **Due Time** (Optional)
- Specific time for the task
- Example: "14:30" or "2:30 PM"

#### **Priority** (Optional)
- Choose from:
  - **None**: No priority (default)
  - **Low**: Nice to have
  - **Medium**: Should do soon
  - **High**: Important and urgent
- Priority shows as colored badge: !1 (High), !2 (Medium), !3 (Low)

#### **Tags** (Optional)
- Add one or more tags to categorize tasks
- Click existing tags to apply them
- Click **"+ Add Tag"** to create new tags inline
- Tags display as colored badges on tasks

### Keyboard Shortcut

Press **`/`** or **`N`** to quickly open the new task form!

---

## Managing Tasks

### Completing Tasks

**Method 1: Click Checkbox**
- Click the circle checkbox next to any task
- Task moves to "Done" filter
- Swipe right (>80px) on mobile to complete quickly

**Method 2: Swipe Gesture (Mobile)**
- Swipe right on a task (more than 80 pixels)
- Task is automatically marked as complete

### Editing Tasks

1. Click the **edit icon** (pencil) on any task
2. Modify any field
3. Click **"Update Task"**
4. Changes are saved and synced instantly

### Deleting Tasks

**Method 1: Delete Button**
- Click the **delete icon** (trash) on any task
- Confirm deletion in the popup
- Task is permanently removed

**Method 2: Swipe Gesture (Mobile)**
- Swipe left on a task (more than 80 pixels)
- Confirm deletion in the popup
- Task is permanently removed

### Uncompleting Tasks

1. Switch to **"Done"** filter
2. Click the checkbox on a completed task
3. Task moves back to "Active"

---

## Using Tags

### Why Use Tags?

Tags help you organize tasks by:
- **Category**: Work, Personal, Shopping, etc.
- **Context**: Home, Office, Errands, etc.
- **Project**: Vacation Planning, Home Renovation, etc.

### Creating Tags

**Method 1: Tag Manager**
1. Click the **tag icon** in the header
2. Enter tag name
3. Choose a color (10 presets or custom)
4. Click **"Create Tag"**

**Method 2: Inline Creation**
1. While creating/editing a task
2. Click **"+ Add Tag"** button
3. Type tag name and press **Enter**
4. Tag is created with default blue color

**Keyboard Shortcut**: Press **`T`** to open Tag Manager

### Applying Tags to Tasks

1. When creating or editing a task
2. Click on tag names to select/deselect them
3. Selected tags are highlighted in blue
4. Task displays colored tag badges

### Managing Tags

In the Tag Manager:
- **View all tags** with their colors
- **Delete tags** using the trash icon
- **Create new tags** with custom colors

---

## Search and Filters

### Searching Tasks

Use the search bar to find tasks by:
- **Title**: "Buy groceries"
- **Notes**: "Whole Foods"
- **Tags**: "Shopping"

**Features**:
- Real-time search (updates as you type)
- Case-insensitive
- Partial matching ("groc" finds "groceries")

**Keyboard Shortcut**: Press **`Ctrl+K`** (or **`Cmd+K`** on Mac) to focus search

### Filtering Tasks

Three filter options:

1. **Active** (Press `1`)
   - Shows incomplete tasks only
   - Your main working view

2. **Done** (Press `2`)
   - Shows completed tasks only
   - Review what you've accomplished

3. **All** (Press `3`)
   - Shows all tasks regardless of status
   - Complete overview

**Combined Search + Filter**:
- Search works within the current filter
- Example: Search "work" in "Active" filter shows only active work tasks

---

## Keyboard Shortcuts

HABoard supports 11 keyboard shortcuts for power users!

### Viewing All Shortcuts

Press **`?`** to see the complete list with descriptions.

### Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| **`/`** or **`N`** | Create new task |
| **`Escape`** | Close modal or form |
| **`?`** | Show keyboard shortcuts help |
| **`Ctrl/Cmd+K`** | Focus search bar |
| **`T`** | Open tag manager |
| **`1`** | Show Active tasks |
| **`2`** | Show Done tasks |
| **`3`** | Show All tasks |
| **`Ctrl/Cmd+S`** | Sync with server |

### Platform-Specific

- **Windows/Linux**: Use `Ctrl` key
- **Mac**: Use `Cmd` (⌘) key
- Shortcuts are displayed with the correct key for your platform

### Context-Aware

Shortcuts don't interfere with typing:
- When typing in an input field, shortcuts are disabled
- Focus stays on your text input

---

## Offline Mode

### How It Works

HABoard works completely offline!

**Features**:
- Create, edit, delete, and complete tasks without internet
- All changes saved locally in your browser
- Automatic sync when connection returns

### Indicators

**Online Status** (top right):
- 🟢 **Green "Online"**: Connected to Home Assistant
- 🔴 **Red "Offline"**: No connection, working offline

### Syncing

**Automatic Sync**:
- Changes sync automatically when online
- Real-time updates from other devices
- Connection restored notification appears

**Manual Sync**:
- Click the **sync icon** (circular arrows)
- Or press **`Ctrl/Cmd+S`**
- Shows spinning animation while syncing

**Last Synced**:
- Displays under the header
- Example: "Last synced: 2m ago"

### Offline Tips

1. **Work normally**: Everything works offline
2. **Multiple devices**: Changes merge when back online
3. **No data loss**: All changes preserved locally
4. **Conflict handling**: Server changes take precedence

---

## Tips and Tricks

### 🎯 Productivity Tips

1. **Use keyboard shortcuts** for faster task entry
2. **Tag consistently** for better organization
3. **Set priorities** for important tasks
4. **Add due dates** to stay on schedule
5. **Use search** to find tasks quickly

### 🏷️ Tag Organization Examples

**By Context**:
- @home, @work, @errands, @online

**By Project**:
- #vacation, #renovation, #birthday-party

**By Energy**:
- low-energy, high-energy, quick-wins

**By Person**:
- @john, @sarah, @family

### 📱 Mobile Tips

1. **Add to Home Screen**: Install as PWA for app-like experience
2. **Swipe gestures**: Quick complete (right) or delete (left)
3. **Touch-optimized**: All buttons ≥44px for easy tapping
4. **Works offline**: Perfect for on-the-go task management

### 🎨 Visual Organization

- **Use colors**: Different tag colors for different categories
- **Priority badges**: Quickly spot important tasks (!2 = High priority)
- **Due dates**: "Today" and "Tomorrow" stand out
- **Overdue tasks**: Red border alerts you

---

## Troubleshooting

### Tasks Not Syncing

**Check**:
1. Online/offline indicator (top right)
2. Home Assistant is running
3. Network connection is stable

**Try**:
1. Click the sync button manually
2. Refresh the page
3. Check Home Assistant logs

### Can't Create Tasks

**Check**:
1. Title field is not empty (required)
2. Page has loaded completely
3. Browser console for errors (F12)

**Try**:
1. Refresh the page
2. Clear browser cache
3. Try a different browser

### Tags Not Appearing

**Check**:
1. Tag was created successfully (shows in Tag Manager)
2. Tag is applied to the task

**Try**:
1. Refresh the page
2. Re-apply the tag
3. Check if tag exists in Tag Manager

### Search Not Working

**Check**:
1. Search query is typed correctly
2. Tasks exist matching your search
3. Current filter (Active/Done/All)

**Try**:
1. Clear search and try again
2. Switch to "All" filter
3. Refresh the page

### App Running Slow

**Try**:
1. Close other browser tabs
2. Clear browser cache
3. Restart browser
4. Check if you have 1000+ tasks (archive old ones)

### Lost Tasks

**Don't worry!** Tasks are stored both:
1. Locally in browser (IndexedDB)
2. On Home Assistant server (SQLite)

**To recover**:
1. Refresh the page (triggers sync)
2. Check "All" filter
3. Check "Done" filter
4. Use search to find them

---

## Frequently Asked Questions

### Can I access HABoard from multiple devices?

Yes! Changes sync automatically across all devices connected to your Home Assistant.

### Does HABoard work without internet?

Yes! Full offline support. All features work without connection.

### Are my tasks backed up?

Yes! Tasks are stored on your Home Assistant server. Regular Home Assistant backups include HABoard data.

### Can I import/export tasks?

Not in v0.1.0. This feature is planned for future releases.

### Does HABoard support recurring tasks?

Not yet. Recurring tasks are planned for v1.0.

### Can I share tasks with others?

Not directly. All users sharing the same Home Assistant instance see the same tasks.

### Is there a mobile app?

HABoard is a PWA (Progressive Web App). Install it on your home screen for an app-like experience.

### How do I uninstall HABoard?

Use HACS to uninstall, or manually delete the `custom_components/haboard/` folder.

---

## Getting Help

### Support Resources

- **Documentation**: `/docs` folder in GitHub repository
- **Issues**: [GitHub Issues](https://github.com/Fab585/HAA_ToDo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Fab585/HAA_ToDo/discussions)
- **Installation Guide**: `INSTALLATION.md`
- **Release Notes**: `RELEASE_NOTES.md`

### Reporting Bugs

When reporting bugs, include:
1. HABoard version (v0.1.0)
2. Home Assistant version
3. Browser and version
4. Steps to reproduce
5. Expected vs actual behavior
6. Console errors (F12 → Console)

### Feature Requests

We'd love to hear your ideas! Open a GitHub Discussion with:
1. Clear description
2. Use case explanation
3. Why it would help you

---

## What's Next?

### Coming in Beta

- Home Assistant authentication integration
- Enhanced mobile gestures
- Batch operations (select multiple tasks)
- Performance optimizations
- More keyboard shortcuts

### Coming in v1.0

- Natural language parsing ("tomorrow at 3pm")
- Calendar view
- Recurring tasks
- Subtasks
- Push notifications
- Import/export

---

## Quick Reference Card

### Essential Actions

| Action | Method |
|--------|--------|
| Create task | Click "+ New Task" or press `/` |
| Complete task | Click checkbox or swipe right |
| Edit task | Click pencil icon |
| Delete task | Click trash icon or swipe left |
| Search tasks | Type in search bar or `Ctrl+K` |
| Create tag | Click tag icon or press `T` |
| Sync now | Click sync icon or `Ctrl+S` |
| Show shortcuts | Press `?` |

### Filters

- Press `1` for Active tasks
- Press `2` for Done tasks
- Press `3` for All tasks

### Tips

- Works completely offline
- Auto-syncs when online
- Install as PWA for app feel
- Use keyboard shortcuts for speed
- Tag tasks for organization

---

**Happy task managing with HABoard!** 🎉

*For more information, see [INSTALLATION.md](../INSTALLATION.md) or [RELEASE_NOTES.md](../RELEASE_NOTES.md)*
