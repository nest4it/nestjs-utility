import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './slack-alerts.configure-module';
import { createProviders } from './providers';
import { SlackAlertService } from './services';

@Module({
  providers: [...createProviders(), SlackAlertService],
  exports: [...createProviders(), SlackAlertService],
})
export class SlackAlertsModule extends ConfigurableModuleClass {}
