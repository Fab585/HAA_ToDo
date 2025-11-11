#!/usr/bin/with-contenv bashio
# HABoard Local Add-on Installation Script

set -e

bashio::log.info "Installing HABoard v0.1.0..."

# Create directories
mkdir -p /config/custom_components
mkdir -p /config/www

# Backup existing installation if present
if [ -d "/config/custom_components/haboard" ]; then
    BACKUP_DIR="/config/custom_components/haboard.backup.$(date +%Y%m%d_%H%M%S)"
    bashio::log.warning "Backing up existing installation to: ${BACKUP_DIR}"
    mv /config/custom_components/haboard "${BACKUP_DIR}"
fi

# Install integration
bashio::log.info "Installing HABoard integration..."
cp -r /data/haboard /config/custom_components/

# Install frontend
bashio::log.info "Installing HABoard frontend..."
rm -rf /config/www/haboard
cp -r /data/www /config/www/haboard

# Verify installation
if [ -f "/config/custom_components/haboard/__init__.py" ] && [ -f "/config/www/haboard/index.html" ]; then
    bashio::log.info "✓ HABoard installed successfully!"
    bashio::log.info ""
    bashio::log.info "Next steps:"
    bashio::log.info "1. Restart Home Assistant"
    bashio::log.info "2. Go to Settings → Devices & Services"
    bashio::log.info "3. Click '+ Add Integration'"
    bashio::log.info "4. Search for 'HABoard'"
    bashio::log.info "5. Access at: http://your-ha-ip:8123/local/haboard/"
    bashio::log.info ""
    bashio::log.info "Installation complete!"
else
    bashio::log.error "Installation failed - files not found"
    exit 1
fi

# Exit successfully
exit 0
