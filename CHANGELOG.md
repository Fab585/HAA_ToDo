# Changelog

All notable changes to HABoard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-10

### 🎉 Initial MVP Release

This is the first production-ready release of HABoard - an offline-first To-Do PWA for Home Assistant.

### Added

#### Task Management
- Task creation with title, notes, due date/time, priority (4 levels), and tags
- Task editing with inline forms
- Task completion via checkbox or swipe right gesture (>80px)
- Task deletion via delete button or swipe left gesture (>80px) with confirmation
- Search across task title, notes, and tags with real-time filtering
- Filter tasks by status (Active, Completed, All)
- Due date support with smart formatting ("Today", "Tomorrow", or date)
- Overdue task detection with visual indicators (red border + text)
- Priority levels (None, Low, Medium, High) with color-coded badges

#### Tag System
- Tag creation with custom colors (10 presets + color picker)
- Apply multiple tags to tasks
- Inline tag creation during task creation/editing
- Tag manager modal for full CRUD operations
- Color-coded tag badges throughout UI

#### Offline-First Architecture
- IndexedDB storage for local task persistence
- Outbox pattern for reliable offline→online synchronization
- Optimistic UI updates for instant feedback
- Automatic sync when connection restored
- Background sync via Service Worker
- Conflict resolution with server-wins strategy

#### Real-Time Synchronization
- WebSocket connection for live updates
- Auto-reconnect with exponential backoff
- Ping/pong keep-alive for connection health monitoring
- Bidirectional sync (client ↔ server)
- Online/offline status indicator in header

#### Progressive Web App (PWA)
- Service Worker with intelligent caching strategies
  - Cache-first for static assets (instant load)
  - Network-first for API calls (fresh data)
- Installable on mobile and desktop platforms
- Full offline CRUD operations
- PWA manifest with app icons and metadata
- Splash screens and theme color support

#### User Experience
- Dark mode with automatic system preference detection
- Responsive design optimized for mobile and desktop
- Touch-optimized interface with ≥44px tap targets
- Swipe gestures for quick task actions
- Smooth animations (fly, fade, scale transitions)
- Loading states and empty states
- Toast notification system with 4 types (success, error, warning, info)
- Auto-dismiss notifications with configurable duration (default 5s)
- Error handling with automatic retry (exponential backoff: 1s, 2s, 4s)

