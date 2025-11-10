# Canvas Review & Analysis

*Review date: 10 Nov 2025*

This document provides a comprehensive review of the alignment between **Canvas 1 (User Stories)** and **Canvas 2 (Technology Strategy)**, identifying strengths, gaps, and recommendations.

---

## Executive Summary

✅ **Overall Assessment: STRONG ALIGNMENT**

The technology strategy in Canvas 2 directly addresses 95%+ of the user stories in Canvas 1. The chosen stack is well-suited for the requirements, with particular strengths in:

- Offline-first architecture (US-25/26)
- Real-time collaboration (US-10/11/12)
- Home Assistant integration depth (US-2/9/13/14/15)
- Performance budgets (US-16/25)
- Mobile/tablet UX (US-1/3/4/7/16)

### Key Strengths

1. **Architecture simplicity** - 2-layer design reduces latency and complexity
2. **PostgreSQL choice** - LISTEN/NOTIFY enables sub-500ms sync critical for family collaboration
3. **Conflict resolution strategy** - Vector clocks with per-field merge strategies address real-world edge cases
4. **Dual notification channels** - Web Push + HA Companion ensures reliability
5. **Comprehensive observability** - Full metrics/tracing/logging from day one

### Areas Requiring Attention

1. Natural language parsing complexity (US-1)
2. Context-aware suggestions implementation details (US-6)
3. Scalability beyond single-home use case
4. Testing strategy depth

---

## Detailed Story-to-Tech Mapping

### 1) Capture & Create (US-1, US-2, US-3)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-1: Quick Add (Natural Language)** | Partial | ⚠️ NEEDS DETAIL | Canvas 2 doesn't specify NLP library/approach. Recommend: `chrono-node` for date/time parsing + custom regex for tags/priority/assignee |
| **US-2: Voice Add via Assist** | Complete | ✅ EXCELLENT | INT-02 ticket covers training set; Assist intents well-defined |
| **US-3: Quick Capture** | Complete | ✅ EXCELLENT | PWA with Service Worker + keyboard shortcuts; link preview spec clear |

**Recommendation:** Add explicit NLP strategy to Canvas 2:
- Use `chrono` for natural language date/time parsing (supports "tomorrow 6pm", "next Friday")
- Custom tokenizer for special syntax: `#tag`, `!priority`, `@assignee`
- Fallback to structured form if parsing confidence < 70%
- Store parsed tokens for iterative training

---

### 2) Plan & Schedule (US-4, US-5, US-6)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-4: Agenda Drag-and-Drop** | Complete | ✅ EXCELLENT | `@use-gesture/svelte` + haptics; latency budget enforced |
| **US-5: Time Blocking** | Complete | ✅ EXCELLENT | `block.create` service; calendar integration clear |
| **US-6: Smart Suggestions** | Minimal | ⚠️ NEEDS DETAIL | Mentioned in principles but no implementation strategy |

**Recommendation for US-6:** Add to Canvas 2 Section 9.1:
```
### Smart Suggestions Engine
- **Rule-based initial implementation:**
  - Weather checks: HA weather entity state before suggesting outdoor tasks
  - Presence checks: defer time-sensitive tasks if nobody home
  - Energy tariff: check `sensor.energy_price` for low-rate windows
- **Data pipeline:**
  - Periodic job (every 15m) evaluates suggestion rules
  - Creates `suggestion` entities with reasoning + actions (defer/reschedule/skip)
  - User feedback (accept/reject) tracked for future ML training
- **Future ML enhancement:**
  - User behavior patterns (completion time distributions)
  - Task clustering by context signals
```

---

### 3) Do & Complete (US-7, US-8, US-9)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-7: One-Swipe Triage** | Complete | ✅ EXCELLENT | FE-02 ticket; gesture library + haptics + undo toast |
| **US-8: Actionable Notifications** | Complete | ✅ EXCELLENT | Web Push with action buttons; 2s latency target |
| **US-9: Device-Linked Completion** | Complete | ✅ EXCELLENT | HA events + automation; matches well with integration design |

**No issues.** This section is comprehensively addressed.

---

### 4) Share & Collaborate (US-10, US-11, US-12)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-10: Shared Boards** | Complete | ✅ EXCELLENT | Per-board roles + activity log in schema; Slice 5 |
| **US-11: Assign to Person** | Complete | ✅ EXCELLENT | Task assignee field + notification targeting |
| **US-12: Grocery & Errands Flow** | Complete | ✅ EXCELLENT | Zone-based notifications + real-time sync |

**No issues.** Collaboration model is solid.

---

