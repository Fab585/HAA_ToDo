"""HABoard - Home Assistant To-Do App Integration."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from .const import DOMAIN
from .database import get_database, Database
from .database.repository import TaskRepository, TagRepository
from .database.models import Task, Tag

_LOGGER = logging.getLogger(__name__)

# Service schemas
SERVICE_CREATE_TASK_SCHEMA = vol.Schema({
    vol.Required("title"): cv.string,
    vol.Optional("notes"): cv.string,
    vol.Optional("due_date"): cv.string,
    vol.Optional("priority", default=0): vol.All(vol.Coerce(int), vol.Range(min=0, max=3)),
    vol.Optional("tags"): vol.All(cv.ensure_list, [cv.string]),
})


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HABoard from a config entry."""
    _LOGGER.info("Setting up HABoard integration")

    # Initialize database
    config_dir = Path(hass.config.path())
    db = await get_database(config_dir)

    # Store database in hass.data
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "db": db,
        "task_repo": TaskRepository(db.conn),
        "tag_repo": TagRepository(db.conn),
    }

    # Register services
    await _register_services(hass, entry)

    _LOGGER.info("HABoard integration setup complete")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload HABoard config entry."""
    _LOGGER.info("Unloading HABoard integration")

    # Disconnect database
    data = hass.data[DOMAIN].pop(entry.entry_id)
    db: Database = data["db"]
    await db.disconnect()

    _LOGGER.info("HABoard integration unloaded")
    return True


async def _register_services(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Register HABoard services.

    Args:
        hass: Home Assistant instance
        entry: Config entry
    """

    async def handle_create_task(call: ServiceCall) -> None:
        """Handle create_task service call.

        Args:
            call: Service call with task data
        """
        data = hass.data[DOMAIN][entry.entry_id]
        task_repo: TaskRepository = data["task_repo"]

        # Create task from service data
        task = Task(
            title=call.data["title"],
            notes=call.data.get("notes"),
            due_date=call.data.get("due_date"),
            priority=call.data.get("priority", 0),
            tags=call.data.get("tags", []),
            device_id="homeassistant",  # TODO: Get actual device ID
        )

        # Save to database
        created_task = await task_repo.create(task)

        _LOGGER.debug("Created task via service: %s", created_task.id)

        # TODO: Week 3-4: Broadcast task created event via WebSocket

    # Register services
    hass.services.async_register(
        DOMAIN,
        "create_task",
        handle_create_task,
        schema=SERVICE_CREATE_TASK_SCHEMA,
    )

    _LOGGER.debug("Registered HABoard services")
