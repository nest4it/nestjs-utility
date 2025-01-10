import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './error-interceptor.configure-module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { APP_FILTER } from '@nestjs/core';

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
export class ErrorInterceptorModule extends ConfigurableModuleClass {}
