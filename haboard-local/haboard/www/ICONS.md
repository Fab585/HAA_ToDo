# PWA Icons

This directory needs the following icon files for the PWA to work properly:

## Required Icons

- **icon-192.png** - 192x192px PNG icon (for Android/Chrome)
- **icon-512.png** - 512x512px PNG icon (for Android/Chrome)
- **favicon.png** - 32x32px or 48x48px PNG favicon

## Optional Screenshots

- **screenshot-mobile.png** - 390x844px mobile screenshot
- **screenshot-desktop.png** - 1920x1080px desktop screenshot

## Source File

- **icon.svg** - Source SVG file that can be used to generate the required PNG files

## How to Generate Icons

You can use the following tools to generate PNG icons from the SVG:

### Using ImageMagick (command line)

```bash
# Generate 192x192 icon
convert icon.svg -resize 192x192 icon-192.png

# Generate 512x512 icon
convert icon.svg -resize 512x512 icon-512.png

# Generate favicon
convert icon.svg -resize 48x48 favicon.png
```

### Using Online Tools

- https://realfavicongenerator.net/ - Comprehensive favicon generator
- https://www.pwabuilder.com/ - PWA icon and manifest generator

### Using npm packages

```bash
npm install -g pwa-asset-generator
pwa-asset-generator icon.svg ./static --icon-only --background "#3b82f6"
```

## Current Status

✅ icon.svg - Created
⚠️ icon-192.png - TODO: Generate from SVG
⚠️ icon-512.png - TODO: Generate from SVG
⚠️ favicon.png - TODO: Generate from SVG
⚠️ Screenshots - TODO: Capture after MVP is complete
