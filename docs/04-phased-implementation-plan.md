# HABoard — Phased Implementation Plan (MVP to Full Vision)

*Created: 10 Nov 2025*
*Strategy: Incremental delivery with continuous user feedback*

---

## 🎯 Philosophy

**Build → Ship → Learn → Iterate**

Each phase delivers **real user value** and validates assumptions before building more. We maintain the full vision (Canvas 1 + 2) but sequence features intelligently to:

1. **Prove the concept** early (MVP)
2. **Get feedback** from real usage
3. **De-risk complexity** (start simple, add sophistication)
4. **Deliver value continuously** (every phase is useful)

---

## 📊 Release Phases Overview

| Phase | Timeline | Focus | Key Question |
|-------|----------|-------|--------------|
| **MVP (v0.1)** | 6-8 weeks | Core task management + basic HA | "Does this concept work?" |
| **Beta (v0.5)** | +14 weeks (4-6 months total) | Daily driver + key differentiators | "Is this useful daily?" |
| **V1.0** | +32 weeks (9-12 months total) | Feature complete + collaboration | "Is this production ready?" |
| **V2.0+** | 12+ months | Advanced features + ML | "What's next?" |

---

## 🗓️ Complete Timeline: Zero to V1.0 Public Release

### **Phase 0: Validation Spikes (Weeks 1-2)**
- Run 4 critical experiments to validate unknowns
- Gate: All spikes must pass before MVP development

### **Phase 1: MVP Development (Weeks 3-10)**
- **Week 1-2:** Foundation + validation spikes
- **Week 3-4:** Backend + sync
- **Week 5-6:** Frontend core + offline
- **Week 7-8:** Features + polish
- **Week 9-10:** MVP testing with 5-10 pilot users
- **Deliverable:** Working offline-first task app with basic HA integration

### **Phase 2: Beta Development (Weeks 11-24)**
- **Week 11-12:** Shared boards foundation
- **Week 13-14:** Vector clocks + conflict resolution
- **Week 15-16:** Kiosk mode
- **Week 17-18:** Voice via Assist
- **Week 19-20:** Presence awareness + smart digests
- **Week 21-22:** Lovelace card + polish
- **Week 23-24:** Beta testing with 20-50 users
- **Deliverable:** Daily driver quality with kiosk, voice, presence

### **Phase 3: V1.0 Development (Weeks 25-56)**
- **Week 25-26:** Calendar integration
- **Week 27-28:** Time blocking
- **Week 29-30:** Smart suggestions
- **Week 31-32:** Sensor-triggered tasks
- **Week 33-34:** Device completion + zones
- **Week 35-36:** Advanced collaboration
- **Week 37-38:** Board sections
- **Week 39-40:** Weekly planning ritual
- **Week 41-42:** Grocery & errands flow
- **Week 43-44:** Accessibility (WCAG AAA)
- **Week 45-46:** Internationalization
- **Week 47-48:** Security audit + polish
- **Week 49-50:** Performance optimization
- **Week 51-52:** Beta testing (100+ users)
- **Week 53-54:** Production hardening
- **Week 55-56:** Public release 🚀
- **Deliverable:** Production-ready, feature-complete, 500+ users

### **Total Timeline: 56 weeks (~13 months)**

**Critical Path Dependencies:**
- Validation spikes → MVP → Beta → V1.0
- Each phase has Go/No-Go gate (can extend if not met)
- User feedback loops inform next phase planning

**Staffing Requirements:**
- **Weeks 1-10 (MVP):** 1 full-stack developer
- **Weeks 11-24 (Beta):** 1-2 full-stack developers
- **Weeks 25-56 (V1.0):** 2 full-stack developers + part-time UX/QA

**Flexibility:**
- Each phase can extend if success metrics not met
- Features can be deferred based on user feedback
- Timeline assumes no major blockers or pivots

---

## 🚀 MVP (v0.1) — "Prove the Concept"

**Timeline:** 6-8 weeks *(reduced from 8-12 weeks via scope refinement)*
**Goal:** Ship minimal viable product that validates offline-first + HA integration
**Users:** 5-10 pilot testers (you + trusted HA community members)

### User Stories Included *(Reduced from 8 to 5 core stories)*

| ID | Story | Why MVP | Complexity |
|----|-------|---------|------------|
| **US-1** | Quick Add (Natural Language - Optional) | Core value — fast capture | Medium |
| **US-7** | One-Swipe Triage | Core UX — fast completion | Low |
| **US-20** | Powerful Search | Essential for 50+ tasks | Medium |
| **US-25** | Offline-First | Core differentiator | High |
| **US-26** | Real-Time Sync (basic) | Core differentiator | High |

### Deferred to Beta (Scope Reduction)

| ID | Story | Why Deferred | Move to |
|----|-------|--------------|---------|
| **US-3** | Quick Capture from Anywhere | Keyboard shortcuts are polish | Beta |
| **US-8** | Actionable Notifications | Basic notifications sufficient for MVP | Beta |
| **US-11** | Assign to a Person | Family features belong with shared boards | Beta |

### Features Included

#### ✅ Core Task Management
- **Quick Add with OPTIONAL NLP:**
  - **Primary:** Structured form (title, date picker, time picker, tags dropdown)
  - **Optional Enhancement:** Parse natural language with `chrono` if present
  - Philosophy: Don't overestimate NLP accuracy; let users choose input method
- **CRUD Operations:** Create, read, update, delete tasks
- **Basic fields:** Title, notes, due date/time, priority (none/low/medium/high), tags
- **Swipe gestures:** Right to complete, left to snooze (presets only: 1h, 3h, tomorrow)
- **Filters:** Today, Overdue, All, By Tag
- **NO assignee in MVP** — Single-user experience; family features in Beta

