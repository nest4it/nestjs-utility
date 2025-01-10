import type { SlackWebhookConfig } from './models';
import { MODULE_OPTIONS_TOKEN } from './error-interceptor.configure-module';
import { SLACK_CLIENT } from './constants';
import { IncomingWebhook } from '@slack/webhook';

export const createSlackClient = async (options: SlackWebhookConfig) => {
  return new IncomingWebhook(options.url, options.options);
};

export const createProviders = () => [
  {
    provide: SLACK_CLIENT,
    useFactory: createSlackClient,
    inject: [MODULE_OPTIONS_TOKEN],
  },
];
