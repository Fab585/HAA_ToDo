"""Validation Spike 4: SQLite FTS5 Performance Test

Success Criteria:
- Load 1,000 tasks into database
- Perform full-text search queries
- Measure p95 latency < 200ms on Raspberry Pi 4 class hardware

Test Environment:
- SQLite with FTS5
- Porter stemming + Unicode61 tokenizer
- WAL mode enabled
"""
import asyncio
import time
import random
from pathlib import Path
import tempfile
import statistics

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.haboard.database import Database
from custom_components.haboard.database.repository import TaskRepository
from custom_components.haboard.database.models import Task

# Sample task titles and notes for realistic data
SAMPLE_TITLES = [
    "Buy milk",
    "Call dentist for appointment",
    "Fix leaky faucet in bathroom",
    "Schedule team meeting",
    "Pick up kids from school",
    "Grocery shopping - eggs, bread, cheese",
    "Review quarterly reports",
    "Pay electricity bill",
    "Water plants in garden",
    "Finish project presentation",
    "Book flight tickets",
    "Renew car insurance",
    "Clean garage",
    "Update resume",
    "Call mom",
]

SAMPLE_NOTES = [
    "Don't forget to check expiration date",
    "Need to do this before Friday",
    "Tools are in the shed",
    "Send calendar invite to everyone",
    "School ends at 3:30 PM",
    None,
    "Focus on Q4 metrics",
    "Due date is next week",
    "Check if they need fertilizer",
    "Include sales numbers from last month",
    "Compare prices on different websites",
    "Policy expires end of month",
    None,
    "Add new skills learned this year",
    "She mentioned she wants to talk",
]

SEARCH_QUERIES = [
    "milk",
    "dentist appointment",
    "fix",
    "meeting",
    "school",
    "grocery",
    "reports",
    "bill",
    "garden",
    "presentation",
    "flight",
    "insurance",
    "clean",
    "resume",
    "call",
]


async def generate_test_data(task_repo: TaskRepository, count: int = 1000):
    """Generate test data for performance testing.

    Args:
        task_repo: Task repository
        count: Number of tasks to create
    """
    print(f"Generating {count} test tasks...")
    start = time.perf_counter()

    for i in range(count):
        title_idx = random.randint(0, len(SAMPLE_TITLES) - 1)
        notes_idx = random.randint(0, len(SAMPLE_NOTES) - 1)

        task = Task(
            title=f"{SAMPLE_TITLES[title_idx]} #{i}",
            notes=SAMPLE_NOTES[notes_idx],
            priority=random.randint(0, 3),
            completed=random.choice([True, False]),
            device_id="test_device",
        )

        await task_repo.create(task)

        if (i + 1) % 100 == 0:
            print(f"  Created {i + 1}/{count} tasks...")

    elapsed = time.perf_counter() - start
    print(f"Generated {count} tasks in {elapsed:.2f}s ({count/elapsed:.0f} tasks/sec)")


async def measure_search_performance(task_repo: TaskRepository, iterations: int = 50):
    """Measure FTS5 search performance.

    Args:
        task_repo: Task repository
        iterations: Number of search iterations to perform

    Returns:
        Dictionary with performance metrics
    """
    print(f"\nPerforming {iterations} search queries...")
    latencies = []

    for i in range(iterations):
        query = random.choice(SEARCH_QUERIES)

        start = time.perf_counter()
        results = await task_repo.search(query, limit=50)
        elapsed = (time.perf_counter() - start) * 1000  # Convert to milliseconds

        latencies.append(elapsed)

        if (i + 1) % 10 == 0:
            print(f"  Completed {i + 1}/{iterations} queries...")

    # Calculate statistics
    latencies.sort()
    p50 = statistics.median(latencies)
    p95_index = int(len(latencies) * 0.95)
    p95 = latencies[p95_index]
    p99_index = int(len(latencies) * 0.99)
    p99 = latencies[p99_index]
    avg = statistics.mean(latencies)
    min_latency = min(latencies)
    max_latency = max(latencies)

    return {
        "iterations": iterations,
        "min": min_latency,
        "max": max_latency,
        "avg": avg,
        "p50": p50,
        "p95": p95,
        "p99": p99,
        "all_latencies": latencies,
    }


async def run_spike():
    """Run validation spike 4: FTS5 performance test."""
    print("=" * 70)
    print("VALIDATION SPIKE 4: SQLite FTS5 Performance")
    print("=" * 70)

    # Create temporary database
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = Path(tmp.name)

    try:
        # Initialize database
        print("\nInitializing database...")
        db = Database(db_path)
        await db.connect()
        task_repo = TaskRepository(db.conn)

        # Generate test data
        await generate_test_data(task_repo, count=1000)

        # Measure search performance
        metrics = await measure_search_performance(task_repo, iterations=50)

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

        # Evaluate success criteria
        print("\nSUCCESS CRITERIA EVALUATION:")
        print(f"  Target: p95 < 200ms")
        print(f"  Actual: p95 = {metrics['p95']:.2f}ms")

        if metrics["p95"] < 200:
            print(f"  ✅ PASS - p95 latency is {metrics['p95']:.2f}ms (< 200ms)")
            success = True
        else:
            print(f"  ❌ FAIL - p95 latency is {metrics['p95']:.2f}ms (>= 200ms)")
            success = False

        # Additional observations
        print("\nOBSERVATIONS:")
        if metrics["avg"] < 50:
            print("  • Excellent average latency (< 50ms)")
        elif metrics["avg"] < 100:
            print("  • Good average latency (< 100ms)")

        if metrics["max"] > 500:
            print("  ⚠️ Some queries are slow (max > 500ms) - may need optimization")

        # Database size
        db_size = db_path.stat().st_size / 1024 / 1024  # MB
        print(f"\nDatabase size: {db_size:.2f} MB (1,000 tasks)")

        # Cleanup
        await db.disconnect()

        print("\n" + "=" * 70)
        if success:
            print("SPIKE RESULT: ✅ PASS")
        else:
            print("SPIKE RESULT: ❌ FAIL")
        print("=" * 70)

        return success

    finally:
        # Cleanup
        db_path.unlink(missing_ok=True)


if __name__ == "__main__":
    asyncio.run(run_spike())
