import { Inject, Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";

import type { SendGridEmailModuleConfig } from "../models";
import type { EmailEventError, EmailEventReady, EmailEventStart } from "../models/events";

import { MODULE_OPTIONS_TOKEN } from "../sendgrid-email.configure-module";
import { EMAIL_SEND_START, EMAIL_SEND_ERROR, EMAIL_SEND_READY } from "../constants";
import { exponentialBackoff, sendEmail } from "./utils";

@Injectable()
export class EmailSubscriberService {
  private logger = new Logger(EmailSubscriberService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @Inject(MODULE_OPTIONS_TOKEN) private options: SendGridEmailModuleConfig,
  ) {}

  @OnEvent(EMAIL_SEND_START)
  public async eventStart(evt: EmailEventStart) {
    try {
      await this.options.onEventStart?.(evt, this.options);
      return await sendEmail(this.eventEmitter, this.options, evt);
    } catch (error) {
      return this.eventEmitter.emit(EMAIL_SEND_ERROR, {
        ...evt,
        data: {
          ...evt.data,
          error,
        },
      });
    }
  }

  @OnEvent(EMAIL_SEND_READY)
  public async eventReady(evt: EmailEventReady) {
    await this.options.onEventReady?.(evt, this.options);
  }

  @OnEvent(EMAIL_SEND_ERROR)
  public async eventError(evt: EmailEventError) {
    try {
      if (!this.options.exponentialBackoff) {
        if (this.options.logErrors) {
          this.logger.error("Failed to send email", evt.error.stack);
        }
  
        return await this.options.onEventError?.(evt, this.options);
      }

      if (evt.opts.retries >= this.options.exponentialBackoff.maxRetries) {
        if (this.options.logErrors) {
          this.logger.error("Failed to send email", evt.error.stack);
        }

        return await this.options.onEventError?.(evt, this.options);
      }

      return exponentialBackoff(this.options.exponentialBackoff.baseDelayMs, evt.opts.retries).then(() =>
        this.eventEmitter.emit(EMAIL_SEND_START, {
          ...evt,
          data: {
            ...evt.data,
            retries: evt.opts.retries + 1,
          },
        })
      );
    } catch (error) {
      if (this.options.logErrors) {
        this.logger.error("Failed to handle sending emails error", error.stack);
      }
    }
  }
}
