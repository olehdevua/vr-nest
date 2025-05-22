database_name=${DATABASE_NAME:-'vr-back-too'}
database_host=${DATABASE_HOST:-'localhost'}
database_user=${DATABASE_USER:-'vr-moo'}
database_password=${DATABASE_PASSWORD:-'deadbeef'}

give_db_access () {
  local create_role_cmd="CREATE USER \"$database_user\" ENCRYPTED PASSWORD '$database_password'"
  local give_db_access="GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"$database_user\""
  local cmd="$create_role_cmd; $give_db_access"

  local container_id=$(docker container ps --filter ancestor=postgres:17-bookworm --quiet)
# local container_ip=$(docker container inspect $container_id -f "{{.NetworkSettings.Networks.${DOCKER_NET}.IPAMConfig.IPv4Address}}")

  if [ -n "$container_id" ]; then
    docker container exec -e PGPASSWORD=postgres -e PGHOST=localhost -e PGUSER=postgres "$container_id" psql -c "$cmd"
  else
    docker container run -t --rm --network=host -e PGHOST=localhost -e PGUSER=postgres -e PGPASSWORD=postgres postgres:17-bookworm psql -c "$cmd"
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

give_db_access
exit 0
