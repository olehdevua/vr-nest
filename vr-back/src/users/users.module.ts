import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VRLoggerModule } from '../core/modules/vr-logger.module';
import { VRPostgresModule } from '../core/modules/vr-postgres.module';
import { User } from './entities/user.entity';
import { UserRepo } from './repos/user.repo';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { UsersCreateService } from './services/users-create.service';
import { UsersUpdateService } from './services/users-update.service';

@Module({
  imports: [
    VRLoggerModule.forRootAsync(),
    VRPostgresModule.forRootAsync(),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersCreateService, UsersUpdateService, UserRepo],
  exports: [UsersService],
})
export class UsersModule {}
