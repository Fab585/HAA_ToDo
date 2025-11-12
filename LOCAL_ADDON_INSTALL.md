# HABoard Local Add-on Installation Guide

**Fast Testing & Development Workflow**

This guide explains how to install and test HABoard using a local add-on, perfect for development and quick iteration without HACS caching issues.

**Version: 0.1.2**

---

## Overview

**What you get**:
- ✅ 1-click installation
- ✅ 1-click updates when you release new versions
- ✅ No manual file copying
- ✅ Automatic backup of previous versions
- ✅ Installation logs in Supervisor

**How it works**:
1. Add this repository to Home Assistant Supervisor
2. Install the HABoard add-on
3. Add-on copies files to correct locations
4. Restart HA and use HABoard!

---

## Prerequisites

- Home Assistant OS (Supervised) with Supervisor
- Samba Share or SSH access to transfer files
- ~5 minutes for initial setup

---

## Step 1: Transfer Add-on Repository to Home Assistant

You need to get the `haboard-addon` folder onto your Home Assistant instance.

### Method A: Samba Share (Easiest)

**On Windows**:

1. Open File Explorer
2. Navigate to `\\wsl.localhost\Ubuntu\home\fabri\HAA_ToDo\haboard-addon`
3. Copy the entire `haboard-addon` folder
4. Navigate to `\\192.168.50.108\addons` (your HA Samba share)
5. Paste the folder there

You should have: `\\192.168.50.108\addons\haboard-addon\`

### Method B: SSH/Terminal (Alternative)

If you prefer terminal:

```bash
# On your development machine
cd /home/fabri/HAA_ToDo
tar -czf haboard-addon.tar.gz haboard-addon/

# Transfer to HA (replace with your method)
scp haboard-addon.tar.gz root@192.168.1.100:/tmp/

# On Home Assistant terminal
cd /addons
tar -xzf /tmp/haboard-addon.tar.gz
```

### Method C: USB Drive

1. Copy `haboard-addon` folder to USB drive
2. Plug USB into HA device
3. Use Terminal & SSH to copy from `/media/...` to `/addons/`

---

## Step 2: Add Local Repository in Supervisor

1. Open **Home Assistant**
2. Go to **Settings → Add-ons → Add-on Store**
3. Click the **⋮ menu** (top right) → **Repositories**
4. In the "Add repository" field, enter:
   ```
   /addons
   ```
5. Click **Add**

You should see: "HABoard Local Testing Repository" appear

**Note**: If you don't see it, try:
- Refresh the page (Ctrl+R)
- Check that `haboard-addon` folder is in `/addons/`
- Check Supervisor logs for errors

---

## Step 3: Install HABoard Add-on

1. In the **Add-on Store**, scroll down to find:
   **"HABoard (Local Testing)"**

2. Click on it

3. Click **INSTALL**
   - This may take 2-3 minutes
   - It's building the Docker image locally

4. Wait for "Successfully installed addon_..." message

---

## Step 4: Run the Add-on

1. Go to the **Info** tab of HABoard add-on

2. Click **START**

3. Go to the **Log** tab and watch the output

You should see:
```
[INFO] Installing HABoard v0.1.0...
[INFO] Installing HABoard integration...
[INFO] Installing HABoard frontend...
[INFO] ✓ HABoard installed successfully!
[INFO] Next steps:
[INFO] 1. Restart Home Assistant
...
```

4. The add-on will **automatically stop** after installation (this is normal!)

---

## Step 5: Restart Home Assistant

1. Go to **Settings → System**
2. Click **Restart** → **Restart Home Assistant**
3. Wait 2-3 minutes for restart

---

## Step 6: Add HABoard Integration

1. Go to **Settings → Devices & Services**
2. Click **"+ Add Integration"** (bottom right)
3. Search for **"HABoard"**
4. Click **HABoard** when it appears
5. Click **Submit** (should auto-configure)

You should see: "HABoard is now available"

---

## Step 7: Access HABoard

Open in your browser:
```
http://192.168.1.100:8123/local/haboard/
```

You should see:
- HABoard title
- "+ New Task" button
- Online indicator (green dot)
- Empty task list

**Create your first task**:
1. Click "+ New Task" or press `/`
2. Enter title: "Test Task"
3. Click "Create Task"
4. Task appears immediately!

---

## 🔄 Updating HABoard (Future)

When you make changes and want to update:

### On Development Machine:

```bash
cd /home/fabri/HAA_ToDo

# 1. Make your code changes
# 2. Build new frontend
cd frontend && npm run build && cd ..

# 3. Update version in add-on config
# Edit haboard-addon/config.json
# Change: "version": "0.1.1"

# 4. Copy new files to add-on
cp -r custom_components/haboard haboard-addon/
cp -r frontend/build haboard-addon/www

