import { Inject } from '@nestjs/common';
import { SLACK_CLIENT } from '../constants';
import { Message, Section } from 'slack-block-builder';
import type { ErrorObj } from '../models';

export const createAlert = (emoji: string, severity: string) => (obj: ErrorObj) =>
  Message()
    .asUser()
    .blocks(
      Section({ text: `:${emoji}: *${obj.message}* :${emoji}:` }),
      Section({ text: `*Severity*: ${severity}` }),
      Section({ text: `*Time*: ${new Date().toDateString()}` }),
    )
    .buildToJSON();

export const createFailureAlert = createAlert('warning', 'Failure');
export const createErrorAlert = createAlert('red_circle', 'Error');

export const InjectSlackClient = () => Inject(SLACK_CLIENT);
