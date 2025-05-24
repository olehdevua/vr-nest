import { VRConfigService } from '../../core/modules/vr-config.module';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class TestConfigService extends VRConfigService {
  getPostgresConfig() {
    const config = super.getPostgresConfig();

    return {
      ...config,
      // TODO: validate configs
      // TS18048: config.database is possibly undefined
      // TS18048: process.env.JEST_WORKER_ID is possibly undefined
      database:
        (config.database as string) + '' + (process.env.JEST_WORKER_ID ?? '1'),
      retryAttempts: 2 as number,
    } as TypeOrmModuleOptions;
  }
}
