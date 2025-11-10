# Contributing to HABoard

Thank you for your interest in contributing to HABoard! 🎉

> **Note:** This project is currently in the planning phase. Active development will begin after validation spikes are complete.

---

## 📋 Getting Started

1. **Read the planning documents:**
   - [User Stories & Acceptance Criteria](docs/01-user-stories-acceptance-criteria.md)
   - [Technology Strategy](docs/02-technology-strategy.md)
   - [Review & Analysis](docs/03-review-and-analysis.md)

2. **Check existing issues:** Look for issues labeled `good first issue` or `help wanted`

3. **Join the discussion:** Use GitHub Discussions to ask questions or propose ideas

---

## 🛠️ Development Setup

> This section will be populated once development begins.

**Prerequisites:**
- Home Assistant 2024.1+
- PostgreSQL 14+ (or SQLite)
- Node.js 18+
- Python 3.11+

---

## 🎯 Contribution Guidelines

### Code Style
- **Python:** Follow PEP 8; use `black` for formatting, `ruff` for linting
- **TypeScript:** Use Prettier; follow Airbnb style guide
- **Commits:** Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.)

### Testing Requirements
- All new features must include unit tests
- Critical paths require E2E tests
- Maintain >80% code coverage

### Performance Requirements
- Respect performance budgets (see README)
- Run Lighthouse CI locally before submitting PRs
- Measure bundle size impact

### Accessibility Requirements
- All interactive elements must be keyboard accessible
- Provide ARIA labels for screen readers
- Test with NVDA or VoiceOver

---

## 🔄 Pull Request Process

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the guidelines above
3. **Write tests** for new functionality
4. **Run the full test suite** and ensure all checks pass
5. **Update documentation** if you're changing functionality
6. **Submit a PR** with a clear description of the changes

### PR Checklist
- [ ] Tests added/updated and passing
- [ ] Documentation updated (if applicable)
- [ ] Performance budgets respected
- [ ] Accessibility checks pass
- [ ] No new linting errors
- [ ] Conventional commit format used
- [ ] PR description clearly explains the change

---

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Environment:**
   - Home Assistant version
   - HABoard version
   - Browser/device (for frontend issues)
   - Python version (for backend issues)

2. **Steps to reproduce:** Clear, numbered steps

3. **Expected behavior:** What should happen

4. **Actual behavior:** What actually happens

5. **Logs/Screenshots:** Include relevant error messages or screenshots

---

## 💡 Feature Requests

We love feature ideas! Before submitting:

1. **Check existing issues:** Your idea might already be discussed
2. **Review the user stories:** Does it align with the project vision?
3. **Open a discussion:** Propose the feature and get feedback before coding

### Feature Request Template
```markdown
**Problem:** What problem does this solve?
**Proposed Solution:** How would it work?
**Alternatives:** What other approaches did you consider?
**User Story Alignment:** Which existing user stories does this support?
**Acceptance Criteria:** How do we know it's done?
```

---

## 🧪 Testing

### Running Tests
```bash
# Backend tests
pytest tests/

# Frontend tests
npm test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y
```

### Writing Tests
- **Unit tests:** Test individual functions/components in isolation
- **Integration tests:** Test API contracts, database operations
- **E2E tests:** Test critical user flows (add task, complete, sync)

---

## 📝 Documentation

Good documentation is just as important as good code!

- Update README for user-facing changes
- Update technical docs for architecture changes
- Add JSDoc/docstrings for public APIs
- Include code examples for complex features

---

## 🏗️ Project Structure (Coming Soon)

```
haboard/
├── custom_components/haboard/    # Home Assistant integration
│   ├── __init__.py
│   ├── manifest.json
│   ├── config_flow.py
│   └── ...
├── frontend/                      # SvelteKit PWA
│   ├── src/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── ...
│   └── package.json
├── docs/                          # Documentation
└── tests/                         # Test suites
```

---

## 🌟 Recognition

Contributors will be recognized in:
- The project README
- Release notes for their contributions
- The CONTRIBUTORS file

---

## 📜 Code of Conduct

Be respectful, inclusive, and constructive. We're building this together for the Home Assistant community.

**In short:**
- Be kind and respectful
- Provide constructive feedback
- Focus on the issue, not the person
- Celebrate others' contributions

---

## 🙋 Questions?

- Open a GitHub Discussion for general questions
- Comment on relevant issues for specific topics
- Check the [Home Assistant Community Forums](https://community.home-assistant.io/)

---

**Thank you for contributing to HABoard! 🚀**
