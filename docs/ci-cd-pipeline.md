# CI/CD Pipeline Documentation

## Overview

HABoard uses GitHub Actions for continuous integration and continuous deployment. Our CI/CD pipeline ensures code quality, security, and reliability through automated testing, linting, and security scanning.

## Workflows

### 1. Python CI (`python-ci.yml`)

Runs on every push and pull request to validate Python code quality.

**Jobs:**

- **Lint**: Python code linting and formatting checks
  - `ruff check .` - Fast Python linting
  - `black --check .` - Code formatting verification
  - `mypy` - Static type checking (optional during early development)

- **Test**: Run pytest test suite
  - Matrix testing on Python 3.11 and 3.12
  - Code coverage reporting with pytest-cov
  - Coverage upload to Codecov

**Configuration:**
- `pyproject.toml` - Ruff, Black, pytest, mypy configuration
- Target Python version: 3.11+
- Line length: 100 characters

### 2. Frontend CI (`frontend-ci.yml`)

Validates frontend code quality and builds the production bundle.

**Jobs:**

- **Lint**: Frontend code linting and formatting
  - ESLint for TypeScript and Svelte code
  - Prettier for consistent formatting

- **Test**: Run Vitest test suite
  - Unit and integration tests
  - Coverage reporting

- **Build**: Production bundle build
  - Verifies build succeeds
  - Checks bundle size (target: <150KB gzipped)

**Configuration:**
- `frontend/.eslintrc.cjs` - ESLint configuration
- `frontend/.prettierrc` - Prettier configuration
- Node.js version: 20

### 3. Security Scanning (`security.yml`)

Automated security checks for vulnerabilities and code issues.

**Jobs:**

- **Bandit**: Python security linter
  - Scans for common security issues in Python code
  - Checks for OWASP Top 10 vulnerabilities

- **Safety**: Python dependency vulnerability scanner
  - Checks for known security vulnerabilities in dependencies

- **npm audit**: Node.js dependency security audit
  - Identifies vulnerabilities in npm packages

- **CodeQL**: GitHub's semantic code analysis
  - Deep code analysis for Python and JavaScript
  - Detects security vulnerabilities and code quality issues

**Schedule:**
- Runs on push/PR to main and develop branches
- Weekly scheduled scan every Monday at 00:00 UTC

### 4. Pull Request Validation (`pr-validation.yml`)

Enforces PR quality standards and best practices.

**Checks:**

- **PR Title Format**: Ensures conventional commits format
  - Valid prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`, `ci:`
  - Example: `feat: Add task completion animation`

- **PR Size Check**: Warns on large PRs (>500 lines changed)
  - Encourages smaller, reviewable PRs

- **Branch Naming**: Validates branch naming convention
  - Expected patterns: `feature/*`, `fix/*`, `docs/*`, `refactor/*`, `test/*`, `chore/*`, `claude/*`
  - Example: `feature/add-task-sync`, `fix/search-bug`

## Performance Budgets

Enforced in CI to maintain performance targets:

| Metric | Target | Tool |
|--------|--------|------|
| Initial JS bundle | <150 KB gzipped | Webpack Bundlesize |
| Total lazy JS | <250 KB gzipped | Webpack Bundlesize |
| Test coverage (Python) | >80% | pytest-cov |
| Test coverage (Frontend) | >70% | Vitest |
| Linting errors | 0 | Ruff, ESLint |
| Security issues (High) | 0 | Bandit, Safety |

## Local Development

### Running Checks Locally

Before pushing, run these commands to catch issues early:

**Python:**
```bash
# Linting
ruff check .
black --check .
mypy custom_components/haboard

# Testing
pytest

# Security
bandit -r custom_components/haboard
safety check
```

**Frontend:**
```bash
cd frontend

# Linting
npm run lint
npm run format

# Testing
npm test

# Build check
npm run build
```

### Pre-commit Hooks (Optional)

Install pre-commit hooks to automatically run checks:

```bash
# Install pre-commit (Week 0 Day 3)
pip install pre-commit
pre-commit install

# Hooks will run automatically on git commit
```

## CI Status Badges

Add these badges to your README to show CI status:

```markdown
[![Python CI](https://github.com/Fab585/HAA_ToDo/workflows/Python%20CI/badge.svg)](https://github.com/Fab585/HAA_ToDo/actions)
[![Frontend CI](https://github.com/Fab585/HAA_ToDo/workflows/Frontend%20CI/badge.svg)](https://github.com/Fab585/HAA_ToDo/actions)
[![Security](https://github.com/Fab585/HAA_ToDo/workflows/Security%20Scanning/badge.svg)](https://github.com/Fab585/HAA_ToDo/actions)
```

## Troubleshooting

### Common Issues

**1. Ruff or Black formatting failures:**
```bash
# Auto-fix formatting issues
black .
ruff check . --fix
```

**2. npm audit warnings:**
```bash
# Update vulnerable dependencies
cd frontend
npm audit fix
```

**3. Test failures:**
```bash
# Run tests locally with verbose output
pytest -v
cd frontend && npm test -- --reporter=verbose
```

**4. Coverage too low:**
- Add tests for uncovered code paths
- Target: >80% Python, >70% Frontend

## Future Enhancements (Post-MVP)

- [ ] Automated deployment to staging environment
- [ ] Performance regression testing (Lighthouse CI)
- [ ] Visual regression testing (Percy/Chromatic)
- [ ] Bundle size tracking over time
- [ ] Automated changelog generation
- [ ] Semantic release automation
- [ ] HACS validation before publish

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)
