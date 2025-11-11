# 🧪 HABoard Beta Testing Program

**Help Shape the Future of HABoard!**

We're looking for **5-10 beta testers** to try HABoard v0.1.0 and provide valuable feedback that will guide future development.

---

## 🎯 What is HABoard?

HABoard is an **offline-first task management PWA** designed specifically for Home Assistant users. It combines the power of local-first architecture with real-time synchronization for a seamless task management experience.

**Key Features**:
- Works perfectly offline
- Real-time sync when online
- Modern, responsive UI
- Full keyboard navigation
- 11 keyboard shortcuts
- WCAG 2.1 accessible

---

## 👥 Who We're Looking For

**Ideal beta testers**:
- ✅ Use Home Assistant daily
- ✅ Comfortable installing custom components (HACS or manual)
- ✅ Can dedicate 15-30 minutes for initial setup
- ✅ Willing to use HABoard for daily tasks for 2 weeks
- ✅ Can provide feedback (bugs, feature requests, UX issues)
- ✅ Have access to desktop or mobile device with modern browser

**No coding experience required!** We need feedback from actual users, not just developers.

---

## 📅 Timeline

**Duration**: 2 weeks
**Start Date**: Upon approval
**End Date**: 2 weeks after installation

**Time Commitment**:
- **Week 1**: 30-60 minutes (installation + initial testing)
- **Week 2**: 15-30 minutes (continued use + feedback form)
- **Total**: ~2 hours over 2 weeks

---

## 🧪 What You'll Test

### Week 1 Focus: Core Features
1. **Installation** - How smooth is the setup process?
2. **Task Management** - Creating, editing, completing, deleting tasks
3. **Tags** - Creating tags with colors, applying to tasks
4. **Search & Filters** - Finding tasks quickly
5. **Offline Mode** - Does it work when network drops?
6. **Sync** - Do changes sync correctly when back online?

### Week 2 Focus: Daily Use
1. **Performance** - Is it fast enough for daily use?
2. **Reliability** - Any crashes, errors, or data loss?
3. **UX** - Is it intuitive? Anything confusing?
4. **Mobile** - How's the experience on phones/tablets?
5. **Keyboard Shortcuts** - Do they help or hinder?
6. **Missing Features** - What do you wish it had?

---

## 📝 What We're Testing

### ✅ What's In (Ready to Test)
- Task CRUD operations
- Tag management with colors
- Search and filters
- Offline-first architecture
- Real-time sync
- Due dates with smart formatting
- Priority levels
- Swipe gestures (mobile)
- 11 keyboard shortcuts
- Dark mode
- PWA installation