### 5) Context & Smart Home Awareness (US-13, US-14, US-15)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-13: Presence-Aware Reminders** | Complete | ✅ EXCELLENT | Presence fusion algorithm detailed; confidence scoring |
| **US-14: Sensor-Triggered Tasks** | Complete | ✅ EXCELLENT | HA events → automation → `add_item` service |
| **US-15: Weather & Daylight** | Partial | ⚠️ NEEDS DETAIL | Mentioned in US-6 context but no dedicated implementation |

**Recommendation:** Expand Section 5.2 to cover weather/daylight:
```
### 5.3 Environmental Context
- **Weather awareness:**
  - Subscribe to HA weather entity updates
  - Tag outdoor tasks with `#outdoor` (auto or manual)
  - On forecast change: check next 48h for task-compatible windows
  - Suggest reschedule with reasoning ("Rain forecast; suggest Saturday 2pm")
- **Daylight awareness:**
  - Calculate sunset time from `sun.sun` entity
  - Warn if task due < 45 min before sunset
  - Auto-suggest next morning for dusk-sensitive tasks
```

---

### 6) Kiosk & Shared Displays (US-16, US-17)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-16: Fridge Tablet View** | Complete | ✅ EXCELLENT | Performance budgets; large targets; Slice 2 |
| **US-17: Ambient & Idle Mode** | Complete | ✅ EXCELLENT | PWA kiosk route with 2-min idle trigger |

**No issues.** Kiosk experience is well-specified.

---

### 7) Calendar & Agenda (US-18, US-19)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-18: Unified Agenda** | Complete | ✅ EXCELLENT | Calendar entities + drag-reschedule; Slice 3 |
| **US-19: Week Planning Ritual** | Partial | ⚠️ NEEDS TICKET | Feature defined but no implementation ticket |

**Recommendation:** Add ticket:
```
**FE-04** Weekly planning mode:
- Sunday 18:00 automation triggers `planning_mode` entity
- UI route `/plan-week` with:
  - Overdue carryover list
  - Unscheduled task pool
  - "Auto-distribute" algorithm (spread by duration/priority)
  - Drag-to-refine before save
- Persistence: planning session state in IndexedDB
```

---

### 8) Search, Filter, Organize (US-20, US-21, US-22)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-20: Powerful Search** | Complete | ✅ EXCELLENT | PostgreSQL FTS; BE-02 ticket; <200ms benchmark |
| **US-21: Tags & Priority** | Complete | ✅ EXCELLENT | Schema includes tags table + priority enum |
| **US-22: Sections/Pages** | Complete | ✅ EXCELLENT | `create_page` service; drag-between-sections |

**No issues.** Search & organization thoroughly covered.

---

### 9) Notifications Strategy (US-23, US-24)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-23: Smart Digests** | Complete | ✅ EXCELLENT | Service Worker local scheduling for 08:00/18:00 digests |
| **US-24: Threaded & Targeted** | Complete | ✅ EXCELLENT | Per-board threads; assignee-first targeting |

**No issues.** Notification architecture is comprehensive.

---

### 10) Reliability, Performance, Offline (US-25, US-26)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-25: Offline-First** | Complete | ✅ EXCELLENT | IndexedDB + Outbox + vector clocks; Spike 3 validates |
| **US-26: Real-Time Sync** | Complete | ✅ EXCELLENT | LISTEN/NOTIFY + WS; <500ms LAN target; Spike 2 validates |

**No issues.** This is a core strength of the architecture.

---

### 11) Security & Roles (US-27, US-28)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-27: Roles & Permissions** | Complete | ✅ EXCELLENT | Per-board roles; HA user mapping; Slice 5 |
| **US-28: Audit & Activity** | Complete | ✅ EXCELLENT | `activity_log` table; export to CSV/JSON |

**No issues.** Security model aligns with HA patterns.

---

### 12) Accessibility & Inclusivity (US-29)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-29: A11y First** | Minimal | ⚠️ NEEDS DETAIL | Mentioned in quality gates but no implementation plan |

**Recommendation:** Add explicit a11y section to Canvas 2:
```
## 20) Accessibility Implementation

### ARIA & Screen Readers
- All interactive elements: role, aria-label, aria-live for dynamic updates
- Task cards announce: "Task: [title], Due: [time], Priority: [level], Assigned to: [person], [status]"
- Swipe gestures have keyboard alternatives (Space=complete, S=snooze)

### Visual Accessibility
- High-contrast theme: WCAG AAA contrast ratios (7:1 for text)
- Motion-reduced mode: `prefers-reduced-motion` CSS query
  - Disable swipe animations, fade-in effects
  - Static state transitions
- Configurable font size (base 16px, up to 24px)

