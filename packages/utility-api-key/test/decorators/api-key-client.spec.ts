import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiKeyModule } from '../../src/api-key.module'; // adjust path to your module
import { ApiKeyService } from '../../src/api-key.service'; // if you need to generate a real token
import { FakeUserController } from './mocks/fake-key-client.controller'; // adjust path to your controller
describe('ApiKeyClient Integration', () => {
  let app: INestApplication;
  let apiKeyService: ApiKeyService;
  // let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiKeyModule.register({
          apiKeyHeader: 'x-api-key',
          apiKeyHeaderPrefix: 'v1 ',
          secret: 'secret',
        }),
      ],
      controllers: [FakeUserController],
    }).compile();

    apiKeyService = moduleFixture.get<ApiKeyService>(ApiKeyService);
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/profile (GET) - returns data if valid token is provided', async () => {
    const token = await apiKeyService.createApiKey(
      {
        policies: ['user:manage'],
        role: 'admin',
      },
      '1h',
    );

    // 2. Make a GET request with the Bearer token
    return request(app.getHttpServer())
      .get('/profile')
      .set('x-api-key', `v1 ${token}`)
      .expect(200)
      .expect((res) => {
        // console.log(res.body);
        expect(res.body.userId).toBeDefined();
        expect(res.body.role).toBe('admin');
        expect(res.body.policies).toContain('user:manage');
      });
  });

  it('/profile (GET) - should fail or return 401 if no token is sent', async () => {
    return request(app.getHttpServer()).get('/profile').expect(401);
  });

  it('/profile (GET) - returns error if token is invalid', async () => {
    const invalidToken = 'Bearer invalid.token.xyz';
    return request(app.getHttpServer())
      .get('/profile')
      .set('x-api-key', `v1 ${invalidToken}`)
      .expect(401);
  });
});
