# HABoard Manual Testing Guide (Private Repository)

**Version**: v0.1.0
**Date**: 2025-11-11
**Purpose**: Test HABoard on Home Assistant without HACS while repository is private

---

## Overview

This guide explains how to test HABoard on your Home Assistant instance without making the repository public or using HACS. Perfect for validating the integration before public launch.

---

## Quick Start

### Option 1: Automated Install (If You Have SSH Access to HA)

```bash
# On your development machine
cd /home/fabri/HAA_ToDo

# Run the installation script with your HA config path
./scripts/manual-install-test.sh /path/to/ha/config

# Example for Home Assistant OS:
./scripts/manual-install-test.sh /usr/share/hassio/homeassistant

# Example for Docker:
./scripts/manual-install-test.sh /home/youruser/homeassistant/config

# Then restart Home Assistant
```

### Option 2: Manual Transfer (Most Common)

```bash
# Step 1: Create test package (on dev machine)
cd /home/fabri/HAA_ToDo
./scripts/manual-install-test.sh

# Step 2: Transfer package to HA server
scp -r test_package/ root@your-ha-ip:/tmp/

# Step 3: On HA server, install files
ssh root@your-ha-ip
cd /tmp/test_package

# Copy integration
cp -r haboard /config/custom_components/

# Copy frontend
mkdir -p /config/www
cp -r www /config/www/haboard

# Set permissions
chown -R homeassistant:homeassistant /config/custom_components/haboard
chown -R homeassistant:homeassistant /config/www/haboard

# Step 4: Restart Home Assistant (via UI or CLI)
ha core restart
```

---

## What's in the Test Package?

The automated script creates `test_package/` containing:

```
test_package/
├── README.md              # Installation instructions
├── verify-install.sh      # Verification script
├── haboard/              # Integration files (96KB)
│   ├── __init__.py
│   ├── manifest.json
│   ├── const.py
│   ├── config_flow.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── views.py
│   └── database/
│       ├── __init__.py
│       ├── schema.sql
│       └── migrations/
└── www/                   # Frontend build (244KB)
    ├── index.html
    ├── service-worker.js
    ├── manifest.json
    ├── icon.svg
    └── _app/
        └── immutable/

Total Size: 348KB
```

---

## Installation Steps (Detailed)

### Prerequisites

- Home Assistant 2024.1.0 or newer
- SSH access to your HA server (or file manager add-on)
- ~10 minutes for installation and testing

### Step 1: Build and Package (Development Machine)

```bash
cd /home/fabri/HAA_ToDo/frontend

# Build fresh production bundle
npm run build

# Create test package
cd ..
./scripts/manual-install-test.sh
```

**Result**: Creates `test_package/` with all files needed

### Step 2: Transfer to Home Assistant

**Method A: SCP (Linux/Mac)**
```bash
scp -r test_package/ root@192.168.1.100:/tmp/
```

**Method B: SFTP (Windows/All)**
- Use WinSCP, FileZilla, or similar
- Upload `test_package/` to `/tmp/` on HA server

**Method C: Samba Share / File Editor Add-on**
- Use Home Assistant File Editor add-on
- Manually copy files via web interface

### Step 3: Install on Home Assistant

```bash
# SSH into Home Assistant
ssh root@your-ha-ip

# Navigate to package
cd /tmp/test_package

# Create directories
mkdir -p /config/custom_components
mkdir -p /config/www

# Install integration
cp -r haboard /config/custom_components/

# Install frontend
cp -r www /config/www/haboard

# Set ownership (important!)
chown -R homeassistant:homeassistant /config/custom_components/haboard
chown -R homeassistant:homeassistant /config/www/haboard

# Verify installation
./verify-install.sh
```

### Step 4: Restart Home Assistant

**Via UI**: Settings → System → Restart
**Via CLI**: `ha core restart`

Wait 2-3 minutes for HA to fully restart.

### Step 5: Add Integration

1. Go to **Settings → Devices & Services**
2. Click **"+ Add Integration"** (bottom right)
3. Search for **"HABoard"**
4. Click **HABoard** and follow setup wizard
5. Should auto-configure with default settings

### Step 6: Access HABoard

Navigate to: `http://your-ha-ip:8123/local/haboard/`

---

## Verification Checklist

