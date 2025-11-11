-- HABoard Database Schema
-- SQLite with WAL mode + FTS5 for full-text search
-- Version: 1 (MVP Schema)

-- Enable WAL mode for better concurrent access
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

-- ====================
-- CORE TABLES
-- ====================

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,  -- UUID v4
    title TEXT NOT NULL,
    notes TEXT,
    due_date TEXT,  -- ISO 8601 date (YYYY-MM-DD)
    due_time TEXT,  -- ISO 8601 time (HH:MM:SS)
    priority INTEGER DEFAULT 0,  -- 0=none, 1=low, 2=medium, 3=high
    completed BOOLEAN DEFAULT 0,
    completed_at TEXT,  -- ISO 8601 timestamp
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TEXT NOT NULL,  -- ISO 8601 timestamp, updated on every change
    device_id TEXT NOT NULL,  -- Device that last modified this task
    version INTEGER DEFAULT 1,  -- For conflict resolution (increments on update)

    -- Indexes for common queries
    CHECK (priority BETWEEN 0 AND 3),
    CHECK (completed IN (0, 1))
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,  -- UUID v4
    name TEXT NOT NULL UNIQUE,
    color TEXT,  -- Hex color code (e.g., #FF5733)
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Task-Tag junction table (many-to-many)
CREATE TABLE IF NOT EXISTS task_tags (
    task_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Sync metadata table (for conflict resolution)
CREATE TABLE IF NOT EXISTS sync_metadata (
    task_id TEXT PRIMARY KEY,
    last_synced_at TEXT NOT NULL,
    sync_version INTEGER DEFAULT 1,

    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- ====================
-- INDEXES
-- ====================

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_modified_at ON tasks(modified_at);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_due ON tasks(completed, due_date);

CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);

-- ====================
-- FULL-TEXT SEARCH (FTS5)
-- ====================

-- FTS5 virtual table for full-text search on tasks
CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
    title,
    notes,
    content=tasks,
    content_rowid=rowid,
    tokenize='porter unicode61'
);

-- Triggers to keep FTS5 in sync with tasks table
CREATE TRIGGER IF NOT EXISTS tasks_fts_insert AFTER INSERT ON tasks BEGIN
    INSERT INTO tasks_fts(rowid, title, notes)
    VALUES (new.rowid, new.title, new.notes);
END;

CREATE TRIGGER IF NOT EXISTS tasks_fts_update AFTER UPDATE ON tasks BEGIN
    UPDATE tasks_fts
    SET title = new.title, notes = new.notes
    WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS tasks_fts_delete AFTER DELETE ON tasks BEGIN
    DELETE FROM tasks_fts WHERE rowid = old.rowid;
END;

-- ====================
-- VIEWS
-- ====================

-- View for tasks with their tags (for easier querying)
CREATE VIEW IF NOT EXISTS tasks_with_tags AS
SELECT
    t.id,
    t.title,
    t.notes,
    t.due_date,
    t.due_time,
    t.priority,
    t.completed,
    t.completed_at,
    t.created_at,
    t.modified_at,
    t.device_id,
    t.version,
    GROUP_CONCAT(tag.name, ',') as tags,
    GROUP_CONCAT(tag.color, ',') as tag_colors
FROM tasks t
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags tag ON tt.tag_id = tag.id
GROUP BY t.id;

-- ====================
-- SCHEMA VERSION
-- ====================

-- Table to track schema version for migrations
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Insert initial schema version
INSERT OR IGNORE INTO schema_version (version, description)
VALUES (1, 'Initial MVP schema with tasks, tags, and FTS5 search');
