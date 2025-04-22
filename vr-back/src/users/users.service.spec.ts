import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { VRConfigService } from '../core/modules/vr-config.module';
import { DataSource } from 'typeorm';
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
      database: config.database + '' + process.env.JEST_WORKER_ID,
    } as const;
  }
}

describe('UsersService', () => {
  let service: UsersService;
  // let controller: UsersController;
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
  });

  it('should be defined', async () => {
    const result = await service.create({
      email: 'test@mail.com',
      password: 'Deadbeef12',
    });

    const user = await dataSource.getRepository(User).find();

    expect(result).toMatchInlineSnapshot();
    expect(user).toMatchInlineSnapshot();
  });
});
