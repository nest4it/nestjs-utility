import type { EventEmitter2 } from "@nestjs/event-emitter";
import type { SendGridEmailModuleConfig } from "../../models";
import * as sendgrid from "@sendgrid/mail";
import type { EmailEventStart } from "../../models/events";
import { EMAIL_SEND_READY, EMAIL_SEND_ERROR } from "../../constants";

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const exponentialBackoff = (
  baseDelayMs: number, 
  retries: number
) => wait(baseDelayMs * 2 ** retries);

export const getSendGridEmailReq = (
  conf: SendGridEmailModuleConfig,
  data: sendgrid.MailDataRequired,
): sendgrid.MailDataRequired => ({
  from: conf.fromEmail,
  ...data, // from can be overwritten by event data
});

export const sendEmail = (
  eventEmitter: EventEmitter2,
  opts: SendGridEmailModuleConfig,
  evt: EmailEventStart,
) => sendgrid.send(getSendGridEmailReq(opts, evt.data)).then(res => {
  const [data] = res;

  if (data.statusCode >= 200 && data.statusCode < 300) {
    return eventEmitter.emit(EMAIL_SEND_READY, {
      ...evt,
      data: {
        ...evt.data,
        error: null,
      },
    });
  }

  return eventEmitter.emit(EMAIL_SEND_ERROR, {
    ...evt,
    data: {
      ...evt.data,
      error: data,
    },
  });
})