Use the included `verify-install.sh` script or manually check:

### ✅ Backend Verification

```bash
# Check integration files exist
ls -la /config/custom_components/haboard
# Should see: __init__.py, manifest.json, api/, database/

# Check manifest version
cat /config/custom_components/haboard/manifest.json | grep version
# Should show: "version": "0.1.0"

# Check Home Assistant logs
grep -i "haboard" /config/home-assistant.log | tail -20
# Should see: "Setup of domain haboard took..." or similar

# Check integration is loaded
ha integrations list | grep haboard
```

### ✅ Frontend Verification

```bash
# Check frontend files exist
ls -la /config/www/haboard
# Should see: index.html, service-worker.js, manifest.json, _app/

# Check file sizes
du -sh /config/www/haboard/*
# index.html should be ~1.5KB
# service-worker.js should be ~6KB

# Test HTTP access (from HA server)
curl -I http://localhost:8123/local/haboard/
# Should return: HTTP/1.1 200 OK
```

### ✅ Browser Verification

Open `http://your-ha-ip:8123/local/haboard/` and check:

1. **Page loads** within 1-2 seconds
2. **No console errors** (F12 → Console)
3. **Service worker registers** (F12 → Application → Service Workers)
4. **IndexedDB created** (F12 → Application → IndexedDB → haboard-db)
5. **WebSocket connects** (F12 → Network → WS filter)

---

## Testing Checklist

### Core Features (30 minutes)

#### Task Management
- [ ] Click **"+ New Task"** or press `/`
- [ ] Create task with title: "Test Task 1"
- [ ] Add notes: "This is a test note"
- [ ] Set priority: **Medium**
- [ ] Set due date: Tomorrow
- [ ] Click **"Create Task"**
- [ ] **Verify**: Task appears immediately

#### Task Operations
- [ ] **Complete**: Click checkbox → task marked complete
- [ ] **Uncomplete**: Click checkbox again → task active
- [ ] **Edit**: Click edit button (pencil icon)
- [ ] Change title to "Updated Task 1"
- [ ] **Save**: Click "Update Task"
- [ ] **Delete**: Click delete button (trash icon)
- [ ] Confirm deletion → task removed

#### Tags
- [ ] Create task with tag
- [ ] Click **"Add Tag"**
- [ ] Enter tag name: "urgent"
- [ ] Choose color: Red preset
- [ ] **Verify**: Tag appears with red color
- [ ] Create multiple tags on same task
- [ ] Filter by tag (if implemented)

#### Search & Filters
- [ ] Create 5+ tasks with varying titles
- [ ] Use search box (or press `/`)
- [ ] Search for keyword
- [ ] **Verify**: Results filter in real-time
- [ ] Click **"Active"** filter → only incomplete tasks
- [ ] Click **"Done"** filter → only completed tasks
- [ ] Click **"All"** filter → all tasks visible

#### Keyboard Shortcuts
- [ ] Press **`?`** → shortcuts modal appears
- [ ] Press **`/`** → focus search
- [ ] Press **`n`** → new task form
- [ ] Press **`Esc`** → close form/modal
- [ ] Press **`1`** → set priority Low
- [ ] Press **`2`** → set priority Medium
- [ ] Press **`3`** → set priority High

### Offline Mode (15 minutes)

- [ ] Disable network (airplane mode or disconnect Wi-Fi)
- [ ] **Verify**: "Offline" indicator appears
- [ ] Create 3 new tasks while offline
- [ ] Edit existing task
- [ ] Complete 2 tasks
- [ ] Delete 1 task
- [ ] **Verify**: All operations work instantly (no errors)
- [ ] Re-enable network
- [ ] **Verify**: "Online" indicator appears
- [ ] **Verify**: All changes sync to server
- [ ] Check in another browser/device → changes visible

### Real-Time Sync (10 minutes)

Requires 2 devices or 2 browser windows:

- [ ] Open HABoard on Device A and Device B
- [ ] On Device A: Create task "Sync Test"
- [ ] On Device B: **Verify**: Task appears within 2 seconds
- [ ] On Device B: Complete the task
- [ ] On Device A: **Verify**: Task marked complete within 2 seconds
- [ ] On Device A: Delete the task
- [ ] On Device B: **Verify**: Task removed within 2 seconds

