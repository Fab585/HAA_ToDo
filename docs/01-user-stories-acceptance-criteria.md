# Canvas 1 — User Stories & Acceptance Criteria (Gold Standard)

*Last updated: 10 Nov 2025 (Europe/London)*

This canvas captures the exhaustive, design-led **user stories** and **acceptance criteria** for the Home Assistant–integrated, mobile/tablet-first to‑do app. These are *gold‑standard* behaviors—how it should ideally work for individuals and families—based on our research across top to‑do apps and smart‑home capabilities.

---

## 1) Capture & Create

### US‑1: Quick Add (Natural Language)

**As a busy user**, I want to add a task in one step using natural language so I can capture thoughts instantly.

* **AC‑1.1**: Typing "Buy milk tomorrow 6pm #groceries !high @Alex" auto‑parses: Title=Buy milk; Due=Tomorrow 18:00 (local); Tag=groceries; Priority=High; Assignee=Alex.
* **AC‑1.2**: Parsing feedback chips appear inline and are editable (tap to change time, tag, priority, assignee) without leaving the field.
* **AC‑1.3**: Save creates the task in ≤2s, with an undo toast (5s window).
* **AC‑1.4**: Works offline; sync happens transparently when online.

### US‑2: Voice Add via Assist

**As any family member**, I want to add tasks by voice so I can stay hands‑free.

* **AC‑2.1**: Phrases like "Add *take out trash* to *Family* **tonight**" create a task due 21:00 local by default.
* **AC‑2.2**: Assist confirms out loud and on‑screen ("Added to Family · tonight 21:00"), with an *Undo* chip.
* **AC‑2.3**: If board not specified, system asks a single clarifying question or defaults to last used board.
* **AC‑2.4**: Works for recurring ("every Friday"), and relative ("in 2 hours").

### US‑3: Quick Capture from Anywhere

**As a user**, I want a persistent quick‑add so capture is always ≤2 taps.

* **AC‑3.1**: FAB on mobile and docked quick‑add on kiosk are always available without scrolling.
* **AC‑3.2**: Keyboard shortcut (/) focuses quick‑add; Enter saves; Shift+Enter adds another.
* **AC‑3.3**: Pasting a link auto‑creates a rich preview in the task body.

---

## 2) Plan & Schedule

### US‑4: Agenda Drag‑and‑Drop

**As a planner**, I want to drag tasks onto days so I can distribute workload.

* **AC‑4.1**: Dragging to a day chip sets due date; visual snap + haptic.
* **AC‑4.2**: Drag between days reschedules; latency ≤1000 ms end‑to‑end.
* **AC‑4.3**: Conflict hint appears when overbooking a day (e.g., too many tasks / calendar events).

### US‑5: Time Blocking (Optional)

**As a time‑boxer**, I want to add a duration to tasks and slot them in my day.

* **AC‑5.1**: Setting a duration creates a calendar block on the board calendar.
* **AC‑5.2**: Moving the block updates task due/start times.
* **AC‑5.3**: Calendar respects existing events; prevents overlaps unless forced.

### US‑6: Smart Suggestions (Context‑Aware)

**As a user**, I want the app to propose good times or deferrals based on context.

* **AC‑6.1**: If it's raining, a "Water plants" task suggests deferring to next clear window.
* **AC‑6.2**: If nobody is home near due time, convert to a presence‑window reminder.
* **AC‑6.3**: When energy tariff is low (sensor), suggest running energy‑heavy chores.

---

## 3) Do & Complete

### US‑7: One‑Swipe Triage

**As a task doer**, I want to complete or snooze with a single gesture.

* **AC‑7.1**: Swipe right completes with animated check; haptic tick.
* **AC‑7.2**: Swipe left opens snooze presets (15m, 1h, evening, tomorrow) + custom.
* **AC‑7.3**: Undo is available for 5s from a toast or notification.

### US‑8: Actionable Notifications

**As a mobile user**, I want to act from notifications to save time.

