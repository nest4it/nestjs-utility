import { createVerifyJwtToken } from '../../src/utils/decode';
import { sign } from 'jsonwebtoken';

describe('create a verify jwt token', () => {
  it('should verify a valid token successfully', async () => {
    const secretKey = 'secret';
    const verifyJwtToken = createVerifyJwtToken(secretKey);

    const token = sign(
      {
        jti: 'test-jti',
        foo: 'bar',
      },
      secretKey,
      { expiresIn: '1h' },
    );

    const result = await verifyJwtToken(token);

    expect(result).toBeDefined();
    expect(result.jti).toBe('test-jti');
    expect(result).toHaveProperty('exp');
    expect(result).toHaveProperty('iat');
    expect(result).toHaveProperty('foo', 'bar');
  });
});

describe('createVerifyJwtToken - Expired Token', () => {
  it('should throw an ApiKeyExpiredError for an expired token', async () => {
    const secretKey = 'secret';
    const verifyJwtToken = createVerifyJwtToken(secretKey);

    const token = sign({ jti: 'expired-jti' }, secretKey, {
      expiresIn: '1s',
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await expect(verifyJwtToken(token)).rejects.toThrow('Token has expired');
  });
});

describe('createVerifyJwtToken - Invalid Token', () => {
  it('should throw JsonWebTokenError (or similar) for an invalid token', async () => {
    const secretKey = 'secret';
    const verifyJwtToken = createVerifyJwtToken(secretKey);

    const token = sign({ jti: 'invalid-jti' }, 'wrongSecretKey', {
      expiresIn: '1h',
    });

    await expect(verifyJwtToken(token)).rejects.toThrow('Token is invalid or malformed.');
  });
});