### Mobile / PWA (15 minutes)

- [ ] Open on mobile browser (Chrome/Safari)
- [ ] Check responsive design works
- [ ] Tap **"Install"** or browser menu → "Add to Home Screen"
- [ ] **Verify**: HABoard icon appears on home screen
- [ ] Launch from home screen
- [ ] **Verify**: Opens in standalone mode (no browser UI)
- [ ] Test swipe gestures (if implemented):
  - [ ] Swipe right → complete task
  - [ ] Swipe left → delete task

### Performance (5 minutes)

- [ ] Create 50+ tasks quickly (use script or manual)
- [ ] **Verify**: App remains responsive
- [ ] Search through large task list
- [ ] **Verify**: Search is instant (<200ms)
- [ ] Complete/uncomplete multiple tasks rapidly
- [ ] **Verify**: No lag or freezing

### Accessibility (10 minutes)

- [ ] Navigate entire app using **Tab** key only
- [ ] **Verify**: All interactive elements reachable
- [ ] **Verify**: Focus indicators visible
- [ ] Activate buttons with **Enter/Space**
- [ ] Test screen reader (optional):
  - [ ] NVDA (Windows) or VoiceOver (Mac)
  - [ ] **Verify**: Task details announced
  - [ ] **Verify**: Button labels clear

---

## Troubleshooting

### Integration Not Appearing

**Symptom**: Can't find "HABoard" when adding integration

**Solutions**:
```bash
# 1. Verify files are in place
ls /config/custom_components/haboard/__init__.py

# 2. Check manifest is valid JSON
cat /config/custom_components/haboard/manifest.json

# 3. Check HA logs for errors
grep -i "haboard" /config/home-assistant.log | grep -i error

# 4. Restart HA completely (not just quick reload)
ha core restart

# 5. Clear HA cache (if issue persists)
rm -rf /config/.storage/core.config_entries
ha core restart  # Warning: This removes ALL integrations!
```

### Frontend Shows 404

**Symptom**: "404 Not Found" when accessing `/local/haboard/`

**Solutions**:
```bash
# 1. Verify frontend files exist
ls -la /config/www/haboard/index.html

# 2. Check file permissions
ls -la /config/www/haboard

# 3. Verify file ownership
stat /config/www/haboard/index.html

# 4. Fix permissions
chown -R homeassistant:homeassistant /config/www/haboard
chmod -R 755 /config/www/haboard

# 5. Clear browser cache
# - Hard refresh: Ctrl+Shift+R (Windows/Linux)
# - Hard refresh: Cmd+Shift+R (Mac)
# - Or clear browser cache entirely
```

### WebSocket Won't Connect

**Symptom**: "Offline" indicator stays on, sync not working

**Solutions**:
1. **Check integration is running**:
   ```bash
   grep "websocket" /config/home-assistant.log
   ```

2. **Verify HA API is accessible**:
   ```bash
   curl http://localhost:8123/api/haboard/tasks
   ```

3. **Check browser console** (F12 → Console):
   - Look for WebSocket connection errors
   - Should see: `WebSocket connection opened`

4. **Check CORS settings** (if using reverse proxy):
   - Add HABoard API paths to allowed origins
   - Ensure WebSocket upgrade headers allowed

### Tasks Not Syncing

**Symptom**: Changes don't appear on other devices

**Solutions**:
1. **Check WebSocket** is connected (see above)

2. **Verify API is responding**:
   ```bash
   curl -X GET http://localhost:8123/api/haboard/tasks
   # Should return JSON array of tasks
   ```

3. **Check outbox** (F12 → Application → IndexedDB → outbox):
   - If stuck items in outbox → sync queue issue
   - Clear outbox and retry

4. **Check server logs** for errors:
   ```bash
   grep -i "error" /config/home-assistant.log | grep -i haboard
   ```

### Service Worker Not Registering

**Symptom**: Offline mode doesn't work, no caching

**Solutions**:
1. **Check HTTPS**: Service workers require HTTPS or localhost
   - Use `https://your-ha-ip:8123/` instead of HTTP
   - Or use Nabu Casa URL

2. **Check service worker file** exists:
   ```bash
   ls /config/www/haboard/service-worker.js
   ```

