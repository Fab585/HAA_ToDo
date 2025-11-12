"""Data models for HABoard."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import uuid


@dataclass
class Task:
    """Task model."""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    notes: Optional[str] = None
    due_date: Optional[str] = None  # ISO 8601 date (YYYY-MM-DD)
    due_time: Optional[str] = None  # ISO 8601 time (HH:MM:SS)
    priority: int = 0  # 0=none, 1=low, 2=medium, 3=high
    completed: bool = False
    completed_at: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    modified_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    device_id: str = ""
    version: int = 1
    tags: list[str] = field(default_factory=list)  # Tag names

    def to_dict(self) -> dict:
        """Convert to dictionary.

        Returns:
            Dictionary representation
        """
        return {
            "id": self.id,
            "title": self.title,
            "notes": self.notes,
            "due_date": self.due_date,
            "due_time": self.due_time,
            "priority": self.priority,
            "completed": self.completed,
            "completed_at": self.completed_at,
            "created_at": self.created_at,
            "modified_at": self.modified_at,
            "device_id": self.device_id,
            "version": self.version,
            "tags": self.tags,
        }

    @classmethod
    def from_dict(cls, data: dict) -> Task:
        """Create from dictionary.

        Args:
            data: Dictionary with task data

        Returns:
            Task instance
        """
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            title=data.get("title", ""),
            notes=data.get("notes"),
            due_date=data.get("due_date"),
            due_time=data.get("due_time"),
            priority=data.get("priority", 0),
            completed=data.get("completed", False),
            completed_at=data.get("completed_at"),
            created_at=data.get("created_at", datetime.utcnow().isoformat()),
            modified_at=data.get("modified_at", datetime.utcnow().isoformat()),
            device_id=data.get("device_id", ""),
            version=data.get("version", 1),
            tags=data.get("tags", []),
        )


@dataclass
class Tag:
    """Tag model."""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    color: Optional[str] = None  # Hex color code
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> dict:
        """Convert to dictionary.

        Returns:
            Dictionary representation
        """
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> Tag:
        """Create from dictionary.

        Args:
            data: Dictionary with tag data

        Returns:
            Tag instance
        """
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            name=data.get("name", ""),
            color=data.get("color"),
            created_at=data.get("created_at", datetime.utcnow().isoformat()),
        )
