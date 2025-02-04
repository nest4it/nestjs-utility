import { type ArgumentsHost, HttpException } from '@nestjs/common';

export type ExceptionObj = ReturnType<typeof createExceptionObj>;

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
    return exResponse.message || exResponse.error;
  }

  return 'Internal Server Error';
};

export const getStatus = (exception: HttpException | Error) =>
  exception instanceof HttpException ? exception.getStatus() : 500;

export const createExceptionObj = (
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
    stored_information: null,
    error: response.error,
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
    stored_information: any | null;
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
    stored_information: err.stored_information,
    stack: err.stack,
    severity,
  },
];
