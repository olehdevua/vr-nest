#kafka_dir='kafka_2.13-2.8.1'
kafka_dir='kafka_2.13-3.0.0'
download_url="https://dlcdn.apache.org/kafka/3.0.0/${kafka_dir}.tgz"
#download_url="https://apache.volia.net/kafka/2.8.1/${kafka_dir}.tgz"
#download_url="https://dlcdn.apache.org/kafka/2.8.0/${kafka_dir}.tgz"

echo 'build kafka image'

if [ ! -d "${kafka_dir}" ]; then
  curl -sSL "${download_url}" | tar -xzf -
  echo "kafka is downloaded and unpacked..."
else
  echo "kafka is already downloaded!"
fi

#for i in {2..4}; do
#  id=${i} \
#  port="909${i}" \
#  adv_addr="192.168.0.101:909${i}" \
#  repl_factor=1 \
#  envsubst < config/server-tmpl.properties > config/server-${i}.properties
#done


#docker image build \
#  -t oleh-kafka \
#  -f Dockerfile \
#  --build-arg kafka_source_dir=${kafka_dir} \
#  .
#echo "image is built..."

#echo "run zookeeper"
#docker container run -dt --rm \
#  --name oleh-kafka-zookeeper \
#  --network host \
#  -v oleh-kafka-zookeeper:/opt/zookeeper-snapshot \
#  oleh-kafka \
#  ./bin/zookeeper-server-start.sh config/zookeeper.properties


#echo "run kafka server"
#for i in {2..4}; do
#  docker container run -dt --rm \
#    --name oleh-kafka-server-${i} \
#    --network host \
#    -v oleh-kafka-server-${i}:/opt/kafka-log-files \
#    oleh-kafka \
#    ./bin/kafka-server-start.sh config/server-${i}.properties
#done


#echo "create topic"
#docker container exec -it oleh-kafka-server \
#  ./bin/kafka-topics.sh \
#    --create \
#    --bootstrap-server 192.168.11.166:9092 \
#    --topic public-storage-update
