// src/providers/async-local-storage.provider.ts
import { AsyncLocalStorage } from 'async_hooks';

export const ASYNC_LOCAL_STORAGE = 'ASYNC_LOCAL_STORAGE';

export const asyncLocalStorageProvider = {
  provide: ASYNC_LOCAL_STORAGE,
  useValue: new AsyncLocalStorage<Map<string, any>>(),
};
