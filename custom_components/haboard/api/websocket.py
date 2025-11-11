"""WebSocket support for real-time task synchronization."""
from __future__ import annotations

import logging
from typing import Any, Callable
import asyncio

from homeassistant.core import HomeAssistant, callback
from homeassistant.components import websocket_api
import voluptuous as vol

from ..const import DOMAIN
from ..database.repository import TaskRepository

_LOGGER = logging.getLogger(__name__)

# WebSocket command types
WS_TYPE_SUBSCRIBE = "haboard/subscribe"
WS_TYPE_UNSUBSCRIBE = "haboard/unsubscribe"
WS_TYPE_TASK_CREATED = "haboard/task_created"
WS_TYPE_TASK_UPDATED = "haboard/task_updated"
WS_TYPE_TASK_DELETED = "haboard/task_deleted"
WS_TYPE_PING = "haboard/ping"
WS_TYPE_PONG = "haboard/pong"


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_SUBSCRIBE,
        vol.Optional("device_id"): str,
    }
)
@websocket_api.async_response
async def websocket_subscribe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Subscribe to task updates.

    Args:
        hass: Home Assistant instance
        connection: WebSocket connection
        msg: Subscribe message with optional device_id
    """
    device_id = msg.get("device_id", connection.id)

    _LOGGER.debug("WebSocket client %s subscribed (device: %s)", connection.id, device_id)

    # Store subscription in connection context
    if "haboard_subscriptions" not in connection.subscriptions:
        connection.subscriptions["haboard_subscriptions"] = set()

    connection.subscriptions["haboard_subscriptions"].add(device_id)

    # Send success response
    connection.send_result(msg["id"], {"subscribed": True, "device_id": device_id})

    # TODO: Send initial sync data (all tasks modified since last sync)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_UNSUBSCRIBE,
    }
)
@websocket_api.async_response
async def websocket_unsubscribe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Unsubscribe from task updates.

    Args:
        hass: Home Assistant instance
        connection: WebSocket connection
        msg: Unsubscribe message
    """
    _LOGGER.debug("WebSocket client %s unsubscribed", connection.id)

    # Clear subscriptions
    if "haboard_subscriptions" in connection.subscriptions:
        connection.subscriptions.pop("haboard_subscriptions")

    connection.send_result(msg["id"], {"subscribed": False})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_PING,
    }
)
@websocket_api.async_response
async def websocket_ping(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle ping message.

    Args:
        hass: Home Assistant instance
        connection: WebSocket connection
        msg: Ping message
    """
    # Send pong response
    connection.send_message(
        websocket_api.event_message(msg["id"], {"type": WS_TYPE_PONG})
    )


class WebSocketManager:
    """Manages WebSocket connections for real-time sync."""

    def __init__(self, hass: HomeAssistant):
        """Initialize WebSocket manager.

        Args:
            hass: Home Assistant instance
        """
        self.hass = hass
        self._connections: set[websocket_api.ActiveConnection] = set()

    def register_connection(self, connection: websocket_api.ActiveConnection) -> None:
        """Register a WebSocket connection.

        Args:
            connection: WebSocket connection
        """
        self._connections.add(connection)
        _LOGGER.debug("Registered WebSocket connection: %s", connection.id)

    def unregister_connection(
        self, connection: websocket_api.ActiveConnection
    ) -> None:
        """Unregister a WebSocket connection.

        Args:
            connection: WebSocket connection
        """
        self._connections.discard(connection)
        _LOGGER.debug("Unregistered WebSocket connection: %s", connection.id)

    @callback
    def broadcast_task_created(self, task_dict: dict[str, Any]) -> None:
        """Broadcast task created event to all subscribed clients.

        Args:
            task_dict: Task data as dictionary
        """
        self._broadcast_event(WS_TYPE_TASK_CREATED, {"task": task_dict})

    @callback
    def broadcast_task_updated(self, task_dict: dict[str, Any]) -> None:
        """Broadcast task updated event to all subscribed clients.

        Args:
            task_dict: Task data as dictionary
        """
        self._broadcast_event(WS_TYPE_TASK_UPDATED, {"task": task_dict})

    @callback
    def broadcast_task_deleted(self, task_id: str) -> None:
        """Broadcast task deleted event to all subscribed clients.

        Args:
            task_id: ID of deleted task
        """
        self._broadcast_event(WS_TYPE_TASK_DELETED, {"task_id": task_id})

    def _broadcast_event(self, event_type: str, data: dict[str, Any]) -> None:
        """Broadcast an event to all subscribed connections.

        Args:
            event_type: Type of event
            data: Event data
        """
        message = {"type": event_type, **data}

        for connection in self._connections:
            # Check if connection is subscribed
            if "haboard_subscriptions" in connection.subscriptions:
                try:
                    connection.send_message(
                        websocket_api.event_message(connection.id, message)
                    )
                except Exception as err:
                    _LOGGER.error(
                        "Error sending WebSocket message to %s: %s",
                        connection.id,
                        err,
                    )


def setup_websocket(hass: HomeAssistant) -> WebSocketManager:
    """Set up WebSocket support for HABoard.

    Args:
        hass: Home Assistant instance

    Returns:
        WebSocketManager instance
    """
    # Register WebSocket commands
    hass.components.websocket_api.async_register_command(websocket_subscribe)
    hass.components.websocket_api.async_register_command(websocket_unsubscribe)
    hass.components.websocket_api.async_register_command(websocket_ping)

    # Create and return WebSocket manager
    ws_manager = WebSocketManager(hass)

    _LOGGER.info("HABoard WebSocket support initialized")

    return ws_manager
