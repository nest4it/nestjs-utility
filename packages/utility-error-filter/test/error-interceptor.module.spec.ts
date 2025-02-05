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

  it(`should generate a stored_information when none is provided`, () => {
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
          stored_information: expect.objectContaining({
            requestId: expect.any(String),
          }),
        });
        expect(Object.keys(res.body.stored_information).length).toBeGreaterThan(0);
      });
  });

  it('should attach stored_information from header when provided', async () => {
    const testRequestId = 'test-request-id';
    const response = await request(app.getHttpServer())
      .get('/cats')
      .set('x-request-id', testRequestId)
      .expect(500);
    expect(response.body).toHaveProperty('stored_information');
    expect(response.body.stored_information.requestId).toEqual(testRequestId);
    expect(response.body.stored_information).toMatchObject({
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

  it('should not attach stored_information even if provided in header', async () => {
    const test_stored_information = 'test-request-id';
    const response = await request(app.getHttpServer())
      .get('/cats')
      .set('x-request-id', test_stored_information)
      .expect(500);
    expect(response.body).not.toHaveProperty('stored_information');
  });

  it('should not attach stored_information when none is provided', async () => {
    const response = await request(app.getHttpServer()).get('/cats').expect(500);
    expect(response.body).not.toHaveProperty('stored_information');
  });

  afterAll(async () => {
    await app.close();
  });
});
