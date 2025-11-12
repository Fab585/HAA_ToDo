# HABoard Local Add-on

## About

This is a local testing add-on for HABoard that automatically installs the custom integration and frontend files to your Home Assistant instance.

**Version**: 0.1.0

## Installation

This add-on installs HABoard as a custom integration. It will:

1. Copy integration files to `/config/custom_components/haboard/`
2. Copy frontend files to `/config/www/haboard/`
3. Create backups of any existing installation

## How to Use

1. **Install the add-on** from your local repository
2. **Start the add-on** (it will run once and exit)
3. **Check the logs** to verify successful installation
4. **Restart Home Assistant**
5. **Add the integration**:
   - Go to Settings → Devices & Services
   - Click "+ Add Integration"
   - Search for "HABoard"
   - Follow the setup wizard
6. **Access HABoard** at: `http://your-ha-ip:8123/local/haboard/`

## Updating

To update HABoard:

1. The developer will release a new version (e.g., 0.1.1)
2. Refresh your add-on repository in Supervisor
3. Click "Update" on the HABoard add-on
4. Start the add-on again
5. Restart Home Assistant

## Features

- ✅ Offline-first task management
- ✅ Real-time sync across devices
- ✅ 11 keyboard shortcuts
- ✅ Tag system with colors
- ✅ Dark mode
- ✅ PWA installable
- ✅ WCAG 2.1 accessible

## Support

- **Documentation**: See `/config/www/haboard/` for user guide
- **Issues**: Report via GitHub (once public)
- **Logs**: Check add-on logs for installation status

## Notes

- This is a **local testing version** for development
- For production use, the integration will be available via HACS
- The add-on only runs during installation/updates (startup: once)
- Safe to uninstall the add-on after installation (files remain in /config)
