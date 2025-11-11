"""REST API views for HABoard."""
from __future__ import annotations

import logging
from typing import Any

from aiohttp import web
import voluptuous as vol

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from ..const import DOMAIN
from ..database.repository import TaskRepository, TagRepository
from ..database.models import Task, Tag

_LOGGER = logging.getLogger(__name__)


class HABoardAPIView(HomeAssistantView):
    """Base view for HABoard API."""

    requires_auth = True

    def _get_repos(self, request: web.Request) -> tuple[TaskRepository, TagRepository]:
        """Get repositories from hass data.

        Args:
            request: HTTP request

        Returns:
            Tuple of (TaskRepository, TagRepository)
        """
        hass: HomeAssistant = request.app["hass"]
        # Get first config entry (we only support one instance for MVP)
        entry_id = next(iter(hass.data[DOMAIN].keys()))
        data = hass.data[DOMAIN][entry_id]
        return data["task_repo"], data["tag_repo"]


class TaskListView(HABoardAPIView):
    """View to list and create tasks."""

    url = "/api/haboard/tasks"
    name = "api:haboard:tasks"

    async def get(self, request: web.Request) -> web.Response:
        """List tasks with optional filters.

        Query parameters:
            completed: Filter by completion status (true/false)
            tag: Filter by tag name
            limit: Maximum number of results (default: 100)
            offset: Offset for pagination (default: 0)
        """
        task_repo, _ = self._get_repos(request)

        # Parse query parameters
        completed = request.query.get("completed")
        if completed:
            completed = completed.lower() == "true"
        else:
            completed = None

        tag = request.query.get("tag")
        limit = int(request.query.get("limit", 100))
        offset = int(request.query.get("offset", 0))

        # Get tasks
        tasks = await task_repo.list(
            completed=completed, tag=tag, limit=limit, offset=offset
        )

        return self.json([task.to_dict() for task in tasks])

    async def post(self, request: web.Request) -> web.Response:
        """Create a new task.

        Body:
            {
                "title": "Task title" (required),
                "notes": "Task notes" (optional),
                "due_date": "2024-12-31" (optional, ISO 8601),
                "due_time": "14:30:00" (optional, ISO 8601),
                "priority": 0-3 (optional, default: 0),
                "tags": ["tag1", "tag2"] (optional)
            }
        """
        task_repo, _ = self._get_repos(request)
        hass: HomeAssistant = request.app["hass"]

        # Parse and validate request body
        try:
            data = await request.json()
        except ValueError:
            return self.json_message("Invalid JSON", status_code=400)

        # Validate required fields
        if "title" not in data or not data["title"]:
            return self.json_message("Title is required", status_code=400)

        # Create task
        task = Task(
            title=data["title"],
            notes=data.get("notes"),
            due_date=data.get("due_date"),
            due_time=data.get("due_time"),
            priority=data.get("priority", 0),
            tags=data.get("tags", []),
            device_id="web_api",  # TODO: Get actual device ID from request
        )

        created_task = await task_repo.create(task)

        # TODO: Broadcast task created event via WebSocket

        return self.json(created_task.to_dict(), status_code=201)


class TaskDetailView(HABoardAPIView):
    """View for single task operations."""

    url = "/api/haboard/tasks/{task_id}"
    name = "api:haboard:tasks:detail"

    async def get(self, request: web.Request, task_id: str) -> web.Response:
        """Get a single task by ID."""
        task_repo, _ = self._get_repos(request)

        task = await task_repo.get(task_id)
        if not task:
            return self.json_message("Task not found", status_code=404)

        return self.json(task.to_dict())

    async def put(self, request: web.Request, task_id: str) -> web.Response:
        """Update a task.

        Body: Same as POST /api/haboard/tasks
        """
        task_repo, _ = self._get_repos(request)

        # Get existing task
        task = await task_repo.get(task_id)
        if not task:
            return self.json_message("Task not found", status_code=404)

        # Parse request body
        try:
            data = await request.json()
        except ValueError:
            return self.json_message("Invalid JSON", status_code=400)

        # Update task fields
        if "title" in data:
            task.title = data["title"]
        if "notes" in data:
            task.notes = data["notes"]
        if "due_date" in data:
            task.due_date = data["due_date"]
        if "due_time" in data:
            task.due_time = data["due_time"]
        if "priority" in data:
            task.priority = data["priority"]
        if "completed" in data:
            task.completed = data["completed"]
            if task.completed and not task.completed_at:
                from datetime import datetime

                task.completed_at = datetime.utcnow().isoformat()
        if "tags" in data:
            task.tags = data["tags"]

        task.device_id = "web_api"  # TODO: Get actual device ID

        # Save updated task
        updated_task = await task_repo.update(task)

        # TODO: Broadcast task updated event via WebSocket

        return self.json(updated_task.to_dict())

    async def delete(self, request: web.Request, task_id: str) -> web.Response:
        """Delete a task."""
        task_repo, _ = self._get_repos(request)

        deleted = await task_repo.delete(task_id)
        if not deleted:
            return self.json_message("Task not found", status_code=404)

        # TODO: Broadcast task deleted event via WebSocket

        return self.json_message("Task deleted", status_code=200)


