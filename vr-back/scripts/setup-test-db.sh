export DATABASE_HOST="${DATABASE_HOST:-10.22.20.1}"
export DATABASE_PASSWORD=deadbeef
export DATABASE_USER=vr

for worker_id in {0..4}; do
  DATABASE_NAME="vr-back${worker_id}" npm run migration:run
done