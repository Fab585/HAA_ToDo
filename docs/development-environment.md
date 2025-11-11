# Development Environment Setup

This guide covers different ways to set up your development environment for HABoard.

## Table of Contents

1. [VS Code Dev Containers (Recommended)](#vs-code-dev-containers-recommended)
2. [Local Development Setup](#local-development-setup)
3. [Editor Configuration](#editor-configuration)
4. [Git Hooks](#git-hooks)
5. [Debugging](#debugging)
6. [Troubleshooting](#troubleshooting)

---

## VS Code Dev Containers (Recommended)

The easiest way to get started is using VS Code Dev Containers, which provides a fully configured development environment.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Docker Engine](https://docs.docker.com/engine/install/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Fab585/HAA_ToDo.git
   cd HAA_ToDo
   ```

2. **Open in VS Code:**
   ```bash
   code .
   ```

3. **Reopen in Container:**
   - Press `F1` or `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (Mac)
   - Type "Dev Containers: Reopen in Container"
   - Wait for the container to build (first time takes ~5-10 minutes)

4. **Automatic Setup:**
   The container will automatically:
   - Install Python dependencies (`requirements.txt`, `requirements-dev.txt`)
   - Install frontend dependencies (`npm install`)
   - Set up pre-commit hooks
   - Configure VS Code with recommended extensions and settings

5. **Verify Setup:**
   ```bash
   # Test Python
   python --version
   pytest --version

   # Test Node.js
   node --version
   npm --version

   # Test linters
   ruff --version
   black --version
   ```

### What's Included

**Installed Tools:**
- Python 3.11 with all dependencies
- Node.js 20 with npm
- Git with config mounted from host
- SQLite 3
- All development tools (pytest, ruff, black, mypy, etc.)

**VS Code Extensions:**
- Python development (Pylance, Black, Ruff)
- Frontend development (Svelte, ESLint, Prettier)
- Testing tools (Test Explorer, Vitest)
- Git tools (GitLens, GitHub PR)
- Utilities (EditorConfig, Error Lens, TODO Highlight)

**Port Forwarding:**
- `8123` - Home Assistant (when running)
- `5173` - Vite frontend dev server

---

## Local Development Setup

If you prefer not to use Docker, you can set up your local environment.

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Git
- SQLite 3 (usually included with Python)

### Python Setup

1. **Create virtual environment:**
   ```bash
   python3.11 -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   # OR
   .venv\Scripts\activate     # Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

3. **Verify installation:**
   ```bash
   pytest --version
   ruff --version
   black --version
   ```

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Verify installation:**
   ```bash
   npm run build
   npm test -- --run
   ```

### Pre-commit Hooks (Optional but Recommended)

1. **Install pre-commit:**
   ```bash
   pip install pre-commit
   ```

2. **Set up hooks:**
   ```bash
   pre-commit install
   pre-commit install --hook-type commit-msg
   ```

3. **Test hooks:**
   ```bash
   pre-commit run --all-files
   ```

---

## Editor Configuration

### VS Code (Recommended)

The repository includes VS Code settings that automatically configure:

- Python linting with Ruff
- Python formatting with Black
- Frontend linting with ESLint
- Frontend formatting with Prettier
- Test discovery with pytest
- Debug configurations

**Recommended Extensions:** See `.vscode/extensions.json`

To install all recommended extensions:
1. Open VS Code
2. Press `Ctrl+Shift+P` / `Cmd+Shift+P`
3. Type "Extensions: Show Recommended Extensions"
4. Click "Install" on each extension

### Other Editors

The repository includes an `.editorconfig` file that works with most modern editors:

- **IntelliJ/PyCharm:** Built-in support
- **Sublime Text:** Install EditorConfig plugin
- **Vim/Neovim:** Install editorconfig-vim plugin
- **Emacs:** Install editorconfig-emacs

---

## Git Hooks

Pre-commit hooks automatically run checks before each commit to catch issues early.

### What Gets Checked

**Python:**
- Black formatting
- Ruff linting and auto-fixes
- Bandit security scanning

**Frontend:**
- Prettier formatting
- ESLint linting and auto-fixes

**General:**
- Trailing whitespace removal
- End-of-file newlines
- Large file detection
- Private key detection
- Merge conflict markers

**Commit Messages:**
- Conventional commits format validation

### Usage

**Automatic (on commit):**
```bash
git commit -m "feat: Add new feature"
# Hooks run automatically
```

**Manual (all files):**
```bash
pre-commit run --all-files
```

**Skip hooks (emergency only):**
```bash
git commit --no-verify -m "emergency fix"
```

### Bypass Specific Hooks

```bash
SKIP=eslint git commit -m "feat: Add feature"
```

---

## Debugging

### Python Debugging

**VS Code:**
1. Set breakpoints by clicking left of line numbers
2. Press `F5` or use Debug panel
3. Select "Python: Current File" or "Python: pytest"

**CLI:**
```bash
# IPython debugger
python -m ipdb your_script.py

# Pytest with debugger
pytest --pdb
```

### Frontend Debugging

**VS Code:**
1. Start dev server: `cd frontend && npm run dev`
2. Press `F5`
3. Select "Frontend: Debug in Chrome"
4. Set breakpoints in `.svelte` or `.ts` files

**Browser DevTools:**
1. Start dev server
2. Open http://localhost:5173
3. Press `F12` for DevTools
4. Use Sources tab for debugging

### Home Assistant Integration Debugging

```bash
# Enable debug logging in HA configuration.yaml
logger:
  default: info
  logs:
    custom_components.haboard: debug
```

---

## Troubleshooting

### Dev Container Issues

**Problem:** Container build fails
```bash
# Rebuild without cache
Ctrl+Shift+P > "Dev Containers: Rebuild Container Without Cache"
```

**Problem:** Ports not forwarding
```bash
# Check Docker port mappings
docker ps
# Manually forward in VS Code: Ports panel > Forward Port
```

### Python Issues

**Problem:** `ModuleNotFoundError`
```bash
# Ensure virtual environment is activated
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt -r requirements-dev.txt
```

**Problem:** Import errors in VS Code
```bash
# Select correct Python interpreter
Ctrl+Shift+P > "Python: Select Interpreter"
# Choose .venv/bin/python
```

### Frontend Issues

**Problem:** `npm install` fails
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Problem:** Vite dev server won't start
```bash
# Check if port 5173 is already in use
lsof -ti:5173  # Linux/Mac
# Kill process if needed
kill $(lsof -ti:5173)
```

### Pre-commit Issues

**Problem:** Hooks failing unexpectedly
```bash
# Update hooks to latest versions
pre-commit autoupdate

# Clean and reinstall
pre-commit clean
pre-commit install
```

**Problem:** ESLint hook fails in container
```bash
# Install frontend deps in container
cd frontend
npm install
```

### Git Issues

**Problem:** Commit rejected by hooks
```bash
# See what failed
git commit -m "your message"
# Fix issues shown in output
# Retry commit
```

**Problem:** Large files blocked
```bash
# Check file size
ls -lh path/to/file
# If intentional, add to .gitattributes or increase limit in .pre-commit-config.yaml
```

---

## Development Workflow

### Typical Day

**Morning:**
```bash
# Start dev container or activate venv
source .venv/bin/activate

# Update dependencies
git pull
pip install -r requirements.txt
cd frontend && npm install && cd ..

# Run tests to ensure clean state
pytest
cd frontend && npm test -- --run && cd ..
```

**During Development:**
```bash
# Terminal 1: Frontend dev server (hot reload)
cd frontend
npm run dev

# Terminal 2: Python development
# Make changes, run tests
pytest tests/test_your_feature.py -v

# Terminal 3: Home Assistant (if needed)
# Run HA dev instance with integration loaded
```

**Before Committing:**
```bash
# Run all checks locally
pytest
cd frontend && npm test && npm run lint && cd ..
ruff check .
black --check .

# Or let pre-commit handle it
git commit -m "feat: Add your feature"
```

---

## Performance Tips

### VS Code Performance

```json
// Add to .vscode/settings.json for large projects
{
  "files.watcherExclude": {
    "**/.venv/**": true,
    "**/node_modules/**": true,
    "**/.svelte-kit/**": true
  }
}
```

### pytest Performance

```bash
# Run tests in parallel (faster)
pytest -n auto

# Run only failed tests
pytest --lf

# Skip slow tests during development
pytest -m "not slow"
```

### npm Performance

```bash
# Use npm ci instead of npm install (faster, cleaner)
npm ci

# Cache npm packages
npm config set cache ~/.npm-cache
```

---

## Next Steps

- Read [CI/CD Pipeline](ci-cd-pipeline.md) to understand automated checks
- Review [Phased Implementation Plan](04-phased-implementation-plan.md) for development roadmap
- Check [Technology Strategy](02-technology-strategy.md) for architecture details

---

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/Fab585/HAA_ToDo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Fab585/HAA_ToDo/discussions)
- **Home Assistant Community:** [Home Assistant Forums](https://community.home-assistant.io/)
