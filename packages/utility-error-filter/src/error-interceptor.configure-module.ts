import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ErrorInterceptorModuleConfig } from './models';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ErrorInterceptorModuleConfig>({
    moduleName: 'ErrorInterceptor',
  }).build();
