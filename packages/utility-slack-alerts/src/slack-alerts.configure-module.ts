import { ConfigurableModuleBuilder } from '@nestjs/common';
import { SlackAlertsModuleConfig } from './models';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<SlackAlertsModuleConfig>({
    moduleName: 'SlackAlerts',
  }).build();