#### ✅ Mobile PWA (Offline-Capable)
- **SvelteKit PWA** with Service Worker
- **IndexedDB cache** for tasks (full offline CRUD)
- **Optimistic UI** (instant feedback, reconcile on sync)
- **Performance:**
  - Initial bundle <150 KB
  - TTI <2s on mid-range phone
  - Offline: cache today + current board

#### ✅ Basic Home Assistant Integration
- **Custom Integration (`haboard`):**
  - `todo.default` entity (mirrors all tasks)
  - Service: `haboard.add_item` (for automations)
  - Service: `haboard.complete_item`
  - Service: `haboard.update_item`
- **REST API:** `/api/haboard/tasks` (CRUD endpoints)
- **Basic WebSocket:** Subscribe to task updates

#### ✅ Sync (Simplified for MVP)
- **Database:** **SQLite ONLY** (WAL mode + FTS5)
  - No PostgreSQL in MVP — reduces deployment complexity
  - Migration to PostgreSQL planned for Beta if LISTEN/NOTIFY needed
  - Optimize SQLite: proper indexes, query planning, FTS5 for search

- **Conflict Resolution:** **Hybrid LWW + Simple CRDT**
  - **Task metadata:** Last-Write-Wins with timestamp (title, notes, due, priority)
  - **Task completion:** TRUE always wins (once done, stays done)
  - **Tags:** Set union (no data loss on merge)
  - **Why:** Prevents common family frustration (lost tasks) without full CRDT complexity
  - Store: `modified_at` + `device_id` + `completed_at`
  - Show toast on conflict: "⚠️ Merged changes from [device]"

- **Sync Protocol:**
  - Outbox pattern (IndexedDB queue for offline writes)
  - Retry with exponential backoff (2s, 4s, 8s, 16s)
  - WebSocket for realtime push (with 30s polling fallback)
  - Sync on app foreground + visibility change

#### ✅ Notifications (Basic)
- **Web Push** (primary) with single action button (Open)
- **Timing:** Due-now reminders only (at due time, no digest yet)
- **Targeting:** All devices (no assignee filtering in MVP)
- **Defer to Beta:** Action buttons (Complete, Snooze), smart digests, assignee targeting

#### ✅ Basic UI/UX
- **Mobile-first design:**
  - Bottom navigation (Today, All, Search, Settings)
  - FAB for quick add
  - Swipe gestures with haptics
- **Light/Dark mode** (respects system preference)
- **Basic accessibility:**
  - Semantic HTML
  - ARIA labels on interactive elements
  - Keyboard navigation (/, Enter, Escape)

### What's DEFERRED (for Beta/V1.0)

❌ Kiosk mode
❌ Ambient idle mode
❌ Lit custom card for Lovelace
❌ Voice via Assist
❌ Presence awareness
❌ Sensor-triggered tasks
❌ Weather/daylight awareness
❌ Calendar integration
❌ Time blocking
❌ Shared boards with roles
❌ Activity log
❌ Vector clocks / sophisticated conflict resolution
❌ Smart suggestions
❌ Digest notifications
❌ Weekly planning ritual
❌ Child mode
❌ RTL support

### Success Metrics (MVP)

**Must achieve to proceed:**
- ✅ 5 pilot users use it daily for 2 weeks
- ✅ <3 critical bugs reported
- ✅ Offline → online sync works 95%+ of the time
- ✅ Performance budgets met (bundle size, TTI)
- ✅ Positive feedback: "I'd use this over my current app"

**Learn:**
- Which features are missing most?
- Is NLP parsing good enough?
- Is LWW conflict resolution acceptable?
- Do users want kiosk mode or is mobile enough?

### Error Handling & Degradation (NEW)

**Critical: Define fallback behaviors early to prevent user frustration**

| Error Scenario | Degradation Strategy | User Experience |
|----------------|---------------------|-----------------|
| **WebSocket disconnects** | Fall back to 30s polling | Toast: "Syncing slower — reconnecting..." |
| **IndexedDB quota exceeded** | Warn at 80%; offer to archive old completed tasks | Modal: "Storage almost full. Archive tasks?" |
| **HA integration crashes** | Local-only mode; queue all changes | Banner: "Offline mode — changes will sync when server returns" |
| **Network timeout** | Retry 4 times (2s, 4s, 8s, 16s); then local-only | No UI change; sync icon spins; toast on failure |
| **Conflict resolution fails** | Show side-by-side diff; let user choose | Modal: "Both devices changed '[task title]'. Keep which version?" |
| **Service Worker update fails** | Prompt user to refresh | Toast: "Update available. Refresh to get latest features." |

**Recovery Mechanisms:**
- **Auto-retry:** All network operations retry with exponential backoff
- **Local-first:** App fully functional offline; sync when connection restored
- **State reconciliation:** On reconnect, sync all outbox items before new operations
- **Error logging:** Ship errors to HA logs (integration) + browser console (PWA)

### Migration Strategy (NEW)

**Zero-downtime upgrades between versions**

#### MVP → Beta Migration (SQLite stays, schema changes)
**Changes:**
- Add `board_id`, `assignee_user_id` columns to tasks table
- Add `boards` and `board_members` tables
- Add `vector_clock` JSONB column for improved conflict resolution

**Migration Process:**
1. **Pre-migration check:** Validate SQLite file integrity
2. **Backup:** Copy `haboard.db` to `haboard.db.backup-{timestamp}`
3. **Schema upgrade:** Run `alembic upgrade head` (auto-applied by integration)
4. **Data migration:**
   - Create default "Personal" board for all existing tasks
   - Set `vector_clock` = `{"device_id": modified_at}` (initialize from LWW)
5. **Rollback plan:** If migration fails, restore from backup; integration stays at MVP version

**User Impact:** Automatic on integration restart; no action required

#### Beta → V1.0 Migration (Optional: SQLite → PostgreSQL)
**Only if user wants PostgreSQL for LISTEN/NOTIFY performance**

