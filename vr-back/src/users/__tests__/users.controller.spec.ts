/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import request from 'supertest';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from '../users.module';
import { VRConfigService } from '../../core/modules/vr-config.module';
import { TestConfigService } from './_utils';
import { UserDto } from '../dto/user.dto';

describe('UserController', () => {
  let module: TestingModule;
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
  });

  afterAll(async () => {
    if (module) await module.close();
  });

  it('should get user after create it', async () => {
    const EMAIL = 'oleh-test233@mail.com';
    const server = request(app.getHttpServer());

    const createResp = await server
      .post('/users')
      .send({ email: EMAIL, password: 'Deadbeef12' });
    const createBody = createResp.body as { content: UserDto };

    expect(createResp.status).toBe(201);
    expect(createBody).toMatchObject({
      content: {
        id: expect.any(String),
        email: EMAIL,
      },
    });

    const listResp = await server.get(`/users/${createBody.content.id}`);

    expect(listResp.status).toBe(200);
    expect(listResp.body).toMatchObject({
      content: {
        id: createBody.content.id,
        name: null,
        email: EMAIL,
      },
    });
  });
});
