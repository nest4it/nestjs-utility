import * as request from 'supertest';
import { ErrorInterceptorModule } from '../src/error-interceptor.module';
import { Test } from '@nestjs/testing';
import { FakeController } from './mocks/fake-module';
import { INestApplication } from '@nestjs/common';

describe('ErrorInterceptorModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ErrorInterceptorModule.register({
          logErrors: true,
          useUniqueRequestId: true,
        }),
      ],
      controllers: [FakeController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`should generate a requestId when none is provided`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(500)
      .expect((res) => {
        expect(res.body).toEqual({
          path: '/cats',
          method: 'GET',
          status: 500,
          message: 'FakeController',
          time: expect.any(String),
          requestId: expect.objectContaining({
            requestId: expect.any(String),
          }),
        });
        expect(Object.keys(res.body.requestId).length).toBeGreaterThan(0);
      });
  });

  it('should attach requestId from header when provided', async () => {
    const testRequestId = 'test-request-id';
    const response = await request(app.getHttpServer())
      .get('/cats')
      .set('x-request-id', testRequestId)
      .expect(500);
    expect(response.body).toHaveProperty('requestId');
    expect(response.body.requestId.requestId).toEqual(testRequestId);
    expect(response.body.requestId).toMatchObject({
      requestId: testRequestId,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

describe('GlobalExceptionFilter with AsyncLocalStorage disabled', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ErrorInterceptorModule.register({
          useUniqueRequestId: false,
          logErrors: false,
          logFailures: false,
          customErrorToStatusCodeMap: new Map(),
        }),
      ],
      controllers: [FakeController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should not attach requestId even if provided in header', async () => {
    const test_requestId = 'test-request-id';
    const response = await request(app.getHttpServer())
      .get('/cats')
      .set('x-request-id', test_requestId)
      .expect(500);
    expect(response.body).not.toHaveProperty('requestId');
  });

  it('should not attach requestId when none is provided', async () => {
    const response = await request(app.getHttpServer()).get('/cats').expect(500);
    expect(response.body).not.toHaveProperty('requestId');
  });

  afterAll(async () => {
    await app.close();
  });
});
