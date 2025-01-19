import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FakeController } from './mocks/strategy-fake-module';
import { ApiKeyModule } from '../../src/api-key.module';
import { ApiKeyService } from '../../src/api-key.service';

describe('AuthGuard (Integration)', () => {
  let app: INestApplication;
  let apiKeyService: ApiKeyService;
  let validToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiKeyModule.register({
          apiKeyHeader: 'x-api-key',
          apiKeyHeaderPrefix: 'v1 ',
          secret: 'secret',
        }),
      ],
      controllers: [FakeController],
    }).compile();

    apiKeyService = moduleFixture.get<ApiKeyService>(ApiKeyService);
    const data = { jti: 'test-jti', foo: 'bar' };
    validToken = await apiKeyService.createApiKey(data, '1h');

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow access with a valid apikey', async () => {
    return request(app.getHttpServer())
      .get('/cats')
      .set('x-api-key', `v1 ${validToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          message: 'You have access!',
        });
      });
  });
});

describe('AuthGuard - Blocked', () => {
  let app: INestApplication;
  let apiKeyService: ApiKeyService;
  let expiredToken: string;
  const nonExistentToken: string = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiKeyModule.register({
          apiKeyHeader: 'x-api-key',
          apiKeyHeaderPrefix: 'v1 ',
          secret: 'secret',
        }),
      ],
      controllers: [FakeController],
    }).compile();

    apiKeyService = moduleFixture.get<ApiKeyService>(ApiKeyService);
    const data = { jti: 'test-jti', foo: 'bar' };
    expiredToken = await apiKeyService.createApiKey(data, '1s');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Should deny access based on expired token', async () => {
    return request(app.getHttpServer())
      .get('/cats')
      .set('x-api-key', `v1 ${expiredToken}`)
      .expect(401);
  });

  it('Should deny access based non-existent token', async () => {
    return request(app.getHttpServer())
      .get('/cats')
      .set('x-api-key', `v1 ${nonExistentToken}`)
      .expect(401);
  });
});
