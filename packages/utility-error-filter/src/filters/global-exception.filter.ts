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

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: ErrorInterceptorModuleConfig,
    @Inject(SLACK_CLIENT) private client: IncomingWebhook,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  async catch(exception: Error | HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const err = createExceptionObj(
      exception,
      host,
      this.options.customErrorToStatusCodeMap || new Map(),
    );

    if (exception instanceof UnauthorizedException) {
      await this.options.onUnauthorized?.(exception, host);
    }

    // http exceptions are considered failures,
    // they are recoverable by user input
    if (isRecoverable(err) && this.options.logFailures) {
      this.logger.warn(...createLogLine(err, 'WARNING'));

      if (this.options.slackWebhook) {
        await this.client.send(createFailureAlert(err)).catch();
      }
    }

    // internal exceptions are considered errors
    // they are not recoverable by user input
    if (isInternalError(err) && this.options.logErrors) {
      this.logger.error(...createLogLine(err, 'ERROR'));

      if (this.options.slackWebhook) {
        await this.client.send(createErrorAlert(err)).catch();
      }
    }

    httpAdapter.reply(err.res, toExceptionResponse(err), err.status);
  }
}
