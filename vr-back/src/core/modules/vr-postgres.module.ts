import { VRConfigModule, VRConfigService } from './vr-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({})
export class VRPostgresModule {
  static forRootAsync() {
    const dbModule = TypeOrmModule.forRootAsync({
      // name: 'VRBack',
      imports: [VRConfigModule],
      // inject into { provide: TYPEORM_MODULE_OPTIONS }
      // Used for:
      // return { provide: TYPEORM_MODULE_OPTIONS, useFactory: options.useFactory, inject: options.inject || [] };
      inject: [VRConfigService],
      useFactory(configService: VRConfigService) {
        return configService.getPostgresConfig();
      },
    });
    return {
      module: VRPostgresModule,
      imports: [VRConfigModule, dbModule],
      providers: [...(dbModule.providers ?? [])],
      exports: [...(dbModule.exports ?? [])],
    };
  }
}

export const typeormPostgresModule = {};
