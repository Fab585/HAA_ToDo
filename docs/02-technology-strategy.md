# Canvas 2 — Final Technology Strategy & Optimisation Plan

*Last updated: 10 Nov 2025 (Europe/London)*

This is the **definitive tech plan** for the HA‑integrated to‑do app, merging our original stack decisions with the complete optimisation review. It maps every choice to the gold‑standard user stories in **Canvas 1**, and locks in budgets, risks, and validation spikes.

---

## 0) Executive Verdict

**Overall fit: GREEN.** The stack meets all user stories with high confidence when implemented as below.

**Key shifts vs. earlier draft:**

1. **Simplified architecture (2‑layer):** App talks **directly to the HA custom integration** (REST + WS). The optional FastAPI add‑on is deferred until multi‑home/cloud sync.
2. **Database:** **PostgreSQL** as the primary datastore for concurrency & LISTEN/NOTIFY. SQLite remains supported as a fallback, but not the default.
3. **Offline & conflict safety:** Vector clocks + per‑field merge strategies; CRDT/line‑merge for notes; tombstones for tag removals.
4. **Notifications:** **Web Push** as primary channel with **HA Companion** fallback; **local scheduling** in Service Worker.
5. **Performance & observability:** Strict budgets in CI, four validation spikes, and full metrics/tracing.

---

## 1) Guiding Principles (from Canvas 1)

* **HA‑native first:** Entities, services, events, Assist, Blueprints. (US‑2, US‑7/8, US‑16)
* **Mobile/tablet excellence:** Fast PWA, smooth gestures, offline‑first. (US‑1, US‑4, US‑7, US‑25)
* **Kiosk‑ready:** Glanceable, large targets, ambient mode. (US‑16, US‑17)
* **Context‑aware:** Presence, zones, sensors, weather. (US‑6, US‑12/13/14/15)
* **Privacy/local‑first:** Data stays at home by default. (US‑25, Security)

---

## 2) System Architecture (Simplified, Low‑Latency)

### 2.1 Final Architecture (2‑layer)

* **Client (SvelteKit PWA + Lit Card)** ⟷ **HA Custom Integration (`haboard`)**

  * **REST (aiohttp views)** at `/api/haboard/*` for CRUD & batch sync
  * **WebSocket message types**: `haboard/subscribe_board`, `haboard/updates`
  * **Entities/services/events** registered in HA for automation/Assist

**Flow (Complete):** tap → `POST /api/haboard/tasks/{id}/complete` → integration updates DB → updates entity state → HA broadcasts → clients update. **3 hops**, typical LAN ≤ **150 ms**.

### 2.2 Future Sync Service (deferred)

* Add **separate** sync microservice (FastAPI/Go) *beside* the integration for multi‑home/cloud; database remains the source of truth. Local perf unaffected.

---

## 3) Data Layer & Database

### 3.1 Primary: PostgreSQL

* **Why:** MVCC concurrency, **LISTEN/NOTIFY** for sub‑200 ms realtime fan‑out, robust FTS, JSON, and migration tooling.
* **Config (home‑scale):** `max_connections=20`, `shared_buffers=128MB`, `work_mem=4MB`.
* **Features:**

  * FTS via `tsvector` initially; can add **pg_trgm** for prefix search.
  * **LISTEN/NOTIFY** channel `haboard_updates` with payload deltas (task ID, changed fields, clocks).
  * Optional **pg_cron** for periodic jobs (recurrence, cleanups).

### 3.2 Fallback: SQLite

* Supported for minimal setups; WAL mode; caution with concurrent writes.

### 3.3 Schema Highlights

* `boards`, `tasks`, `subtasks`, `tags` (many‑to‑many), `attachments`, `activity_log` (append‑only), `vector_clocks` (per task), `webpush_subscriptions`.
* IDs: **UUID v7** (sortable).

---

## 4) Sync, Offline & Conflict Resolution (US‑25/26)

### 4.1 Vector Clocks & Merge

* Store per‑task **vector clocks** (`{device_id: counter}`) to detect concurrency.
* **Per‑field strategies:**

  * `title` → conflict UI if concurrent (user choice)
  * `description/notes` → **CRDT text** (Automerge) or pragmatic **line‑merge** with diff banner
  * `due`, `priority`, `assignee` → latest timestamp wins (tie‑break by device ID)
  * `completed` → **TRUE wins** (append‑only event with `completed_at`, `completed_by`)
  * `tags` → **set union** with tombstones for removals
  * `subtasks` → array CRDT (append + tombstones)

### 4.2 Client Outbox & Optimism

* **IndexedDB Outbox**: idempotent ops with retry & exponential backoff.
* **Optimistic UI**: instant checkmark; reconcile on ack; show conflict badges when applied.

### 4.3 Realtime Propagation