**Migration Process:**
1. **User opts in:** Configuration UI in HA integration settings
2. **Export SQLite to SQL dump:** `sqlite3 haboard.db .dump > export.sql`
3. **Convert to PostgreSQL syntax:** Script handles type conversions
4. **Import to PostgreSQL:** `psql < export-converted.sql`
5. **Update integration config:** Point to PostgreSQL connection string
6. **Validation:** Check row counts match; spot-check 10 tasks
7. **Rollback plan:** Keep SQLite file; revert config if issues found

**User Impact:** Opt-in only; requires PostgreSQL setup; 10-30 min downtime

**Backward Compatibility Promise:**
- Old PWA versions continue working with new integration (API versioned)
- Integration auto-migrates database schema on upgrade
- No breaking changes to WebSocket protocol within major versions

### Testing Strategy (NEW)

**5 Golden Paths (Must pass before release)**

These critical flows must work flawlessly:

1. **Offline Add → Sync → Complete**
   - Open app (offline)
   - Add task "Buy milk"
   - Go online
   - See task sync to server (< 2s)
   - Complete task on different device
   - Original device sees completion (< 2s)

2. **Concurrent Edit → Conflict Resolution**
   - Device A: Edit task title to "Buy whole milk" (offline)
   - Device B: Edit same task title to "Buy oat milk" (offline)
   - Both go online
   - Verify conflict resolution (LWW with toast notification)
   - No data loss (history preserved)

3. **Voice Add → Notification → Swipe Complete**
   - Say "Hey HA, add buy groceries to my todo list tomorrow 6pm"
   - Verify task appears in PWA with correct due date
   - Wait until tomorrow 6pm
   - Receive Web Push notification
   - Tap notification → opens app
   - Swipe task right to complete

4. **Search with 1000 Tasks**
   - Import 1000 sample tasks
   - Type search query: "milk"
   - Results appear in < 200ms
   - Verify FTS5 ranking (exact match ranks higher)

5. **App Offline for 24h → Bulk Sync**
   - Add 20 tasks offline over 24 hours
   - Go online
   - All 20 sync successfully (< 10s)
   - Verify order preserved
   - No duplicates

**Test Coverage Targets:**
- **Unit tests:** >80% coverage for business logic (sync, conflict resolution, NLP parsing)
- **Integration tests:** All API endpoints + WebSocket messages
- **E2E tests:** 5 golden paths (Playwright on mobile viewport)
- **Performance tests:** Bundle size, TTI, sync latency benchmarked in CI
- **Accessibility tests:** axe-core on all pages; keyboard navigation manual test

**Test Execution:**
- **Pre-commit:** Unit tests (< 5s)
- **Pre-push:** Unit + integration tests (< 30s)
- **CI (every push):** Full suite + performance + bundle size
- **Weekly:** E2E on real devices (Android mid-range, iOS Safari, tablet)

### Technical Milestones (MVP)

**Week 1-2: Validation Spikes + Foundation**
- [ ] **Validation Spike 1:** Offline sync POC (IndexedDB + WebSocket)
- [ ] **Validation Spike 2:** NLP parsing quality (50 test phrases with chrono)
- [ ] **Validation Spike 3:** Bundle size check (SvelteKit minimal build)
- [ ] **Validation Spike 4:** SQLite FTS5 performance (1k tasks, <200ms queries)
- [ ] **Gate:** All spikes must pass before continuing
- [ ] Repo setup (monorepo: `/custom_components/haboard`, `/frontend`)
- [ ] CI/CD pipeline (GitHub Actions: lint, test, build, bundle size enforcement)
- [ ] Database schema (SQLite with WAL mode + FTS5 for tasks table)
- [ ] HA integration skeleton (manifest, config_flow, entities)

**Week 3-4: Backend + Sync**
- [ ] REST API (aiohttp views in HA integration)
- [ ] CRUD endpoints with Pydantic validation
- [ ] OpenAPI spec generation
- [ ] WebSocket with 30s polling fallback
- [ ] Hybrid conflict resolution (LWW + completion-wins + tag-union)
- [ ] Error handling (retry logic, local-only fallback)

**Week 5-6: Frontend Core + Offline**
- [ ] SvelteKit scaffold + TailwindCSS
- [ ] TypeScript types from OpenAPI (`openapi-typescript`)
- [ ] Tanstack Query setup + WebSocket integration
- [ ] IndexedDB wrapper + Outbox pattern with retry
- [ ] Service Worker + offline cache strategy
- [ ] Optimistic UI updates

**Week 7-8: Features + Polish**
- [ ] Quick add (structured form + optional chrono NLP)
- [ ] Task list with filters (Today, Overdue, All, By Tag)
- [ ] Swipe gestures with haptics (@use-gesture/svelte)
- [ ] Search (SQLite FTS5)
- [ ] Basic settings screen
- [ ] Basic Web Push notifications (Open action only)
- [ ] E2E tests for 5 golden paths (Playwright)
- [ ] Deploy to pilot users (HA addon or manual install)
- [ ] 2-week feedback cycle

---

## 🎨 Beta (v0.5) — "Daily Driver Quality"

**Timeline:** 4-6 months (from project start)
**Goal:** Feature-rich enough for daily use; add key differentiators
**Users:** 20-50 beta testers from HA community

### Additional User Stories

| ID | Story | Why Beta | Complexity |
|----|-------|----------|------------|
| **US-2** | Voice Add via Assist | HA differentiation | Medium |
| **US-4** | Agenda Drag-and-Drop | Planning utility | Medium |
| **US-10** | Shared Boards | Family collaboration | Medium |
| **US-13** | Presence-Aware Reminders (basic) | Smart home integration | High |
| **US-16** | Fridge Tablet View (Kiosk) | Family/shared displays | Medium |
| **US-17** | Ambient & Idle Mode | Kiosk polish | Low |
| **US-21** | Tags & Priority | Organization | Low |
| **US-23** | Smart Digests | Notification fatigue | Low |

