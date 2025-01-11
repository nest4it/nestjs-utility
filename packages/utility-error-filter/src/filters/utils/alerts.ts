import { ExceptionObj } from '.';

export const createAlert = (emoji: string) => (obj: ExceptionObj) => ({
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
        text: obj.stack,
      },
    },
  ],
});

export const createFailureAlert = createAlert('warning');
export const createErrorAlert = createAlert('red_circle');