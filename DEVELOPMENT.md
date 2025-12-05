# Development Setup

## Prerequisites

- Docker & Docker Compose
- [Lefthook](https://github.com/evilmartians/lefthook) (for git hooks)

## Installing Lefthook

```bash
# macOS
brew install lefthook

# Or using npm
npm install -g @evilmartians/lefthook

# Or using go
go install github.com/evilmartians/lefthook@latest
```

## Setup Git Hooks

After cloning the repository, install the git hooks:

```bash
lefthook install
```

This will set up pre-commit hooks that:
- ✅ Validate conventional commit messages
- ✅ Auto-fix linting issues with ruff (backend)
- ✅ Run type checking with mypy (backend)
- ✅ Auto-fix linting issues with ESLint (frontend)
- ✅ Automatically stage fixed files

## CLI Commands

Use `./cli.sh` for common development tasks:

```bash
# Development
./cli.sh dev start          # Start all services
./cli.sh dev stop           # Stop all services
./cli.sh dev logs           # View logs
./cli.sh dev build          # Rebuild containers
./cli.sh dev shell backend  # Enter backend shell

# Linting & Formatting
./cli.sh lint backend       # Check backend linting
./cli.sh lint backend --fix # Fix backend linting issues
./cli.sh lint frontend      # Check frontend linting
./cli.sh lint all --fix     # Fix all linting issues

./cli.sh format backend     # Format backend code
./cli.sh format frontend    # Format frontend code
./cli.sh format all         # Format all code

# Type Checking
./cli.sh type-check backend  # Type check backend
./cli.sh type-check frontend # Type check frontend
./cli.sh type-check all      # Type check all

# Testing
./cli.sh test backend       # Run backend tests
./cli.sh test frontend      # Run frontend tests
./cli.sh test all           # Run all tests

# Database
./cli.sh db migrate         # Run database migrations
./cli.sh db seed            # Seed database with test data
```

## Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes
- `revert`: Revert a previous commit

### Examples
```bash
git commit -m "feat(auth): add JWT refresh token support"
git commit -m "fix(api): handle null values in telemetry data"
git commit -m "docs: update setup instructions in README"
git commit -m "chore(deps): upgrade fastapi to v0.109.0"
```

## CI/CD

GitHub Actions will run on every push and pull request:
- ✅ Frontend: lint, type-check, build
- ✅ Backend: ruff, mypy
- ✅ Auto-deploy to Coolify on main branch

## Local Development

1. Start services:
   ```bash
   ./cli.sh dev start
   ```

2. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - API Docs: http://localhost/api/docs

3. View logs:
   ```bash
   ./cli.sh dev logs
   ```

4. Run migrations:
   ```bash
   ./cli.sh db migrate
   ```
