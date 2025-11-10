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

- **MVP (v0.1)** — 2-3 months: Core task management + offline sync + basic HA integration
- **Beta (v0.5)** — 4-6 months: + Kiosk mode + voice control + presence awareness
- **V1.0** — 9-12 months: + Full collaboration + calendar + smart suggestions
- **V2.0+** — 12+ months: + ML features + multi-home sync + integrations

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
| **Database** | PostgreSQL (SQLite fallback) | LISTEN/NOTIFY for real-time, full-text search, concurrency |
| **Sync** | Vector Clocks + Per-Field Merge | Conflict-safe family collaboration |
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
**Timeline:** 2-3 months | **Users:** 5-10 pilot testers

**Core Features:**
- ✅ Quick add with natural language parsing (chrono)
- ✅ Swipe to complete/snooze with haptics
- ✅ Offline-first PWA (IndexedDB + Service Worker)
- ✅ Real-time sync with last-write-wins conflict resolution
- ✅ Basic HA integration (todo entity + services)
- ✅ Web Push notifications with action buttons
- ✅ Mobile-optimized UI with Today/Overdue/All filters

**What We'll Learn:**
- Is the concept useful enough to replace existing apps?
- Is NLP parsing accurate enough?
- Does offline sync work reliably?

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

## 🧪 Validation Spikes

Before full implementation, we'll run time-boxed experiments to validate unknowns:

1. **Kiosk Drag Performance:** 50 task cards, 60 fps target, budget tablet
2. **Realtime Under Load:** 4 clients, 10 writes/sec, p95 <500ms
3. **Offline Conflict Merge:** Concurrent edits, verify vector clock resolution
4. **Bundle Size Reality Check:** Prod build, main <150 KB, total <250 KB, Lighthouse ≥90

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
- PostgreSQL 14+ (or SQLite for simple setups)
- Node.js 18+
- Python 3.11+

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

**Current Phase:** Planning & Documentation ✅
**Next Phase:** Validation Spikes → MVP Development (v0.1)
**Strategy:** Incremental delivery with continuous user feedback

### Completed Milestones
- ✅ User stories & acceptance criteria (30 stories)
- ✅ Technology stack selection & justification
- ✅ Architecture design (2-layer, simplified sync)
- ✅ Comprehensive review & gap analysis
- ✅ **Phased implementation plan (MVP → Beta → V1.0 → V2.0+)**

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
