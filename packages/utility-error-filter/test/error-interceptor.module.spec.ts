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
        }),
      ],
      controllers: [FakeController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
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
        });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
