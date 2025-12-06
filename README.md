# KarTune 🏎️

AI-powered karting telemetry analysis and setup optimization platform.

## Overview

KarTune is a comprehensive data collection and analysis platform designed for karting teams to optimize their race setups through telemetry data analysis. Built with modern web technologies and AI-powered insights, KarTune helps teams make data-driven decisions to improve lap times and race performance.

## Features

### 🏁 Core Functionality
- **Telemetry Analysis**: Upload and analyze CSV telemetry data from karting sessions
- **Session Management**: Track and organize racing sessions by driver, track, and date
- **Team Collaboration**: Multi-user support with team-based data isolation
- **Driver Profiles**: Manage multiple drivers and their performance metrics
- **Track Database**: Maintain track information and session history
- **Equipment Tracking**: Monitor kart and engine configurations

### 📊 Analytics
- **Lap Time Analysis**: Best lap, average lap, and lap-by-lap comparisons
- **AI-Powered Insights**: Automated analysis of telemetry data patterns
- **Performance Trends**: Track improvements over time
- **Setup Optimization**: Data-driven recommendations for kart setup

### 🎨 Modern UI
- **Dark Theme**: Racing-inspired dark interface with red accents
- **Mobile Responsive**: Full functionality on all device sizes
- **Real-time Updates**: Live data synchronization
- **Intuitive Navigation**: Clean, modern interface built with Next.js and shadcn/ui

## Tech Stack

### Frontend
- **Framework**: Next.js 14.1.0 (React 18)
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Form Management**: React Hook Form + Zod validation

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: SQLAlchemy
- **Authentication**: JWT with refresh tokens
- **File Processing**: Pandas for telemetry analysis

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Deployment**: Coolify (self-hosted)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/docmet/kartune.git
   cd kartune
   ```

2. **Start the application**
   ```bash
   ./cli.sh dev start
   ```

3. **Access the application**
   - Frontend: http://localhost
   - API Documentation: http://localhost/api/docs

4. **Create your first account**
   - Navigate to http://localhost
   - Click "Get Started"
   - Register with your email and create a team

### Using the CLI

KarTune includes a convenient CLI tool for common tasks:

```bash
# Development
./cli.sh dev start          # Start all services
./cli.sh dev stop           # Stop all services
./cli.sh dev logs           # View logs
./cli.sh dev build          # Rebuild containers

# Database
./cli.sh db migrate         # Run migrations
./cli.sh db seed            # Seed test data

# Testing & Linting
./cli.sh test all           # Run all tests
./cli.sh lint all --fix     # Fix linting issues
./cli.sh format all         # Format code
./cli.sh type-check all     # Type checking
```

## Development

For detailed development setup, testing, and contribution guidelines, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Project Structure

```
kartune/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
├── backend/              # FastAPI backend application
│   ├── app/
│   │   ├── api/         # API route handlers
│   │   ├── core/        # Core configuration
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── alembic/         # Database migrations
│   └── tests/           # Backend tests
├── nginx/               # Nginx configuration
└── cli.sh              # Development CLI tool
```

## API Documentation

Once the application is running, interactive API documentation is available at:
- **Swagger UI**: http://localhost/api/docs
- **ReDoc**: http://localhost/api/redoc

## Environment Variables

### Frontend
- `NEXT_PUBLIC_API_URL`: API base URL (default: empty for nginx proxy)
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGINS`: Allowed CORS origins (JSON array)

## Security

- **Authentication**: JWT-based with access and refresh tokens
- **Authorization**: Team-based data isolation
- **Password Security**: Bcrypt hashing
- **Input Validation**: Pydantic schemas
- **CORS**: Configurable allowed origins
- **HTTPS**: Recommended for production

## Deployment

KarTune is designed for easy deployment with Docker Compose:

1. **Production deployment** uses `docker-compose.prod.yml`
2. **Database migrations** run automatically on backend startup
3. **Environment variables** configured via Coolify or `.env` files
4. **Nginx** handles SSL termination and request routing

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed deployment instructions.

## License

[Add your license here]

## Contributing

Contributions are welcome! Please see [DEVELOPMENT.md](DEVELOPMENT.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- Git workflow (Conventional Commits)

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ for the karting community
