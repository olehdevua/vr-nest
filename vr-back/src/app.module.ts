import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { VRConfigModule } from './core/modules/vr-config.module';
import { VRLoggerModule } from './core/modules/vr-logger.module';

@Module({
  imports: [VRLoggerModule.forRootAsync(), VRConfigModule, UsersModule],
  controllers: [AppController],
})
export class AppModule {}
