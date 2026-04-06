---
trigger: always_on
---

## Docker Commands

**All commands MUST be executed via `./dc.sh exec`. Never run bare commands outside Docker.**

### Service Access URLs

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:3000 |
| Backend API | http://localhost:3000/api |
| API Documentation | http://localhost:3000/api/docs |
| pgadmin | http://localhost:5050 |

### Environment Management

```bash
docker volume create isco-docker-sync # Required before first run
./dc.sh up -d           # Start all services
./dc.sh stop            # Stop all services
./dc.sh ps              # View running services
./dc.sh logs -f         # Follow all logs
./dc.sh logs backend    # View specific service logs
```

### Backend Commands

```bash
./dc.sh exec backend ./test.sh                      # Run backend tests & linter
./dc.sh exec backend pytest                         # Run backend tests (raw)
./dc.sh exec backend flake8                         # Run linter
./dc.sh exec backend bash                           # Open shell
```

### Frontend Commands

```bash
./dc.sh exec frontend yarn prettier-write       # Format code
./dc.sh exec frontend bash                          # Open shell
./dc.sh exec frontend yarn start                    # Start dev server
./dc.sh exec frontend yarn lint                  # Run ESLint
./dc.sh exec frontend yarn test                  # Run tests (Jest)
```

### Rules

1. **Never run `python`, `pip`, `node`, `npm`, or `yarn` directly** — always prefix with `./dc.sh exec backend` or `./dc.sh exec frontend`.
2. **Setup**: Run `docker volume create isco-docker-sync` before starting services for the first time.
3. **Pre-commit**: The `./dc.sh` script automatically handles `pre-commit` installation.
4. **Database migrations** should run via Alembic within the backend container (`./dc.sh exec backend alembic upgrade head`).
5. **Hot reload** is enabled for development services.
6. **Environment variables** go in `.env` file (based on `.env.example`).
