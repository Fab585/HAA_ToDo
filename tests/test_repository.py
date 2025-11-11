"""Tests for repository module."""
import pytest
from datetime import datetime

from custom_components.haboard.database.models import Task, Tag


@pytest.mark.asyncio
async def test_create_task(task_repo):
    """Test creating a task."""
    task = Task(
        title="Test task",
        notes="Test notes",
        priority=2,
        device_id="test_device",
    )

    created = await task_repo.create(task)

    assert created.id == task.id
    assert created.title == "Test task"
    assert created.notes == "Test notes"
    assert created.priority == 2
    assert created.version == 1


@pytest.mark.asyncio
async def test_get_task(task_repo):
    """Test getting a task by ID."""
    task = Task(title="Test task", device_id="test_device")
    await task_repo.create(task)

    retrieved = await task_repo.get(task.id)

    assert retrieved is not None
    assert retrieved.id == task.id
    assert retrieved.title == "Test task"


@pytest.mark.asyncio
async def test_get_nonexistent_task(task_repo):
    """Test getting a task that doesn't exist."""
    task = await task_repo.get("nonexistent-id")
    assert task is None


@pytest.mark.asyncio
async def test_list_tasks(task_repo):
    """Test listing tasks."""
    # Create multiple tasks
    task1 = Task(title="Task 1", device_id="test")
    task2 = Task(title="Task 2", completed=True, device_id="test")
    task3 = Task(title="Task 3", device_id="test")

    await task_repo.create(task1)
    await task_repo.create(task2)
    await task_repo.create(task3)

    # List all tasks
    all_tasks = await task_repo.list()
    assert len(all_tasks) == 3

    # List only incomplete tasks
    incomplete = await task_repo.list(completed=False)
    assert len(incomplete) == 2

    # List only completed tasks
    completed = await task_repo.list(completed=True)
    assert len(completed) == 1
    assert completed[0].title == "Task 2"


@pytest.mark.asyncio
async def test_update_task(task_repo):
    """Test updating a task."""
    task = Task(title="Original", device_id="test")
    created = await task_repo.create(task)

    # Update task
    created.title = "Updated"
    created.priority = 3
    updated = await task_repo.update(created)

    assert updated.title == "Updated"
    assert updated.priority == 3
    assert updated.version == 2  # Version incremented

    # Verify in database
    retrieved = await task_repo.get(task.id)
    assert retrieved.title == "Updated"
    assert retrieved.version == 2


@pytest.mark.asyncio
async def test_delete_task(task_repo):
    """Test deleting a task."""
    task = Task(title="To delete", device_id="test")
    await task_repo.create(task)

    # Delete task
    deleted = await task_repo.delete(task.id)
    assert deleted is True

    # Verify it's gone
    retrieved = await task_repo.get(task.id)
    assert retrieved is None


@pytest.mark.asyncio
async def test_delete_nonexistent_task(task_repo):
    """Test deleting a task that doesn't exist."""
    deleted = await task_repo.delete("nonexistent-id")
    assert deleted is False


@pytest.mark.asyncio
async def test_task_with_tags(task_repo):
    """Test creating and retrieving a task with tags."""
    task = Task(
        title="Task with tags",
        tags=["grocery", "urgent"],
        device_id="test",
    )

    created = await task_repo.create(task)
    assert len(created.tags) == 2

    # Retrieve and verify tags
    retrieved = await task_repo.get(task.id)
    assert "grocery" in retrieved.tags
    assert "urgent" in retrieved.tags


@pytest.mark.asyncio
async def test_search_tasks(task_repo):
    """Test full-text search."""
    # Create tasks
    task1 = Task(title="Buy milk", notes="From the store", device_id="test")
    task2 = Task(title="Call dentist", notes="Schedule appointment", device_id="test")
    task3 = Task(title="Buy groceries", notes="Milk, eggs, bread", device_id="test")

    await task_repo.create(task1)
    await task_repo.create(task2)
    await task_repo.create(task3)

    # Search for "milk"
    results = await task_repo.search("milk")
    assert len(results) == 2
    titles = [t.title for t in results]
    assert "Buy milk" in titles
    assert "Buy groceries" in titles


@pytest.mark.asyncio
async def test_filter_by_tag(task_repo):
    """Test filtering tasks by tag."""
    task1 = Task(title="Task 1", tags=["grocery"], device_id="test")
    task2 = Task(title="Task 2", tags=["work"], device_id="test")
    task3 = Task(title="Task 3", tags=["grocery", "urgent"], device_id="test")

    await task_repo.create(task1)
    await task_repo.create(task2)
    await task_repo.create(task3)

    # Filter by grocery tag
    grocery_tasks = await task_repo.list(tag="grocery")
    assert len(grocery_tasks) == 2

    # Filter by work tag
    work_tasks = await task_repo.list(tag="work")
    assert len(work_tasks) == 1


@pytest.mark.asyncio
async def test_create_tag(tag_repo):
    """Test creating a tag."""
    tag = Tag(name="grocery", color="#FF5733")

    created = await tag_repo.create(tag)

    assert created.id == tag.id
    assert created.name == "grocery"
    assert created.color == "#FF5733"


@pytest.mark.asyncio
async def test_get_tag_by_name(tag_repo):
    """Test getting a tag by name."""
    tag = Tag(name="work", color="#00FF00")
    await tag_repo.create(tag)

    retrieved = await tag_repo.get_by_name("work")

    assert retrieved is not None
    assert retrieved.name == "work"
    assert retrieved.color == "#00FF00"


@pytest.mark.asyncio
async def test_list_tags(tag_repo):
    """Test listing all tags."""
    tag1 = Tag(name="grocery")
    tag2 = Tag(name="work")
    tag3 = Tag(name="personal")

    await tag_repo.create(tag1)
    await tag_repo.create(tag2)
    await tag_repo.create(tag3)

    tags = await tag_repo.list()

    assert len(tags) == 3
    tag_names = [t.name for t in tags]
    assert "grocery" in tag_names
    assert "work" in tag_names
    assert "personal" in tag_names


@pytest.mark.asyncio
async def test_delete_tag(tag_repo):
    """Test deleting a tag."""
    tag = Tag(name="to_delete")
    await tag_repo.create(tag)

    deleted = await tag_repo.delete(tag.id)
    assert deleted is True

    retrieved = await tag_repo.get(tag.id)
    assert retrieved is None


@pytest.mark.asyncio
async def test_pagination(task_repo):
    """Test task pagination."""
    # Create 10 tasks
    for i in range(10):
        task = Task(title=f"Task {i}", device_id="test")
        await task_repo.create(task)

    # Get first page
    page1 = await task_repo.list(limit=5, offset=0)
    assert len(page1) == 5

    # Get second page
    page2 = await task_repo.list(limit=5, offset=5)
    assert len(page2) == 5

    # Ensure different tasks
    page1_ids = {t.id for t in page1}
    page2_ids = {t.id for t in page2}
    assert len(page1_ids.intersection(page2_ids)) == 0
