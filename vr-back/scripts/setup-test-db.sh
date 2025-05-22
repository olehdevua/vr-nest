database_name=${DATABASE_NAME:-'vr-back'}
database_host=${DATABASE_HOST:-'localhost'}


abspath=$(readlink -f "$0")
dir_path=${abspath%/*}

setup_test_db () {
  for worker_id in {0..4}; do
#   local create_role_cmd="DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vr') THEN CREATE ROLE \"vr\" WITH LOGIN PASSWORD 'deadbeef' CREATEDB; END IF; END \$\$;"
    DATABASE_NAME="$database_name${worker_id}" \
    DATABASE_HOST=$database_host \
    DATABASE_USER=${DATABASE_USER:-'vr'} \
    DATABASE_PASSWORD=${DATABASE_PASSWORD:-'deadbeef'} \
    bash "$dir_path/setup-db.sh"
  done
}

setup_test_db
exit 0