* **AC‑8.1**: Due‑soon and due‑now notifications include **Complete**, **Snooze**, **Open**.
* **AC‑8.2**: Tapping actions updates task state in ≤2s and reflects across all devices.
* **AC‑8.3**: Critical tasks can escalate (sticky/critical channel) if still overdue after N minutes (configurable).

### US‑9: Device‑Linked Completion

**As an automation‑minded user**, I want tasks to complete when linked device actions finish.

* **AC‑9.1**: Mark "Vacuum living room" done automatically when robot vacuum reports job complete within 3h window.
* **AC‑9.2**: Mark "Start movie night" done when scene `movie_time` executes successfully.

---

## 4) Share & Collaborate (Family)

### US‑10: Shared Boards

**As a family**, we want shared boards where everyone can see and contribute.

* **AC‑10.1**: Board roles: viewer, commenter, editor; enforced per HA user.
* **AC‑10.2**: Activity log shows created/edited/completed with who + when.
* **AC‑10.3**: Board color/icon/theme editable; visible on kiosk and mobile.

### US‑11: Assign to a Person

**As a parent**, I want to assign tasks to specific family members.

* **AC‑11.1**: Each task shows assignee avatar; tap to reassign.
* **AC‑11.2**: "Mine" filter shows tasks assigned to current user.
* **AC‑11.3**: Notifications target only the assignee by default (others can subscribe).

### US‑12: Grocery & Errands Flow

**As shoppers**, we want lists that surface at the right place.

* **AC‑12.1**: Entering `zone.grocery` pops the Grocery board or a compact list notification.
* **AC‑12.2**: Items auto‑group by aisle/category if known (optional enhancement).
* **AC‑12.3**: Shared ticking is real‑time; no double‑buying.

---

## 5) Context & Smart Home Awareness

### US‑13: Presence‑Aware Reminders

**As an assignee**, I want reminders to arrive when I can actually do the task.

* **AC‑13.1**: Evening‑window chores (18:00–21:00) only notify if I'm home; otherwise defer with a summary when I arrive.
* **AC‑13.2**: Multi‑person presence targeting: if task is unassigned, notify first available adult at home.
* **AC‑13.3**: Quiet hours respect system/phone DND; urgent tasks may bypass (opt‑in).

### US‑14: Sensor‑Triggered Tasks

**As a homeowner**, I want tasks to be created from meaningful sensor events.

* **AC‑14.1**: When washer finishes, auto‑create "Move laundry to dryer" with a 20‑minute due.
* **AC‑14.2**: When HVAC runtime > threshold, create "Replace air filter" for the weekend.
* **AC‑14.3**: Duplicates are suppressed; tasks auto‑merge if similar open items exist.

### US‑15: Weather & Daylight Awareness

**As an outdoor chore doer**, I want tasks to adapt to weather/daylight.

* **AC‑15.1**: "Mow lawn" suggests nearest dry daylight slot; warns if sunset < 45 min away.
* **AC‑15.2**: "Water garden" pauses on rain forecast and resumes next dry morning.

---

## 6) Kiosk & Shared Displays

### US‑16: Fridge Tablet View

**As a household**, we want a clean tablet display everyone can use.

* **AC‑16.1**: Loads in ≤2s on a budget tablet; large, high‑contrast typography.
* **AC‑16.2**: Chips show Today, Overdue, Mine; tapping filters instantly (<300 ms).
* **AC‑16.3**: Tap targets ≥56 px; swipe complete/snooze works on kiosk.

### US‑17: Ambient & Idle Mode

**As a family**, we want an ambient mode that's glanceable.

* **AC‑17.1**: After 2 min idle, switches to ambient: next 3 tasks + time/date + subtle background.
* **AC‑17.2**: Motion/tap wakes to full interactive mode.

---

## 7) Calendar & Agenda

### US‑18: Unified Agenda

**As a planner**, I want tasks and events together.

* **AC‑18.1**: Board calendar shows tasks (blocks) alongside events; color‑coded by board.
* **AC‑18.2**: Dragging a task block reschedules due/start; conflicts highlighted.
* **AC‑18.3**: All‑day tasks display at the top; timed tasks in timeline.

