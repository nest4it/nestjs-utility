import type { EmailEventError, EmailEventReady, EmailEventStart } from './events';

export type SendGridEmailModuleConfig = {
  /**
   * The SendGrid API key to use for sending emails.
   */
  apiKey: string;

  /**
   * The email address to use as the sender for all emails.
   */
  fromEmail: string;

  /**
   * Whether to log errors when sending emails.
   */
  logErrors?: boolean;

  /**
   * Exponential backoff configuration for retrying failed email sends.
   */
  exponentialBackoff?: {
    /**
     * The number of times to retry sending an email.
     */
    maxRetries: number;

    /**
     * The base number of milliseconds to wait before retrying.
     */
    baseDelayMs: number;
  };

  /**
   * Event handlers for email events.
   */
  onEventStart?: (
    event: EmailEventStart,
    opts?: SendGridEmailModuleConfig,
  ) => Promise<void>;
  onEventError?: (
    event: EmailEventError,
    opts?: SendGridEmailModuleConfig,
  ) => Promise<void>;
  onEventReady?: (
    event: EmailEventReady,
    opts?: SendGridEmailModuleConfig,
  ) => Promise<void>;
};
