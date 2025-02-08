import { createErrorAlert, createFailureAlert } from '../../../src/filters/utils/alerts';

describe('alerts', () => {
  describe('createErrorAlert', () => {
    it('should return an object with the correct structure', () => {
      const result = createErrorAlert({ message: 'test', stack: 'test' });

      expect(result).toEqual({
        as_user: true,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:red_circle: *test* :red_circle:`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'test',
            },
          },
        ],
      });
    });
  });

  describe('createFailureAlert', () => {
    it('should return an object with the correct structure', () => {
      const result = createFailureAlert({ message: 'test', stack: 'test' });

      expect(result).toEqual({
        as_user: true,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:warning: *test* :warning:`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'test',
            },
          },
        ],
      });
    });
  });
});
