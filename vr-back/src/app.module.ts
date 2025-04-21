import { randomUUID } from 'crypto';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { LoggerModule, Params as PinoParams } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule,
    // ConfigModule.forRoot({
    //   // isGlobal: true, // Makes the ConfigService available everywhere
    //   // You can optionally specify a .env file path here:
    //   // envFilePath: '.env',
    // }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return <PinoParams>{
          pinoHttp: {
            // Use 'autoLogging: false' if you want to manually log requests/responses
            // autoLogging: false,
            // Generate a request ID automatically (you might have your own middleware)
            genReqId(req, res) {
              return (
                req.headers['x-request-id'] ??
                res.getHeader('X-Request-Id') ??
                randomUUID()
              );
            },
            // Add custom properties to the log, like the request ID under a specific key
            customProps(req /*, res */) {
              return {
                requestId: req.id, // req.id is populated by genReqId
              };
            },
            transport: !configService.get<boolean>('PINO_LOGGER_PRETTY')
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    colorizeObjects: true,
                    singleLine: true,
                  },
                },
            level: configService.get<string>('PINO_LOGGER_LEVEL', 'info'),
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      // name: 'VRBack',
      imports: [ConfigModule],
      // provide: TYPEORM_MODULE_OPTIONS==='TypeOrmModuleOptions',
      useFactory(configService: ConfigService) {
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USER', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: configService.get<string>('DATABASE_NAME', 'user_db'),
          synchronize: false, // Auto-creates database schema, use with caution in production
          autoLoadEntities: true,
        };
      },
      // inject into { provide: TYPEORM_MODULE_OPTIONS }
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
