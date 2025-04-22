import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepo } from './repos/user.repo';
import { loggerModule } from '../core/modules/vr-logger.module';
import { typeormPostgresModule } from '../core/modules/vr-postgres.module';

@Module({
  imports: [
    loggerModule,
    typeormPostgresModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepo],
  exports: [UsersService],
})
export class UsersModule {}
