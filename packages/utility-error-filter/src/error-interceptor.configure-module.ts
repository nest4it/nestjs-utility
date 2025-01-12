import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { ErrorInterceptorModuleConfig } from './models';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ErrorInterceptorModuleConfig>({
  moduleName: 'ErrorInterceptor',
}).build();
