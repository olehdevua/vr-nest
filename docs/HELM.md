# Install

## Install helm

```bash
curl -sSLO https://get.helm.sh/helm-v3.17.3-linux-amd64.tar.gz
curl -sSLO https://get.helm.sh/helm-v3.17.3-linux-amd64.tar.gz.sha256sum
cat helm-v3.17.3-linux-amd64.tar.gz.sha256sum | sha256sum -c --status
tar -xzf helm-v3.17.3-linux-amd64.tar.gz
sudo cp linux-amd64/helm /usr/local/bin/helm

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

## Install postgresql

*Passwords*:
Setting `auth.postgresPassword` is crucial for security.
The chart might require other passwords depending on the configuration
(like `auth.password` for a default app user or `auth.replicationPassword` if replication is enabled).
**Do not use default passwords in production.**
Use *Helm* secrets management for better security.

By default, newer *Bitnami charts* often enable persistence using your cluster's *default StorageClass*.
Check the chart's values `helm show values bitnami/postgresql`
to confirm defaults for persistence size, storage class, etc.

```bash

# Create a namespace (optional, but recommended)
kubectl create namespace postgresql

# Install PostgreSQL using Helm
# IMPORTANT: Replace 'YourPostgresPassword' and 'YourReplicationPassword' with strong, secure passwords!
helm install postgresql-release bitnami/postgresql \
  --namespace postgresql \
  --set auth.postgresPassword='YourPostgresPassword' \
  --set auth.replicationPassword='YourReplicationPassword'
  # Add other --set flags or a --values file for more configuration (persistence, resources, etc.)

# --- Example with Persistence (uses default StorageClass) ---
# helm install postgresql-release bitnami/postgresql \
#  --namespace postgresql \
#  --set auth.postgresPassword='YourPostgresPassword' \
#  --set auth.replicationPassword='YourReplicationPassword' \
#  --set primary.persistence.enabled=true \
#  --set primary.persistence.size=8Gi

helm show values bitnami/postgresql

# **Check status after installation**
kubectl get pods -n postgresql -w # Wait for pods to be Ready
kubectl get svc -n postgresql     # See the created service(s)
kubectl get pvc -n postgresql     # See PersistentVolumeClaims if persistence is enabled
helm status postgresql-release -n postgresql
```

*postgresql* can be accessed via port `5432` on the following *DNS* names from within your *cluster*:

    postgresql-release.postgresql.svc.cluster.local - Read/Write connection

```bash
# To get the password for "postgres" run:
export POSTGRES_PASSWORD=$(kubectl get secret --namespace postgresql postgresql-release -o jsonpath="{.data.postgres-password}" | base64 -d)

# To connect to your database run the following command:
kubectl run postgresql-release-client --rm --tty -i --restart='Never' --namespace postgresql \
  --image docker.io/bitnami/postgresql:17.4.0-debian-12-r15 \
  --env="PGPASSWORD=$POSTGRES_PASSWORD" \
  --command -- \
    psql --host postgresql-release -U postgres -d postgres -p 5432

# NOTE: If you access the container using bash, make sure that you execute <code_below>
# in order to avoid the error
# "psql: local user with ID 1001} does not exist"
/opt/bitnami/scripts/postgresql/entrypoint.sh /bin/bash

# To connect to your database from outside the cluster execute the following commands:
kubectl port-forward --namespace postgresql svc/postgresql-release 5432:5432 &
PGPASSWORD="$POSTGRES_PASSWORD" psql --host 127.0.0.1 -U postgres -d postgres -p 5432
```

*WARNING:*
The configured password will be ignored on new installation in case when previous *postgresql release*
was deleted through the helm command.
In that case, old `PVC` will have an old password, and setting it through helm won't take effect.
Deleting persistent volumes *PVs* will solve the issue.

*WARNING:*
There are "resources" sections in the chart not set.
Using "resourcesPreset" is not recommended for production.
For production installations, please set the following values according to your workload needs:
- primary.resources
- readReplicas.resources
  +info https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/


--------------------------------------------------------------------------------

## Install Kafka

*Persistence*: (`persistence.enabled=true`, `persistence.size`) - Highly recommended.
*Authentication/Authorization*: (e.g., SASL, TLS) - Crucial for security.
*Listeners*: How clients connect (internal, external via LoadBalancer/NodePort).
*Zookeeper/KRaft*: Check the chart's default mode (`zookeeper.enabled`, `kraft.enabled`).


```bash
# Create a namespace (optional, but recommended)
kubectl create namespace kafka

# Install Kafka using Helm
helm install kafka-release bitnami/kafka \
  --namespace kafka
  # Add --set flags or a --values file for more configuration

# --- Example with Persistence & potentially simplified setup (CHECK CHART DEFAULTS!) ---
# Note: Bitnami Kafka chart options change frequently. Always check current values.
# This example might enable persistence and use KRaft (no Zookeeper) if that's the chart default.
# helm install kafka-release bitnami/kafka \
#  --namespace kafka \
#  --set persistence.enabled=true \
#  --set persistence.size=8Gi
#  # Add settings for authentication, external access, listeners etc. as needed

helm show values bitnami/kafka

kubectl get pods -n kafka -w # Wait for pods/statefulsets to be Ready
kubectl get svc -n kafka
kubectl get statefulset -n kafka
kubectl get pvc -n kafka # If persistence is enabled
helm status kafka-release -n kafka
```

Kafka can be accessed by consumers via port `9092` on the following *DNS* name from within your *cluster*:

    kafka-release.kafka.svc.cluster.local

Each *Kafka broker* can be accessed by producers via port 9092 on the following *DNS* name(s) from within your *cluster*:

    kafka-release-controller-0.kafka-release-controller-headless.kafka.svc.cluster.local:9092
    kafka-release-controller-1.kafka-release-controller-headless.kafka.svc.cluster.local:9092
    kafka-release-controller-2.kafka-release-controller-headless.kafka.svc.cluster.local:9092

The *CLIENT listener* for Kafka client connections from within your cluster have been
configured with the following security settings:
- SASL authentication

To connect a client to your Kafka, you need to create
the `'client.properties'` configuration files with the content below:

    security.protocol=SASL_PLAINTEXT
    sasl.mechanism=SCRAM-SHA-256
    sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required \
    username="user1" \
    password="$(kubectl get secret kafka-release-user-passwords --namespace kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1)";

To create a pod that you can use as a Kafka client run the following commands:

```bash
kubectl run kafka-release-client --restart='Never' --image docker.io/bitnami/kafka:4.0.0-debian-12-r0 --namespace kafka --command -- sleep infinity
kubectl cp --namespace kafka /path/to/client.properties kafka-release-client:/tmp/client.properties
kubectl exec --tty -i kafka-release-client --namespace kafka -- bash

# PRODUCER:
kafka-console-producer.sh \
    --producer.config /tmp/client.properties \
    --bootstrap-server kafka-release.kafka.svc.cluster.local:9092 \
    --topic test

# CONSUMER:
kafka-console-consumer.sh \
    --consumer.config /tmp/client.properties \
    --bootstrap-server kafka-release.kafka.svc.cluster.local:9092 \
    --topic test \
    --from-beginning
```

*WARNING:*
There are "resources" sections in the chart not set.
Using "resourcesPreset" is not recommended for production.
For production installations, please set the following values according to your workload needs:
- controller.resources
- defaultInitContainers.prepareConfig.resources
  +info https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
