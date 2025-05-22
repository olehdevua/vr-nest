FROM node:23-bookworm-slim AS production

USER node
WORKDIR /home/node/app

COPY --chown=1000:1000 ./package.json ./package-lock.json /home/node/app/
RUN npm ci -f --only-production && npm cache clean --force

COPY --chown=1000:1000 . /home/node/app
RUN npm run build

CMD ["node", "dist/src/main"]

LABEL app=vr-back


FROM node:23-bookworm-slim AS development

RUN apt update && apt install -y iproute2 procps \
  && rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /home/node/app

COPY --chown=1000:1000 ./package.json ./package-lock.json /home/node/app/
RUN npm ci && npm cache clean --force

COPY --chown=1000:1000 . /home/node/app
RUN npm run build

LABEL app=vr-back