# 5. Transfer to HA (same as Step 1)
# Copy haboard-addon folder to \\192.168.1.100\addons\
```

### On Home Assistant:

1. Go to **Settings → Add-ons → HABoard (Local Testing)**
2. Click **Rebuild** (top right menu)
3. Wait for rebuild to complete
4. Click **Start**
5. Check logs to verify successful update
6. **Restart Home Assistant**

**That's it!** Much easier than manual file copying.

---

## 📋 Verification Checklist

After installation, verify everything works:

### Backend
- [ ] Integration appears in Settings → Devices & Services
- [ ] No errors in Home Assistant logs
- [ ] Database created at `/config/haboard/haboard.db`

### Frontend
- [ ] `/local/haboard/` loads successfully
- [ ] No console errors (F12 → Console)
- [ ] Service worker registers
- [ ] IndexedDB created

### Features
- [ ] Can create task
- [ ] Can complete/uncomplete task
- [ ] Can edit task
- [ ] Can delete task
- [ ] Search works
- [ ] Tags work
- [ ] Keyboard shortcuts work (press `?`)

---

## 🐛 Troubleshooting

### Repository Not Appearing

**Problem**: Don't see "HABoard Local Testing Repository" in add-on store

**Solutions**:
```bash
# Check folder exists
ls -la /addons/haboard-addon

# Should see:
# - config.json
# - Dockerfile
# - run.sh
# - DOCS.md
# - haboard/
# - www/

# Check repository.json exists
ls -la /addons/repository.json

# If missing, create it
cat > /addons/repository.json <<EOF
{
  "name": "HABoard Local Testing Repository",
  "url": "https://github.com/Fab585/HAA_ToDo",
  "maintainer": "Fab585"
}
EOF

# Restart Supervisor
ha supervisor restart
```

### Add-on Install Failed

**Problem**: "Failed to install addon" error

**Solutions**:
1. Check Supervisor logs: Settings → System → Logs → Supervisor
2. Common issues:
   - Docker build error → Check Dockerfile syntax
   - Out of disk space → Free up space
   - Architecture mismatch → Check config.json arch list

### Add-on Starts But Files Not Copied

**Problem**: Add-on logs show success, but files missing

**Solutions**:
```bash
# Check files manually
ls -la /config/custom_components/haboard
ls -la /config/www/haboard

# Check add-on logs
# Look for permission errors or path issues

# Manually run the copy (emergency)
docker exec addon_local_haboard /run.sh
```

### Integration Not Found After Restart

**Problem**: Can't find "HABoard" when adding integration

**Solutions**:
```bash
# 1. Verify integration files
ls /config/custom_components/haboard/__init__.py

# 2. Check manifest is valid
cat /config/custom_components/haboard/manifest.json

# 3. Check HA logs for loading errors
grep -i "haboard" /config/home-assistant.log

# 4. Full HA restart (not quick reload)
ha core restart
```

---

## 🎯 Advantages of This Method

**vs Manual Installation**:
- ✅ One-time setup
- ✅ Click "Update" instead of copying files
- ✅ Automatic backups
- ✅ Version tracking
- ✅ Installation logs

**vs Public HACS (for testing)**:
- ✅ Keep repository private
- ✅ Test updates before public release
- ✅ Full control over versions
- ✅ Easy rollback to previous versions

---

## 🚀 Migration Path to HACS

When ready to go public:

1. **Stop using local add-on**:
   - Uninstall the add-on (files remain in /config)
   - Remove local repository from Supervisor

2. **Make repository public** on GitHub

3. **Users install via HACS**:
   - Add custom repository in HACS
   - Install HABoard
   - Same experience as local add-on!

The integration files stay the same - you're just changing the distribution method.

---

## 📊 Quick Reference

| Action | Command/Location |
|--------|-----------------|
| **Add-on location** | `/addons/haboard-addon/` |
| **Integration location** | `/config/custom_components/haboard/` |
| **Frontend location** | `/config/www/haboard/` |
| **Database** | `/config/haboard/haboard.db` |
| **Add-on logs** | Settings → Add-ons → HABoard → Log tab |
| **HA logs** | Settings → System → Logs → Home Assistant Core |
| **Access URL** | `http://192.168.1.100:8123/local/haboard/` |

---

## ✅ Success!

Once you see HABoard running at `/local/haboard/`, you're all set!

**Next steps**:
1. Test all features thoroughly
2. Make changes to code
3. Update version number
4. Rebuild add-on
5. Test updates
6. Once happy → Go public with HACS!

---

**Questions or issues?** Check the add-on logs first - they'll show you exactly what happened during installation.

**Ready to install?** Start with Step 1 above!
