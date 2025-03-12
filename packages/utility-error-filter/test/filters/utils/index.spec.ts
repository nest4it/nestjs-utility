import { HttpException } from '@nestjs/common';
import {
  isString,
  isArray,
  isObject,
  getErrorResponse,
  getStatus,
  getRequestId,
  makeCreateExceptionObj,
  createLogLine,
  toExceptionResponse,
  isRecoverable,
  isInternalError,
} from '../../../src/filters/utils';
import { AsyncLocalStorage } from 'async_hooks';

describe('isString', () => {
  it('should return true if the input is a string', () => {
    expect(isString('string')).toBe(true);
  });

  it('should return false if the input is not a string', () => {
    expect(isString(123)).toBe(false);
  });
});

describe('isArray', () => {
  it('should return true if the input is an array', () => {
    expect(isArray([1, 2, 3])).toBe(true);
  });

  it('should return false if the input is not an array', () => {
    expect(isArray('string')).toBe(false);
  });
});

describe('isObject', () => {
  it('should return true if the input is an object', () => {
    expect(isObject({ key: 'value' })).toBe(true);
  });

  it('should return false if the input is not an object', () => {
    expect(isObject('string')).toBe(false);
  });
});

describe('getErrorResponse', () => {
  it('should return the exception message if the exception is not an HttpException', () => {
    const exception = new Error('error message');
    expect(getErrorResponse(exception)).toBe('error message');
  });

  it('should return the response message if the response is a string', () => {
    const exception = new HttpException('string error message', 500);
    expect(getErrorResponse(exception)).toBe('string error message');
  });

  it('should return the response if the response is an array', () => {
    const exception = new HttpException(['array error message'], 500);
    expect(getErrorResponse(exception)).toEqual(['array error message']);
  });

  it('should return the response error if the response is an object', () => {
    const exception = new HttpException({ error: 'object error message' }, 500);
    expect(getErrorResponse(exception)).toBe('object error message');
  });
});

describe('getStatus', () => {
  it('should return the status of the exception if it is an HttpException', () => {
    const exception = new HttpException('error message', 404);
    expect(getStatus(exception)).toBe(404);
  });

  it('should return 500 if the exception is not an HttpException', () => {
    const exception = new Error('error message');
    expect(getStatus(exception)).toBe(500);
  });
});

describe('getRequestId', () => {
  let asyncLocalStorage: AsyncLocalStorage<Map<string, any>>;

  beforeEach(() => {
    asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();
  });

  it('should return requestId when stored in AsyncLocalStorage', () => {
    asyncLocalStorage.run(new Map(), () => {
      const store = asyncLocalStorage.getStore();
      store.set('requestId', 'test-request-id');

      const result = getRequestId(asyncLocalStorage);
      expect(result).toEqual({ requestId: 'test-request-id' });
    });
  });

  it('should return { requestId: null } when store exists but does not contain requestId', () => {
    asyncLocalStorage.run(new Map(), () => {
      const result = getRequestId(asyncLocalStorage);
      expect(result).toEqual({ requestId: null });
    });
  });

  it('should return an empty object {} when AsyncLocalStorage store is not available', () => {
    const result = getRequestId(asyncLocalStorage);
    expect(result).toEqual({});
  });
});

describe('isRecoverable', () => {
  it('should return true for status < 500', () => {
    const error400 = { status: 400 } as any;
    const error404 = { status: 404 } as any;

    expect(isRecoverable(error400)).toBe(true);
    expect(isRecoverable(error404)).toBe(true);
  });

  it('should return false for status >= 500', () => {
    const error500 = { status: 500 } as any;
    const error503 = { status: 503 } as any;

    expect(isRecoverable(error500)).toBe(false);
    expect(isRecoverable(error503)).toBe(false);
  });
});

describe('isInternalError', () => {
  it('should return true for status >= 500', () => {
    const error500 = { status: 500 } as any;
    const error503 = { status: 503 } as any;

    expect(isInternalError(error500)).toBe(true);
    expect(isInternalError(error503)).toBe(true);
  });

  it('should return false for status < 500', () => {
    const error400 = { status: 400 } as any;
    const error404 = { status: 404 } as any;

    expect(isInternalError(error400)).toBe(false);
    expect(isInternalError(error404)).toBe(false);
  });
});

describe('toExceptionResponse', () => {
  let mockException: ReturnType<ReturnType<typeof makeCreateExceptionObj>>;

  beforeEach(() => {
    mockException = {
      cause: new Error('Mocked error'),
      path: '/test-endpoint',
      method: 'POST',
      status: 500,
      message: 'Test error occurred',
      error: 'Mocked error',
      requestId: { requestId: 'test-request-id' },
      res: { error: 'Internal Server Error' } as any,
      stack: 'Mocked stack trace',
      time: '2024-02-05T12:00:00Z',
    };
  });

  it('should correctly map ExceptionObj fields to response format', () => {
    const expectedResponse = {
      path: '/test-endpoint',
      method: 'POST',
      status: 500,
      message: 'Test error occurred',
      error: 'Internal Server Error',
      time: '2024-02-05T12:00:00Z',
    };

    expect(toExceptionResponse(mockException)).toEqual(expectedResponse);
  });

  it('should handle missing error field in res gracefully', () => {
    mockException.res = {} as any; // Simulating response without an error field

    const expectedResponse = {
      path: '/test-endpoint',
      method: 'POST',
      status: 500,
      message: 'Test error occurred',
      error: undefined, // Since res.error is missing
      time: '2024-02-05T12:00:00Z',
    };

    expect(toExceptionResponse(mockException)).toEqual(expectedResponse);
  });
});

describe('createLogLine', () => {
  let mockException: ReturnType<ReturnType<typeof makeCreateExceptionObj>>;

  beforeEach(() => {
    mockException = {
      cause: new Error('Mocked error'),
      path: '/test-endpoint',
      method: 'POST',
      status: 500,
      message: 'Test error occurred',
      error: 'Mocked error',
      requestId: { requestId: 'test-request-id' },
      res: { error: 'Internal Server Error' } as any,
      stack: 'Mocked stack trace',
      time: '2024-02-05T12:00:00Z',
    };
  });

  it('should correctly format log entry with all fields', () => {
    const severity = 'ERROR';
    const logEntry = createLogLine(mockException, severity);

    expect(logEntry).toEqual([
      'Test error occurred',
      'Mocked stack trace',
      {
        cause: new Error('Mocked error'),
        method: 'POST',
        path: '/test-endpoint',
        status: 500,
        requestId: { requestId: 'test-request-id' },
        stack: 'Mocked stack trace',
        severity: 'ERROR',
      },
    ]);
  });

  it('should correctly handle a null requestId', () => {
    mockException.requestId = null;
    const severity = 'WARNING';
    const logEntry = createLogLine(mockException, severity);

    expect(logEntry).toEqual([
      'Test error occurred',
      'Mocked stack trace',
      {
        cause: new Error('Mocked error'),
        method: 'POST',
        path: '/test-endpoint',
        status: 500,
        requestId: null,
        stack: 'Mocked stack trace',
        severity: 'WARNING',
      },
    ]);
  });

  it('should correctly map severity values', () => {
    const severity = 'CRITICAL';
    const logEntry = createLogLine(mockException, severity);

    expect(logEntry[2].severity).toBe('CRITICAL');
  });
});

// makeCreateExceptionObj is tested in the e2e tests in error-interceptor.module.spec.ts
