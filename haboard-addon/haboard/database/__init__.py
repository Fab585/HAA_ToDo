"""Database initialization and management for HABoard."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import aiosqlite

_LOGGER = logging.getLogger(__name__)

# Database file location (will be in HA config/.storage/)
DB_NAME = "haboard.db"


class Database:
    """HABoard database manager."""

    def __init__(self, db_path: Path):
        """Initialize database manager.

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self._conn: Optional[aiosqlite.Connection] = None

    async def connect(self) -> None:
        """Connect to database and initialize schema if needed."""
        _LOGGER.debug("Connecting to database at %s", self.db_path)

        # Create parent directory if it doesn't exist
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

        # Connect to database
        self._conn = await aiosqlite.connect(str(self.db_path))
        self._conn.row_factory = aiosqlite.Row

        # Enable foreign keys and WAL mode
        await self._conn.execute("PRAGMA foreign_keys = ON")
        await self._conn.execute("PRAGMA journal_mode = WAL")
        await self._conn.execute("PRAGMA synchronous = NORMAL")

        # Initialize schema if database is new
        await self._initialize_schema()

        _LOGGER.info("Database connected and initialized")

    async def disconnect(self) -> None:
        """Close database connection."""
        if self._conn:
            await self._conn.close()
            self._conn = None
            _LOGGER.debug("Database disconnected")

    async def _initialize_schema(self) -> None:
        """Initialize database schema if not already created."""
        # Check if schema_version table exists
        cursor = await self._conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
        )
        table_exists = await cursor.fetchone()

        if not table_exists:
            _LOGGER.info("Initializing database schema...")
            await self._create_schema()
        else:
            # Check current schema version
            cursor = await self._conn.execute(
                "SELECT MAX(version) as version FROM schema_version"
            )
            row = await cursor.fetchone()
            current_version = row["version"] if row else 0
            _LOGGER.debug("Current schema version: %d", current_version)

            # TODO: Run migrations if needed (Week 0 Day 4)

    async def _create_schema(self) -> None:
        """Create database schema from schema.sql file."""
        schema_file = Path(__file__).parent / "schema.sql"

        # Read schema file (Path.read_text() is acceptable for small files during setup)
        schema_sql = schema_file.read_text()

        # Execute schema in a transaction
        await self._conn.executescript(schema_sql)
        await self._conn.commit()

        _LOGGER.info("Database schema created successfully")

    @property
    def conn(self) -> aiosqlite.Connection:
        """Get database connection.

        Returns:
            Active database connection

        Raises:
            RuntimeError: If not connected to database
        """
        if not self._conn:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._conn

    async def execute(self, sql: str, parameters: tuple = ()) -> aiosqlite.Cursor:
        """Execute a SQL statement.

        Args:
            sql: SQL statement to execute
            parameters: Parameters for SQL statement

        Returns:
            Database cursor
        """
        return await self.conn.execute(sql, parameters)

    async def executemany(
        self, sql: str, parameters: list[tuple]
    ) -> aiosqlite.Cursor:
        """Execute a SQL statement with multiple parameter sets.

        Args:
            sql: SQL statement to execute
            parameters: List of parameter tuples

        Returns:
            Database cursor
        """
        return await self.conn.executemany(sql, parameters)

    async def commit(self) -> None:
        """Commit current transaction."""
        await self.conn.commit()

    async def rollback(self) -> None:
        """Rollback current transaction."""
        await self.conn.rollback()


async def get_database(config_dir: Path) -> Database:
    """Get database instance.

    Args:
        config_dir: Home Assistant config directory

    Returns:
        Connected database instance
    """
    db_path = config_dir / ".storage" / DB_NAME
    db = Database(db_path)
    await db.connect()
    return db
