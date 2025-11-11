"""Tests for database module."""
import pytest
from pathlib import Path
import tempfile

from custom_components.haboard.database import Database, get_database


@pytest.mark.asyncio
async def test_database_connect():
    """Test database connection."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = Path(tmp.name)

    db = Database(db_path)
    await db.connect()

    assert db._conn is not None
    assert db.conn is not None

    await db.disconnect()
    db_path.unlink()


@pytest.mark.asyncio
async def test_database_schema_initialization(db):
    """Test that schema is initialized correctly."""
    # Check that schema_version table exists
    cursor = await db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
    )
    row = await cursor.fetchone()
    assert row is not None

    # Check current version
    cursor = await db.execute("SELECT MAX(version) as version FROM schema_version")
    row = await cursor.fetchone()
    assert row["version"] == 1


@pytest.mark.asyncio
async def test_database_wal_mode(db):
    """Test that WAL mode is enabled."""
    cursor = await db.execute("PRAGMA journal_mode")
    row = await cursor.fetchone()
    assert row[0].lower() == "wal"


@pytest.mark.asyncio
async def test_database_foreign_keys(db):
    """Test that foreign keys are enabled."""
    cursor = await db.execute("PRAGMA foreign_keys")
    row = await cursor.fetchone()
    assert row[0] == 1


@pytest.mark.asyncio
async def test_get_database():
    """Test get_database factory function."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        config_dir = Path(tmp_dir)
        db = await get_database(config_dir)

        assert db._conn is not None
        assert (config_dir / ".storage" / "haboard.db").exists()

        await db.disconnect()
