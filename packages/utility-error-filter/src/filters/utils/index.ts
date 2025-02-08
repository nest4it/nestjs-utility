import { type ArgumentsHost, HttpException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ErrorInterceptorModuleConfig } from '../../models';

export type ExceptionObj = ReturnType<ReturnType<typeof makeCreateExceptionObj>>;

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const getErrorResponse = (exception: HttpException | Error) => {
  if (!(exception instanceof HttpException)) {
    return exception.message;
  }

  const exResponse = exception?.getResponse();

  if (isString(exResponse) || isArray(exResponse)) {
    return exResponse;
  }

  if (isObject(exResponse)) {
    return exResponse.message || exResponse.error || 'Unknown error';
  }
};

export const getStatus = (exception: HttpException | Error) =>
  exception instanceof HttpException ? exception.getStatus() : 500;

export const getRequestId = (asyncLocalStorage: AsyncLocalStorage<Map<string, any>>) => {
  const store = asyncLocalStorage.getStore();
  if (!store) {
    return {};
  }
  return {
    requestId: store.get('requestId') ?? null,
  };
};

export const makeCreateExceptionObj =
  (
    options: ErrorInterceptorModuleConfig,
    asyncLocalStorage: AsyncLocalStorage<Map<string, any>>,
  ) =>
  (
    exception: HttpException | Error,
    host: ArgumentsHost,
    customErrorToStatusCodeMap: Map<string, number>,
  ) => {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const stack = exception.stack ?? exception.cause;

    return {
      time: new Date().toISOString(),
      path: request.path,
      method: request.method,
      message: getErrorResponse(exception) ?? 'Internal Server Error',
      error: response.error, // is this needed, as response is provided in line 73?
      requestId: options.useUniqueRequestId ? getRequestId(asyncLocalStorage) : undefined,
      status:
        customErrorToStatusCodeMap.get(exception.name) ??
        getStatus(exception) ??
        response.statusCode ??
        500,

      stack: JSON.stringify(stack ? { stack } : {}),
      res: response,
    };
  };

export const toExceptionResponse = (err: ExceptionObj) => ({
  path: err.path,
  method: err.method,
  status: err.status,
  message: err.message,
  // requestId: err.requestId || null,
  error: err.res.error,
  time: err.time,
});

export const isRecoverable = (err: ExceptionObj) => err.status < 500;
export const isInternalError = (err: ExceptionObj) => err.status >= 500;

export const createLogLine = (
  err: ExceptionObj,
  severity: string,
): [
  unknown,
  string,
  {
    method: string;
    path: string;
    status: number;
    requestId: Record<string, any> | null;
    stack: string;
    severity: string;
  },
] => [
  err.message,
  err.stack,
  {
    method: err.method,
    path: err.path,
    status: err.status,
    requestId: err.requestId,
    stack: err.stack,
    severity,
  },
];
