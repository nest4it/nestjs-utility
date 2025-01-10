import type { MailDataRequired } from '@sendgrid/mail';

export interface EmailEventStart {
  data: MailDataRequired;
  error: null;
  createdAt: Date;
  eventId: string;
  opts: {
    retries: number;
  };
}

export interface EmailEventError extends Omit<EmailEventStart, 'error'> {
  error: Error;
}

export interface EmailEventReady extends Omit<EmailEventStart, 'error'> {
  error: null;
}
