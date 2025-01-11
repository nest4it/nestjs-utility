import type { ErrorInterceptorModuleConfig } from './models';
import { MODULE_OPTIONS_TOKEN } from './error-interceptor.configure-module';
import { SLACK_CLIENT } from './constants';
import { IncomingWebhook } from '@slack/webhook';

export const createSlackClient = async (options: ErrorInterceptorModuleConfig) => {
  if (!options.slackWebhook?.url) {
    return null;
  }

  return new IncomingWebhook(options.slackWebhook.url, options.slackWebhook.options);
};

export const createProviders = () => [
  {
    provide: SLACK_CLIENT,
    useFactory: createSlackClient,
    inject: [MODULE_OPTIONS_TOKEN],
  },
];
