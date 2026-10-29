# ISCO

[![Build Status](https://akvo.semaphoreci.com/badges/isco/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/isco) [![Repo Size](https://img.shields.io/github/repo-size/akvo/isco)](https://img.shields.io/github/repo-size/akvo/isco) [![Languages](https://img.shields.io/github/languages/count/akvo/isco)](https://img.shields.io/github/languages/count/akvo/isco) [![Issues](https://img.shields.io/github/issues/akvo/isco)](https://img.shields.io/github/issues/akvo/isco) [![Last Commit](https://img.shields.io/github/last-commit/akvo/isco/main)](https://img.shields.io/github/last-commit/akvo/isco/main) [![Coverage Status](https://coveralls.io/repos/github/akvo/isco/badge.svg?branch=main)](https://coveralls.io/github/akvo/isco?branch=main)

## Prerequisite
- Docker > v19
- Docker Compose > v2.1
- Docker Sync 0.7.1

## Development

### Environment Setup

Expected that PORT 5432 and 3000 are not being used by other services.

Transactional email goes out over SMTP. Put the relay settings in a `.env`
file in the project root:

```bash
EMAIL_HOST=""
EMAIL_PORT="587"
EMAIL_HOST_USER=""
EMAIL_HOST_PASSWORD=""
EMAIL_USE_TLS="true"
EMAIL_USE_SSL="false"
```

`EMAIL_USE_TLS` (STARTTLS, port 587) and `EMAIL_USE_SSL` (implicit SSL, port
465) are mutually exclusive; the defaults above match the common relay and
apply when the variables are absent. Leave `EMAIL_HOST` empty during local
development and mail sending simply fails and is logged.

#### Start

For initial run, you need to create a new docker volume.

```bash
docker volume create isco-docker-sync
```

```bash
./dc.sh up -d
```

The app should be running at: [localhost:3000](http://localhost:3000). Any endpoints with prefix
- `^/api/*` is redirected to [localhost:5000/api](http://localhost:5000/api)

Network Config:
- [setupProxy.js](https://github.com/akvo/isco/blob/main/frontend/src/setupProxy.js)
- [mainnetwork](https://github.com/akvo/isco/blob/docker-compose.override.yml#L4-L8) container setup

#### Log

```bash
./dc.sh log --follow <container_name>
```
Available containers:
- backend
- frontend
- mainnetwork
- db
- pgadmin
- mailpit

#### Local Mail (Mailpit)

Emails sent by the backend in local development (user invitations, password resets, download readiness) are captured by **Mailpit** without needing external SMTP credentials:
- **Web UI**: [http://localhost:8025](http://localhost:8025)
- **SMTP Server**: `localhost:1025` (pre-configured for the backend)

```bash
./dc.sh stop
```

#### Teardown

```bash
docker-compose down -v
docker volume rm isco-docker-sync
```

### Database Migrations & Seeders

#### 1. Database Migrations (Alembic)
Database schema definitions and DDL are version-controlled using Alembic.
All migration commands must be executed inside the backend container via `./dc.sh`:

- **Run all pending migrations**:
  ```bash
  ./dc.sh exec backend alembic upgrade head
  ```
- **Roll back the latest migration**:
  ```bash
  ./dc.sh exec backend alembic downgrade -1
  ```
- **Create a new migration**:
  ```bash
  ./dc.sh exec backend alembic revision -m "your_migration_description"
  ```

> **Migration Guidelines**:
> - Migrations are strictly for **DDL (schema structure, tables, columns, indexes, foreign keys)** and static foundational reference rows (such as the 4 permanent harmonized peer groups).
> - Dynamic domain data and cross-table mappings must **not** be seeded inside migrations to keep migrations 100% deterministic across fresh test environments and existing production databases.

#### 2. Database Seeders
Initial reference data, test datasets, and entity mappings are located in `backend/seeder/`:

- **Seed Member & ISCO Types**:
  ```bash
  ./dc.sh exec backend python -m seeder.member_isco_type
  ```
- **Seed & Reconcile Peer Groups & Member Type Mappings**:
  ```bash
  ./dc.sh exec backend python -m seeder.peer_group
  ```
- **Seed Organisations**:
  ```bash
  ./dc.sh exec backend python -m seeder.organisation
  ```
- **Seed Users**:
  ```bash
  ./dc.sh exec backend python -m seeder.user
  ```
- **Seed Roadmap Forms**:
  ```bash
  ./dc.sh exec backend python -m seeder.roadmap_init
  ```

> **Single Source of Truth**:
> Canonical static reference data is maintained in `backend/seeder/static/` (e.g. `static_peer_group.py`, `static_member_isco.py`). Both seeders and runtime services import from these definitions to guarantee DRY consistency across the platform.

### Static Content Extraction

To extract the static content constants from the frontend application into a `.xlsx` spreadsheet, you can use the provided export script. This will run a script inside the Docker container to generate `frontend/content-export.xlsx`.

```bash
cd frontend
./export.sh
```

## Production

```bash
export CI_COMMIT='local'
./ci/build.sh
```

Above command will generate two docker images with prefix `eu.gcr.io/akvo-lumen/isco` for backend and frontend

```bash
docker-compose -f docker-compose.yml -f docker-compose.ci.yml up -d
```

Network config: [nginx](https://github.com/akvo/isco/blob/main/frontend/nginx/conf.d/default.conf)