* On commit: DB → `NOTIFY` → integration WS broadcast → clients update caches. **LAN p95 < 500 ms** target.

---

## 5) Notifications & Presence (US‑8/12/13/23/24)

### 5.1 Dual‑Channel Delivery

* **Primary:** **Web Push** (PWA Service Worker). Reliable wake, action buttons, works when app closed (iOS ≥16.4, Android modern browsers).
* **Secondary:** **HA Companion** (`notify.mobile_app_*`) as fallback & for **critical alerts**.
* **Local Scheduling:** Service Worker maintains digest/heads‑up schedule, fires even offline; dedupes with server pushes.

### 5.2 Presence Confidence

* Fuse **GPS + Wi‑Fi SSID + BLE beacon (opt) + device activity** → produce a 0–1 confidence score.
* Debounce enters/leaves; allow user overrides ("Notify me anyway").
* Multi‑person routing: notify first eligible adult at home; else queue summary on first arrival.

---

## 6) Frontend Application

### 6.1 Stack

* **SvelteKit + TypeScript + TailwindCSS + Motion One** (PWA)
* **Lit Custom Card** for Lovelace (thin bridge to the app)
* **Gesture helper:** `@use-gesture/svelte` (swipe/drag reliability)
* **i18n:** `svelte-i18n` + chrono locales

### 6.2 State Architecture

* **Server state:** **@tanstack/svelte-query** (fetch, cache, optimistic mutations, WS‑backed invalidation).
* **Cross‑component & cross‑surface:** **Nanostores** (filters, user, sync status) shared by Svelte app, Lit card, SW.
* **UI state:** Svelte stores (ephemeral); persisted prefs in IndexedDB when needed.
* **Persistence:** **IndexedDB** via `idb` for offline caches & outbox.

### 6.3 Performance Budget

* Initial JS **< 150 KB gzipped** (hard fail at 150 KB), total lazy **< 250 KB**; TTI **< 1.5 s** mid‑range phone; kiosk cold start **< 3 s**.
* Enforced in CI; Lighthouse PWA ≥ 90.

---

## 7) API, Types & Contracts

* **OpenAPI** generated from integration models → **openapi‑typescript** generates TS types (`types.generated.ts`).
* Client uses types for request/response; **Zod** (generated or hand‑rolled) validates forms client‑side; **Pydantic** validates server‑side.
* **Schemathesis** fuzzes OpenAPI in CI.

---

## 8) Caching & Service Worker

* **HTTP cache:** immutable hashed assets 1y; HTML no‑cache.
* **Workbox** strategies:

  * Static assets → cache‑first; versioned precache.
  * API GET → network‑first with 2s timeout → cache fallback.
  * Mutations → network‑only + Outbox queue.
* **IndexedDB** stores structured tasks/boards for fast offline queries (today, by board/tag).

---

## 9) Home Assistant Integration (`haboard`)

* **Entities:** `todo.<board>`, `calendar.<board>_deadlines`, `sensor.<board>_overdue_count`, `sensor.<board>_mine_count`, `sensor.<board>_next_three`, `binary_sensor.<board>_has_overdue`.
* **Services:** `create_board`, `create_page`, `add_item`, `update_item`, `complete_item`, `reopen_item`, `snooze_item`, `assign_item`, `share_board`, `block.create` (atomic task+calendar block).
* **Events:** `item_created`, `item_updated`, `item_completed`, `item_assigned` (payloads include clocks & user).
* **Assist intents:** AddTodo, ListToday, CompleteTodo with examples for recurrence/relative times + one‑shot clarification.
* **Calendar:** mirror due tasks; optional ICS export.

---

## 10) Kiosk & Dashboard Embedding

* **Lit Custom Card:** light logic, configurable via HA Config Flow; delegates heavy work to PWA via bridge (postMessage or WS topic).
* **PWA Kiosk Route:** fullscreen, large touch targets, ambient mode after 2 min idle; deep links from notifications (`app://board/{id}` or HA panel path).

---

## 11) Search & Indexing (US‑20)

* PostgreSQL FTS (tsvector) over title/notes/tags/assignee; optional pg_trgm for prefix.
* Materialised views/indexes for common filters (overdue, today, mine, tags).
* **Target:** results **< 200 ms** on low‑end hardware; benchmarked in CI.

---

## 12) Images, Links & Media (US‑3.3)

* Link previews via server‑side fetch (Open Graph), proxied/stored under `/media/haboard/previews/`; thumbnails with Pillow; EXIF stripped.
* Future attachments under `/media/haboard/attachments/{task_id}/`; quotas and type validation via magic bytes.

---

## 13) Observability & Ops

