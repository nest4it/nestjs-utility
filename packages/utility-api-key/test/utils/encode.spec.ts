import { createJwtData, createSignJwtToken } from '../../src/utils/encode';

describe('encode', () => {
  describe('createJwtData', () => {
    it('should create a new JWT data with a random UUID', () => {
      const data = { key: 'value' };
      const jwtData = createJwtData(data);
      expect(jwtData).toEqual({
        ...data,
        jti: expect.any(String),
      });
    });
  });

  describe('createSignJwtToken', () => {
    it('should create a new JWT token with the given data and secret', () => {
      const secret = 'secret';
      const data = { key: 'value' };
      const expiresIn = '1d';
      const jwtToken = createSignJwtToken(secret)(data, expiresIn);
      expect(jwtToken).toBeDefined();
    });

    it('should create a new JWT token with the given data and default expiresIn', () => {
      const secret = 'secret';
      const data = { key: 'value' };
      const jwtToken = createSignJwtToken(secret)(data, undefined);
      expect(jwtToken).toBeDefined();
    });
  });
});
