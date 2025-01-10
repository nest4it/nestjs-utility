import { Inject } from '@nestjs/common';
import { SLACK_CLIENT } from '../constants';
import type { ErrorObj } from '../models';

export const createAlert = (emoji: string, severity: string) => (obj: ErrorObj) => ({
  as_user: true,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:${emoji}: *${obj.message}* :${emoji}:`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Severity*: ${severity}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Time*: ${new Date().toDateString()}`,
      },
    },
  ],
});

export const createFailureAlert = createAlert('warning', 'Failure');
export const createErrorAlert = createAlert('red_circle', 'Error');

export const InjectSlackClient = () => Inject(SLACK_CLIENT);
