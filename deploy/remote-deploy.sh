#!/usr/bin/env bash
# Deploys the portfolio on the MoniShield server. Run by the "deploy" job of .github/workflows/ci.yml over SSH
# (stdin), or by hand on the server:  PORTFOLIO_TAG=latest bash deploy/remote-deploy.sh
#
# Expects in $DEPLOY_DIR:  docker-compose.yml (copied from deploy/docker-compose.server.yml)  and  .env (created by hand).
# Idempotent: creates the portfolio role/database in MoniShield's PostgreSQL only when missing.
set -euo pipefail

DIR=${DEPLOY_DIR:-/srv/web-portofolio}
export PORTFOLIO_TAG=${PORTFOLIO_TAG:-latest}
NETWORK=${MONISHIELD_NETWORK:-monishield_default}
HEALTH_WAIT=${DEPLOY_HEALTH_WAIT:-240}

say() { printf '==> %s\n' "$*"; }
fail() { echo "error: $*" >&2; exit 1; }

cd "$DIR" || fail "$DIR does not exist"
[ -f docker-compose.yml ] || fail "$DIR/docker-compose.yml is missing"
[ -f .env ] || fail "$DIR/.env is missing. Create it from deploy/.env.server.example (README, section Deploy)."
grep -q '^PORTFOLIO_DOMAIN=' .env \
  || fail "$DIR/.env is not the server .env (no PORTFOLIO_DOMAIN). Create it from deploy/.env.server.example."

# Only the server compose file: a docker-compose.override.yml from a repo checkout (development ports,
# a "db" service) would otherwise be merged in automatically.
export COMPOSE_FILE=docker-compose.yml
if [ -e docker-compose.override.yml ] || [ -d .git ]; then
  echo "warning: $DIR looks like a repo checkout; only .env, docker-compose.yml and backups/ are needed here" >&2
fi

# Read single values from .env without sourcing it (values may contain shell characters)
env_value() {
  local v
  v=$(sed -n "s/^$1=//p" .env | tail -n 1)
  v=${v%\"}; v=${v#\"}; v=${v%\'}; v=${v#\'}
  printf '%s' "${v:-$2}"
}
DB_NAME=$(env_value PORTFOLIO_DB_NAME portfolio)
DB_USER=$(env_value PORTFOLIO_DB_USER portfolio)
DB_PASSWORD=$(env_value PORTFOLIO_DB_PASSWORD '')
[ -n "$DB_PASSWORD" ] || fail "PORTFOLIO_DB_PASSWORD is empty in .env"

# ---------------------------------------------------------------- MoniShield's PostgreSQL
docker network inspect "$NETWORK" >/dev/null 2>&1 \
  || fail "Docker network $NETWORK not found. Is MoniShield running? (set MONISHIELD_NETWORK if its name differs)"
PG=$(docker ps -q --filter label=com.docker.compose.project=monishield --filter label=com.docker.compose.service=postgres | head -n 1)
[ -n "$PG" ] || fail "MoniShield's postgres container is not running"

say "ensuring database '$DB_NAME' and role '$DB_USER' exist in MoniShield's PostgreSQL"
# The password travels as an environment variable (not on a command line, so it never shows in `ps`)
PORTFOLIO_DB_PASSWORD="$DB_PASSWORD" docker exec -i -e PORTFOLIO_DB_PASSWORD "$PG" \
  psql -v ON_ERROR_STOP=1 -q -U monishield -d monishield -v db="$DB_NAME" -v role="$DB_USER" <<'SQL'
\getenv pw PORTFOLIO_DB_PASSWORD
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'role', :'pw')
 WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'role') \gexec
SELECT format('ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD %L', :'role', :'pw') \gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'db', :'role')
 WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db') \gexec
-- the portfolio role must not be able to open MoniShield's database (its owner keeps access)
REVOKE CONNECT ON DATABASE monishield FROM PUBLIC;
SQL

# ---------------------------------------------------------------- containers
mkdir -p backups
say "pulling images (tag $PORTFOLIO_TAG)"
docker compose pull --quiet
say "starting containers"
docker compose up -d --remove-orphans

api=$(docker compose ps -q api)
status=unknown
for _ in $(seq 1 "$HEALTH_WAIT"); do
  status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$api")
  [ "$status" = healthy ] && break
  sleep 1
done
if [ "$status" != healthy ]; then
  echo "error: api is '$status' after ${HEALTH_WAIT}s; last log lines:" >&2
  docker compose logs --tail 60 api >&2
  exit 1
fi

docker image prune -f >/dev/null
say "deployed $PORTFOLIO_TAG: api is healthy"
docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}' | grep -E 'NAME|portfolio|monishield' || true