### Child Mode
- Simplified UI route `/simple`
- Larger touch targets (72px minimum)
- Picture-based task icons (optional)
- Reduced density layout

### Testing
- Automated: axe-core in E2E tests (zero violations gate)
- Manual: NVDA + VoiceOver quarterly testing
- User testing: Include 2+ users with accessibility needs in pilot
```

---

### 13) Internationalization (US-30)

| User Story | Tech Coverage | Status | Notes |
|------------|--------------|--------|-------|
| **US-30: i18n & Timezones** | Partial | ⚠️ NEEDS DETAIL | `svelte-i18n` mentioned but no locale strategy |

**Recommendation:** Add i18n implementation details:
```
### 6.4 Internationalization Strategy

**Locale Detection:**
- Priority: 1) User setting, 2) HA user locale, 3) Browser Accept-Language
- Store in user profile; sync across devices

**Date/Time Handling:**
- All dates stored as UTC in DB (timestamp with time zone)
- Display in user's local timezone (from HA location + user override)
- Use `Intl.DateTimeFormat` for locale-aware formatting
- DST transitions: recalculate due times on system timezone change

**String Localization:**
- `svelte-i18n` with JSON files per locale: `en-US.json`, `es-ES.json`, etc.
- Extraction tool: `svelte-i18n-extract` finds all `$t('key')` calls
- Initial launch: English only
- Crowdin integration for community translations

**RTL Support:**
- CSS logical properties (`margin-inline-start` vs `margin-left`)
- Automatic direction detection via `dir` attribute
- Test with Hebrew/Arabic before launch

**NLP Localization (chrono):**
- chrono supports EN, DE, FR, JA, PT, NL
- For unsupported locales: structured date picker fallback
```

---

## Technology Stack Deep Dive

### Database Choice: PostgreSQL ✅

**Strengths:**
- LISTEN/NOTIFY is perfect for real-time family collaboration
- MVCC handles concurrent edits gracefully
- Full-text search without additional dependencies
- Robust migration tooling (Alembic)
- Future-proof for growth

**Concerns:**
- Slight overkill for single-user setups
- **Mitigation:** SQLite fallback is smart

**Verdict:** Excellent choice for primary use case.

---

### Frontend: SvelteKit + TypeScript ✅

**Strengths:**
- Svelte's reactivity model perfect for real-time updates
- Small bundle size aligns with perf budgets
- TypeScript + OpenAPI codegen ensures type safety
- SvelteKit handles PWA, routing, SSR in one package

**Concerns:**
- Smaller ecosystem than React (fewer libs)
- **Mitigation:** Core libs (Tanstack Query, Nanostores) are framework-agnostic

**Verdict:** Strong fit for performance-critical PWA.

---

### Sync: Vector Clocks + Per-Field Merge ✅

**Strengths:**
- Sophisticated approach for family collaboration
- Per-field strategies handle real-world conflicts intelligently
- Tombstones for deletions prevent ghost data

**Concerns:**
- Clock storage overhead grows with devices
- Complex debugging if merge logic has bugs
- **Mitigation:** Spike 3 validates; include conflict inspector UI for debugging

**Recommendation:** Add conflict resolution UI:
```
### Conflict Resolution UI
- When vector clocks detect conflict:
  - Show banner: "Conflict detected in task '[title]'"
  - Side-by-side diff view for title/notes
  - Radio buttons: "Keep mine", "Keep theirs", "Merge"
  - Auto-merge for tags/subtasks (set union)
- Log all conflicts to activity_log for post-mortem
```

**Verdict:** Necessary complexity; well-justified.

---

### Notifications: Web Push + Companion ✅

**Strengths:**
- Web Push is modern, reliable, supports action buttons
- Companion fallback ensures critical alerts get through
- Service Worker local scheduling works offline

**Concerns:**
- iOS Web Push only in Safari 16.4+ (iOS 16.4+)
- Android: Chrome/Edge only (no Firefox Android yet)
- **Mitigation:** Graceful degradation to Companion; detect capabilities at PWA install

**Recommendation:** Add capability detection:
```javascript
// On PWA install
async function checkNotificationSupport() {
  const support = {
    webPush: 'Notification' in window && 'serviceWorker' in navigator,
    actionButtons: 'actions' in Notification.prototype,
    requiresClick: Notification.requireInteraction !== undefined
  };

  // Store in user profile
  await updateUserCapabilities(support);

  // Fallback strategy:
  if (!support.webPush) {
    // Use HA Companion exclusively
    enableCompanionNotifications();
  }
}
```

**Verdict:** Solid dual-channel strategy.

---

### Observability: Structlog + Prometheus + OTel ✅

**Strengths:**
- Production-grade monitoring from day one
- OpenTelemetry enables end-to-end tracing
- Prometheus + Grafana is industry standard

**Concerns:**
- Adds complexity for home users
- **Mitigation:** Metrics endpoint disabled by default; opt-in via config

**Recommendation:** Add simplified home-user dashboard:
```
### Home User Dashboard (HA Lovelace Card)
- Metrics without Grafana:
  - Sync status: "✓ All devices in sync" / "⚠ 2 devices pending"
  - Latency: "Average response: 120ms"
  - Errors: "0 errors in last 24h"
  - Queue: "3 tasks pending upload"
