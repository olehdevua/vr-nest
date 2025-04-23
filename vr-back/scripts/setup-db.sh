export PGHOST="${PGHOST:-10.22.20.1}"
export PGPASSWORD=deadbeef
export PGUSER=vr
export PGDATABASE=vr-back

export DATABASE_HOST="${DATABASE_HOST:-10.22.20.1}"
export DATABASE_PASSWORD=deadbeef
export DATABASE_USER=vr

set -x

setup_db () {
    local create_role_cmd="create user \"vr\" encrypted password 'deadbeef' createdb"
    local create_db_cmd="create database \"${PGDATABASE}\" owner = vr"

    PGHOST="$PGHOST" PGPASSWORD=postgres PGUSER=postgres PGDATABASE=postgres psql -c "$create_role_cmd"
    PGHOST="$PGHOST" PGPASSWORD=postgres PGUSER=postgres PGDATABASE=postgres psql -c "$create_db_cmd"

    DATABASE_NAME="vr-back" npm run migration:run
}


setup_db
exit 0