### US‑19: Week Planning Ritual

**As a couple/family**, we want a simple weekly planning flow.

* **AC‑19.1**: Sunday 18:00 prompt opens planning mode with suggestions (overdue carry‑over, unscheduled items).
* **AC‑19.2**: One‑tap distribute: auto‑spread unscheduled tasks across the coming week, editable before save.

---

## 8) Search, Filter, Organize

### US‑20: Powerful Search

**As a user**, I want to find any task fast.

* **AC‑20.1**: Search matches title, notes, tags, assignee; results in <200 ms on 1k tasks.
* **AC‑20.2**: Recent searches and saved filters (e.g., "@Alex + #garden + overdue").

### US‑21: Tags & Priority

**As an organizer**, I want consistent tagging and prioritization.

* **AC‑21.1**: Create/edit tags inline with color.
* **AC‑21.2**: Priority levels (None/Low/Med/High) show clear visual cues.

### US‑22: Sections/Pages per Board

**As a planner**, I want to segment a board by projects or routines.

* **AC‑22.1**: Sections are collapsible; per‑section progress and next due chip.
* **AC‑22.2**: Move tasks between sections via drag; preserves metadata.

---

## 9) Notifications Strategy

### US‑23: Smart Digests

**As a user**, I want summaries instead of constant pings.

* **AC‑23.1**: Morning (08:00) and evening (18:00) digests: counts, top 3, quick links.
* **AC‑23.2**: Optional weekend digest; silence during defined quiet hours.

### US‑24: Threaded & Targeted

**As a family**, we want notifications to go to the right person/device.

* **AC‑24.1**: Threads per board; collapsing repeats into a single thread.
* **AC‑24.2**: Default target = assignee's active device(s); followers can subscribe per task/board.

---

## 10) Reliability, Performance, Offline

### US‑25: Offline‑First

**As a mobile user**, I want the app to work without internet.

* **AC‑25.1**: Full CRUD offline; changes queue and sync later without conflicts (last‑writer wins with human‑readable merge for notes).
* **AC‑25.2**: Local cache preloads Today + current board; cold start <1.5 s on mid‑range phone.

### US‑26: Real‑Time Sync

**As a family**, we want instant updates across devices.

* **AC‑26.1**: Task state changes propagate in ≤500 ms on LAN; ≤2 s over WAN.
* **AC‑26.2**: Kiosk updates without manual refresh.

---

## 11) Security & Roles

### US‑27: Roles & Permissions

**As an admin/parent**, I want to control who can edit what.

* **AC‑27.1**: Per‑board roles (viewer/commenter/editor) enforced for all interactions.
* **AC‑27.2**: Sensitive tasks can be marked private to specific users.

### US‑28: Audit & Activity

**As a parent**, I want to see who did what.

* **AC‑28.1**: Activity timeline per board with filters (created, edited, completed, reassigned).
* **AC‑28.2**: Export activity (CSV/JSON) for backups.

---

## 12) Accessibility & Inclusivity

### US‑29: A11y First

**As a user with accessibility needs**, I want a fully accessible app.

* **AC‑29.1**: Screen readers announce due status, priority, assignee; all controls labeled.
* **AC‑29.2**: High‑contrast theme; motion‑reduced mode respects OS setting.
* **AC‑29.3**: Child mode with larger targets and simplified UI.

---

## 13) Internationalization

### US‑30: i18n & Timezones

**As a global family**, we want accurate dates/times and languages.

* **AC‑30.1**: Timezone‑aware due dates; DST safe.
* **AC‑30.2**: Localized strings; RTL support; locale‑aware parsing (e.g., "mañana 18:00").

---

## 14) Quality Gates (Definition of Done per Story)

* All acceptance criteria met with UX parity in light/dark.
* Unit + E2E tests cover critical paths (add, complete, snooze, reschedule, notify).
* Performance budgets respected (bundle size, latency metrics).
* Privacy checks: no unintended data egress; notifications respect lock‑screen redaction.
* Usability: 5 pilot users complete flows without guidance.

---

**End of Canvas 1**
