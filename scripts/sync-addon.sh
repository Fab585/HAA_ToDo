#!/bin/bash
set -e

echo "Syncing HABoard add-on from custom_components..."

# Get version from manifest
VERSION=$(grep '"version"' custom_components/haboard/manifest.json | cut -d'"' -f4)
echo "Version: $VERSION"

# Clean old files
rm -rf haboard-local/haboard
rm -rf haboard-local/www

# Copy integration
echo "Copying integration..."
cp -r custom_components/haboard haboard-local/

# Copy frontend (from bundled www)
echo "Copying frontend..."
cp -r custom_components/haboard/www haboard-local/

# Update add-on version
echo "Updating add-on version to $VERSION..."
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" haboard-local/config.json
sed -i "s/v[0-9]\+\.[0-9]\+\.[0-9]\+/v$VERSION/g" haboard-local/run.sh

echo "✓ Add-on synced to v$VERSION"
echo ""
echo "Files ready in haboard-local/"
echo ""
echo "Next steps:"
echo "1. Git commit and push (Supervisor pulls from GitHub)"
echo "   git add -A && git commit -m 'Update' && git push"
echo ""
echo "2. In Home Assistant Supervisor:"
echo "   - Go to Add-on Store → HABoard (Local Testing)"
echo "   - Click 'Update' button (if available)"
echo "   - Or remove/re-add repository to force refresh"
echo ""
echo "3. Restart Home Assistant"
echo "   - Settings → System → Restart"
echo ""
echo "4. Add integration (if first time):"
echo "   - Settings → Devices & Services → Add Integration"
echo "   - Search 'HABoard'"