### New Features (Beta)

#### ✅ Kiosk Mode
- **Dedicated route:** `/kiosk` with fullscreen layout
- **Large touch targets:** ≥56px, high-contrast text
- **Ambient mode:** After 2 min idle, show next 3 tasks + time/weather
- **Chips:** Today (X), Overdue (Y), Mine (Z) — tap to filter
- **Performance:** Cold start <3s on budget tablet (Fire HD 8)

#### ✅ Lit Custom Card
- **Lovelace embedding:** `type: custom:haboard-card`
- **Config options:** Board, view (today/week/all), max items
- **Bridge pattern:** Communicates with PWA via postMessage or shared WebSocket topic

#### ✅ Voice via Home Assistant Assist
- **Intents:**
  - `AddTodo`: "Add [task] to [board] [due]"
  - `ListToday`: "What's on my list today?"
  - `CompleteTodo`: "Mark [task] done"
- **Natural language:** "every Friday", "in 2 hours", "tomorrow evening"
- **Confirmation:** Spoken + visual with Undo chip

#### ✅ Basic Presence Awareness
- **Data source:** HA `person` entities (device_tracker aggregation)
- **Logic:** Delay reminders if assignee not home
  - Due 18:00, nobody home → defer to 30 min after first arrival
  - Show notification summary on arrival: "3 tasks waiting"
- **Override:** User can force "Notify me anyway" in settings

#### ✅ Shared Boards & Basic Collaboration
- **Per-board members:** Add HA users to boards
- **Simple roles (Beta):** Everyone is "editor" (roles in V1.0)
- **Real-time updates:** All members see changes instantly
- **Assignee targeting:** Notifications go to assignee only

#### ✅ Improved Conflict Resolution
- **Upgrade to per-field LWW:**
  - Title, notes, due, priority, assignee: LWW per field
  - Completed: TRUE wins (once done, stays done)
  - Tags: Set union (merge, no loss)
- **Conflict UI:** Show side-by-side diff if title changes concurrently; let user choose

#### ✅ Smart Digests
- **Morning (08:00):** "Good morning! You have 5 tasks today"
- **Evening (18:00):** "3 tasks left; 2 overdue"
- **Service Worker scheduling:** Fires even when app closed

#### ✅ PostgreSQL Upgrade (Optional but Recommended)
- **Migration path:** SQLite → PostgreSQL
- **Why:** LISTEN/NOTIFY for faster realtime (latency improvement)
- **Backward compat:** Keep SQLite as fallback option

### Success Metrics (Beta)

**Must achieve:**
- ✅ 20+ daily active users for 4 weeks
- ✅ Average session time >2 min (indicates usefulness)
- ✅ <5 critical bugs per month
- ✅ Positive sentiment: >70% would recommend

**Learn:**
- Is kiosk mode used? By how many households?
- Does voice via Assist work reliably?
- Do presence-aware reminders add value or annoy?
- What features are requested most?

### Technical Milestones (Beta)

**Prerequisites:**
- ✅ MVP deployed and validated with 5+ pilot users
- ✅ Go decision from MVP → Beta gate
- ✅ 20+ beta testers recruited

**Week 1-2: Shared Boards Foundation**
- [ ] Database migration: Add `boards`, `board_members`, `assignee_user_id` columns
- [ ] Migration script with rollback (see Migration Strategy section)
- [ ] API endpoints: Board CRUD, member management
- [ ] Frontend: Board selector, member invitation UI
- [ ] Update existing tasks to default "Personal" board

**Week 3-4: Vector Clocks + Improved Conflict Resolution**
- [ ] Add `vector_clock` JSONB column to tasks table
- [ ] Implement vector clock increment/merge logic
- [ ] Per-field conflict resolution (title → conflict UI)
- [ ] Side-by-side diff viewer for concurrent title changes
- [ ] Update sync protocol to include vector clocks
- [ ] Migration: Initialize vector clocks from LWW timestamps

**Week 5-6: Kiosk Mode**
- [ ] `/kiosk` route with fullscreen layout
- [ ] Large touch targets (≥56px), high-contrast design
- [ ] Today/Overdue/Mine filter chips
- [ ] Ambient mode: 2-min idle → show next 3 tasks + time/weather
- [ ] Performance optimization: cold start <3s on Fire HD 8
- [ ] E2E test: kiosk flow on tablet viewport

**Week 7-8: Voice via Home Assistant Assist**
- [ ] Define Assist intents: `AddTodo`, `ListToday`, `CompleteTodo`
- [ ] Intent handlers in HA integration (Python)
- [ ] Sentence templates with slot filling (board, due date, task)
- [ ] Confirmation: spoken response + visual Undo chip
- [ ] Test with 20 voice phrases; measure accuracy

**Week 9-10: Presence Awareness + Smart Digests**
- [ ] Subscribe to HA `person` entity state changes
- [ ] Notification deferral logic (if nobody home → defer to arrival + 30 min)
- [ ] Arrival notification: "3 tasks waiting for you"
- [ ] Service Worker: schedule morning (08:00) and evening (18:00) digests
- [ ] Settings: "Notify me anyway" override

**Week 11-12: Lovelace Card + Polish**
- [ ] Lit custom card: `type: custom:haboard-card`
- [ ] Config options: board, view (today/week/all), max items
- [ ] Bridge: postMessage or shared WebSocket topic
- [ ] HACS integration for easy distribution
- [ ] Actionable notifications: Add Complete and Snooze buttons
- [ ] Bug fixes from beta tester feedback
- [ ] Deploy to all 20+ beta testers

**Week 13-14: Beta Testing & Feedback**
- [ ] 4-week beta testing period
- [ ] Weekly feedback sessions with testers
- [ ] Bug fixes and polish based on feedback
- [ ] Collect metrics: DAU, session time, kiosk usage, voice accuracy
- [ ] Go/No-Go review for V1.0

