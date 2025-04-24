/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { VRConfigService } from '../../core/modules/vr-config.module';
import { User } from '../entities/user.entity';
import { UsersModule } from '../users.module';
import { TestConfigService } from './_utils';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UsersCreateService } from '../services/users-create.service';

describe('UsersCreateService', () => {
  let module: TestingModule;
  let service: UsersCreateService;
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

    service = module.get<UsersCreateService>(UsersCreateService);
    // controller = module.get<UsersController>(UsersController);
    dataSource = module.get<DataSource>(DataSource);

    await dataSource.getRepository(User).delete({});
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create user', async () => {
    const { content } = await service.execute({
      email: 'test@mail.com',
      password: 'Deadbeef12',
    });

    if (!content) {
      expect(content).toBeTruthy();
      return;
    }

    expect(content).toMatchObject({
      id: expect.any(String),
      email: 'test@mail.com',
    });

    const user = await dataSource
      .getRepository(User)
      .findOne({ where: { id: content.id } });

    expect(user).toMatchObject({
      id: expect.any(String),
      email: 'test@mail.com',
    });
  });
});
