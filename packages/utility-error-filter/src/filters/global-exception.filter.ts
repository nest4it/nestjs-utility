import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from '../error-interceptor.configure-module';
import { ErrorInterceptorModuleConfig } from '../models';
import {
  createLogLine,
  makeCreateExceptionObj,
  toExceptionResponse,
  isRecoverable,
  isInternalError,
  getRequestId,
} from './utils';
import { HttpAdapterHost } from '@nestjs/core';
import { IncomingWebhook } from '@slack/webhook';
import { SLACK_CLIENT } from '../constants';
import { createErrorAlert, createFailureAlert } from './utils/alerts';
import { ASYNC_LOCAL_STORAGE } from '../providers/async-local-storage.provider';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private createExceptionObj: ReturnType<typeof makeCreateExceptionObj>;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: ErrorInterceptorModuleConfig,
    @Inject(ASYNC_LOCAL_STORAGE)
    private readonly asyncLocalStorage: AsyncLocalStorage<Map<string, any>>,
    @Inject(SLACK_CLIENT) private client: IncomingWebhook,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {
    this.createExceptionObj = makeCreateExceptionObj(
      this.options,
      this.asyncLocalStorage,
    );
  }

  async catch(exception: Error | HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    let requestId = {};
    if (this.options.useUniqueRequestId) {
      requestId = getRequestId(this.asyncLocalStorage);
    }

    const err = this.createExceptionObj(
      exception,
      host,
      this.options.customErrorToStatusCodeMap || new Map(),
    );

    if (this.options.useUniqueRequestId) {
      err.requestId = requestId;
    }

    if (exception instanceof UnauthorizedException) {
      await this.options.onUnauthorized?.(exception, host);
    }

    // http exceptions are considered failures,
    // they are recoverable by user input
    if (isRecoverable(err) && this.options.logFailures) {
      this.logger.warn(...createLogLine(err, 'WARNING'));

      if (this.options.slackWebhook) {
        await this.client.send(createFailureAlert(err)).catch(() => null);
      }
    }

    // internal exceptions are considered errors
    // they are not recoverable by user input
    if (isInternalError(err) && this.options.logErrors) {
      this.logger.error(...createLogLine(err, 'ERROR'));

      if (this.options.slackWebhook) {
        await this.client.send(createErrorAlert(err)).catch(() => null);
      }
    }
    const baseResponse = toExceptionResponse(err);
    const responseBody = this.options.useUniqueRequestId
      ? { ...baseResponse, requestId: err.requestId }
      : baseResponse;

    httpAdapter.reply(err.res, responseBody, err.status);
  }
}
