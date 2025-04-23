import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { VRConfigService } from '../core/modules/vr-config.module';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersModule } from './users.module';

class TestConfigService extends VRConfigService {
  getPostgresConfig() {
    const config = super.getPostgresConfig();

    return {
      ...config,
      // TODO: validate configs
      // TS18048: config.database is possibly undefined
      // TS18048: process.env.JEST_WORKER_ID is possibly undefined
      database:
        (config.database as string) + '' + (process.env.JEST_WORKER_ID ?? '0'),
      retryAttempts: 2 as number,
    } as TypeOrmModuleOptions;
  }
}

describe('UsersService', () => {
  let service: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(VRConfigService)
      .useClass(TestConfigService)
      .compile();

    service = module.get<UsersService>(UsersService);
    // controller = module.get<UsersController>(UsersController);
    dataSource = module.get<DataSource>(DataSource);

    await dataSource.getRepository(User).delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', async () => {
    const { content } = await service.create({
      email: 'test@mail.com',
      password: 'Deadbeef12',
    });

    if (!content) {
      expect(content).toBeTruthy();
      return;
    }

    expect(content).toMatchObject({
      email: 'test@mail.com',
    });

    const user = await dataSource
      .getRepository(User)
      .findOne({ where: { id: content.id } });

    expect(user).toMatchObject({
      id: expect.any(String), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      email: 'test@mail.com',
    });
  });
});
