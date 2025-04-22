## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
export PGHOST=10.22.20.1
export PGPASSWORD=deadbeef
export PGUSER=vr
export PGDATABASE=vr

for worker_id in {7..9}; do
    psql -c "create database vr${worker_id} owner = \"vr\""
    DATABASE_NAME="vr${worker_id}" npm run migration:run
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