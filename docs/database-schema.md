# Database Schema Documentation

## Overview

HABoard uses SQLite with Write-Ahead Logging (WAL) mode for the MVP and Beta phases. The schema is designed for:
- Fast local operations
- Offline-first architecture
- Full-text search with FTS5
- Conflict resolution support
- Easy migration to PostgreSQL (V1.0+)

## Database Configuration

```sql
PRAGMA journal_mode = WAL;      -- Better concurrent access
PRAGMA synchronous = NORMAL;    -- Balance safety and performance
PRAGMA foreign_keys = ON;       -- Enforce referential integrity
```

## Schema Version

Current version: **1** (MVP Schema)

Schema version is tracked in the `schema_version` table for migration management.

## Tables

### tasks

Main table storing all tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | UUID v4 |
| `title` | TEXT NOT NULL | Task title |
| `notes` | TEXT | Optional task notes/description |
| `due_date` | TEXT | ISO 8601 date (YYYY-MM-DD) |
| `due_time` | TEXT | ISO 8601 time (HH:MM:SS) |
| `priority` | INTEGER | 0=none, 1=low, 2=medium, 3=high |
| `completed` | BOOLEAN | Completion status (0/1) |
| `completed_at` | TEXT | ISO 8601 timestamp when completed |
| `created_at` | TEXT | ISO 8601 timestamp (auto-generated) |
| `modified_at` | TEXT | ISO 8601 timestamp (updated on change) |
| `device_id` | TEXT | Device that last modified this task |
| `version` | INTEGER | Version number for conflict resolution |

**Indexes:**
- `idx_tasks_completed` on `completed`
- `idx_tasks_due_date` on `due_date`
- `idx_tasks_priority` on `priority`
- `idx_tasks_modified_at` on `modified_at`
- `idx_tasks_completed_due` on `(completed, due_date)`

**Constraints:**
- `CHECK (priority BETWEEN 0 AND 3)`
- `CHECK (completed IN (0, 1))`

### tags

