# ISCO

[![Build Status](https://akvo.semaphoreci.com/badges/isco/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/isco) [![Repo Size](https://img.shields.io/github/repo-size/akvo/isco)](https://img.shields.io/github/repo-size/akvo/isco) [![Languages](https://img.shields.io/github/languages/count/akvo/isco)](https://img.shields.io/github/languages/count/akvo/isco) [![Issues](https://img.shields.io/github/issues/akvo/isco)](https://img.shields.io/github/issues/akvo/isco) [![Last Commit](https://img.shields.io/github/last-commit/akvo/isco/main)](https://img.shields.io/github/last-commit/akvo/isco/main) [![Coverage Status](https://coveralls.io/repos/github/akvo/isco/badge.svg?branch=main)](https://coveralls.io/github/akvo/isco?branch=main)

## Prerequisite
- Docker > v19
- Docker Compose > v2.1
- Docker Sync 0.7.1

## Development

### Environment Setup

Expected that PORT 5432 and 3000 are not being used by other services.

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

#### Stop

```bash
./dc.sh stop
```

#### Teardown

```bash
docker-compose down -v
docker volume rm isco-docker-sync
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
