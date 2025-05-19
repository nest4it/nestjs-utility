import { randomUUID } from 'node:crypto';
import { sign } from 'jsonwebtoken';
import { DEFAULTS } from '../constants/defaults';
import type { StringValue } from 'ms';

export const createJwtData = <T extends Record<string, unknown>>(data: T) => ({
  ...data,
  jti: randomUUID(),
});

export const createSignJwtToken =
  (secret: string) =>
  <T extends Record<string, unknown>>(data: T, expiresIn: StringValue | number) => {
    return sign(createJwtData(data), secret, {
      expiresIn: expiresIn ?? DEFAULTS.expiresIn,
    });
  };