### Phase Transition: MVP → Beta Checklist

**Before starting Beta development:**
- [ ] MVP deployed for 2+ weeks with 5+ pilot users
- [ ] All MVP success metrics met (see MVP Success Metrics section)
- [ ] User feedback collected and analyzed
- [ ] Go decision from stakeholder review
- [ ] Beta testers recruited (20-50 people)
- [ ] Beta feedback channel set up (Discord/GitHub Discussions)

**Migration tasks:**
- [ ] Backup all user data (SQLite export)
- [ ] Run database migration (add boards, vector_clocks)
- [ ] Validate migration: spot-check 10 tasks
- [ ] Deploy new integration version
- [ ] Deploy new PWA version
- [ ] Monitor for 48 hours: error rates, sync reliability

---

## 🏆 V1.0 — "Feature Complete"

**Timeline:** 9-12 months
**Goal:** Production-ready, all core user stories implemented
**Users:** Public release to HA community

### Additional User Stories

| ID | Story | Why V1.0 | Complexity |
|----|-------|----------|------------|
| **US-5** | Time Blocking | Power user feature | High |
| **US-6** | Smart Suggestions | AI differentiation | High |
| **US-9** | Device-Linked Completion | Automation power | Medium |
| **US-12** | Grocery & Errands Flow | Location utility | Medium |
| **US-14** | Sensor-Triggered Tasks | Smart home magic | Medium |
| **US-15** | Weather & Daylight Awareness | Context-aware polish | Medium |
| **US-18** | Unified Agenda | Calendar integration | High |
| **US-19** | Week Planning Ritual | Planning workflow | Medium |
| **US-22** | Sections/Pages per Board | Organization depth | Medium |
| **US-27** | Roles & Permissions | Collaboration security | Medium |
| **US-28** | Audit & Activity | Collaboration transparency | Low |
| **US-29** | A11y First | Inclusivity | Medium |
| **US-30** | i18n & Timezones | Global readiness | Medium |

### New Features (V1.0)

#### ✅ Calendar Integration & Time Blocking
- **Board calendar:** Tasks + events side-by-side
- **Drag-to-day scheduling:** Visual workload distribution
- **Time blocks:** Set duration → creates calendar block
- **Conflict detection:** Warn when overbooking

#### ✅ Smart Suggestions (Rule-Based)
- **Weather integration:**
  - "Mow lawn" → suggest next dry daylight window
  - "Water garden" → defer on rain forecast
- **Energy tariff:**
  - "Run dishwasher" → suggest low-rate window (sensor.energy_price)
- **Presence logic:**
  - Multi-person task → notify first available person at home
- **User feedback loop:** Accept/reject suggestions; track for ML

#### ✅ Context-Aware Automation
- **Sensor-triggered tasks:**
  - Washer done → create "Move laundry to dryer" (20 min due)
  - HVAC runtime > threshold → "Replace air filter" (weekend)
  - Low battery (device tracker) → "Charge phone"
- **Device-linked completion:**
  - Robot vacuum job complete → mark "Vacuum living room" done
  - Scene activated → mark related task done
- **Zone-based notifications:**
  - Enter grocery zone → pop grocery list notification

#### ✅ Advanced Collaboration
- **Per-board roles:**
  - Viewer: Read-only
  - Commenter: Can add comments (not edit tasks)
  - Editor: Full CRUD
- **Activity log:**
  - Who created/edited/completed/reassigned tasks
  - Filter by user, action type, date range
  - Export CSV/JSON
- **Private tasks:** Mark tasks visible only to creator + assignee

#### ✅ Sophisticated Conflict Resolution
- **Vector clocks:** Detect true concurrency (not just timestamp)
- **Per-field merge:**
  - Notes: Line-based merge with CRDT or diff3
  - Subtasks: Array CRDT with tombstones
  - Tags: Set union with tombstones for removals
- **Conflict inspector UI:** Debug view for developers

#### ✅ Accessibility & Internationalization
- **A11y:**
  - WCAG AAA contrast ratios
  - Full screen reader support (tested with NVDA + VoiceOver)
  - Motion-reduced mode
  - Child mode (larger targets, simplified UI)
- **i18n:**
  - Locale detection (HA user locale → browser → default)
  - RTL support (CSS logical properties)
  - Timezone-aware due dates (Intl.DateTimeFormat)
  - Localized NLP parsing (chrono multi-locale)

#### ✅ Weekly Planning Flow
- **Sunday 18:00 prompt:** "Plan your week?"
- **Planning mode:**
  - Show unscheduled tasks + overdue carryovers
  - One-tap distribute: auto-spread across week
  - Drag to refine before saving
  - Save → creates due dates

#### ✅ Board Organization
- **Sections/Pages:** Segment boards by project or routine
- **Collapsible sections:** Show progress, next due per section
- **Drag between sections:** Move tasks, preserve metadata

### Success Metrics (V1.0)

**Must achieve:**
- ✅ 500+ monthly active users
- ✅ <10 critical bugs per month
- ✅ 4+ star average rating (HA community)
- ✅ Featured in HA community showcase

**Quality gates:**
- ✅ Performance budgets met (all enforced in CI)
- ✅ Security audit passed (no critical vulnerabilities)
- ✅ Accessibility audit passed (axe-core + manual testing)
- ✅ 5 pilot families complete flows without guidance

### Technical Milestones (V1.0)

**Prerequisites:**
- ✅ Beta deployed for 4+ weeks with 20+ users
- ✅ Go decision from Beta → V1.0 gate
- ✅ 100+ beta testers recruited for V1.0
- ✅ Optional: PostgreSQL upgrade completed (if needed for scale)

