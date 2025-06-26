#!/bin/bash

broker_ids="0,1,2" # broker id's should match your real broker id's
topics=$(kubectl -n qa exec -t kafka-0 -- kafka-topics.sh --list --zookeeper zookeeper:2181)
#topics='controller-device-list-report access-keys-init-6 controller-info-updated'

last_topic=$(echo $topics | awk '{print $NF}')

echo '{"version":1,
  "partitions":['

for t in $topics; do
  sep=',';
  pcount=$( \
    kubectl -n qa exec -t kafka-0 -- kafka-topics.sh \
      --describe \
      --zookeeper zookeeper:2181 \
      --topic $t \
      2>/dev/null \
      | awk '{print $4}' | awk 'NR==1{print $1}' \
  );

  for i in $(seq 0 $[pcount - 1]); do
    if [ "${t}" == "${last_topic}" ] && [ "$[pcount - 1]" == "$i" ]; then sep=''; fi
    echo "    {\"topic\":\"${t}\",\"partition\":${i},\"replicas\":[0,1,2]}$sep"
  done
done

echo '  ]
}'


#while read -r line; do lines+=("$line"); done <<<"$topics"
#echo '{"version":1,
#  "partitions":['
#for t in $topics; do
#    sep=","
#    pcount=$(kafka-topics.sh --describe --zookeeper zookeeper:2181 --topic $t | awk '{print $4}' | awk 'NR==1{print $1}')
##    echo $pcount
#    for i in $(seq 0 $[pcount - 1]); do
#        if [ "${t}" == "${lines[-1]}" ] && [ "$[pcount - 1]" == "$i" ]; then sep=""; fi
#        #randombrokers=$(echo "$broker_ids" | sed -r 's/,/ /g' | tr " " "\n" | shuf | tr  "\n" "," | head -c -1)
#        #echo "    {\"topic\":\"${t}\",\"partition\":${i},\"replicas\":[${randombrokers}]}$sep"
#        echo "    {\"topic\":\"${t}\",\"partition\":${i},\"replicas\":[0,1,2]}$sep"
#    done
#done
#
