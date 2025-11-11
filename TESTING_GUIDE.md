# HABoard Testing Guide

## Testing Options

You have two main options for testing HABoard v0.1.0:

---

## Option 1: Full Testing in Home Assistant (Recommended)

This tests the complete stack: backend integration + frontend PWA + real-time sync.

### Prerequisites
- Home Assistant 2024.1+ instance (development or test instance recommended)
- SSH/Terminal access to Home Assistant
- Or: Home Assistant OS with File Editor add-on

### Installation Steps

#### Method A: Manual Installation (Fastest for Testing)

```bash
# 1. SSH into your Home Assistant instance

# 2. Navigate to custom_components directory
cd /config/custom_components

# 3. Clone the repository
git clone https://github.com/Fab585/HAA_ToDo.git haboard_temp
mv haboard_temp/custom_components/haboard ./
rm -rf haboard_temp

# 4. Restart Home Assistant
# In HA UI: Settings → System → Restart
```

#### Method B: HACS Custom Repository (Cleaner)

```bash
# 1. In Home Assistant:
# HACS → Integrations → ⋮ (three dots) → Custom repositories

# 2. Add repository:
URL: https://github.com/Fab585/HAA_ToDo
Category: Integration

# 3. Search for "HABoard" in HACS
# Click Download → Restart Home Assistant
```

### Configure Integration

```bash
# 1. After restart, go to:
Settings → Devices & Services → Add Integration

# 2. Search for "HABoard"

# 3. Complete setup wizard
# (Currently auto-configures with default settings)

# 4. Access the frontend:
http://your-ha-instance:8123/local/haboard/
```

### What to Test in Home Assistant

**Backend API:**
```bash
# Check if integration loaded
# Home Assistant Logs: Settings → System → Logs
# Look for: "Component haboard initialized"

# Test API endpoints manually:
curl http://localhost:8123/api/haboard/tasks \
  -H "Authorization: Bearer YOUR_LONG_LIVED_TOKEN"

# Check database created:
ls -la /config/.storage/haboard.db
```

**Frontend PWA:**
1. Open: `http://your-ha-instance:8123/local/haboard/`
2. Should see HABoard UI
3. Open DevTools → Application → Service Workers
4. Verify service worker registered

**Full Feature Test:**
- [ ] Create a task
- [ ] Edit a task
- [ ] Delete a task
- [ ] Add tags with colors
- [ ] Search tasks
- [ ] Filter (Active/Done/All)
- [ ] Toggle task completion
- [ ] Test swipe gestures (mobile)
- [ ] Test keyboard shortcuts (`/`, `?`, `1`, `2`, `3`)
- [ ] Toggle dark mode
- [ ] Test offline (DevTools → Network → Offline)
- [ ] Test sync (create task offline, go online)

---

## Option 2: Local Frontend Testing (Quick Development)

This tests only the frontend in isolation with a mock backend.

### Prerequisites
- Node.js 18+
- npm or pnpm

### Steps

```bash
# 1. Clone and navigate to frontend
cd HAA_ToDo/frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
# Navigate to: http://localhost:5173
```

### What This Tests

**Pros:**
- ✅ Fast hot-reload for UI development
- ✅ Test all frontend features
- ✅ Test PWA functionality
- ✅ Test offline capabilities
- ✅ Test keyboard shortcuts
- ✅ Test responsive design

**Cons:**
- ❌ No real backend API (will use mock/fail)
- ❌ No real-time sync testing
- ❌ No Home Assistant integration
- ❌ IndexedDB works but no server sync

### Mock Backend Mode

If you want to test with a mock backend locally:

```bash
# Edit: frontend/src/lib/api/client.ts
# Temporarily change baseUrl:

constructor(options: APIClientOptions = {}) {
  this.baseUrl = options.baseUrl || 'http://localhost:8123';
  // Change to:
  this.baseUrl = options.baseUrl || 'http://localhost:5000'; // Mock server
}
```

Then create a simple mock server (optional):

```javascript
// mock-server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let tasks = [];
let tags = [];

app.get('/api/haboard/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/haboard/tasks', (req, res) => {
  const task = { id: Date.now().toString(), ...req.body };
  tasks.push(task);
  res.json(task);
});

app.get('/api/haboard/tags', (req, res) => {
  res.json(tags);
});

app.listen(5000, () => console.log('Mock server on :5000'));
```

```bash
npm install express cors
node mock-server.js
```

---

## Option 3: Run Tests (No Manual Testing)

Just verify all automated tests pass:

### Unit Tests (Frontend)

```bash
cd frontend
npm test -- --run

# Expected: 44 tests passing
# Note: May show 3 unhandled rejection warnings (expected)
```

### E2E Tests (Frontend)

