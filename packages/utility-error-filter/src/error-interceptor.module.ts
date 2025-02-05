import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './error-interceptor.configure-module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { createProviders } from './providers';
import { asyncLocalStorageProvider } from './providers/async-local-storage.provider';
import { AsyncLocalStorageMiddleware } from './middlewares/async-local-storage.middleware';
import { ErrorInterceptorModuleConfig } from './models';
@Module({
  providers: [
    ...createProviders(),
    asyncLocalStorageProvider,
    GlobalExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [GlobalExceptionFilter],
})
export class ErrorInterceptorModule
  extends ConfigurableModuleClass
  implements NestModule
{
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: ErrorInterceptorModuleConfig,
  ) {
    super();
  }
  configure(consumer: MiddlewareConsumer) {
    if (this.options.useUniqueRequestId) {
      consumer.apply(AsyncLocalStorageMiddleware).forRoutes('*');
    }
  }
}
