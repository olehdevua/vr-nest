database_name=${DATABASE_NAME:-'vr-back-too'}
database_host=${DATABASE_HOST:-'localhost'}
database_user=${DATABASE_USER:-'vr-moo'}
database_password=${DATABASE_PASSWORD:-'deadbeef'}

setup_db () {
# local create_role_cmd="DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vr') THEN CREATE ROLE \"vr\" WITH LOGIN PASSWORD 'deadbeef' CREATEDB; END IF; END \$\$;"
  local create_role_cmd="create user \"$database_user\" encrypted password '$database_password'"
  local create_db_cmd="create database \"${database_name}\" owner = \"$database_user\""

  local container_id=$(docker container ps --filter ancestor=postgres:17-bookworm --quiet)
# local container_ip=$(docker container inspect $container_id -f "{{.NetworkSettings.Networks.${DOCKER_NET}.IPAMConfig.IPv4Address}}")

  if [ -n "$container_id" ]; then
    docker container exec -e PGPASSWORD=postgres -e PGHOST=localhost -e PGUSER=postgres "$container_id" psql -c "$create_role_cmd"
    docker container exec -e PGPASSWORD=postgres -e PGHOST=localhost -e PGUSER=postgres "$container_id" psql -c "$create_db_cmd"
  else
    docker container run -t --rm --network=host -e PGHOST=localhost -e PGUSER=postgres -e PGPASSWORD=postgres postgres:17-bookworm psql -c "$create_role_cmd"
    docker container run -t --rm --network=host -e PGHOST=localhost -e PGUSER=postgres -e PGPASSWORD=postgres postgres:17-bookworm psql -c "$create_db_cmd"
  fi

  # Hostname Resolution:
  # Crucially, GitHub Actions automatically configures DNS resolution within this job network.
  # It maps the service label (which is "postgres" in your workflow) to the internal IP address
  # of the service container within that specific network.
  DATABASE_NAME="$database_name" \
  DATABASE_HOST="$database_host" \
  DATABASE_USER="$database_user" \
  DATABASE_PASSWORD="$database_password" \
  npm run migration:run
}

setup_db
exit 0
