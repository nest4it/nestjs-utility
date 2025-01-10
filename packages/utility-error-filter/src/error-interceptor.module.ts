import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} from './error-interceptor.configure-module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { SlackAlertsModule } from '@n4it/utility-slack-alerts';
import type { ErrorInterceptorModuleConfig } from './models';

@Module({
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [GlobalExceptionFilter],
})
export class ErrorInterceptorModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      imports: [SlackAlertsModule.register(options.slackWebhook)],
      ...super.register(options),
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      imports: [
        SlackAlertsModule.registerAsync({
          useFactory: (options: ErrorInterceptorModuleConfig) => options.slackWebhook,
          inject: [MODULE_OPTIONS_TOKEN],
        }),
      ],
      ...super.registerAsync(options),
    };
  }
}
