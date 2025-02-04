import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { ASYNC_LOCAL_STORAGE } from '../providers/async-local-storage.provider';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AsyncLocalStorageMiddleware implements NestMiddleware {
  constructor(
    @Inject(ASYNC_LOCAL_STORAGE)
    private readonly asyncLocalStorage: AsyncLocalStorage<Map<string, any>>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.asyncLocalStorage.run(new Map(), () => {
      const requestId = req.headers['x-request-id'] || uuidv4();
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || '';
      const requestBody = req.body;
      const requestMethod = req.method;
      const requestUrl = req.originalUrl || req.url;
      const userAgent = (req.headers['user-agent'] as string) || '';
      const timestamp = new Date().toISOString();
      const queryParams = req.query;

      const store = this.asyncLocalStorage.getStore();
      store.set('requestId', requestId);
      store.set('ipAddress', ipAddress);
      store.set('requestBody', requestBody);
      store.set('requestMethod', requestMethod);
      store.set('requestUrl', requestUrl);
      store.set('userAgent', userAgent);
      store.set('timestamp', timestamp);
      store.set('queryParams', queryParams);
      next();
    });
  }
}