Tag definitions for categorizing tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | UUID v4 |
| `name` | TEXT NOT NULL UNIQUE | Tag name (unique) |
| `color` | TEXT | Hex color code (e.g., #FF5733) |
| `created_at` | TEXT | ISO 8601 timestamp (auto-generated) |

### task_tags

Many-to-many junction table linking tasks to tags.

| Column | Type | Description |
|--------|------|-------------|
| `task_id` | TEXT | Foreign key to tasks.id |
| `tag_id` | TEXT | Foreign key to tags.id |
| `created_at` | TEXT | ISO 8601 timestamp |

**Primary Key:** `(task_id, tag_id)`

**Foreign Keys:**
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE
- `tag_id` REFERENCES `tags(id)` ON DELETE CASCADE

**Indexes:**
- `idx_task_tags_task_id` on `task_id`
- `idx_task_tags_tag_id` on `tag_id`

### sync_metadata

Metadata for sync operations and conflict resolution.

| Column | Type | Description |
|--------|------|-------------|
| `task_id` | TEXT PRIMARY KEY | Foreign key to tasks.id |
| `last_synced_at` | TEXT | Last successful sync timestamp |
| `sync_version` | INTEGER | Sync version counter |

**Foreign Keys:**
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE

### schema_version

Tracks applied database migrations.

| Column | Type | Description |
|--------|------|-------------|
| `version` | INTEGER PRIMARY KEY | Schema version number |
| `applied_at` | TEXT | Timestamp when migration was applied |
| `description` | TEXT | Migration description |

## Full-Text Search

### tasks_fts

FTS5 virtual table for fast full-text search on tasks.

**Columns:**
- `title` - Task title
- `notes` - Task notes

**Configuration:**
- `content=tasks` - Linked to tasks table
- `content_rowid=rowid` - Uses tasks.rowid
- `tokenize='porter unicode61'` - Porter stemming + Unicode support

**Triggers:**
- `tasks_fts_insert` - Auto-populate on task insert
- `tasks_fts_update` - Auto-update on task update
- `tasks_fts_delete` - Auto-delete on task delete

**Search Example:**
```sql
SELECT * FROM tasks WHERE rowid IN (
    SELECT rowid FROM tasks_fts WHERE tasks_fts MATCH 'grocery milk'
);
```

## Views

### tasks_with_tags

Convenient view joining tasks with their tags.

**Columns:**
- All columns from `tasks` table
- `tags` - Comma-separated tag names
- `tag_colors` - Comma-separated tag colors

**Example:**
```sql
SELECT * FROM tasks_with_tags WHERE completed = 0;
```

## Data Models

### Task Model

Python dataclass representing a task:

```python
@dataclass
class Task:
    id: str  # UUID v4
    title: str
    notes: Optional[str]
    due_date: Optional[str]  # YYYY-MM-DD
    due_time: Optional[str]  # HH:MM:SS
    priority: int  # 0-3
    completed: bool
    completed_at: Optional[str]
    created_at: str
    modified_at: str
    device_id: str
    version: int
    tags: list[str]  # Tag names
```

### Tag Model

Python dataclass representing a tag:

```python
@dataclass
class Tag:
    id: str  # UUID v4
    name: str
    color: Optional[str]  # Hex color
    created_at: str
```

## Repository API

### TaskRepository

```python
# Create
task = await task_repo.create(Task(title="Buy milk"))

# Get by ID
task = await task_repo.get("task-uuid")

# List with filters
tasks = await task_repo.list(completed=False, tag="grocery", limit=50)

# Update
task.title = "Buy milk and eggs"
await task_repo.update(task)

# Delete
await task_repo.delete("task-uuid")

# Search
results = await task_repo.search("grocery milk", limit=50)
```

### TagRepository

```python
# Create
tag = await tag_repo.create(Tag(name="grocery", color="#FF5733"))

# Get by ID or name
tag = await tag_repo.get("tag-uuid")
tag = await tag_repo.get_by_name("grocery")

# List all
tags = await tag_repo.list()

# Delete
await tag_repo.delete("tag-uuid")
```

## Conflict Resolution

The schema supports hybrid conflict resolution (LWW + custom rules):

**Fields used for conflict resolution:**
- `modified_at` - Last-Write-Wins timestamp
- `version` - Version counter (increments on update)
- `device_id` - Device that made the change

**Resolution rules (MVP):**
1. **Completion status:** Completed wins over not completed
2. **Tags:** Union of tags from both versions
3. **Other fields:** Last-Write-Wins based on `modified_at`

**Beta upgrade:** Vector clocks will be added to `sync_metadata` table.

## Migrations

### Migration System

The migration system supports versioned schema changes:

```python
# Define migration
async def migrate_v2_add_boards(conn: aiosqlite.Connection):
    await conn.execute("""
        CREATE TABLE boards (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            ...
        )
    """)

# Register migration
migration = Migration(
    version=2,
    description="Add boards table for shared boards",
    upgrade=migrate_v2_add_boards
)

# Apply migration
manager = MigrationManager(db.conn)
manager.register(migration)
await manager.migrate_to_latest()
```

### Planned Migrations

**Version 2 (Beta):** Add boards table for shared boards feature
**Version 3 (Beta):** Add vector clocks to sync_metadata
**Version 4 (V1.0):** Add users and permissions tables
**Version 5 (V1.0):** Add activity_log table for audit trail

## Performance Characteristics

### Query Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Task CRUD | <10ms | Single task operations |
| List tasks (100) | <50ms | With filters and tags |
| Full-text search | <200ms | On 1,000 tasks, p95 |
| Tag operations | <10ms | List all tags |
| Database init | <100ms | Cold start |

### Scaling Considerations

**MVP/Beta (SQLite):**
- Tested up to 10,000 tasks
- Single-user and small family usage
- WAL mode supports concurrent reads

**V1.0+ (Optional PostgreSQL):**
- Supports 100,000+ tasks
- LISTEN/NOTIFY for real-time sync
- Better concurrent write performance
- Horizontal scaling with read replicas

## Database File Location

**Home Assistant:**
```
<config_dir>/.storage/haboard.db
<config_dir>/.storage/haboard.db-wal  # WAL file
<config_dir>/.storage/haboard.db-shm  # Shared memory file
```

**Backup Recommendations:**
- Backup all three files together
- Or use `PRAGMA wal_checkpoint(FULL)` before backup
- Automated backups included in HA snapshots

## Testing

### Schema Tests

```python
# Test database initialization
db = Database(Path("/tmp/test.db"))
await db.connect()
assert await db.get_current_version() == 1

# Test task CRUD
repo = TaskRepository(db.conn)
task = await repo.create(Task(title="Test"))
assert task.id is not None

# Test FTS search
results = await repo.search("test")
assert len(results) == 1
```

### Performance Tests

```bash
# Run performance benchmarks
pytest tests/test_database_performance.py -v

# Benchmark FTS search
pytest tests/test_fts_performance.py --benchmark
```

## Migration from Other Systems

### Todoist Import

```python
# Example: Import from Todoist JSON export
async def import_from_todoist(json_data: dict):
    for item in json_data['items']:
        task = Task(
            title=item['content'],
            notes=item.get('description'),
            due_date=item.get('due', {}).get('date'),
            priority=4 - item['priority'],  # Todoist uses 1-4
            completed=item['checked'],
        )
        await repo.create(task)
```

## See Also

- [Technology Strategy](02-technology-strategy.md) - Architecture overview
- [Phased Implementation Plan](04-phased-implementation-plan.md) - Development roadmap
- [CI/CD Pipeline](ci-cd-pipeline.md) - Testing and deployment
