## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

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


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


## Typeorm

As you can see below, `forFeature([User])` is called before `.forRootAsync`

```typescript
// app.module.ts
@Module({ imports: [ /*.. , */ TypeOrmModule.forRootAsync({ /*..*/ }), UsersModule, ] /* , ..*/ })
export class AppModule {}

// users/users.module.ts
@Module({ imports: [TypeOrmModule.forFeature([User]), logMod], /*, ..*/ })
export class UsersModule {}

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
Typeorm `forFeature` add entities to `EntitiesMetadataStorage` and provides only specified entities repositories.
When `forRootAsync` in root `app.module.ts` is called it take all entities added by all `forFeature`s, and create
new `DataSource` with all those entities provided by `forFeatures`s
