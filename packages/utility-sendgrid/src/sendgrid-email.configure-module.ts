import { ConfigurableModuleBuilder } from '@nestjs/common';
import { SendGridEmailModuleConfig } from './models';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<SendGridEmailModuleConfig>({
    moduleName: 'SendGridEmail',
  })
  .build();