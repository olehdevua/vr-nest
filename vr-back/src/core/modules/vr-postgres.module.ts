import { VRConfigModule, VRConfigService } from './vr-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';

export const typeormPostgresModule = TypeOrmModule.forRootAsync({
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