```bash
cd frontend
npm run test:e2e

# Or with UI:
npm run test:e2e:ui

# Expected: 62 tests across 5 browsers
```

### Python Tests (Backend)

```bash
cd HAA_ToDo
pip install -r requirements-dev.txt
pytest

# Expected: 25 tests passing
```

---

## Recommended Testing Sequence

### Phase 1: Quick Verification (5 minutes)
```bash
# Run automated tests
cd frontend && npm test -- --run
npm run build  # Verify production build works

# Check bundle size
ls -lh build/  # Should see ~45KB gzipped
```

### Phase 2: Local Frontend (15 minutes)
```bash
# Start dev server
npm run dev

# Open http://localhost:5173
# Test basic UI, offline mode, PWA features
```

### Phase 3: Full HA Integration (30 minutes)
```bash
# Install in Home Assistant (see Option 1)
# Test complete feature set
# Verify backend API, real-time sync, multi-device
```

---

## Common Issues & Solutions

### Issue: Frontend can't connect to backend
```bash
# Check Home Assistant API is accessible:
curl http://your-ha-instance:8123/api/

# Check HABoard integration loaded:
# HA Logs should show: "Component haboard initialized"

# Check firewall not blocking port 8123
```

### Issue: Service Worker not registering
```bash
# Must use HTTPS or localhost
# Check: DevTools → Console for SW errors
# Clear: DevTools → Application → Clear storage
```

### Issue: Database not created
```bash
# Check HA has write permissions:
ls -la /config/.storage/

# Check logs for SQL errors:
# Settings → System → Logs → Filter "haboard"
```

### Issue: CORS errors in browser
```bash
# This shouldn't happen with proper HA setup
# If testing locally with mock backend, add CORS headers

# In Home Assistant, check:
# configuration.yaml should NOT have restrictive CORS settings
```

---

## Performance Testing

### Bundle Size
```bash
cd frontend
npm run build

# Check sizes:
du -sh build/
gzip -c build/_app/immutable/chunks/*.js | wc -c

# Should be ~45KB gzipped total
```

### Database Performance
```bash
# In HA, create 1000 test tasks:
# Settings → Developer Tools → Services
# Service: haboard.create_task
# Run 1000 times (script it)

# Then test search speed:
# Should be <10ms for typical queries
# Check SQLite FTS5 performance
```

### Lighthouse Audit
```bash
# With frontend running:
# Chrome DevTools → Lighthouse
# Run audit with:
# - Performance
# - Accessibility
# - Best Practices
# - PWA

# Should get 90+ on all categories
```

---

## Test Checklist

### Critical Features ✅
- [ ] Create task with title, notes, due date, priority
- [ ] Edit existing task
- [ ] Delete task with confirmation
- [ ] Complete/uncomplete task
- [ ] Create tags with custom colors
- [ ] Apply multiple tags to tasks
- [ ] Search across title/notes/tags
- [ ] Filter by Active/Done/All
- [ ] Test keyboard shortcuts (11 total)
- [ ] Test swipe gestures (mobile)
- [ ] Test dark mode toggle
- [ ] Test offline mode (create tasks offline)
- [ ] Test sync (verify tasks sync when online)

### PWA Features ✅
- [ ] Service worker registers
- [ ] App installable (Add to Home Screen)
- [ ] Works offline
- [ ] Manifest.json valid
- [ ] Icons display correctly

### Accessibility ✅
- [ ] All buttons have labels
- [ ] Keyboard navigation works
- [ ] Screen reader announces elements
- [ ] Color contrast passes
- [ ] Focus indicators visible

### Performance ✅
- [ ] Bundle size <150KB (target: 45KB)
- [ ] Initial load <2s
- [ ] Search results <200ms
- [ ] Smooth animations (60fps)

---

## My Recommendation

**For your first test:**

1. **Start with Local Frontend** (5 min)
   - Quick verification that UI works
   - Test offline mode and PWA features
   ```bash
   cd frontend && npm run dev
   # Open http://localhost:5173
   ```

2. **Then Full HA Integration** (30 min)
   - Install in Home Assistant (dev instance if possible)
   - Test complete feature set
   - Verify backend + sync + multi-device

3. **If Issues Found:**
   - Run automated tests: `npm test`
   - Check logs in HA: Settings → System → Logs
   - Open browser DevTools → Console for errors

**This gives you confidence in both frontend and full integration.**

---

## Need Help?

**Check logs:**
- Frontend: Browser DevTools → Console
- Backend: HA Settings → System → Logs → Filter "haboard"
- Tests: Terminal output

**Common log locations:**
- Home Assistant: `/config/home-assistant.log`
- HABoard DB: `/config/.storage/haboard.db`
- Frontend build: `frontend/build/`

---

**Status**: Ready to test! 🧪
**Recommended**: Start with local frontend, then full HA integration
