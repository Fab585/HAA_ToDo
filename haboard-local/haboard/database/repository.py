"""Repository layer for database operations."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

import aiosqlite

from .models import Task, Tag

_LOGGER = logging.getLogger(__name__)


class TaskRepository:
    """Repository for task operations."""

    def __init__(self, conn: aiosqlite.Connection):
        """Initialize repository.

        Args:
            conn: Database connection
        """
        self.conn = conn

    async def create(self, task: Task) -> Task:
        """Create a new task.

        Args:
            task: Task to create

        Returns:
            Created task
        """
        task.modified_at = datetime.utcnow().isoformat()

        await self.conn.execute(
            """
            INSERT INTO tasks (
                id, title, notes, due_date, due_time, priority,
                completed, completed_at, created_at, modified_at,
                device_id, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                task.id,
                task.title,
                task.notes,
                task.due_date,
                task.due_time,
                task.priority,
                task.completed,
                task.completed_at,
                task.created_at,
                task.modified_at,
                task.device_id,
                task.version,
            ),
        )

        # Add tags if any
        if task.tags:
            await self._add_tags_to_task(task.id, task.tags)

        await self.conn.commit()
        _LOGGER.debug("Created task: %s", task.id)
        return task

    async def get(self, task_id: str) -> Optional[Task]:
        """Get task by ID.

        Args:
            task_id: Task ID

        Returns:
            Task if found, None otherwise
        """
        cursor = await self.conn.execute(
            """
            SELECT t.*, GROUP_CONCAT(tag.name) as tags
            FROM tasks t
            LEFT JOIN task_tags tt ON t.id = tt.task_id
            LEFT JOIN tags tag ON tt.tag_id = tag.id
            WHERE t.id = ?
            GROUP BY t.id
            """,
            (task_id,),
        )
        row = await cursor.fetchone()

        if not row:
            return None

        return self._row_to_task(row)

    async def list(
        self,
        completed: Optional[bool] = None,
        tag: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Task]:
        """List tasks with optional filters.

        Args:
            completed: Filter by completion status
            tag: Filter by tag name
            limit: Maximum number of tasks
            offset: Number of tasks to skip

        Returns:
            List of tasks
        """
        query = """
            SELECT t.*, GROUP_CONCAT(tag.name) as tags
            FROM tasks t
            LEFT JOIN task_tags tt ON t.id = tt.task_id
            LEFT JOIN tags tag ON tt.tag_id = tag.id
        """

        where_clauses = []
        params = []

        if completed is not None:
            where_clauses.append("t.completed = ?")
            params.append(completed)

        if tag:
            where_clauses.append(
                "t.id IN (SELECT task_id FROM task_tags tt2 "
                "JOIN tags tag2 ON tt2.tag_id = tag2.id WHERE tag2.name = ?)"
            )
            params.append(tag)

        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        query += " GROUP BY t.id ORDER BY t.due_date ASC, t.created_at DESC"
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor = await self.conn.execute(query, params)
        rows = await cursor.fetchall()

        return [self._row_to_task(row) for row in rows]

    async def update(self, task: Task) -> Task:
        """Update an existing task.

        Args:
            task: Task to update

        Returns:
            Updated task
        """
        task.modified_at = datetime.utcnow().isoformat()
        task.version += 1

        await self.conn.execute(
            """
            UPDATE tasks SET
                title = ?, notes = ?, due_date = ?, due_time = ?,
                priority = ?, completed = ?, completed_at = ?,
                modified_at = ?, device_id = ?, version = ?
            WHERE id = ?
            """,
            (
                task.title,
                task.notes,
                task.due_date,
                task.due_time,
                task.priority,
                task.completed,
                task.completed_at,
                task.modified_at,
                task.device_id,
                task.version,
                task.id,
            ),
        )

        # Update tags (remove all and re-add)
        await self.conn.execute("DELETE FROM task_tags WHERE task_id = ?", (task.id,))
        if task.tags:
            await self._add_tags_to_task(task.id, task.tags)

        await self.conn.commit()
        _LOGGER.debug("Updated task: %s", task.id)
        return task

    async def delete(self, task_id: str) -> bool:
        """Delete a task.

        Args:
            task_id: Task ID

        Returns:
            True if deleted, False if not found
        """
        cursor = await self.conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        await self.conn.commit()

        deleted = cursor.rowcount > 0
        if deleted:
            _LOGGER.debug("Deleted task: %s", task_id)
        return deleted

    async def search(self, query: str, limit: int = 50) -> list[Task]:
        """Search tasks using full-text search.

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            List of matching tasks
        """
        cursor = await self.conn.execute(
            """
            SELECT t.*, GROUP_CONCAT(tag.name) as tags
            FROM tasks t
            LEFT JOIN task_tags tt ON t.id = tt.task_id
            LEFT JOIN tags tag ON tt.tag_id = tag.id
            WHERE t.rowid IN (
                SELECT rowid FROM tasks_fts WHERE tasks_fts MATCH ?
            )
            GROUP BY t.id
            LIMIT ?
            """,
            (query, limit),
        )
        rows = await cursor.fetchall()

        return [self._row_to_task(row) for row in rows]

    async def _add_tags_to_task(self, task_id: str, tag_names: list[str]) -> None:
        """Add tags to a task, creating tags if they don't exist.

        Args:
            task_id: Task ID
            tag_names: List of tag names
        """
        for tag_name in tag_names:
            # Get or create tag
            cursor = await self.conn.execute(
                "SELECT id FROM tags WHERE name = ?", (tag_name,)
            )
            row = await cursor.fetchone()

            if row:
                tag_id = row["id"]
            else:
                # Create new tag
                from .models import Tag

                tag = Tag(name=tag_name)
                await self.conn.execute(
                    "INSERT INTO tags (id, name) VALUES (?, ?)", (tag.id, tag.name)
                )
                tag_id = tag.id

            # Link tag to task
            await self.conn.execute(
                "INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)",
                (task_id, tag_id),
            )

    def _row_to_task(self, row: aiosqlite.Row) -> Task:
        """Convert database row to Task model.

        Args:
            row: Database row

        Returns:
            Task instance
        """
        tags = row["tags"].split(",") if row["tags"] else []
        return Task(
            id=row["id"],
            title=row["title"],
            notes=row["notes"],
            due_date=row["due_date"],
            due_time=row["due_time"],
            priority=row["priority"],
            completed=bool(row["completed"]),
            completed_at=row["completed_at"],
            created_at=row["created_at"],
            modified_at=row["modified_at"],
            device_id=row["device_id"],
            version=row["version"],
            tags=tags,
        )