3. **Verify registration** (F12 → Application → Service Workers):
   - Should show "haboard" worker as "activated"
   - If not, check console for registration errors

4. **Clear service workers**:
   - F12 → Application → Service Workers → Unregister
   - Hard refresh page (Ctrl+Shift+R)

---

## Performance Expectations

Based on v0.1.0 testing:

| Metric | Target | Actual (Dev) |
|--------|--------|--------------|
| Bundle Size | <150KB | **45KB** gzipped ✅ |
| First Load | <3s | **1-2s** ✅ |
| Task Creation | <500ms | **<100ms** ✅ |
| Search (FTS5) | <200ms | **0.36ms** ✅ |
| WebSocket Latency | <500ms | **<100ms** (LAN) ✅ |
| Offline Operations | Instant | **<50ms** ✅ |

If your results significantly differ, check:
- Network latency (HA on different VLAN?)
- Database size (1000+ tasks?)
- Hardware (RPi Zero vs RPi 4?)

---

## Test Scenarios

### Scenario 1: Power User Workflow

1. Press `/` to focus search
2. Type "meeting"
3. Press `n` to create task
4. Fill in: "Prepare meeting notes"
5. Press `Tab` to move through fields
6. Press `2` for Medium priority
7. Press `Enter` to save
8. Press `?` to view shortcuts
9. Navigate with `Tab`, complete with `Enter`

**Expected**: Smooth, keyboard-only workflow

### Scenario 2: Mobile On-the-Go

1. Create task on desktop
2. Leave house (HA becomes unavailable)
3. Open HABoard on phone
4. Verify task synced before leaving
5. Complete task offline
6. Return home (HA reconnects)
7. Verify completion synced to desktop

**Expected**: Seamless offline→online transition

### Scenario 3: Family Shared Tasks

1. User A creates task "Buy groceries"
2. User B sees it immediately (<2s)
3. User B adds tag "urgent"
4. User A sees tag update immediately
5. User A completes task
6. User B sees completion immediately

**Expected**: Real-time collaboration

---

## Automated Testing (Optional)

If you want to run the full test suite:

### Unit Tests (Vitest)

```bash
cd /home/fabri/HAA_ToDo/frontend

# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Expected: 44 tests passing
```

### E2E Tests (Playwright)

```bash
cd /home/fabri/HAA_ToDo/frontend

# Install browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI (see tests in browser)
npm run test:e2e:ui

# Expected: 62 tests passing across 5 browsers
```

---

## Reporting Issues

If you find bugs during testing:

### 1. Check Known Issues

See [FINAL_RELEASE_STATUS.md](FINAL_RELEASE_STATUS.md) for known limitations.

### 2. Gather Debug Info

```bash
# Backend logs
grep -i "haboard" /config/home-assistant.log > haboard.log

# Frontend console errors
# F12 → Console → Right-click → Save As → console.log

# Browser info
# F12 → Console → paste:
navigator.userAgent

# System info
ha core info
```

### 3. Create Bug Report

Include:
- **Description**: What happened vs expected
- **Steps to reproduce**: 1. Do this, 2. Then this, 3. See error
- **Environment**:
  - Home Assistant version
  - Browser and version
  - Device (RPi 4, Docker, etc.)
- **Logs**: Attach haboard.log and console.log
- **Screenshots**: If UI issue

---

## Next Steps

After successful manual testing:

### Option A: Keep Testing Privately
- Invite trusted users to test
- Share `test_package/` with them
- Gather feedback privately

### Option B: Go Public
1. Merge this branch to `main`
2. Make repository public on GitHub
3. Create GitHub Release v0.1.0
4. Test HACS installation end-to-end
5. Launch beta recruitment program

### Option C: Hybrid Approach
1. Keep repo private for now
2. Continue private testing for 1-2 weeks
3. Fix any critical issues found
4. Then go public with v0.1.1 (polished)

---

## Support

- **Documentation**: `/home/fabri/HAA_ToDo/docs/`
- **User Guide**: `docs/USER_GUIDE.md`
- **Test Report**: `docs/TEST_REPORT.md`
- **Questions**: Create an issue (once public)

---

**Ready to test? Run the script and let's validate HABoard!** 🚀

```bash
cd /home/fabri/HAA_ToDo
./scripts/manual-install-test.sh
```
