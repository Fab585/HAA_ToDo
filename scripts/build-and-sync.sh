#!/bin/bash
set -e

echo "Building HABoard frontend and syncing add-on..."
echo ""

# Build frontend
echo "1. Building frontend..."
cd frontend
npm run build
cd ..

echo "✓ Frontend built"
echo ""

# Copy frontend to integration
echo "2. Copying frontend to integration..."
rm -rf custom_components/haboard/www
cp -r frontend/build custom_components/haboard/www

echo "✓ Frontend copied to integration"
echo ""

# Sync add-on
echo "3. Syncing add-on..."
./scripts/sync-addon.sh
