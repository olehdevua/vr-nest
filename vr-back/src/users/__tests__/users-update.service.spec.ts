import { v1 as uuidV1 } from 'uuid';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { VRConfigService } from '../../core/modules/vr-config.module';
import { UsersModule } from '../users.module';
import { TestConfigService } from './_utils';
import { User } from '../entities/user.entity';
import { UsersUpdateService } from '../services/users-update.service';

describe('UsersUpdateService', () => {
  let module: TestingModule;
  let service: UsersUpdateService;
  let dataSource: DataSource;
  let app: INestApplication<App>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(VRConfigService)
      .useClass(TestConfigService)
      .compile();

    app = module.createNestApplication();
    await app.init();

    service = module.get<UsersUpdateService>(UsersUpdateService);
    dataSource = module.get<DataSource>(DataSource);

    await dataSource.getRepository(User).delete({});
  });

  afterAll(async () => {
    await module.close();
  });

  it('should update user', async () => {
    const userId = uuidV1();

    const user = await User.create({
      email: 'user@email.com',
      password: 'Deadbeef12',
    });
    user.id = userId;

    await dataSource.getRepository(User).insert(user);

    const result = await service.execute(userId, {
      name: 'new name',
    });

    expect(result).toMatchObject({ content: { id: userId } });

    const updatedUser = await dataSource
      .getRepository(User)
      .findOne({ where: { id: userId } });

    expect(updatedUser).toMatchObject({
      id: userId,
      name: 'new name',
      email: 'user@email.com',
    });
  });
});
