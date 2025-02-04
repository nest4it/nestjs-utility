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
  createExceptionObj,
  toExceptionResponse,
  isRecoverable,
  isInternalError,
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

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: ErrorInterceptorModuleConfig,
    @Inject(ASYNC_LOCAL_STORAGE)
    private readonly asyncLocalStorage: AsyncLocalStorage<Map<string, any>>,
    @Inject(SLACK_CLIENT) private client: IncomingWebhook,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  async catch(exception: Error | HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    let requestId: string | null = null;
    let ipAddress: string | null = null;
    let requestBody: any | null = null;
    let requestMethod: string | null = null;
    let requestUrl: string | null = null;
    let userAgent: string | null = null;
    let timestamp: string | null = null;
    let queryParams: any | null = null;

    if (this.options.enableAsyncLocalStorage) {
      const store = this.asyncLocalStorage.getStore();
      requestId = store ? store.get('requestId') : null;
      ipAddress = store ? store.get('ipAddress') : null;
      requestBody = store ? store.get('requestBody') : null;
      requestMethod = store ? store.get('requestMethod') : null;
      requestUrl = store ? store.get('requestUrl') : null;
      userAgent = store ? store.get('userAgent') : null;
      timestamp = store ? store.get('timestamp') : null;
      queryParams = store ? store.get('queryParams') : null;
    }

    const err = createExceptionObj(
      exception,
      host,
      this.options.customErrorToStatusCodeMap || new Map(),
    );

    if (this.options.enableAsyncLocalStorage) {
      err.stored_information = {
        requestId: requestId,
        ipAddress: ipAddress,
        requestBody: requestBody,
        requestMethod: requestMethod,
        requestUrl: requestUrl,
        userAgent: userAgent,
        timestamp: timestamp,
        queryParams: queryParams,
      };
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
    const responseBody = this.options.enableAsyncLocalStorage
      ? { ...baseResponse, stored_information: err.stored_information }
      : baseResponse;

    httpAdapter.reply(err.res, responseBody, err.status);
  }
}
