## Description

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# create migration
npx typeorm migration:create ./src/migrations/create-vr-back-database

npm run start # development
npm run start:dev # watch mode
npm run start:prod # production mode
```

## Run tests

```bash
export PGHOST=localhost
export PGPASSWORD=YourPostgresPassword
export PGUSER=postgres
export PGDATABASE=postgres

export DATABASE_NAME="vr"
export DATABASE_HOST="10.22.0.1"
export DATABASE_USER="test_user"
export DATABASE_PASSWORD="deadbeef"

docker compose run --rm vr-postgres \
  psql -c "create user \"test_user\" encrypted password 'deadbeef'"

for worker_id in {0..4}; do
    docker compose run --rm vr-postgres \
      psql -c "create database vr${worker_id} owner = \"test_user\""

    docker compose run --build --rm \
      -e DATABASE_NAME="$DATABASE_NAME${worker_id}" \
      vr-back \
      npm run migration:run
#     npm run migration:revert
done


# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

## Typeorm

As you can see below, `forFeature([User])` is called before `.forRootAsync`

```typescript
// app.module.ts
@Module({imports: [ /*.. , */ TypeOrmModule.forRootAsync({ /*..*/}), UsersModule,] /* , ..*/})
export class AppModule {
}

// users/users.module.ts
@Module({imports: [TypeOrmModule.forFeature([User]), logMod], /*, ..*/})
export class UsersModule {
}

```

```
setEntities Error: setEnt
    at EntitiesMetadataStorage.addEntitiesByDataSource (/home/node/app/node_modules/@nestjs/typeorm/dist/entities-metadata.storage.js:8:36)
    at TypeOrmModule.forFeature (/home/node/app/node_modules/@nestjs/typeorm/dist/typeorm.module.js:25:61)
    at Object.<anonymous> (/home/node/app/src/users/users.module.ts:10:27)  <- .forFeature method line
createDataSourceFactory
createDataSourceFactory.lastValueFrom
getEntities Error: getEnt
    at EntitiesMetadataStorage.getEntitiesByDataSource (/home/node/app/node_modules/@nestjs/typeorm/dist/entities-metadata.storage.js:26:36)
    at /home/node/app/node_modules/@nestjs/typeorm/dist/typeorm-core.module.js:180:77
    at Observable._subscribe (/home/node/app/node_modules/rxjs/src/internal/observable/defer.ts:54:15)
```

So, basically...
Typeorm `forFeature` add entities to `EntitiesMetadataStorage` and provides only specified
entities repositories.
When `forRootAsync` in root `app.module.ts` is called it take all entities added by all
`forFeature`s, and create
new `DataSource` with all those entities provided by `forFeatures`s

---

## CustomKafkaServer

### Clarifying `addHandler` vs. `handleMessage`

You are right to look at `addHandler`, but it's important to understand its role.
You **do not need to call** `addHandler` yourself.

* **`addHandler`'s Job:**
  When your NestJS application starts, the framework scans all your controllers for
  decorators like `@MessagePattern()` and `@EventPattern()`.
  For each handler it finds, NestJS automatically calls `server.addHandler(...)`
  on your custom server instance.
  This populates a `Map` of handlers inside the base `Server` class.
  This all happens before `listen()` is ever called.
* **`handleMessage`'s Job:**
  Your responsibility inside `listen()` is to get the raw message from the transport
  (Kafka), deserialize it, and then pass the resulting packet to `this.handleMessage()`.
  The `handleMessage` method (which you correctly implemented) then uses the internal
  handler `Map` (populated by `addHandler`) to find and execute the correct application
  code.

**Conclusion:** Your current approach of calling `this.handleMessage()` is the correct and
intended way to integrate with NestJS's event handling.

### Correcting for the `ReadPacket` `id` Field

You are also 100% correct that the `ReadPacket` interface in TypeScript is defined as
`{ pattern: any; data: T; }` and does not have an `id` property.

So how does request-response correlation work?

The correlation `id` must be part of the **message payload itself** that the client sends.
The default NestJS deserializer is responsible for extracting this `id` from
the raw message and attaching it to the packet object it creates.

The object returned by `this.deserializer.deserialize()` will have the `id` property
at runtime if it existed in the source data, even though the static `ReadPacket`
type doesn't show it.

Here is the adjusted code to handle this correctly.

* **Producer for Replies:**
  A real request-response implementation needs a way to send messages back. I've added a
  `K.Producer` to handle this.
* **Handling the `id` Safely:**
  In `handleMessage`, we now access the correlation ID with `(packet as any).id`.
  This acknowledges that we expect the property to exist at runtime even if the static
  type doesn't include it.
* **Dedicated Reply Logic:**
  The `handleMessage` method is now more robust.
  It checks for a handler and, crucially, checks for a `correlationId`.
  If one exists, it awaits the result from the handler and sends it back using a new
  `sendResponse` method.
* **Reply-To Header:**
  A common pattern in Kafka request-response is for the client to specify which topic
  the server should send the reply to.
  I've added logic to look for a `reply-to` header and use it in the `sendResponse`
  method.
  Your `ClientProxy` implementation would be responsible for adding this header.

---

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
