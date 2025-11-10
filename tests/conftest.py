"""Pytest configuration and fixtures."""
import pytest
from pathlib import Path
import tempfile
import asyncio

from custom_components.haboard.database import Database
from custom_components.haboard.database.repository import TaskRepository, TagRepository


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db():
    """Create temporary database for testing."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = Path(tmp.name)

    database = Database(db_path)
    await database.connect()

    yield database

    await database.disconnect()
    db_path.unlink(missing_ok=True)


@pytest.fixture
async def task_repo(db):
    """Create task repository fixture."""
    return TaskRepository(db.conn)


@pytest.fixture
async def tag_repo(db):
    """Create tag repository fixture."""
    return TagRepository(db.conn)
