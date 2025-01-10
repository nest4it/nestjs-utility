import { Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './error-interceptor.configure-module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { SlackAlertsModule } from '@n4it/utility-slack-alerts';
import type { ErrorInterceptorModuleConfig } from './models';

@Module({
  imports: [
    SlackAlertsModule.registerAsync({
      useFactory: (options: ErrorInterceptorModuleConfig) => options.slackWebhook,
      inject: [MODULE_OPTIONS_TOKEN],
    }),
  ],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [GlobalExceptionFilter],
})
export class ErrorInterceptorModule extends ConfigurableModuleClass {}
