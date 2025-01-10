import type { IncomingWebhookDefaultArguments } from '@slack/webhook';

export type SlackAlertsModuleConfig = {
  /**
   * The URL of the Slack webhook.
   */
  url: string;

  /**
   * The default arguments for the Slack webhook.
   */
  options?: IncomingWebhookDefaultArguments;
};

export type ErrorObj = {
  message: string;
};
