#!/bin/sh

# we resolve host here, because we run kafka inside docker,
# as result namespaced network hidden behind the bridge + internal dns
# so, when we connect to kafka with `kcat`, it returns `advertised.listeners`
# with internal hostname, which meaningless for program run on host.
# so, we better provide container ip.
#
# Not sure how well it will work inside k8s, but we'll see
ADVERTISED_IP=$(dig +short $HOSTNAME)

if [ -n "${KAFKA_ID}" ]; then
  id="${KAFKA_ID}" \
  port="9092" \
  advertised_host="${ADVERTISED_IP}" \
  zookeeper_host="${ZOOKEEPER_HOST}" \
  repl_factor=1 \
  envsubst < config/server-tmpl.properties > config/server.properties;
fi

for n in {1..3}; do
  if ! (nc -zv zookeeper 2081); then
    echo "wait $n sec";
    sleep $n;
  else
    break
  fi
done

# $0 == /usr/local/bin/docker-entrypoint.sh
# $1 == ./bin/kafka-server-start.sh         <- exmp
# $2 == ./config/server.properties          <- exmp
kafka_command=$1
kafka_properties=$2

# TODO: exec su root -c "$kafka_command $kafka_properties" -- should work

exec $kafka_command $kafka_properties
