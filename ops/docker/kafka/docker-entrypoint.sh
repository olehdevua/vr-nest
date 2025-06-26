#!/bin/sh

# we resolve host here, because we run kafka inside docker,
# as result namespaced network hidden behind the bridge + internal dns
# so, when we connect to kafka with `kcat`, it returns `advertised.listeners`
# with internal hostname, which meaningless for program run on host.
# so, we better provide container ip.
#
# Not sure how well it will work inside k8s, but we'll see
ADVERTISED_IP=$(dig +short $HOSTNAME)

# Generate a new cluster ID if it doesn't exist
if [ ! -f "/tmp/cluster_id.txt" ]; then
  echo "Generating new Kafka cluster ID..."
  CLUSTER_ID=$(./bin/kafka-storage.sh random-uuid)
  echo $CLUSTER_ID > /tmp/cluster_id.txt
  echo "Generated cluster ID: $CLUSTER_ID"
else
  CLUSTER_ID=$(cat /tmp/cluster_id.txt)
  echo "Using existing cluster ID: $CLUSTER_ID"
fi

# Define controller quorum voters based on the number of Kafka nodes
CONTROLLER_QUORUM_VOTERS=""
for i in $(seq 0 2); do
  if [ -z "$CONTROLLER_QUORUM_VOTERS" ]; then
    CONTROLLER_QUORUM_VOTERS="$i@kafka-$i:9093"
  else
    CONTROLLER_QUORUM_VOTERS="$CONTROLLER_QUORUM_VOTERS,$i@kafka-$i:9093"
  fi
done

if [ -n "${KAFKA_ID}" ]; then
  id="${KAFKA_ID}" \
  port="9092" \
  controller_port="9093" \
  advertised_host="${ADVERTISED_IP}" \
  process_roles="broker,controller" \
  controller_quorum_voters="${CONTROLLER_QUORUM_VOTERS}" \
  repl_factor=1 \
  envsubst < config/server-tmpl.properties > config/server.properties;
fi

# Format the storage directory if it's empty
if [ ! -d "/opt/kafka-log-files/meta.properties" ]; then
  echo "Formatting Kafka storage directory..."
  ./bin/kafka-storage.sh format -t "$CLUSTER_ID" -c config/server.properties
fi

# $0 == /usr/local/bin/docker-entrypoint.sh
# $1 == ./bin/kafka-server-start.sh         <- exmp
# $2 == ./config/server.properties          <- exmp
kafka_command=$1
kafka_properties=$2

# TODO: exec su root -c "$kafka_command $kafka_properties" -- should work

exec $kafka_command $kafka_properties
