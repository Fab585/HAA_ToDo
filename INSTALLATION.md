# HABoard Installation Guide

## Method 1: HACS Installation (Recommended)

### Prerequisites
- Home Assistant 2024.1.0 or newer
- HACS installed

### Installation Steps

1. **Add Custom Repository**
   - Open HACS in Home Assistant
   - Go to Integrations
   - Click the three dots menu (⋮) → Custom repositories
   - Add repository URL: `https://github.com/Fab585/HAA_ToDo`
   - Category: Integration
   - Click Add

2. **Install HABoard**
   - In HACS, search for "HABoard"
   - Click on HABoard
   - Click "Download"
   - Restart Home Assistant

3. **Configure Integration**
   - Go to Settings → Devices & Services
   - Click "+ Add Integration"
   - Search for "HABoard"
   - Follow the configuration steps

4. **Access the App**
   - Navigate to: `http://your-ha-instance:8123/local/haboard/`
   - Or add to your sidebar via Home Assistant UI

## Method 2: Manual Installation

### Prerequisites
- SSH access to your Home Assistant instance
- Git installed (for cloning)

### Installation Steps

```bash
# 1. Clone the repository
cd /tmp
git clone https://github.com/Fab585/HAA_ToDo.git

# 2. Copy integration files
cp -r /tmp/HAA_ToDo/custom_components/haboard /config/custom_components/

# 3. Copy frontend build
mkdir -p /config/www/haboard
cp -r /tmp/HAA_ToDo/frontend/build/* /config/www/haboard/

# 4. Set proper permissions
chown -R homeassistant:homeassistant /config/custom_components/haboard
chown -R homeassistant:homeassistant /config/www/haboard

# 5. Restart Home Assistant
# Via UI: Settings → System → Restart
# Or via CLI: ha core restart
```

## Configuration

### Basic Setup

1. After installation, go to:
   - Settings → Devices & Services → Add Integration
   - Search for "HABoard"

2. The integration will auto-configure with default settings

3. Access the web app at:
   - `http://your-ha-instance:8123/local/haboard/`

### Adding to Sidebar

1. Go to Settings → Dashboards
2. Click "Add to sidebar"
3. Configure:
   - Name: HABoard
   - Icon: `mdi:clipboard-check`
   - URL: `/local/haboard/`

### Optional: Custom URL

To use a custom domain or path:

```yaml
# configuration.yaml
http:
  cors_allowed_origins:
    - https://your-custom-domain.com
```

## Verification

### Check Installation

1. **Verify Backend:**
   ```bash
   # Check if integration is loaded
   ls -la /config/custom_components/haboard

   # Check Home Assistant logs
   grep -i "haboard" /config/home-assistant.log
   ```

2. **Verify Frontend:**
   ```bash
   # Check if files are in place
   ls -la /config/www/haboard

   # Should see:
   # - index.html
   # - service-worker.js
   # - manifest.json
   # - _app/ directory
   ```

3. **Test in Browser:**
   - Navigate to `http://your-ha-instance:8123/local/haboard/`
   - Should see the HABoard interface
   - Check browser console for errors (F12)

### Expected Behavior

✅ **On First Load:**
- App should load within 1-2 seconds
- Service worker should register
- IndexedDB should initialize
- You should see an empty task list

✅ **Creating First Task:**
- Click "+ New Task" or press `/`
- Fill in task details
- Click "Create Task"
- Task should appear immediately (offline-first)
- Check WebSocket connection in Network tab (should show "ws://..." connection)

## Troubleshooting

### Integration Not Found

**Problem:** Can't find HABoard in integrations list

**Solution:**
```bash
# Check if files are in correct location
ls -la /config/custom_components/haboard

# Should see:
# - __init__.py
# - manifest.json
# - database/
# - api/

# Restart Home Assistant
ha core restart
```

### Frontend Not Loading

**Problem:** 404 error when accessing `/local/haboard/`

**Solution:**
```bash
# Check frontend files
ls -la /config/www/haboard/index.html

# If missing, rebuild:
cd /path/to/HAA_ToDo/frontend
npm install
npm run build
cp -r build/* /config/www/haboard/

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### WebSocket Connection Failed

**Problem:** Tasks not syncing, "Offline" indicator shown

**Solution:**
1. Check Home Assistant logs:
   ```bash
   grep -i "websocket" /config/home-assistant.log
   ```

2. Verify integration is loaded:
   ```bash
   # Check integration status
   ha core info
   ```

3. Check browser console (F12) for connection errors

### Database Errors

**Problem:** "Database not found" or similar errors

**Solution:**
```bash
# Check database directory
ls -la /config/haboard/

# If missing, integration will create it on first run
# Force re-initialization:
rm -rf /config/haboard/*.db
# Restart Home Assistant
```

### Service Worker Not Registering

**Problem:** Offline mode not working, no caching

**Solution:**
1. Check service worker registration:
   - Open browser DevTools (F12)
   - Go to Application → Service Workers
   - Should see "haboard" worker active

2. If not registered:
   - Check HTTPS (service workers require HTTPS or localhost)
   - Clear browser cache
   - Hard refresh page

## Performance Tips

### Optimize for Large Task Lists

If you have 1000+ tasks:

```yaml
# configuration.yaml
haboard:
  database:
    wal_mode: true  # Already enabled by default
    cache_size: 10000  # Increase cache
```

### Enable Background Sync

For reliable offline→online sync:

1. Ensure service worker is registered
2. Check Browser → Application → Background Sync
3. Should see "haboard-sync" registered

### Monitor Performance

```bash
# Check database size
ls -lh /config/haboard/*.db

# Check query performance
# Enable debug logging:
# configuration.yaml
logger:
  logs:
    custom_components.haboard: debug
```

## Updating

### Via HACS

1. HACS → Integrations → HABoard
2. Click "Update"
3. Restart Home Assistant
4. Hard refresh browser (Ctrl+Shift+R)

### Manual Update

```bash
cd /tmp
git clone https://github.com/Fab585/HAA_ToDo.git
cp -r HAA_ToDo/custom_components/haboard /config/custom_components/
cp -r HAA_ToDo/frontend/build/* /config/www/haboard/
ha core restart
```

## Uninstalling

### Via HACS

1. HACS → Integrations → HABoard → Uninstall
2. Delete integration: Settings → Devices & Services → HABoard → Delete
3. Restart Home Assistant

### Manual Uninstall

```bash
# Remove integration
rm -rf /config/custom_components/haboard

# Remove frontend
rm -rf /config/www/haboard

# Remove database (optional - keeps your tasks)
# rm -rf /config/haboard

# Restart Home Assistant
ha core restart
```

## Support

### Getting Help

- **Issues:** https://github.com/Fab585/HAA_ToDo/issues
- **Discussions:** https://github.com/Fab585/HAA_ToDo/discussions
- **Documentation:** https://github.com/Fab585/HAA_ToDo/tree/main/docs

### Providing Debug Info

When reporting issues, include:

1. Home Assistant version
2. Browser and version
3. HABoard version (from HACS or manifest.json)
4. Relevant logs:
   ```bash
   grep -i "haboard" /config/home-assistant.log > haboard.log
   ```
5. Browser console errors (F12 → Console)

## Next Steps

After installation:
1. ✅ Create your first task
2. ✅ Try keyboard shortcuts (press `?`)
3. ✅ Test offline mode (disable network)
4. ✅ Install on mobile device as PWA
5. ✅ Customize tags with colors

Enjoy HABoard! 🎉
