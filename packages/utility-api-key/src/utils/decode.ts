import { verify } from 'jsonwebtoken';
import {
  validateAuthenticatedClient,
  type AuthenticatedClient,
} from '../models/authenticated-client';
import { ApiKeyExpiredError, ApiKeyValidationError } from '../errors';

export const toSeconds = (time: number) => Math.floor(time / 1000);

export const getCurrentTimeInSeconds = () => toSeconds(Date.now());

export const isJwtTokenExpired = (token: AuthenticatedClient) =>
  token.exp < getCurrentTimeInSeconds();

export const createVerifyJwtToken = (secret: string) => async (token: string) => {
  try {
    const payload = verify(token, secret, { ignoreExpiration: true });

    const parsedToken = validateAuthenticatedClient<AuthenticatedClient>(payload);

    if (isJwtTokenExpired(parsedToken)) {
      throw new ApiKeyExpiredError('Token has expired');
    }

    return parsedToken;
  } catch (error) {
    if (error.message === 'Token has expired') {
      throw new ApiKeyExpiredError('Token has expired');
    }

    throw new ApiKeyValidationError('Token is invalid or malformed.');
  }
};
