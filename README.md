# HABoard — Home Assistant To‑Do App

> **A mobile/tablet-first, offline-capable, context-aware to‑do app deeply integrated with Home Assistant**

[![Status](https://img.shields.io/badge/status-planning-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-native-blue)]()

---

## 🎯 Vision

HABoard is a next-generation task management system designed for individuals and families who use Home Assistant. It combines the best of modern to‑do apps (natural language input, drag-and-drop planning, smart notifications) with deep smart home integration (presence awareness, sensor triggers, voice control, automation).

**Key Differentiators:**

- 🏠 **HA-Native:** Entities, services, events, Assist intents — works like a built-in HA component
- 📱 **Mobile-First PWA:** Offline-capable, smooth gestures, sub-2-second interactions
- 🖥️ **Kiosk-Ready:** Tablet display for shared family spaces (fridge, wall-mounted)
- 🔄 **Real-Time Sync:** Changes propagate across devices in <500ms on LAN
- 🧠 **Context-Aware:** Presence, weather, zones, sensors influence task timing and notifications
- 👨‍👩‍👧‍👦 **Family Collaboration:** Shared boards, assignees, roles, real-time ticking

---

## 📚 Documentation

This repository contains comprehensive planning documents that define the product vision, user experience, and technical architecture.

### 🎯 Start Here
👉 **[Executive Summary](docs/00-executive-summary.md)** — High-level overview, strategy, and roadmap (10 min read)

### 📖 Complete Planning Suite

| Document | Description | Status |
|----------|-------------|--------|
| **[Canvas 0: Executive Summary](docs/00-executive-summary.md)** | Project overview, strategy, metrics, and getting started guide | ✅ Complete |
| **[Canvas 1: User Stories & Acceptance Criteria](docs/01-user-stories-acceptance-criteria.md)** | 30 user stories with detailed acceptance criteria covering all features | ✅ Complete |
| **[Canvas 2: Technology Strategy](docs/02-technology-strategy.md)** | Definitive tech stack, architecture, database design, sync strategy, and implementation plan | ✅ Complete |
| **[Canvas 3: Review & Analysis](docs/03-review-and-analysis.md)** | Comprehensive review of story-to-tech alignment, gaps, recommendations, and risk assessment | ✅ Complete |
| **[Canvas 4: Phased Implementation Plan](docs/04-phased-implementation-plan.md)** | 🚀 **MVP-first approach** with incremental delivery from v0.1 to v2.0+ | ✅ Complete |

### 🎯 Implementation Strategy

We're taking an **incremental delivery approach** that ships value early while building toward the full vision:

- **MVP (v0.1)** — **6-8 weeks** *(reduced from 12 weeks)*: Core task management + offline sync + basic HA integration
  - **Scope:** 5 core user stories (reduced from 8)
  - **Tech:** SQLite + Hybrid conflict resolution (LWW + simple CRDT)
  - **Goal:** Validate concept with 5-10 pilot users
- **Beta (v0.5)** — 4-6 months: + Kiosk mode + voice control + presence awareness + shared boards
- **V1.0** — 9-12 months: + Full collaboration + calendar + smart suggestions
- **V2.0+** — 12+ months: + ML features + multi-home sync + integrations

**Key Changes:**
- ✅ SQLite-first (not PostgreSQL) — simpler setup, Pi-friendly
- ✅ Reduced MVP scope — ships faster, validates earlier
- ✅ Validation spikes before building — de-risks unknowns
- ✅ Hybrid conflict resolution — prevents data loss without full CRDT complexity

See **[Canvas 4: Phased Implementation Plan](docs/04-phased-implementation-plan.md)** for complete details.

---

## 🏗️ Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────┐
│  Clients                                                 │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Mobile PWA      │  │ Tablet Kiosk │  │ Lovelace   │ │
│  │ (SvelteKit)     │  │ (SvelteKit)  │  │ Card (Lit) │ │
│  └────────┬────────┘  └──────┬───────┘  └─────┬──────┘ │
│           │                  │                 │         │
│           └──────────────────┼─────────────────┘         │
│                              │                           │
└──────────────────────────────┼───────────────────────────┘
                               │ REST + WebSocket
                               │
┌──────────────────────────────▼───────────────────────────┐
│  Home Assistant                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  HABoard Custom Integration                      │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │ Entities   │  │ Services     │  │ Events   │ │   │
│  │  │ Sensors    │  │ API Views    │  │ Assist   │ │   │
│  │  │ Calendar   │  │ WebSocket    │  │ Intents  │ │   │
│  │  └────────────┘  └──────────────┘  └──────────┘ │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                             │   │
│  │  - Tasks, Boards, Tags, Activity Log             │   │
│  │  - Vector Clocks for Conflict Resolution         │   │
│  │  - LISTEN/NOTIFY for Real-Time Updates           │   │
│  └──────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | SvelteKit + TypeScript + TailwindCSS | Mobile-first PWA, small bundle, offline-capable |
| **Card** | Lit | Native Lovelace embedding with minimal overhead |
| **State** | Tanstack Query + Nanostores + IndexedDB | Offline-first, optimistic updates, cross-surface state |
| **Backend** | HA Custom Integration (Python/aiohttp) | Native HA integration with entities, services, events |
| **Database** | **SQLite** (PostgreSQL opt-in V1.0+) | Zero setup, WAL mode, FTS5, Pi-friendly |
| **Sync** | Hybrid LWW + Simple CRDT → Vector Clocks (Beta) | Phased complexity: start simple, add based on need |
| **Notifications** | Web Push + HA Companion | Reliable delivery with action buttons |
| **Observability** | Structlog + Prometheus + OpenTelemetry | Production-grade monitoring |

---

## ✨ Key Features

### 🎤 Natural Language & Voice Input
- Type "Buy milk tomorrow 6pm #groceries !high @Alex" → auto-parsed task
- Voice via HA Assist: "Add take out trash to Family tonight"
- Recurring tasks: "every Friday", relative times: "in 2 hours"

### 📅 Smart Planning
- Drag tasks onto calendar days to schedule
- Time blocking with calendar integration
- Context-aware suggestions based on weather, presence, energy tariff

### ⚡ Lightning-Fast Interactions
- Swipe right to complete (with haptic feedback)
- Swipe left to snooze (presets + custom)
- Offline-first: full CRUD works without internet
- Real-time sync: updates across devices in <500ms

### 🏡 Smart Home Integration
- **Presence-aware:** Reminders arrive when you're home and can act
- **Sensor-triggered:** Washer done → auto-create "Move laundry" task
- **Zone-based:** Entering grocery store → grocery list notification
- **Weather-aware:** Outdoor tasks suggest dry, daylight windows
- **Automation-linked:** Tasks complete when scenes/scripts execute

### 👨‍👩‍👧‍👦 Family Collaboration
- Shared boards with roles (viewer, commenter, editor)
- Assign tasks to family members
- Activity log shows who did what, when
- Real-time updates prevent duplicate work (e.g., grocery shopping)

### 🖥️ Kiosk Mode
- Optimized for fridge tablets or wall-mounted displays
- Large touch targets (≥56px)
- Ambient mode after 2 min idle (glanceable next 3 tasks)
- Loads in <2s on budget hardware

### 🔔 Smart Notifications
- Actionable: Complete, Snooze, Open buttons
- Digest mode: Morning (08:00) and evening (18:00) summaries
- Targeted: Only notify assignees (others can subscribe)
- Critical escalation: Sticky notifications for overdue tasks

### 🔍 Powerful Organization
- Full-text search (<200ms on 1k tasks)
- Tags with colors, priority levels
- Board sections for projects/routines
- Filters: Today, Overdue, Mine, by tag/priority/assignee

---

## 🚀 Development Roadmap

We're following an **incremental delivery strategy** that ships value at each milestone. See [Canvas 4: Phased Implementation Plan](docs/04-phased-implementation-plan.md) for complete details.

### 🎯 MVP (v0.1) — "Prove the Concept"
**Timeline:** 6-8 weeks *(reduced from 12 weeks)* | **Users:** 5-10 pilot testers

**Core Features (Reduced Scope):**
- ✅ Quick add with **optional** NLP (primary: structured form; chrono as enhancement)
- ✅ Swipe to complete/snooze with haptics
- ✅ Offline-first PWA (IndexedDB + Service Worker)
- ✅ Real-time sync with **hybrid conflict resolution** (LWW + completion-wins + tag-union)
- ✅ Basic HA integration (todo entity + services)
- ✅ Basic Web Push notifications (Open action only; digests deferred to Beta)
- ✅ Mobile-optimized UI with Today/Overdue/All/Tag filters
- ✅ Full-text search (SQLite FTS5, <200ms on 1k tasks)

**Validation Spikes (Week 1-2):**
- [ ] Offline sync POC (prove IndexedDB + WebSocket works)
- [ ] NLP parsing quality (test chrono on 50 phrases)
- [ ] Bundle size check (verify <150KB achievable)
- [ ] SQLite FTS5 performance (validate <200ms search)

**What We'll Learn:**
- Is the concept useful enough to replace existing apps?
- Is structured form + optional NLP better than NLP-only?
- Does hybrid conflict resolution prevent family frustration?
- Is SQLite fast enough, or do we need PostgreSQL?

---

### 🎨 Beta (v0.5) — "Daily Driver Quality"
**Timeline:** 4-6 months | **Users:** 20-50 beta testers

**Adds:**
- ✅ Kiosk mode for tablet displays with ambient idle mode
- ✅ Lit custom card for Lovelace dashboards
- ✅ Voice control via Home Assistant Assist
- ✅ Basic presence-aware reminders
- ✅ Shared boards with real-time collaboration
- ✅ Smart notification digests (morning/evening)
- ✅ Improved conflict resolution (per-field merge)

**What We'll Learn:**
- Do families actually use kiosk mode?
- Is voice control reliable enough?
- Does presence awareness add value or annoy?

---

### 🏆 V1.0 — "Feature Complete"
**Timeline:** 9-12 months | **Users:** Public release

**Adds:**
- ✅ Calendar integration with time blocking
- ✅ Smart suggestions (rule-based: weather, energy, presence)
- ✅ Sensor-triggered tasks (washer done, low battery, etc.)
- ✅ Zone-based notifications (grocery store → grocery list)
- ✅ Weekly planning ritual
- ✅ Per-board roles and permissions
- ✅ Activity log with audit trail
- ✅ Full accessibility (WCAG AAA, screen readers, child mode)
- ✅ Internationalization (multiple locales, RTL, timezones)

**What We'll Learn:**
- Which advanced features get used most?
- Is the app stable enough for 500+ users?

---

### 🚀 V2.0+ — "Innovation & Polish"
**Timeline:** 12+ months

**Potential Features (prioritize based on V1.0 feedback):**
- ML-powered smart scheduling and duration prediction
- Multi-home sync for families with multiple properties
- Integrations (Todoist/Things import, calendar sync)
- Analytics & productivity insights
- Platform expansion (desktop apps, browser extensions, wearables)

---

## 🧪 Validation Spikes (Week 1-2)

Before MVP development, we'll run **4 time-boxed experiments** (2 weeks) to validate critical unknowns:

1. **Offline Sync POC:** Prove IndexedDB + Outbox + WebSocket works reliably
   - Test: 2 devices, add task offline, go online, sync in <2s
   - Success: 10/10 syncs work; latency <2s
2. **NLP Parsing Quality:** Test chrono accuracy on 50 phrases
   - Success: >80% fully correct; <10% complete failures
3. **Bundle Size Check:** Build minimal SvelteKit + deps
   - Success: <100 KB (leaves margin for features)
4. **SQLite FTS5 Performance:** Load 1k tasks, measure search latency
   - Success: p95 <200ms on Raspberry Pi 4

**Gate:** All spikes must pass before MVP development starts. No exceptions.

---

## 📊 Performance Budgets

Enforced in CI with hard fail gates:

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Initial JS bundle | <150 KB gzipped | Webpack Bundlesize |
| Total lazy JS | <250 KB gzipped | Webpack Bundlesize |
| TTI (mobile) | <1.5s | Lighthouse CI |
| Kiosk cold start | <3s | WebPageTest CLI |
| Sync latency (LAN) | <500ms p95 | Load test harness |
| Search results | <200ms | Benchmark suite |
| Lighthouse PWA | ≥90 | Lighthouse CI |

---

## 🔒 Security & Privacy

- **Local-first:** Data stays on your Home Assistant instance by default
- **HA Auth:** Uses Home Assistant's user system and access tokens
- **Per-board Roles:** Granular access control (viewer, commenter, editor)
- **Activity Logging:** Full audit trail of all actions
- **No Cloud Dependency:** Works entirely on LAN; optional cloud sync in future

---

## 🌍 Internationalization & Accessibility

### i18n
- Timezone-aware due dates (DST safe)
- Localized strings with `svelte-i18n`
- RTL support for Hebrew/Arabic
- Natural language parsing supports multiple locales via `chrono`

### Accessibility
- WCAG AAA contrast ratios (7:1)
- Full screen reader support (ARIA labels, live regions)
- Keyboard navigation (shortcuts: `/` for quick add, Space to complete)
- Motion-reduced mode respects OS setting
- Child mode with simplified UI and larger targets (72px)

---

## 🛠️ Development Setup

> **Note:** This section will be populated once development begins. The repository currently contains planning documents.

**Prerequisites:**
- Home Assistant 2024.1+
- **SQLite** (included with Python; no external database needed)
- Node.js 18+
- Python 3.11+

**Optional (for V1.0+ power users):**
- PostgreSQL 14+ (for LISTEN/NOTIFY realtime sync)

**Quick Start:**
```bash
# Clone the repository
git clone https://github.com/your-org/haboard.git
cd haboard

# Install dependencies
npm install
pip install -r requirements.txt

# Set up database
./scripts/setup-db.sh

# Run dev server
npm run dev
```

---

## 📖 Documentation Index

### Planning Documents
- [**Executive Summary**](docs/00-executive-summary.md) ⭐ **Start here**
- [User Stories & Acceptance Criteria](docs/01-user-stories-acceptance-criteria.md)
- [Technology Strategy & Architecture](docs/02-technology-strategy.md)
- [Review & Analysis](docs/03-review-and-analysis.md)
- [**Phased Implementation Plan**](docs/04-phased-implementation-plan.md) ⭐ **For developers**

### Technical Specs (Coming Soon)
- Database Schema Design
- API Reference (OpenAPI)
- WebSocket Protocol
- Sync & Conflict Resolution
- Home Assistant Integration Guide

### User Guides (Coming Soon)
- Installation Guide
- Quick Start Tutorial
- Voice Control with Assist
- Kiosk Setup
- Automation Examples

---

## 🤝 Contributing

> This project is currently in the planning phase. Contributions will be welcome once development begins.

**How to Contribute:**
1. Review the [planning documents](docs/)
2. Open an issue for discussion (bug reports, feature requests, questions)
3. Submit PRs against the main branch (once development starts)

**Development Principles:**
- Performance first: budgets are hard gates
- Test everything: unit, integration, E2E
- Accessibility is not optional
- Privacy by default

---

## 📅 Project Status

**Current Phase:** Planning & Documentation ✅ → **Validation Spikes (Week 1-2)**
**Next Phase:** MVP Development (v0.1) — 6-8 weeks
**Strategy:** Incremental delivery with continuous user feedback

### Completed Milestones
- ✅ User stories & acceptance criteria (30 stories)
- ✅ Technology stack selection & justification
- ✅ Architecture design (2-layer, SQLite-first)
- ✅ Comprehensive review & gap analysis
- ✅ **Phased implementation plan (MVP → Beta → V1.0 → V2.0+)**
- ✅ **Refined MVP scope (reduced from 8 to 5 core stories)**
- ✅ **Added error handling, migration, and testing strategies**

### Immediate Next Steps (Weeks 1-2)
- [ ] Run validation spikes (offline sync, NLP parsing, bundle size, FTS performance)
- [ ] Repository infrastructure setup (CI/CD, linting, testing)
- [ ] Recruit 5-10 pilot testers
- [ ] Finalize MVP scope with stakeholders

### MVP Roadmap (Weeks 3-12)
- [ ] Database schema + HA integration skeleton
- [ ] REST API + WebSocket sync
- [ ] SvelteKit PWA with offline support
- [ ] Core features (quick add, swipe gestures, search)
- [ ] Deploy to pilot users

### Long-Term Milestones
- [ ] Beta (v0.5) — 4-6 months: +Kiosk +Voice +Presence
- [ ] V1.0 — 9-12 months: +Calendar +Smart suggestions +Full collaboration
- [ ] Public release — Month 13

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

Inspired by the best of:
- **Things 3** — intuitive natural language input
- **Todoist** — smart scheduling & recurring tasks
- **TickTick** — calendar integration & habit tracking
- **Home Assistant** — local-first, privacy-focused smart home platform

Built with love for the Home Assistant community. ❤️

---

## 📞 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/your-org/haboard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/haboard/discussions)
- **Community:** [Home Assistant Forums](https://community.home-assistant.io/)

---

**Made with 🏡 for smart homes everywhere**
