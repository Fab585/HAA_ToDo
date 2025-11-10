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
| **MVP (v0.1)** | 2-3 months | Core task management + basic HA | "Does this concept work?" |
| **Beta (v0.5)** | 4-6 months | Daily driver + key differentiators | "Is this useful daily?" |
| **V1.0** | 9-12 months | Feature complete + collaboration | "Is this production ready?" |
| **V2.0+** | 12+ months | Advanced features + ML | "What's next?" |

---

## 🚀 MVP (v0.1) — "Prove the Concept"

**Timeline:** 8-12 weeks
**Goal:** Ship something useful that validates core value prop
**Users:** 5-10 pilot testers (you + trusted HA community members)

### User Stories Included

| ID | Story | Why MVP | Complexity |
|----|-------|---------|------------|
| **US-1** | Quick Add (Natural Language) | Core value — fast capture | Medium |
| **US-3** | Quick Capture from Anywhere | Core UX — always accessible | Low |
| **US-7** | One-Swipe Triage | Core UX — fast completion | Low |
| **US-8** | Actionable Notifications (basic) | Mobile utility | Medium |
| **US-11** | Assign to a Person | Family usefulness (basic) | Low |
| **US-20** | Powerful Search | Essential for 50+ tasks | Medium |
| **US-25** | Offline-First | Core differentiator | High |
| **US-26** | Real-Time Sync (basic) | Core differentiator | High |

### Features Included

#### ✅ Core Task Management
- **Quick Add with NLP:** "Buy milk tomorrow 6pm #groceries" → parsed task
  - Use `chrono` for dates/times
  - Simple regex for `#tags`, `!priority`, `@assignee`
  - Fallback to structured form if parsing fails
- **CRUD Operations:** Create, read, update, delete tasks
- **Basic fields:** Title, notes, due date/time, priority (none/low/medium/high), tags, assignee
- **Swipe gestures:** Right to complete, left to snooze (presets only: 1h, 3h, tomorrow)
- **Filters:** Today, Overdue, All, By Tag, By Assignee

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

#### ✅ Sync (Simplified)
- **Database:** PostgreSQL (primary) OR SQLite (fallback) — pick one for MVP
  - **Recommendation:** Start with SQLite for simplicity; migrate to PostgreSQL in Beta
- **Conflict Resolution:** **Last-Write-Wins** (LWW) with timestamp
  - Store `modified_at` + `modified_by_device_id`
  - If conflict: latest timestamp wins
  - Show toast: "⚠️ Conflict resolved: kept most recent version"
- **Sync Protocol:**
  - Outbox pattern (IndexedDB queue)
  - Retry with exponential backoff
  - WebSocket for realtime push (with polling fallback)

#### ✅ Notifications (Basic)
- **Web Push** (primary) with action buttons (Complete, Snooze, Open)
- **Timing:** Due-now reminders (at due time)
- **Targeting:** Notify assignee only (no multi-device logic yet)

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

### Technical Milestones (MVP)

**Week 1-2: Foundation**
- [ ] Repo setup (monorepo: `/custom_components/haboard`, `/frontend`)
- [ ] CI/CD pipeline (GitHub Actions: lint, test, build)
- [ ] Database schema (SQLite initial — tasks, boards, tags tables)
- [ ] HA integration skeleton (manifest, config_flow, entities)

**Week 3-4: Backend**
- [ ] REST API (FastAPI or aiohttp views in HA integration)
- [ ] CRUD endpoints with Pydantic validation
- [ ] OpenAPI spec generation
- [ ] Basic WebSocket (subscribe/broadcast pattern)

**Week 5-6: Frontend Foundation**
- [ ] SvelteKit scaffold + TailwindCSS
- [ ] TypeScript types from OpenAPI (`openapi-typescript`)
- [ ] Tanstack Query setup + WebSocket integration
- [ ] IndexedDB wrapper + Outbox implementation

**Week 7-8: Core Features**
- [ ] Quick add with chrono NLP
- [ ] Task list with filters (Today, Overdue, All)
- [ ] Swipe gestures (@use-gesture/svelte)
- [ ] Search (SQLite FTS5)

**Week 9-10: Offline & Sync**
- [ ] Service Worker + Workbox caching
- [ ] Outbox retry logic
- [ ] LWW conflict resolution
- [ ] Optimistic UI updates

**Week 11-12: Polish & Deploy**
- [ ] Notifications (Web Push)
- [ ] Settings screen (preferences, account)
- [ ] E2E tests (Playwright: add → sync → complete)
- [ ] Deploy to pilot users (HA addon or manual install)

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
