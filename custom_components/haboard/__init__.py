"""HABoard - Home Assistant To-Do App Integration."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

DOMAIN = "haboard"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HABoard from a config entry."""
    # TODO: Week 3-4: Initialize database, API, WebSocket
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload HABoard config entry."""
    # TODO: Week 3-4: Cleanup resources
    return True
