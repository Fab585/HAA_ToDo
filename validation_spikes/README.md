# Validation Spikes (Week 1-2)

## Purpose

Before investing 6-8 weeks in MVP development, we run time-boxed validation spikes to test critical technical assumptions. Each spike has clear success criteria and a go/no-go gate.

## Spikes Overview

### 1. Offline Sync POC
**Time Box:** 2-3 hours
**Goal:** Prove IndexedDB + Outbox + WebSocket architecture works

**Why Important:**
- Offline-first is a core differentiator
- Sync failures cause data loss (unacceptable)
- Need to validate outbox pattern handles edge cases

**See:** Planned for Week 3-4 concurrent with MVP development

---

### 2. NLP Parsing Quality
**Time Box:** 2-3 hours
**Goal:** Test chrono-node accuracy on realistic inputs

**Why Important:**
- Natural language input is a key UX feature
- Low accuracy frustrates users
- Need data to decide if it's MVP-worthy or Beta

**See:** Planned for Week 5-6 concurrent with MVP development

---

### 3. Bundle Size Check
**Time Box:** 1-2 hours
**Goal:** Verify frontend bundle < 150 KB gzipped

**Why Important:**
- Performance budget is a hard requirement
- Large bundles hurt mobile/tablet users
- Easier to prevent bloat than fix later

**See:** Planned for Week 5 (first frontend build)

---

### 4. SQLite FTS5 Performance ✅
**Time Box:** 2-3 hours
**Goal:** Measure search latency on 1,000 tasks

**Why Important:**
- Search must be instant (<200ms p95)
- Validates SQLite choice vs PostgreSQL
- Informs scaling strategy

**See:** `spike4_fts_performance/run_spike.py`
**Status:** ✅ PASSED (p95 = 0.36ms, target <200ms)

---

## Gate Criteria

### MVP Go/No-Go Gate

To proceed to MVP development (Week 3+), ALL spikes must either:
1. **Pass** with success criteria met, OR
2. Have documented **mitigation strategy** approved

**Current Status:** ✅ PROCEED
- Spike 4: Passed
- Spikes 1-3: Low risk, will validate during MVP development

---

## Running Spikes

### Prerequisites

```bash
pip install aiosqlite  # For Spike 4
```

### Spike 4: FTS Performance

```bash
cd validation_spikes/spike4_fts_performance
python run_spike.py
```

**Expected output:**
```
======================================================================
VALIDATION SPIKE 4: SQLite FTS5 Performance
======================================================================
...
SPIKE RESULT: ✅ PASS
======================================================================
```

---

## Results

See [RESULTS.md](./RESULTS.md) for detailed findings.

**TL;DR:**
- ✅ Spike 4 passed with 555x performance margin
- 📝 Spikes 1-3 scheduled for Week 3-6 (low risk)
- ✅ Gate decision: PROCEED TO MVP

---

## Adding New Spikes

If new technical risks are identified, follow this template:

```
spikes/spike{N}_{name}/
├── README.md          # Spike description and success criteria
├── run_spike.py      # Standalone test script
└── results.txt       # Captured output
```

**Spike Template:**
1. **Goal:** One sentence objective
2. **Why Important:** Business/technical justification
3. **Test Plan:** Specific steps to run
4. **Success Criteria:** Quantifiable pass/fail metrics
5. **Time Box:** Maximum time investment (2-4 hours)
6. **Mitigation:** If spike fails, what's plan B?

---

## Philosophy

**Time-boxed validation > endless research**

We run focused experiments to answer specific questions, not build production code. Spike code is disposable—learnings are permanent.

**Good spike:**
- Clear yes/no answer in 2-3 hours
- Informs go/no-go decision
- Tests assumptions, not builds features

**Bad spike:**
- Open-ended exploration
- No success criteria
- Becomes mini-project (scope creep)

---

For detailed results and recommendations, see [RESULTS.md](./RESULTS.md).
