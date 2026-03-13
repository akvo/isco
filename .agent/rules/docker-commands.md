---
trigger: always_on
---

## Docker Commands

**All commands MUST be executed via `./dc.sh exec`. Never run bare commands outside Docker.**

### Service Access URLs

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Documentation | http://localhost:5000/docs |
| pgAdmin | http://localhost:5050 |

### Environment Management

```bash
./dc.sh up -d           # Start all services
./dc.sh down            # Stop all services
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
./dc.sh exec frontend npm run prettier-write       # Format code
./dc.sh exec frontend bash                          # Open shell
./dc.sh exec frontend npm start                    # Start dev server
./dc.sh exec frontend npm run lint                  # Run ESLint
./dc.sh exec frontend npm run test                  # Run tests (Jest)
```

### Rules

1. **Never run `python`, `pip`, `node`, `npm`, or `yarn` directly** — always prefix with `./dc.sh exec backend` or `./dc.sh exec frontend`.
2. **Database migrations** should run via Alembic within the backend container (`./dc.sh exec backend alembic upgrade head`).
3. **Hot reload** is enabled for development services.
4. **Environment variables** go in `.env` file (based on `.env.example`).
