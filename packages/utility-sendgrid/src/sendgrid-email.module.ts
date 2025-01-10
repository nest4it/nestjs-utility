import { Inject, Module, OnModuleInit } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './sendgrid-email.configure-module';
import { SendGridEmailModuleConfig } from './models';
import * as sendgrid from '@sendgrid/mail';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailSubscriberService } from './subscribers/email.subscribers';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
    }),
  ],
  providers: [EmailSubscriberService],
})
export class SendGridEmailModule extends ConfigurableModuleClass implements OnModuleInit {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: SendGridEmailModuleConfig) {
    super();
  }

  onModuleInit() {
    sendgrid.setApiKey(this.options.apiKey);
  }
}
