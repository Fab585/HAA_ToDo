#!/bin/bash
set -e

echo "Syncing HABoard add-on from custom_components..."

# Get version from manifest
VERSION=$(grep '"version"' custom_components/haboard/manifest.json | cut -d'"' -f4)
echo "Version: $VERSION"

# Clean old files
rm -rf haboard-addon/haboard
rm -rf haboard-addon/www

# Copy integration
echo "Copying integration..."
cp -r custom_components/haboard haboard-addon/

# Copy frontend (from bundled www)
echo "Copying frontend..."
cp -r custom_components/haboard/www haboard-addon/

# Update add-on version
echo "Updating add-on version to $VERSION..."
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" haboard-addon/config.json
sed -i "s/v[0-9]\+\.[0-9]\+\.[0-9]\+/v$VERSION/g" haboard-addon/run.sh

echo "✓ Add-on synced to v$VERSION"
echo ""
echo "Files ready in haboard-addon/"
echo ""
echo "Next steps:"
echo "1. Transfer haboard-addon/ to HA"
echo "   Method A (if Samba mounted): cp -r haboard-addon /mnt/ha-addons/"
echo "   Method B (if SSH works): scp -r haboard-addon root@192.168.50.108:/addons/"
echo "   Method C (manual): Use File Editor or Terminal & SSH addon"
echo ""
echo "2. In Home Assistant Supervisor:"
echo "   - Go to Add-on Store"
echo "   - Find 'HABoard (Local Testing)'"
echo "   - Click 'Rebuild' (takes 2-3 minutes)"
echo "   - Click 'Start'"
echo "   - Check logs for success"
echo ""
echo "3. Restart Home Assistant"
echo "   - Settings → System → Restart"
echo ""
echo "4. Add integration (if first time):"
echo "   - Settings → Devices & Services → Add Integration"
echo "   - Search 'HABoard'"
