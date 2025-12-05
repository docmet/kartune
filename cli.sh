#!/bin/bash

# KartTune CLI Tool

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_COMPOSE="docker compose -f $PROJECT_ROOT/docker-compose.yml"

function usage() {
    echo "Usage: $0 [command] [args]"
    echo "Commands:"
    echo "  dev start       Start development environment"
    echo "  dev stop        Stop development environment"
    echo "  dev logs        View logs"
    echo "  dev build       Rebuild containers"
    echo "  dev shell [svc] Enter container shell"
    echo "  test [svc]      Run tests (backend|frontend|all)"
    echo "  lint [svc] [--fix]  Run linters (backend|frontend|all)"
    echo "  format [svc]    Format code (backend|frontend|all)"
    echo "  type-check [svc] Type check code (backend|frontend|all)"
    echo "  db migrate      Run database migrations"
    echo "  db seed         Seed database with test data"
    exit 1
}

if [ $# -eq 0 ]; then
    usage
fi

COMMAND=$1
SUBCOMMAND=$2

case $COMMAND in
    dev)
        case $SUBCOMMAND in
            start)
                $DOCKER_COMPOSE up -d
                echo "Development environment started at http://localhost:3000"
                ;;
            stop)
                $DOCKER_COMPOSE down
                ;;
            logs)
                $DOCKER_COMPOSE logs -f
                ;;
            build)
                $DOCKER_COMPOSE build
                ;;
            shell)
                SERVICE=${3:-backend}
                $DOCKER_COMPOSE exec $SERVICE /bin/bash
                ;;
            *)
                usage
                ;;
        esac
        ;;
    test)
        TARGET=${2:-all}
        if [ "$TARGET" == "backend" ] || [ "$TARGET" == "all" ]; then
            echo "Running backend tests..."
            $DOCKER_COMPOSE exec backend pytest
        fi
        if [ "$TARGET" == "frontend" ] || [ "$TARGET" == "all" ]; then
            echo "Running frontend tests..."
            $DOCKER_COMPOSE exec frontend npm test
        fi
        ;;
    lint)
        TARGET=${2:-all}
        FIX_FLAG=${3:-}
        if [ "$TARGET" == "backend" ] || [ "$TARGET" == "all" ]; then
            echo "Linting backend..."
            if [ "$FIX_FLAG" == "--fix" ]; then
                $DOCKER_COMPOSE exec backend ruff check . --fix
            else
                $DOCKER_COMPOSE exec backend ruff check .
            fi
        fi
        if [ "$TARGET" == "frontend" ] || [ "$TARGET" == "all" ]; then
            echo "Linting frontend..."
            $DOCKER_COMPOSE exec frontend npm run lint
        fi
        ;;
    format)
        TARGET=${2:-all}
        if [ "$TARGET" == "backend" ] || [ "$TARGET" == "all" ]; then
            echo "Formatting backend..."
            $DOCKER_COMPOSE exec backend ruff format .
        fi
        if [ "$TARGET" == "frontend" ] || [ "$TARGET" == "all" ]; then
            echo "Formatting frontend..."
            $DOCKER_COMPOSE exec frontend npm run lint -- --fix
        fi
        ;;
    type-check)
        TARGET=${2:-all}
        if [ "$TARGET" == "backend" ] || [ "$TARGET" == "all" ]; then
            echo "Type checking backend..."
            $DOCKER_COMPOSE exec backend mypy . --ignore-missing-imports
        fi
        if [ "$TARGET" == "frontend" ] || [ "$TARGET" == "all" ]; then
            echo "Type checking frontend..."
            $DOCKER_COMPOSE exec frontend npm run type-check
        fi
        ;;
    db)
        case $SUBCOMMAND in
            migrate)
                $DOCKER_COMPOSE exec backend alembic upgrade head
                ;;
            seed)
                $DOCKER_COMPOSE exec backend python -m app.core.seed
                ;;
            *)
                usage
                ;;
        esac
        ;;
    *)
        usage
        ;;
esac