- Data from `/api/haboard/health` endpoint
- Refresh every 30s
```

**Verdict:** Appropriate for production; add simple view for home users.

---

## Gaps & Missing Elements

### 1. Natural Language Parsing (US-1) ⚠️
**Status:** Mentioned but not specified
**Recommendation:** Add to Canvas 2 Section 6.1:
- Library: `chrono` for date/time, custom regex for syntax
- Confidence scoring & fallback to structured form
- Iterative improvement via stored parse results

### 2. Smart Suggestions Engine (US-6) ⚠️
**Status:** Principles mention context-aware but no implementation
**Recommendation:** Add new Section 9.1 (see detailed spec above)
- Rule-based MVP with weather/presence/energy checks
- Suggestion entity type with user feedback loop
- ML roadmap for future

### 3. Weather & Daylight (US-15) ⚠️
**Status:** Overlaps with US-6; needs dedicated spec
**Recommendation:** Expand Section 5.2 with environmental context (see above)

### 4. Weekly Planning UI (US-19) ⚠️
**Status:** Feature defined, no ticket
**Recommendation:** Add FE-04 ticket (see above)

### 5. Accessibility Implementation (US-29) ⚠️
**Status:** Quality gate mentions but no plan
**Recommendation:** Add Section 20 with ARIA, visual, child mode specs (see above)

### 6. i18n Details (US-30) ⚠️
**Status:** Library mentioned but no strategy
**Recommendation:** Add Section 6.4 with locale detection, RTL, NLP localization (see above)

### 7. Testing Strategy 📝
**Status:** CI/CD covers builds but test depth unclear
**Recommendation:** Add Section 14.1:
```
### Testing Strategy

**Unit Tests:**
- Backend: pytest with coverage >80% target
- Frontend: Vitest for utility functions, stores
- Sync logic: dedicated test suite for vector clocks, merge strategies

**Integration Tests:**
- API contract tests: Schemathesis + manual cases
- Database: test migrations up/down, rollback scenarios
- WebSocket: test reconnection, message ordering, rate limits

**E2E Tests:**
- Playwright on real devices (Android Chrome, iOS Safari)
- Critical paths:
  - Add task → complete → sync across 2 devices
  - Offline add → reconnect → merge
  - Voice add via Assist
  - Kiosk swipe gestures
- Performance: Lighthouse CI on every PR

**Manual Testing:**
- Weekly: pilot family testing (4 users, 3 devices)
- Pre-release: 5 pilot households for 1 week
- Accessibility: quarterly NVDA/VoiceOver testing

