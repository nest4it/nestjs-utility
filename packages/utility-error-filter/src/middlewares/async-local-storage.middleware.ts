// src/middlewares/async-local-storage.middleware.ts
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
      const correlationId = req.headers['x-correlation-id'] || uuidv4();
      this.asyncLocalStorage.getStore().set('correlationId', correlationId);
      next();
    });
  }
}