**Week 1-2: Calendar Integration Foundation**
- [ ] Add `calendar_blocks` table for time blocks
- [ ] HA calendar entity: `calendar.<board>_deadlines`
- [ ] API: Read HA calendar events, create time blocks
- [ ] Frontend: Calendar view (week grid with tasks + events)
- [ ] Drag task to day → set due date
- [ ] E2E test: drag task, verify due date updated

**Week 3-4: Time Blocking**
- [ ] Task duration field (15m, 30m, 1h, 2h, custom)
- [ ] Create calendar block from task (duration → block)
- [ ] Conflict detection: warn when overbooking
- [ ] Sync with HA calendar (bidirectional)
- [ ] Settings: Working hours, break times

**Week 5-6: Smart Suggestions (Weather + Energy)**
- [ ] Weather integration: subscribe to HA weather entity
- [ ] Rule engine: "Mow lawn" → suggest next dry daylight window
- [ ] Energy tariff: subscribe to `sensor.energy_price`
- [ ] Rule: "Run dishwasher" → suggest low-rate window
- [ ] User feedback: Accept/Reject buttons; track for ML
- [ ] Settings: Enable/disable suggestion categories

**Week 7-8: Sensor-Triggered Tasks**
- [ ] Event listener: HA state changes (washer done, low battery, etc.)
- [ ] Trigger config: Define sensor → task mappings (UI or YAML)
- [ ] Auto-create task on trigger: "Move laundry to dryer" (20 min due)
- [ ] Notification: "Task created by automation"
- [ ] Examples: HVAC runtime, battery levels, door/window sensors

**Week 9-10: Device-Linked Completion + Zone Notifications**
- [ ] Device completion: Listen for scene/script/automation completion
- [ ] Auto-complete linked tasks: "Vacuum living room" done when robot finishes
- [ ] Zone-based notifications: Enter grocery zone → show grocery list
- [ ] Geofence setup: Map HA zones to task boards/tags
- [ ] Settings: Enable/disable zone notifications

**Week 11-12: Advanced Collaboration (Roles + Activity Log)**
- [ ] Per-board roles: Viewer, Commenter, Editor
- [ ] Role enforcement: API + UI permission checks
- [ ] Activity log: `activity_log` table (append-only)
- [ ] Activity UI: Filter by user, action type, date range
- [ ] Export activity: CSV/JSON download
- [ ] Private tasks: Visible only to creator + assignee

**Week 13-14: Board Organization (Sections/Pages)**
- [ ] Add `sections` table: belongs to board
- [ ] Section CRUD: API + UI
- [ ] Drag tasks between sections (preserve metadata)
- [ ] Collapsible sections: Show progress bar, next due task
- [ ] Section templates: "Project", "Routine", "Errands"

**Week 15-16: Weekly Planning Ritual**
- [ ] Service Worker: Sunday 18:00 prompt "Plan your week?"
- [ ] Planning mode UI: Show unscheduled tasks + overdue
- [ ] Auto-distribute: Spread tasks across week (algorithm)
- [ ] Drag to refine schedule before saving
- [ ] Save → bulk update due dates
- [ ] Settings: Planning day/time customization

**Week 17-18: Grocery & Errands Flow**
- [ ] "Shopping mode": Optimized for in-store use
- [ ] Aisle/category organization (user-defined)
- [ ] Quick add from template: common items
- [ ] Share list: QR code or link
- [ ] Mark items as "in cart" (visual feedback)
- [ ] Auto-archive: completed items after 24h

**Week 19-20: Accessibility (WCAG AAA)**
- [ ] Contrast audit: All colors ≥7:1 ratio
- [ ] Screen reader testing: NVDA (Windows) + VoiceOver (iOS/Mac)
- [ ] Keyboard navigation: All interactions accessible (Tab, Enter, Escape, Arrow keys)
- [ ] ARIA labels: All interactive elements properly labeled
- [ ] Focus indicators: High-contrast, visible on all elements
- [ ] Motion-reduced mode: Respect `prefers-reduced-motion`
- [ ] Child mode: Larger targets (72px), simplified UI
- [ ] Accessibility statement page

**Week 21-22: Internationalization (i18n)**
- [ ] `svelte-i18n` setup: Extract all strings to locale files
- [ ] Locale files: en-US, es-ES, fr-FR, de-DE, pt-BR (initial set)
- [ ] RTL support: CSS logical properties (start/end vs left/right)
- [ ] Timezone handling: `Intl.DateTimeFormat`, DST-safe
- [ ] Localized NLP: chrono multi-locale parsing
- [ ] Currency/number formatting: `Intl.NumberFormat`
- [ ] Date/time formatting: User's locale preference
- [ ] Locale detection: HA user settings → browser → default

**Week 23-24: Security Audit + Polish**
- [ ] Security audit: OWASP Top 10 review
- [ ] SQL injection prevention: Parameterized queries (verify)
- [ ] XSS prevention: Sanitize all user input
- [ ] CSRF protection: Verify tokens on all mutations
- [ ] Rate limiting: API endpoints (prevent abuse)
- [ ] Content Security Policy: Strict CSP headers
- [ ] Dependency audit: `npm audit`, `safety` (Python)
- [ ] Penetration testing: Hire external auditor or run automated tools

**Week 25-26: Performance Optimization**
- [ ] Bundle analysis: Lazy-load non-critical features
- [ ] Image optimization: WebP, responsive sizes
- [ ] Database optimization: Query profiling, add indexes
- [ ] Cache tuning: Service Worker strategies
- [ ] Lighthouse CI: Enforce scores ≥90
- [ ] Load testing: Simulate 1000 concurrent users
- [ ] Memory leak detection: Chrome DevTools profiling

**Week 27-28: Beta Testing (100+ users)**
- [ ] Deploy V1.0 beta to 100+ testers
- [ ] 4-week beta testing period
- [ ] Weekly feedback sessions (online meetings)
- [ ] Bug triage: Prioritize critical/high bugs
- [ ] Performance monitoring: Sentry, LogRocket
- [ ] User surveys: NPS, feature satisfaction
- [ ] Go/No-Go review for public release

