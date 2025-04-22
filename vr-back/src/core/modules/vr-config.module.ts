import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class VRConfigService {
  constructor(protected readonly configService: ConfigService) {}

  getPinoConfig() {
    return {
      pretty: this.configService.get<boolean>('PINO_LOGGER_PRETTY'),
      level: this.configService.get<string>('PINO_LOGGER_LEVEL', 'info'),
    };
  }

  getPostgresConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      username: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      autoLoadEntities: true,
      retryAttempts: 5 as number,
      logging: ['query'],
    };
  }
}

@Module({
  imports: [
    ConfigModule,
    // ConfigModule.forRoot({
    //   // isGlobal: true, // Makes the ConfigService available everywhere
    //   // You can optionally specify a .env file path here:
    //   // envFilePath: '.env',
    // }),
  ],
  providers: [VRConfigService],
  exports: [VRConfigService],
})
export class VRConfigModule {}