### ❌ What's Out (Intentionally Not Included)
- NLP parsing ("tomorrow at 3pm" → manual)
- Batch operations (select multiple)
- Push notifications
- Authentication (using HA's local network)
- Calendar view
- Recurring tasks
- Subtasks

**Why exclude these?** We want to validate core functionality first before adding complexity!

---

## 🎁 What You Get

### As a Beta Tester, You'll:
1. **Shape the Product** - Your feedback directly influences v0.5 and v1.0
2. **Early Access** - Use features before general availability
3. **Direct Support** - Priority bug fixes and feature clarifications
4. **Credit** - Listed in CONTRIBUTORS.md (if you want!)
5. **Learn** - See inside a real-world SvelteKit + Home Assistant project

---

## 📋 How to Participate

### Step 1: Sign Up
**Comment on this GitHub Discussion** with:
- Your Home Assistant version
- Device(s) you'll test on (OS, browser)
- Primary use case (why you want a task manager)
- Anything specific you're excited to test

**[→ Sign Up Here](https://github.com/Fab585/HAA_ToDo/discussions/new?category=beta-testing)**

### Step 2: Install HABoard
Once approved, you'll receive:
- Installation instructions
- Access to beta testing Discord/Slack (optional)
- Initial feedback form

**Installation Methods**:
- HACS (recommended)
- Manual installation
- Docker (if needed)

### Step 3: Use It Daily
**For 2 weeks**:
- Use HABoard for your real tasks
- Note any issues, confusions, or "wow!" moments
- Try all the features at least once
- Test offline mode intentionally

### Step 4: Provide Feedback
**Three ways to give feedback**:
1. **Bug Reports**: [GitHub Issues](https://github.com/Fab585/HAA_ToDo/issues) with `[BETA]` tag
2. **Feature Requests**: [GitHub Discussions](https://github.com/Fab585/HAA_ToDo/discussions)
3. **Feedback Form**: Comprehensive form sent after Week 1 and Week 2

---

## 🐛 What to Report

### Bugs (GitHub Issues)
**Example Good Bug Report**:
```
Title: [BETA] Task not syncing after offline edit

**Steps to Reproduce**:
1. Go offline (airplane mode)
2. Edit task title
3. Go back online
4. Task title doesn't sync

**Expected**: Task should sync when online
**Actual**: Old title remains on other devices
**Device**: Chrome 120 on macOS 14
**HA Version**: 2024.11.1
```

### Feature Requests (GitHub Discussions)
**Example Good Feature Request**:
```
Title: Add batch complete for multiple tasks

**Problem**: I often complete 5-10 tasks at once.
Currently takes too many clicks.

**Proposed Solution**: Select multiple tasks and
complete them all with one action

**Workaround**: None - must click each one

**Priority**: Nice to have, not blocking
```

### General Feedback (Forms)
- What's working well?
- What's frustrating?
- What's missing that you expected?
- Would you recommend to others?
- What's one thing you'd improve?

---

## ❓ FAQ

### Q: What if I find a critical bug?
**A**: Report immediately in GitHub Issues with `[BETA] [URGENT]` tag. We'll respond within 24 hours.

### Q: Can I stop testing early?
**A**: Yes! No commitment required. Just let us know.

### Q: Will my data be safe?
**A**: HABoard stores data locally in SQLite. No cloud sync. Back up your Home Assistant regularly as always.

### Q: What if I'm not technical?
**A**: Perfect! We need non-technical users. We'll guide you through installation.

### Q: Can I test on multiple devices?
**A**: Yes! Testing sync across devices is valuable.

### Q: What browsers are supported?
**A**: Chrome/Edge 90+, Firefox 88+, Safari 14+

### Q: Do I need to be available 24/7?
**A**: No! Use HABoard when you normally would use a task manager. Feedback can be given anytime.

### Q: Will this slow down my Home Assistant?
**A**: No. HABoard is lightweight (~45KB) and uses minimal resources.

---

## 🎯 Success Criteria

We'll consider beta successful if:
- ✅ 5+ testers complete 2-week period
- ✅ <3 critical bugs found
- ✅ 90%+ sync reliability across devices
- ✅ Positive feedback: "I'd use this over my current app"
- ✅ Clear priorities for v0.5 features

---

## 📞 Contact & Support

### During Beta Testing:
- **Questions**: [GitHub Discussions Q&A](https://github.com/Fab585/HAA_ToDo/discussions/categories/q-a)
- **Bugs**: [GitHub Issues](https://github.com/Fab585/HAA_ToDo/issues)
- **Direct Contact**: @Fab585 on GitHub
- **Community**: (Optional) Beta testing Discord/Slack

### Documentation:
- **User Guide**: [docs/USER_GUIDE.md](https://github.com/Fab585/HAA_ToDo/blob/main/docs/USER_GUIDE.md)
- **Installation**: [DEPLOYMENT_GUIDE.md](https://github.com/Fab585/HAA_ToDo/blob/main/DEPLOYMENT_GUIDE.md)
- **Keyboard Shortcuts**: Press `?` in the app

---

## 🙏 Thank You!

Your time and feedback are invaluable. Every bug report, feature request, and UX insight helps make HABoard better for the entire Home Assistant community.

**Ready to help shape HABoard?**

**[→ Sign Up for Beta Testing](https://github.com/Fab585/HAA_ToDo/discussions/new?category=beta-testing)**

---

## 📊 Testing Checklist

Save this checklist for your testing:

### Week 1: Initial Testing
- [ ] Install HABoard (document time & issues)
- [ ] Create 5+ tasks with varying complexity
- [ ] Create 3+ tags with different colors
- [ ] Complete and uncomplete tasks
- [ ] Edit task details
- [ ] Delete a task
- [ ] Search for tasks
- [ ] Try all 3 filters (Active, Done, All)
- [ ] Test offline mode (airplane mode)
- [ ] Verify sync when back online
- [ ] Try keyboard shortcuts (press `?`)
- [ ] Test on mobile (if applicable)
- [ ] Submit Week 1 feedback form

### Week 2: Daily Use
- [ ] Use HABoard for real daily tasks
- [ ] Note any frustrations or "wow" moments
- [ ] Test edge cases (long titles, many tags, etc.)
- [ ] Try to break it (stress test)
- [ ] Compare to your current task manager
- [ ] Test sync across devices (if applicable)
- [ ] Note performance issues
- [ ] Submit Week 2 feedback form
- [ ] Final survey

---

**Version**: v0.1.0 Beta Testing Program
**Last Updated**: 2025-11-11
**Status**: 🟢 **RECRUITING NOW**
