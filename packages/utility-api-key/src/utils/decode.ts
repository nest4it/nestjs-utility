import { verify } from 'jsonwebtoken';
import {
  validateAuthenticatedClient,
  type AuthenticatedClient,
} from '../models/authenticated-client';

export const createVerifyJwtToken = (secret: string) => async (token: string) => {
  const payload = verify(token, secret, { ignoreExpiration: false });

  const parsedToken = validateAuthenticatedClient<AuthenticatedClient>(payload);

  return parsedToken;
};
