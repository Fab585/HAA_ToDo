"""Config flow for HABoard integration."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN


class HABoardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for HABoard."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if user_input is not None:
            # TODO: Week 3-4: Validate database setup
            return self.async_create_entry(title="HABoard", data={})

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
        )