**Week 29-30: Production Hardening + Launch Prep**
- [ ] Final bug fixes from beta feedback
- [ ] Production infrastructure: Monitoring, alerting
- [ ] Rollback plan: Document and test
- [ ] Launch checklist: All quality gates passed
- [ ] Marketing materials: Screenshots, demo video
- [ ] Documentation: User guides, API docs
- [ ] Community engagement: HA forums, Reddit, Discord
- [ ] Press release: Home Assistant blog, social media

**Week 31-32: Public Release 🚀**
- [ ] Deploy to production
- [ ] Announce on HA community forums
- [ ] HACS listing (if not already)
- [ ] Monitor for 72 hours: Error rates, performance
- [ ] Hotfix any critical issues
- [ ] Celebrate! 🎉

### Phase Transition: Beta → V1.0 Checklist

**Before starting V1.0 development:**
- [ ] Beta deployed for 4+ weeks with 20+ daily users
- [ ] All Beta success metrics met (see Beta Success Metrics section)
- [ ] User feedback analyzed: prioritize most-requested features
- [ ] Go decision from stakeholder review
- [ ] 100+ beta testers recruited for V1.0
- [ ] PostgreSQL upgrade completed (if performance requires it)
- [ ] V1.0 roadmap reviewed and approved

**Migration tasks:**
- [ ] Backup all user data (SQLite/PostgreSQL export)
- [ ] Run database migration (add calendar_blocks, sections, activity_log, roles)
- [ ] Validate migration: automated tests + manual spot-checks
- [ ] Deploy new integration version (staged rollout)
- [ ] Deploy new PWA version (staged rollout)
- [ ] Monitor for 1 week: error rates, sync reliability, user reports

---

## 🚀 V2.0+ — "Innovation & Polish"

**Timeline:** 12+ months
**Goal:** Advanced features, ML-powered intelligence, ecosystem expansion

### Potential Features (Prioritize Based on V1.0 Feedback)

#### 🤖 Machine Learning Enhancements
- **Smart scheduling:** Learn user patterns (morning person? evening person?)
- **Duration prediction:** "This task usually takes you 45 min"
- **Auto-tagging:** Suggest tags based on task content
- **Priority suggestions:** "This is usually high priority for you"

#### 🌐 Multi-Home Sync
- **Use case:** Family with vacation home
- **Architecture:** Add sync microservice (FastAPI/Go) for cloud relay
- **Security:** End-to-end encryption between homes

#### 🔗 Integrations
- **Import:** Todoist, Things, Google Tasks, Notion
- **Export:** ICS, CSV, JSON backup
- **Zapier/n8n:** Webhook triggers for task events
- **Calendar sync:** Bidirectional with Google Calendar, iCal

#### 🎨 Customization
- **Themes:** Custom color schemes, fonts
- **Widgets:** Home screen widgets (iOS/Android)
- **Dashboard layouts:** Kanban view, timeline view, matrix view

#### 📊 Analytics & Insights
- **Completion rates:** Weekly/monthly trends
- **Time tracking:** Optional start/stop timers
- **Productivity insights:** "You're most productive on Tuesdays"
- **Burnout detection:** "You've been overloading yourself"

#### 🏗️ Platform Expansion
- **Desktop apps:** Tauri or Electron for Windows/macOS/Linux
- **Browser extensions:** Quick add from any website
- **Wearables:** Apple Watch/Wear OS complications
- **Smart displays:** Google Nest Hub, Echo Show skills

---

## 🧪 De-Risking Strategy

### Validation Spikes (Before MVP Development)

Run these 2-week time-boxed experiments to validate unknowns:

#### Spike 1: Offline Sync Proof-of-Concept
**Goal:** Prove IndexedDB + Outbox + WebSocket works reliably
**Test:**
- 2 devices (phone + tablet)
- Add task offline on device 1
- Go online → should sync to device 2 in <2s
- Edit same task on both devices concurrently
- Verify LWW resolution works correctly
**Success:** 10/10 syncs work correctly; latency <2s

#### Spike 2: NLP Parsing Quality
**Goal:** Validate chrono + custom regex is good enough
**Test:**
- 50 test phrases (varied complexity)
- Measure parse accuracy (correct due date, tags, priority, assignee)
**Success:** >80% fully correct; <10% complete failures

#### Spike 3: Performance Budget Reality Check
**Goal:** Ensure bundle size is achievable
**Test:**
- Build minimal SvelteKit + TailwindCSS + deps
- Measure gzipped bundle size
**Success:** <100 KB (leaves margin for features)

#### Spike 4: SQLite FTS Performance
**Goal:** Validate search is fast enough
**Test:**
- Load 1000 sample tasks into SQLite
- Run FTS queries on title + notes
- Measure p95 latency
**Success:** <200ms on low-end hardware

---

## 📋 Implementation Guidelines

### For Each Phase

#### 1. User Story → Ticket Breakdown
- Break each user story into 2-5 tickets
- Size: 1-3 days per ticket
- Format: `[Component] Feature name (US-X)`
  - Example: `[FE] Quick add with NLP parsing (US-1)`

#### 2. Definition of Done (Per Ticket)
- [ ] Code implemented and reviewed
- [ ] Unit tests written (>80% coverage for new code)
- [ ] E2E test for critical path (if applicable)
- [ ] Performance budget respected
- [ ] Accessibility checked (axe-core)
- [ ] Documentation updated
- [ ] Deployed to staging

#### 3. Phase Release Checklist
- [ ] All user stories in phase complete
- [ ] E2E tests passing (critical flows)
- [ ] Performance benchmarks met
- [ ] Security scan (no high/critical vulns)
- [ ] Accessibility audit passed
- [ ] User testing with 3+ pilot users
- [ ] Release notes written
- [ ] Migration guide (if DB changes)

