import { randomUUID } from 'crypto';
import type { EmailEventStart } from '../models/events';

export const createEmailEvent = (data: Omit<EmailEventStart, 'opts'>) => ({
  data: {
    ...data,
    opts: {
      retries: 0,
    },
  },
  createdAt: new Date(),
  eventId: randomUUID(),
});
