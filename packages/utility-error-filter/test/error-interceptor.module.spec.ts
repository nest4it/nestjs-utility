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
          enableAsyncLocalStorage: true,
        }),
      ],
      controllers: [FakeController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`should generate a correlationId when none is provided`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(500)
      .expect((res) => {
        expect(res.body).toEqual({
          path: '/cats',
          correlationId: expect.any(String),
          method: 'GET',
          status: 500,
          message: 'FakeController',
          time: expect.any(String),
        });
        expect(res.body.correlationId).not.toEqual('');
      });
  });

  it('should attach correlationId from header when provided', async () => {
    const testCorrelationId = 'test-correlation-id';
    const response = await request(app.getHttpServer())
      .get('/cats')
      .set('x-correlation-id', testCorrelationId)
      .expect(500);
    expect(response.body).toHaveProperty('correlationId', testCorrelationId);
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
          enableAsyncLocalStorage: false,
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

  it('should not attach correlationId even if provided in header', async () => {
    const testCorrelationId = 'test-correlation-id';
    const response = await request(app.getHttpServer())
      .get('/cats')
      .set('x-correlation-id', testCorrelationId)
      .expect(500);
    expect(response.body).not.toHaveProperty('correlationId');
  });

  it('should not attach correlationId when none is provided', async () => {
    const response = await request(app.getHttpServer()).get('/cats').expect(500);
    expect(response.body).not.toHaveProperty('correlationId');
  });

  afterAll(async () => {
    await app.close();
  });
});
