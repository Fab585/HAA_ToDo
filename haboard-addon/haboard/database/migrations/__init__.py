"""Database migration system for HABoard."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Callable, Awaitable

import aiosqlite

_LOGGER = logging.getLogger(__name__)

# Migration function type
MigrationFunc = Callable[[aiosqlite.Connection], Awaitable[None]]


class Migration:
    """Database migration."""

    def __init__(
        self,
        version: int,
        description: str,
        upgrade: MigrationFunc,
        downgrade: MigrationFunc | None = None,
    ):
        """Initialize migration.

        Args:
            version: Target schema version
            description: Migration description
            upgrade: Function to upgrade to this version
            downgrade: Optional function to downgrade from this version
        """
        self.version = version
        self.description = description
        self.upgrade = upgrade
        self.downgrade = downgrade


class MigrationManager:
    """Manages database migrations."""

    def __init__(self, conn: aiosqlite.Connection):
        """Initialize migration manager.

        Args:
            conn: Database connection
        """
        self.conn = conn
        self._migrations: list[Migration] = []

    def register(self, migration: Migration) -> None:
        """Register a migration.

        Args:
            migration: Migration to register
        """
        self._migrations.append(migration)
        self._migrations.sort(key=lambda m: m.version)

    async def get_current_version(self) -> int:
        """Get current schema version.

        Returns:
            Current schema version
        """
        cursor = await self.conn.execute(
            "SELECT MAX(version) as version FROM schema_version"
        )
        row = await cursor.fetchone()
        return row["version"] if row and row["version"] else 0

    async def migrate_to(self, target_version: int) -> None:
        """Migrate database to target version.

        Args:
            target_version: Target schema version

        Raises:
            ValueError: If target version is invalid
        """
        current_version = await self.get_current_version()

        if current_version == target_version:
            _LOGGER.info("Database already at version %d", target_version)
            return

        if target_version < current_version:
            # Downgrade
            migrations = [
                m for m in self._migrations
                if current_version >= m.version > target_version
            ]
            migrations.reverse()

            for migration in migrations:
                if not migration.downgrade:
                    raise ValueError(
                        f"Cannot downgrade: Migration {migration.version} "
                        "does not support downgrade"
                    )

                _LOGGER.info(
                    "Downgrading to version %d: %s",
                    migration.version - 1,
                    migration.description,
                )
                await migration.downgrade(self.conn)
                await self._remove_version(migration.version)

        else:
            # Upgrade
            migrations = [
                m for m in self._migrations
                if current_version < m.version <= target_version
            ]

            for migration in migrations:
                _LOGGER.info(
                    "Upgrading to version %d: %s",
                    migration.version,
                    migration.description,
                )
                await migration.upgrade(self.conn)
                await self._add_version(migration.version, migration.description)

        await self.conn.commit()
        _LOGGER.info("Migration complete. Current version: %d", target_version)

    async def migrate_to_latest(self) -> None:
        """Migrate database to latest version."""
        if not self._migrations:
            _LOGGER.info("No migrations registered")
            return

        latest_version = max(m.version for m in self._migrations)
        await self.migrate_to(latest_version)

    async def _add_version(self, version: int, description: str) -> None:
        """Add version to schema_version table.

        Args:
            version: Schema version
            description: Migration description
        """
        await self.conn.execute(
            "INSERT INTO schema_version (version, description) VALUES (?, ?)",
            (version, description),
        )

    async def _remove_version(self, version: int) -> None:
        """Remove version from schema_version table.

        Args:
            version: Schema version to remove
        """
        await self.conn.execute(
            "DELETE FROM schema_version WHERE version = ?", (version,)
        )


# Example migration (for future use)
async def migrate_v2_add_boards_table(conn: aiosqlite.Connection) -> None:
    """Add boards table for Beta phase.

    This is a placeholder for future Beta migration.
    """
    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS boards (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            modified_at TEXT NOT NULL
        )
        """
    )


# Register migrations (add more as needed)
MIGRATIONS = [
    # Migration(
    #     version=2,
    #     description="Add boards table for shared boards feature (Beta)",
    #     upgrade=migrate_v2_add_boards_table,
    # ),
]