#### Keyboard Shortcuts (11 total)
- `/` or `N` - Quick add new task
- `Escape` - Close modal or form
- `?` - Show keyboard shortcuts help
- `Ctrl/Cmd + S` - Sync with server
- `Ctrl/Cmd + K` - Focus search bar
- `T` - Open tag manager
- `1` - Switch to Active filter
- `2` - Switch to Completed filter
- `3` - Switch to All filter
- Platform-specific display (⌘ for Mac, Ctrl for Windows/Linux)
- Context-aware (doesn't interfere with typing in inputs)

#### Accessibility (WCAG 2.1 Compliant)
- Full keyboard navigation for all features
- Screen reader support with comprehensive ARIA labels
- Semantic HTML with proper heading hierarchy
- Fieldset/legend for form groups
- Focus indicators for all interactive elements
- Visible delete button for keyboard accessibility
- Modal dialogs with proper ARIA attributes (role="dialog", aria-modal, aria-labelledby)
- Color contrast meeting AA standards (4.5:1 minimum)
- Zero accessibility warnings in production build

#### Backend API
- 9 REST endpoints for task and tag management
  - `GET /api/haboard/tasks` - List all tasks
  - `POST /api/haboard/tasks` - Create task
  - `GET /api/haboard/tasks/{id}` - Get single task
  - `PUT /api/haboard/tasks/{id}` - Update task
  - `DELETE /api/haboard/tasks/{id}` - Delete task
  - `POST /api/haboard/tasks/{id}/complete` - Toggle completion
  - `POST /api/haboard/tasks/search` - Full-text search
  - `GET /api/haboard/tags` - List tags
  - `POST /api/haboard/tags` - Create tag
- WebSocket endpoint at `/api/haboard/ws` for real-time updates
- SQLite database with WAL mode for concurrency
- FTS5 full-text search (0.36ms p95 on 1000 tasks)
- aiohttp async server for optimal performance
- Input validation and SQL injection prevention

### Technical

#### Frontend Stack
- SvelteKit 2.x with adapter-static (SSG/SPA mode)
- TypeScript for type safety
- Tailwind CSS for styling
- IndexedDB via `idb` library
- Service Workers for PWA capabilities
- WebSocket for real-time bidirectional sync

#### Backend Stack
- Python 3.11+ Home Assistant custom integration
- SQLite with Write-Ahead Logging (WAL) mode
- FTS5 full-text search extension
- aiohttp >=3.8.0 for async HTTP server
- aiosqlite >=0.17.0 for async database operations

#### Testing
- **106 total tests** (44 unit + 62 E2E)
- **Unit tests** with Vitest
  - Keyboard shortcuts store (10 tests)
  - Notifications store (15 tests)
  - API client with retry logic (19 tests)
- **E2E tests** with Playwright
  - Task management CRUD (13 tests)
  - Tag management (9 tests)
  - Keyboard shortcuts (14 tests)
  - Search and filters (12 tests)
  - Accessibility compliance (14 tests)
- **Multi-browser testing**
  - Desktop: Chromium, Firefox, WebKit/Safari
  - Mobile: Chrome (Pixel 5), Safari (iPhone 12)
- 100% critical path coverage

#### Performance
- Bundle size: 45KB gzipped (70% under 150KB target!)
- IndexedDB operations: <10ms
- FTS5 search: 0.36ms p95 (1000 tasks)
- Offline operations: Instant
- WebSocket latency: <100ms on LAN
- Typical sync latency: <500ms

#### Documentation
- Complete user guide (500+ lines) - `docs/USER_GUIDE.md`
- Beta testing program materials - `docs/BETA_TESTING.md`
- Comprehensive test report (600+ lines) - `docs/TEST_REPORT.md`
- Installation guide - `INSTALLATION.md`
- Release notes - `RELEASE_NOTES.md`
- API documentation in integration README

### Fixed
- Resolved 7 accessibility warnings to achieve WCAG 2.1 compliance
- Fixed TypeScript type errors in API client Headers handling
- Fixed null vs undefined compatibility in API requests
- Fixed retry logic timeout issues in unit tests
- Resolved git merge conflicts while preserving accessibility fixes

### Security
- Backend validation for all inputs
- Parameterized SQL queries to prevent injection
- XSS prevention via Svelte's built-in escaping
- No authentication in MVP (assumes trusted local network)
- Security scans passing (CodeQL, Bandit, Safety)

### Known Limitations
The following features are deferred to Beta or v1.0:
- No batch operations (tasks must be completed/deleted individually)
- No push notifications (Service Worker ready but not implemented)
- No haptic feedback on mobile
- No pull-to-refresh gesture
- No natural language parsing (structured forms only)
- No calendar view (list view only)
- No recurring tasks
- No subtasks
- No Home Assistant authentication integration

## [Unreleased]

### Planned for Beta (v0.5)
- Home Assistant authentication integration
- Enhanced mobile gestures (pull-to-refresh, haptic feedback)
- Batch operations (select multiple tasks)
- Performance optimizations for 1000+ tasks
- Push notifications via Service Worker
- User feedback integration from beta testing

### Planned for v1.0
- Natural language task parsing ("tomorrow at 3pm")
- Calendar view with time blocking
- Recurring tasks
- Subtasks and task dependencies
- Import/export functionality
- Enhanced search with filters and saved searches

---

[0.1.0]: https://github.com/Fab585/HAA_ToDo/releases/tag/v0.1.0