* **Logging:** Python **structlog** (JSON, contextual fields); frontend error logging → **Sentry** (self‑host optional).
* **Metrics:** **Prometheus** endpoint `/api/haboard/metrics`; Grafana dashboards; alerts (latency, error rate, offline queue depth).
* **Tracing:** **OpenTelemetry** spans across UI → API → DB → WS; Jaeger/Zipkin collector.
* **Dash card (ops):** shows sync status, p95 latency, errors, queue depth.

---

## 14) CI/CD & Quality Gates

* **GitHub Actions:** lint → build → unit → E2E → contract tests → perf check → package.
* **Contract tests:** `pytest-homeassistant-custom-component` for entities/services/events.
* **Perf CI:** bundle size gates; Lighthouse mobile profile; WebPageTest CLI for kiosk route.
* **Migration tests:** Alembic up/down; snapshot & restore.

---

## 15) Risks & Mitigations (Updated)

| Risk                            | Impact             | Mitigation                                                                    |
| ------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| iOS/Android notification delays | Missed nudges      | Web Push primary; Companion fallback; local SW scheduling; critical dual‑send |
| Presence false positives        | Bad timing         | Multi‑signal fusion + hysteresis + user override; confidence scoring          |
| DB schema evolution             | Data loss / outage | Versioned migrations, backups, CI migration tests, deprecation discipline     |
| WS connection storms            | Server load        | Connection caps, heartbeat, rate limits, polling fallback                     |
| Tailwind bloat                  | Perf regressions   | Strict purge/JIT, CSS budget in CI, safelist management                       |

---

## 16) Validation Spikes (Time‑boxed Experiments)

1. **Kiosk drag perf:** 50 task cards; 60 fps target; haptics; measure on budget tablet.
2. **Realtime under load:** 4 clients, 10 writes/sec; p95 < 500 ms; zero drop.
3. **Offline conflict merge:** concurrent edits (title, completion, assignee); verify rules & logs.
4. **Bundle size reality:** prod build with deps; main <150 KB; total <250 KB; Lighthouse pass.

---

## 17) Build Slices ↔ Stories

1. **Slice 1: Core CRUD + Sync** — DB schema, WS realtime, Outbox, LWW for primitives → (US‑1, US‑8, US‑25/26)
2. **Slice 2: Kiosk & Card** — Lit card + kiosk route (Today/Overdue/Mine) → (US‑16/17)
3. **Slice 3: Agenda & Calendar** — drag‑to‑day, FTS, calendar mirror, `block.create` → (US‑4/5/18)
4. **Slice 4: Presence & Voice** — presence fusion, Assist intents & disambiguation → (US‑2/12/13)
5. **Slice 5: Activity & Roles** — activity timeline, export, HA role mapping → (US‑10/28)

---

## 18) Tickets (Ready‑to‑Make)

* **FE‑01** Svelte Query + WS invalidation; stale resolves ≤500 ms post‑event.
* **FE‑02** Swipe triage gestures + haptics; 5 s undo toast.
* **FE‑03** Service Worker outbox with idempotency keys; retry policy.
* **BE‑01** PostgreSQL schema + LISTEN/NOTIFY channel; UUID v7.
* **BE‑02** FTS indexes + materialised views; US‑20 benchmark <200 ms.
* **BE‑03** WS broadcast with deltas & server_clock.
* **INT‑01** Entities/sensors (`_mine_count`, `_next_three`); `block.create` service.
* **INT‑02** Assist training set (recurrence/relative) + one‑shot clarification.
* **QA‑01** Contract tests + Schemathesis on OpenAPI.
* **OPS‑01** CI perf budgets; HA version matrix; nightly smoke on HA dev container.

---

## 19) Summary: Optimised Stack (At‑a‑glance)

| Layer              | Final Choice                                      | Why                                              |
| ------------------ | ------------------------------------------------- | ------------------------------------------------ |
| **Architecture**   | 2‑layer (App ⇄ Integration)                       | Lower latency, simpler ops, fewer failure points |
| **Database**       | **PostgreSQL** (SQLite fallback)                  | Concurrency, LISTEN/NOTIFY, FTS, future‑proof    |
| **Sync/Conflicts** | Vector clocks + per‑field merges                  | Data‑safe family collaboration                   |
| **Notifications**  | **Web Push** + Companion fallback + SW scheduling | Reliable, fast, offline‑capable                  |
| **Frontend**       | **SvelteKit + Tailwind + Motion One**             | Mobile/kiosk perf, PWA ergonomics                |
| **Card**           | **Lit**                                           | Native Lovelace embed, thin bridge               |
| **State**          | Svelte Query + Nanostores + IndexedDB             | Offline‑first, cross‑surface                     |
| **Types**          | OpenAPI → TS codegen                              | Single source of truth, compile‑time safety      |
| **Caching**        | Workbox + IndexedDB                               | Sub‑second offline UX                            |
| **Observability**  | Structlog + Prometheus + OTel + Sentry            | Production visibility                            |

---

*End of Canvas 2 — Final Plan.*
