# 0-config-changes-to-enable-replication

```toml
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
min.insync.replicas=1
default.replication.factor = 3
```

------------------------------------------------------------

# 1-reassign-replication-for-topic

Kafka issues related to this topic:
* [KIP-455 Create an Administrative API for Replica Reassignment](https://cwiki.apache.org/confluence/display/KAFKA/KIP-455%3A+Create+an+Administrative+API+for+Replica+Reassignment)

------------------------------------------------------------

# 2-increase-partition-replication

Copy output of program to a rollback json config-file

```bash
./bin/kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassingment-json-file ~/src/monosh/devops/docker/kafka/generate/inc-replication-factor.json \
  --execute
```

From what I noticed response is async (not wait while kafka
finish the job)

------------------------------------------------------------

# 3-check-msg-in-group-count

```shell
# sum of non processed messages
# see result of `kafka-run-class.sh` -> "output 1"
kubectl exec -t kafka-0 -- \
  kafka-run-class.sh kafka.admin.ConsumerGroupCommand \
    --group <group> \
    --bootstrap-server localhost:9092 \
    --describe \
    | awk '{print $6}' | grep [0-9] | awk '{s+=$1} END {printf "%.0f\n", s}'
```

**output 1**

    GROUP           TOPIC                 PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID                                                        HOST            CLIENT-ID
    storage-mover   public-storage-update 14         196             196             0               storage-mover-consumer-client-f7eec9b5-5c96-4173-ad08-6846b012d32a /10.42.10.236   storage-mover-consumer-client
    storage-mover   public-storage-update 19         196             196             0               storage-mover-consumer-client-f7eec9b5-5c96-4173-ad08-6846b012d32a /10.42.10.236   storage-mover-consumer-client
    ...
    storage-mover   public-storage-update 0          203             203             0               storage-mover-consumer-client-f7eec9b5-5c96-4173-ad08-6846b012d32a /10.42.10.236   storage-mover-consumer-client

