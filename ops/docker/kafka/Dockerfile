ARG kafka_dir="kafka_2.13-3.9.0"
ARG download_url="https://dlcdn.apache.org/kafka/3.9.0/${kafka_dir}.tgz"

#####

FROM alpine:3.15 AS download_stage

ARG download_url

WORKDIR /opt/kafka

RUN apk update && apk add curl tar
RUN curl -sSL "${download_url}" | tar -xzf -

#####

FROM azul/zulu-openjdk-alpine:17 AS run_stage

ARG kafka_dir

RUN apk update && apk add --no-cache bash gettext bind-tools

WORKDIR /opt/kafka

COPY --from=download_stage /opt/kafka/${kafka_dir} .
COPY ./config/* ./config/
# `./docker-entrypoint.sh` on host has `+x` rights, so AFAIU
# this "property" transfers/propagates on file-in-image too
COPY ./docker-entrypoint.sh /usr/local/bin/

LABEL project="oleh.services"

ENTRYPOINT ["docker-entrypoint.sh"]

# RUN for i in $(seq 0 2); do \
#       id=${i} \
#       port="909${i}" \
#       adv_addr="${adv_kafka_host}:909${i}" \
#       repl_factor=1 \
#       envsubst < config/server-tmpl.properties > config/server-${i}.properties; \
#     done