### Development Rhythm

**Weekly:**
- Monday: Sprint planning (prioritize tickets)
- Friday: Demo + retrospective

**Bi-weekly:**
- Deploy to staging
- Pilot user feedback session

**Monthly:**
- Phase progress review
- Adjust plan based on learnings

---

## 🎯 Success Criteria by Phase

### MVP → Beta Gate
**Must achieve to proceed:**
- 5+ pilot users actively using for 2 weeks
- Sync reliability >95%
- <3 critical bugs
- Positive feedback: "I'd recommend this"

**Decision point:**
- **YES:** Proceed to Beta (expand features)
- **NO:** Iterate MVP until criteria met

### Beta → V1.0 Gate
**Must achieve:**
- 20+ daily active users
- Kiosk mode used by 5+ households
- Voice commands >70% success rate
- <5 critical bugs per month

**Decision point:**
- **YES:** Proceed to V1.0 (finish features)
- **NO:** Polish Beta until ready

### V1.0 → Public Release Gate
**Must achieve:**
- All core user stories complete (US-1 to US-30)
- Performance budgets met
- Accessibility audit passed
- Security audit passed
- 100+ beta testers

**Decision point:**
- **YES:** Public release
- **NO:** Fix blocking issues

---

## 📊 Tracking & Reporting

### Metrics Dashboard
Track weekly:
- **Development velocity:** Story points per week
- **Bug count:** Open bugs by severity
- **Test coverage:** % lines covered
- **Performance:** Bundle size, TTI, sync latency
- **User engagement:** DAU, session time, retention

### Phase Progress
| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Validation Spikes Complete | Week 2 | Not started |
| MVP Feature Complete | Week 12 | Not started |
| MVP User Testing | Week 14 | Not started |
| Beta Feature Complete | Month 6 | Not started |
| V1.0 Feature Complete | Month 12 | Not started |
| Public Release | Month 13 | Not started |

---

## 🚦 Go/No-Go Decision Framework

At each phase gate, evaluate:

### Go Criteria (Must have ALL)
✅ All user stories in phase complete
✅ Performance budgets met
✅ <5 critical bugs open
✅ Positive user feedback (>70% would recommend)
✅ Core workflows tested by 5+ users

### No-Go Indicators (ANY blocks release)
🛑 Critical bugs unresolved
🛑 Performance budgets missed by >20%
🛑 Sync reliability <90%
🛑 Major user complaints about UX
🛑 Security vulnerabilities unpatched

---

## 🎬 Getting Started

### Immediate Next Steps (This Week)

1. **Run Validation Spikes** (2 weeks)
   - Spike 1: Offline sync POC
   - Spike 2: NLP parsing quality
   - Spike 3: Bundle size check
   - Spike 4: SQLite FTS performance

2. **Set up project infrastructure**
   - Create monorepo structure
   - Set up CI/CD (GitHub Actions)
   - Configure linting/formatting
   - Initialize database schema

3. **Recruit pilot users**
   - Find 5-10 HA community members
   - Set expectations: Alpha quality, active feedback
   - Set up feedback channel (Discord/GitHub Discussions)

4. **Finalize MVP scope**
   - Review this plan with team/stakeholders
   - Adjust timeline based on resources
   - Create first sprint backlog (2 weeks of tickets)

### First Sprint (Week 3-4)
- [ ] HA integration skeleton
- [ ] SQLite schema + migrations
- [ ] REST API (add task, list tasks)
- [ ] SvelteKit scaffold
- [ ] IndexedDB wrapper

---

## 💡 Key Principles for Success

1. **Ship small, ship often** - Every 2 weeks, deploy something
2. **User feedback trumps roadmap** - Be willing to pivot based on learnings
3. **Performance is a feature** - Never ship if budgets are broken
4. **Start simple, add complexity** - LWW before vector clocks; SQLite before PostgreSQL
5. **Every phase must be useful** - No "framework-only" releases

---

## 📚 Appendix: Full Story Mapping

### MVP (v0.1)
- US-1: Quick Add (Natural Language) — Simplified (chrono + regex)
- US-3: Quick Capture from Anywhere — FAB only (no keyboard shortcut yet)
- US-7: One-Swipe Triage — Complete only (snooze with presets)
- US-8: Actionable Notifications — Basic (due-now only)
- US-11: Assign to a Person — Basic (no multi-device targeting)
- US-20: Powerful Search — FTS5 on title/notes/tags
- US-25: Offline-First — IndexedDB + Outbox
- US-26: Real-Time Sync — WebSocket + LWW

### Beta (v0.5) - Adds:
- US-2: Voice Add via Assist
- US-4: Agenda Drag-and-Drop — Day chips only (no calendar view yet)
- US-10: Shared Boards — Everyone is editor (roles in V1.0)
- US-13: Presence-Aware Reminders — Basic (defer if nobody home)
- US-16: Fridge Tablet View
- US-17: Ambient & Idle Mode
- US-21: Tags & Priority — Inline editing
- US-23: Smart Digests — Morning/evening

### V1.0 - Adds:
- US-5: Time Blocking
- US-6: Smart Suggestions — Rule-based
- US-9: Device-Linked Completion
- US-12: Grocery & Errands Flow
- US-14: Sensor-Triggered Tasks
- US-15: Weather & Daylight Awareness
- US-18: Unified Agenda — Full calendar view
- US-19: Week Planning Ritual
- US-22: Sections/Pages per Board
- US-24: Threaded & Targeted Notifications
- US-27: Roles & Permissions
- US-28: Audit & Activity
- US-29: A11y First
- US-30: i18n & Timezones

### Deferred to V2.0+:
- ML-powered features (duration prediction, smart scheduling)
- Multi-home sync
- Integrations (Todoist import, etc.)
- Analytics & insights

---

**End of Phased Implementation Plan**

*Next: Run validation spikes → Begin MVP development*
