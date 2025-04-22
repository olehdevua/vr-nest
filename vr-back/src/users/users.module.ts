import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepo } from './repos/user.repo';
import { loggerModule } from '../core/modules/logger.module';
import {
  VRConfigModule,
  VRConfigService,
} from '../core/modules/vr-config.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      // name: 'VRBack',
      imports: [VRConfigModule],
      // inject into { provide: TYPEORM_MODULE_OPTIONS }
      // Used for:
      // return { provide: TYPEORM_MODULE_OPTIONS, useFactory: options.useFactory, inject: options.inject || [] };
      inject: [VRConfigService],
      useFactory(configService: VRConfigService) {
        return configService.getPostgresConfig();
      },
    }),
    TypeOrmModule.forFeature([User]),
    loggerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepo],
  exports: [UsersService],
})
export class UsersModule {}
