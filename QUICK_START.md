# 🚀 HABoard Local Add-on - Quick Start

**Installation in 3 steps: Copy → Add Repository → Install**

---

## What You're Installing

✅ **HABoard v0.1.0** - Local testing add-on
✅ **1-click installation** - No manual file copying
✅ **1-click updates** - Rebuild and restart
✅ **Safe testing** - Automatic backups

---

## Quick Install (5 Minutes)

### Step 1: Copy Folder to Home Assistant

**From Windows Explorer**:
```
Source:  \\wsl.localhost\Ubuntu\home\fabri\HAA_ToDo\haboard-addon
Destination: \\192.168.50.108\addons\haboard-addon
```

**Result**: You should have `\\192.168.50.108\addons\haboard-addon\config.json`

---

### Step 2: Add Repository in Supervisor

1. Home Assistant → **Settings → Add-ons → Add-on Store**
2. Click **⋮ menu** (top right) → **Repositories**
3. Add repository: `/addons`
4. Click **Add**

**Result**: "HABoard Local Testing Repository" appears in the list

---

### Step 3: Install & Run Add-on

1. Find **"HABoard (Local Testing)"** in Add-on Store
2. Click **INSTALL** (wait 2-3 minutes)
3. Click **START** (it will run and auto-stop)
4. Check **Log tab** - should say "Installation complete!"
5. **Restart Home Assistant**

---

### Step 4: Add Integration

1. **Settings → Devices & Services**
2. **+ Add Integration**
3. Search **"HABoard"**
4. Click **Submit**

---

### Step 5: Open HABoard

```
http://192.168.50.108:8123/local/haboard/
```

Create your first task - done! 🎉

---

## 📁 What's Where

```
/addons/haboard-addon/          ← Add-on files (you copied here)
/config/custom_components/haboard/   ← Integration (auto-installed)
/config/www/haboard/            ← Frontend (auto-installed)
/config/haboard/haboard.db      ← Database (auto-created)
```

---

## 🔄 To Update Later

1. Make code changes on dev machine
2. Update version in `haboard-addon/config.json`
3. Copy updated `haboard-addon` folder to HA
4. In Supervisor → HABoard add-on → **Rebuild**
5. **Start** add-on
6. **Restart** Home Assistant

---

## 🆘 If Something Goes Wrong

**Add-on won't install?**
- Check Supervisor logs for errors
- Verify files are in `/addons/haboard-addon/`

**Integration not found?**
```bash
# Check files exist
ls /config/custom_components/haboard/__init__.py
ls /config/www/haboard/index.html

# Restart HA fully
ha core restart
```

**Frontend 404?**
- Clear browser cache (Ctrl+Shift+R)
- Verify `/config/www/haboard/index.html` exists

---

## 📖 Full Documentation

- **Detailed guide**: `LOCAL_ADDON_INSTALL.md`
- **Manual testing**: `MANUAL_TESTING_GUIDE.md`
- **User guide**: (will be at `/local/haboard/` after install)

---

**Ready? Start with Step 1!** 🚀