class TagRepository:
    """Repository for tag operations."""

    def __init__(self, conn: aiosqlite.Connection):
        """Initialize repository.

        Args:
            conn: Database connection
        """
        self.conn = conn

    async def create(self, tag: Tag) -> Tag:
        """Create a new tag.

        Args:
            tag: Tag to create

        Returns:
            Created tag
        """
        await self.conn.execute(
            "INSERT INTO tags (id, name, color) VALUES (?, ?, ?)",
            (tag.id, tag.name, tag.color),
        )
        await self.conn.commit()
        _LOGGER.debug("Created tag: %s", tag.name)
        return tag

    async def get(self, tag_id: str) -> Optional[Tag]:
        """Get tag by ID.

        Args:
            tag_id: Tag ID

        Returns:
            Tag if found, None otherwise
        """
        cursor = await self.conn.execute(
            "SELECT * FROM tags WHERE id = ?", (tag_id,)
        )
        row = await cursor.fetchone()

        if not row:
            return None

        return self._row_to_tag(row)

    async def get_by_name(self, name: str) -> Optional[Tag]:
        """Get tag by name.

        Args:
            name: Tag name

        Returns:
            Tag if found, None otherwise
        """
        cursor = await self.conn.execute(
            "SELECT * FROM tags WHERE name = ?", (name,)
        )
        row = await cursor.fetchone()

        if not row:
            return None

        return self._row_to_tag(row)

    async def list(self) -> list[Tag]:
        """List all tags.

        Returns:
            List of tags
        """
        cursor = await self.conn.execute(
            "SELECT * FROM tags ORDER BY name ASC"
        )
        rows = await cursor.fetchall()

        return [self._row_to_tag(row) for row in rows]

    async def delete(self, tag_id: str) -> bool:
        """Delete a tag.

        Args:
            tag_id: Tag ID

        Returns:
            True if deleted, False if not found
        """
        cursor = await self.conn.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
        await self.conn.commit()

        deleted = cursor.rowcount > 0
        if deleted:
            _LOGGER.debug("Deleted tag: %s", tag_id)
        return deleted

    def _row_to_tag(self, row: aiosqlite.Row) -> Tag:
        """Convert database row to Tag model.

        Args:
            row: Database row

        Returns:
            Tag instance
        """
        return Tag(
            id=row["id"],
            name=row["name"],
            color=row["color"],
            created_at=row["created_at"],
        )
