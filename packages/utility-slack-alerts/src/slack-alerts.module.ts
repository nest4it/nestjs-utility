import { Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './slack-alerts.configure-module';
import { createProviders } from './providers';
import { SlackAlertService } from './services';

@Global()
@Module({
  providers: [...createProviders(), SlackAlertService],
  exports: [...createProviders(), SlackAlertService],
})
export class SlackAlertsModule extends ConfigurableModuleClass {}
