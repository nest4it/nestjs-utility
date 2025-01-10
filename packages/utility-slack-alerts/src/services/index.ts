import { Inject, Injectable } from '@nestjs/common';
import type { ErrorObj } from '../models';
import { createFailureAlert, createErrorAlert } from '../utils';
import { SLACK_CLIENT } from '../constants';
import { IncomingWebhook } from '@slack/webhook';

@Injectable()
export class SlackAlertService {
  constructor(@Inject(SLACK_CLIENT) private client: IncomingWebhook) {}

  async sendFailureAlert(message: ErrorObj) {
    return this.client.send(createFailureAlert(message));
  }

  async sendErrorAlert(message: ErrorObj) {
    return this.client.send(createErrorAlert(message));
  }
}