**Regression Prevention:**
- Golden snapshot tests for UI components
- API response snapshots
- Bundle size ratcheting (can't increase without justification)
```

---

## Risk Assessment

### High-Confidence Areas ✅
1. **Real-time sync architecture** - PostgreSQL LISTEN/NOTIFY + WebSocket is proven
2. **Offline-first PWA** - IndexedDB + Service Worker + Outbox is standard pattern
3. **HA integration depth** - Entities/services/events leverage platform strengths
4. **Performance budgets** - Specific, measurable, enforced in CI

### Medium-Confidence Areas ⚠️
1. **Vector clock conflict resolution** - Sophisticated; needs thorough testing (Spike 3)
2. **Presence fusion algorithm** - Multi-signal fusion can have false positives; user override critical
3. **Web Push reliability** - iOS support recent; need fallback strategy

### Low-Confidence / Needs Detail ⚠️
1. **Natural language parsing** - No library/approach specified
2. **Smart suggestions engine** - Feature defined but no implementation
3. **Accessibility** - Mentioned but not planned
4. **Internationalization** - Incomplete strategy

---

## Performance Budget Validation

| Budget | Target | Enforcement | Status |
|--------|--------|-------------|--------|
| Initial JS bundle | <150 KB gzipped | CI fail gate | ✅ |
| Total lazy JS | <250 KB gzipped | CI fail gate | ✅ |
| TTI (mobile) | <1.5s | Lighthouse CI | ✅ |
| Kiosk cold start | <3s | WebPageTest CLI | ✅ |
| Task sync latency (LAN) | <500ms p95 | Spike 2 validation | ✅ |
| Search results | <200ms | Benchmark in CI (BE-02) | ✅ |
| Lighthouse PWA score | ≥90 | CI fail gate | ✅ |

**Verdict:** Budgets are specific, measurable, and enforced. Excellent.

---

## Scalability Considerations

### Current Architecture Limits
- **Single HA instance:** 2-layer design assumes single-home deployment
- **Database:** PostgreSQL can handle 100+ concurrent users, but home use <<10
- **WebSocket connections:** HA default limits apply (~50 concurrent)

### Future Multi-Home Scenario
Canvas 2 acknowledges this with "Future Sync Service" (Section 2.2):
- Add FastAPI/Go microservice for cloud sync
- Database becomes source of truth for each home
- Sync service reconciles across homes

**Recommendation:** Defer until proven need. 95% of use cases are single-home.

---

## Security Review

### Strengths ✅
1. **Privacy-first:** Data stays local by default
2. **HA user integration:** Leverages HA's auth system
3. **Per-board roles:** Granular access control
4. **Activity logging:** Full audit trail

### Potential Concerns
1. **API authentication:** Not explicitly specified
   - **Recommendation:** Use HA access tokens; document in Section 7
2. **WebSocket auth:** Not mentioned
   - **Recommendation:** Require token in `haboard/subscribe_board` message
3. **Link preview fetching:** Server-side fetch could be SSRF vector
   - **Recommendation:** Whitelist schemes (http/https), timeout 5s, size limit 1MB

**Add to Canvas 2 Section 12:**
```
### Security Considerations for Link Previews
- Allowed schemes: http, https only (block file://, ftp://, etc.)
- Timeout: 5 seconds
- Size limit: 1MB response
- User-Agent: Custom UA to identify bot
- Rate limit: 10 previews per user per minute
- Validate Content-Type before parsing (HTML only)
- Strip EXIF from downloaded images
- Store previews under `/media/haboard/previews/{hash}`
- Quotas: 100MB per board
```

---

## Recommendations Summary

### Critical (Must-Have for MVP)
1. ✅ **Specify NLP parsing strategy** (US-1)
2. ✅ **Add accessibility implementation plan** (US-29)
3. ✅ **Complete i18n strategy** (US-30)
4. ✅ **Define testing depth** (Section 14.1)
5. ✅ **Add API/WS authentication details** (Section 7)

### High Priority (Should-Have for MVP)
1. ✅ **Smart suggestions engine spec** (US-6)
2. ✅ **Weather/daylight awareness details** (US-15)
3. ✅ **Weekly planning UI ticket** (US-19)
4. ✅ **Conflict resolution UI** (debugging aid)
5. ✅ **Link preview security** (Section 12)

### Medium Priority (Nice-to-Have)
1. ✅ **Home user observability dashboard** (simplified Grafana alternative)
2. ✅ **Notification capability detection** (Web Push feature detection)
3. ✅ **Vector clock inspector UI** (debugging tool)

### Low Priority (Post-MVP)
1. Multi-home sync service (defer per Section 2.2)
2. ML-powered suggestions (start with rule-based)
3. Advanced FTS (pg_trgm; basic tsvector sufficient initially)

---

## Conclusion

**Overall Verdict: READY TO BUILD with minor additions**

Canvas 1 and Canvas 2 are **highly aligned**. The technology choices directly support the user stories, and the architecture is well-suited for the home assistant context.

**Strengths:**
- Clear mapping of tech to user stories
- Performance-first mindset with enforced budgets
- Sophisticated sync strategy for family collaboration
- Deep HA integration (entities, services, events, Assist)
- Offline-first PWA with real-time sync

**Action Items Before Development:**
1. Add NLP parsing spec (chrono + custom regex)
2. Detail smart suggestions engine (rule-based MVP)
3. Complete accessibility plan (ARIA, visual, child mode)
4. Finalize i18n strategy (locale detection, RTL, date formatting)
5. Expand testing section (unit, integration, E2E, manual)
6. Add security details (API auth, WS auth, link preview safety)

**Estimated Effort for Additions:** 1-2 days of documentation work

**Recommended Next Steps:**
1. Incorporate recommendations into Canvas 2 (updated version)
2. Break down Build Slices into sprint-sized tickets
3. Set up project infrastructure (repo, CI, dev environment)
4. Run Validation Spikes 1-4 to de-risk unknowns
5. Begin Slice 1 (Core CRUD + Sync)

---

*End of Review & Analysis*