class TaskCompleteView(HABoardAPIView):
    """View to complete/uncomplete a task."""

    url = "/api/haboard/tasks/{task_id}/complete"
    name = "api:haboard:tasks:complete"

    async def post(self, request: web.Request, task_id: str) -> web.Response:
        """Complete or uncomplete a task.

        Body:
            {
                "completed": true/false
            }
        """
        task_repo, _ = self._get_repos(request)

        # Get existing task
        task = await task_repo.get(task_id)
        if not task:
            return self.json_message("Task not found", status_code=404)

        # Parse request body
        try:
            data = await request.json()
        except ValueError:
            return self.json_message("Invalid JSON", status_code=400)

        completed = data.get("completed", True)

        # Update completion status
        task.completed = completed
        if completed:
            from datetime import datetime

            task.completed_at = datetime.utcnow().isoformat()
        else:
            task.completed_at = None

        task.device_id = "web_api"  # TODO: Get actual device ID

        updated_task = await task_repo.update(task)

        # TODO: Broadcast task updated event via WebSocket

        return self.json(updated_task.to_dict())


class TaskSearchView(HABoardAPIView):
    """View for full-text search."""

    url = "/api/haboard/tasks/search"
    name = "api:haboard:tasks:search"

    async def post(self, request: web.Request) -> web.Response:
        """Search tasks using full-text search.

        Body:
            {
                "query": "search terms",
                "limit": 50 (optional)
            }
        """
        task_repo, _ = self._get_repos(request)

        # Parse request body
        try:
            data = await request.json()
        except ValueError:
            return self.json_message("Invalid JSON", status_code=400)

        query = data.get("query", "")
        if not query:
            return self.json_message("Query is required", status_code=400)

        limit = data.get("limit", 50)

        # Search tasks
        tasks = await task_repo.search(query, limit=limit)

        return self.json([task.to_dict() for task in tasks])


class TagListView(HABoardAPIView):
    """View to list and create tags."""

    url = "/api/haboard/tags"
    name = "api:haboard:tags"

    async def get(self, request: web.Request) -> web.Response:
        """List all tags."""
        _, tag_repo = self._get_repos(request)

        tags = await tag_repo.list()

        return self.json([tag.to_dict() for tag in tags])

    async def post(self, request: web.Request) -> web.Response:
        """Create a new tag.

        Body:
            {
                "name": "Tag name" (required),
                "color": "#FF5733" (optional)
            }
        """
        _, tag_repo = self._get_repos(request)

        # Parse request body
        try:
            data = await request.json()
        except ValueError:
            return self.json_message("Invalid JSON", status_code=400)

        if "name" not in data or not data["name"]:
            return self.json_message("Name is required", status_code=400)

        # Check if tag already exists
        existing_tag = await tag_repo.get_by_name(data["name"])
        if existing_tag:
            return self.json_message("Tag already exists", status_code=409)

        # Create tag
        tag = Tag(name=data["name"], color=data.get("color"))

        created_tag = await tag_repo.create(tag)

        return self.json(created_tag.to_dict(), status_code=201)


def setup_api(hass: HomeAssistant) -> None:
    """Set up HABoard API views.

    Args:
        hass: Home Assistant instance
    """
    hass.http.register_view(TaskListView)
    hass.http.register_view(TaskDetailView)
    hass.http.register_view(TaskCompleteView)
    hass.http.register_view(TaskSearchView)
    hass.http.register_view(TagListView)

    _LOGGER.info("HABoard API views registered")
