set -x

database_name=${DATABASE_NAME:-'vr-back'}
database_host=${DATABASE_HOST:-'localhost'}

setup_db () {
# local create_role_cmd="DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vr') THEN CREATE ROLE \"vr\" WITH LOGIN PASSWORD 'deadbeef' CREATEDB; END IF; END \$\$;"
  local create_role_cmd="create user \"vr\" encrypted password 'deadbeef' createdb"
  local create_db_cmd="create database \"${database_name}\" owner = vr"

  local container_name=$(docker container ps --filter ancestor=postgres:17-bookworm --quiet)
# local container_ip=$(docker container inspect $container_name -f "{{.NetworkSettings.Networks.${DOCKER_NET}.IPAMConfig.IPv4Address}}")

  docker container exec -e PGUSER=postgres "$container_name" psql -c "$create_role_cmd"
  docker container exec -e PGUSER=postgres "$container_name" psql -c "$create_db_cmd"

  # Hostname Resolution:
  # Crucially, GitHub Actions automatically configures DNS resolution within this job network.
  # It maps the service label (which is "postgres" in your workflow) to the internal IP address
  # of the service container within that specific network.
  DATABASE_NAME="$database_name" \
  DATABASE_HOST="$database_host" \
  DATABASE_USER=vr \
  DATABASE_PASSWORD=deadbeef \
  npm run migration:run
}

setup_db
exit 0
