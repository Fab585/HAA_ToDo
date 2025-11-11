"""Validation Spike 4: SQLite FTS5 Performance Test

Success Criteria:
- Load 1,000 tasks into database
- Perform full-text search queries
- Measure p95 latency < 200ms on Raspberry Pi 4 class hardware
"""
import asyncio
import time
import random
from pathlib import Path
import tempfile
import statistics
import aiosqlite


# Sample task titles and notes for realistic data
SAMPLE_TITLES = [
    "Buy milk from store",
    "Call dentist for appointment",
    "Fix leaky faucet in bathroom",
    "Schedule team meeting for project review",
    "Pick up kids from school at 3pm",
    "Grocery shopping - eggs, bread, cheese, vegetables",
    "Review quarterly financial reports",
    "Pay electricity and water bills",
    "Water plants in garden and trim hedges",
    "Finish project presentation slides",
    "Book flight tickets for vacation",
    "Renew car insurance policy online",
    "Clean garage and organize tools",
    "Update resume with recent experience",
    "Call mom and check how she's doing",
]

SAMPLE_NOTES = [
    "Don't forget to check the expiration date",
    "Need to complete this task before Friday deadline",
    "Tools are in the shed, remember to turn off water main",
    "Send calendar invite to all team members",
    "School ends at 3:30 PM sharp",
    "Check if anything is on sale this week",
    "Focus on Q4 metrics and year-over-year comparison",
    "Due date is next week, set up automatic payment",
    "Check if plants need fertilizer or pest control",
    "Include sales numbers and projections from last month",
    "Compare prices on different travel websites",
    "Policy expires at end of month, need renewal",
    "Donate old items we don't use anymore",
    "Add new programming skills learned this year",
    "She mentioned wanting to discuss vacation plans",
]

SEARCH_QUERIES = [
    "milk",
    "dentist appointment",
    "fix faucet",
    "meeting project",
    "school kids",
    "grocery shopping",
    "financial reports",
    "bills payment",
    "garden water",
    "presentation slides",
    "flight vacation",
    "insurance renewal",
    "clean garage",
    "resume update",
    "call mom",
]


async def create_schema(db: aiosqlite.Connection):
    """Create database schema with FTS5."""
    await db.execute("PRAGMA journal_mode = WAL")
    await db.execute("PRAGMA synchronous = NORMAL")

    # Create tasks table
    await db.execute("""
        CREATE TABLE tasks (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            notes TEXT
        )
    """)

    # Create FTS5 virtual table
    await db.execute("""
        CREATE VIRTUAL TABLE tasks_fts USING fts5(
            title,
            notes,
            content=tasks,
            content_rowid=id,
            tokenize='porter unicode61'
        )
    """)

    # Create triggers
    await db.execute("""
        CREATE TRIGGER tasks_fts_insert AFTER INSERT ON tasks BEGIN
            INSERT INTO tasks_fts(rowid, title, notes)
            VALUES (new.id, new.title, new.notes);
        END
    """)

    await db.commit()


async def generate_test_data(db: aiosqlite.Connection, count: int = 1000):
    """Generate test data."""
    print(f"Generating {count} test tasks...")
    start = time.perf_counter()

    for i in range(count):
        title = f"{random.choice(SAMPLE_TITLES)} #{i}"
        notes = random.choice(SAMPLE_NOTES)

        await db.execute(
            "INSERT INTO tasks (title, notes) VALUES (?, ?)",
            (title, notes)
        )

        if (i + 1) % 100 == 0:
            print(f"  Created {i + 1}/{count} tasks...")

    await db.commit()

    elapsed = time.perf_counter() - start
    print(f"Generated {count} tasks in {elapsed:.2f}s ({count/elapsed:.0f} tasks/sec)")


async def measure_search_performance(db: aiosqlite.Connection, iterations: int = 50):
    """Measure FTS5 search performance."""
    print(f"\nPerforming {iterations} search queries...")
    latencies = []

    for i in range(iterations):
        query = random.choice(SEARCH_QUERIES)

        start = time.perf_counter()
        cursor = await db.execute("""
            SELECT t.* FROM tasks t
            WHERE t.id IN (SELECT rowid FROM tasks_fts WHERE tasks_fts MATCH ?)
            LIMIT 50
        """, (query,))
        results = await cursor.fetchall()
        elapsed = (time.perf_counter() - start) * 1000  # ms

        latencies.append(elapsed)

        if (i + 1) % 10 == 0:
            print(f"  Completed {i + 1}/{iterations} queries...")

    # Calculate statistics
    latencies.sort()
    p95_index = int(len(latencies) * 0.95)
    p95 = latencies[p95_index]

    return {
        "iterations": iterations,
        "min": min(latencies),
        "max": max(latencies),
        "avg": statistics.mean(latencies),
        "p50": statistics.median(latencies),
        "p95": p95,
        "p99": latencies[int(len(latencies) * 0.99)],
    }


async def run_spike():
    """Run validation spike."""
    print("=" * 70)
    print("VALIDATION SPIKE 4: SQLite FTS5 Performance")
    print("=" * 70)

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = Path(tmp.name)

    try:
        print("\nInitializing database...")
        db = await aiosqlite.connect(str(db_path))
        db.row_factory = aiosqlite.Row

        await create_schema(db)
        await generate_test_data(db, count=1000)

        metrics = await measure_search_performance(db, iterations=50)

        # Print results
        print("\n" + "=" * 70)
        print("RESULTS")
        print("=" * 70)
        print(f"Total search queries:  {metrics['iterations']}")
        print(f"Min latency:           {metrics['min']:.2f}ms")
        print(f"Max latency:           {metrics['max']:.2f}ms")
        print(f"Average latency:       {metrics['avg']:.2f}ms")
        print(f"Median (p50):          {metrics['p50']:.2f}ms")
        print(f"95th percentile (p95): {metrics['p95']:.2f}ms")
        print(f"99th percentile (p99): {metrics['p99']:.2f}ms")
        print("=" * 70)

        print("\nSUCCESS CRITERIA EVALUATION:")
        print(f"  Target: p95 < 200ms")
        print(f"  Actual: p95 = {metrics['p95']:.2f}ms")

        if metrics["p95"] < 200:
            print(f"  ✅ PASS - p95 latency is {metrics['p95']:.2f}ms (< 200ms)")
            success = True
        else:
            print(f"  ❌ FAIL - p95 latency is {metrics['p95']:.2f}ms (>= 200ms)")
            success = False

        # Database size
        db_size = db_path.stat().st_size / 1024 / 1024  # MB
        print(f"\nDatabase size: {db_size:.2f} MB (1,000 tasks)")

        await db.close()

        print("\n" + "=" * 70)
        print(f"SPIKE RESULT: {'✅ PASS' if success else '❌ FAIL'}")
        print("=" * 70)

        return success

    finally:
        db_path.unlink(missing_ok=True)


if __name__ == "__main__":
    asyncio.run(run_spike())
