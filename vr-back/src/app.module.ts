import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import {
  VRConfigModule,
  VRConfigService,
} from './core/modules/vr-config.module';
import { loggerModule } from './core/modules/logger.module';

@Module({
  imports: [
    VRConfigModule,
    loggerModule,
    TypeOrmModule.forRootAsync({
      // name: 'VRBack',
      imports: [VRConfigModule],
      // inject into { provide: TYPEORM_MODULE_OPTIONS }
      inject: [VRConfigService],
      // provide: TYPEORM_MODULE_OPTIONS==='TypeOrmModuleOptions',
      useFactory(configService: VRConfigService) {
        return configService.getPostgresConfig();
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
