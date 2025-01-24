import {
  isObject,
  isNumber,
  isNonEmptyString,
  validateAuthenticatedClient,
} from '../../src/models/authenticated-client';

describe('Authenticated Client isObject', () => {
  it('Should return true if it is an non-null object, and not an array', () => {
    const obj = { key: 'value' };
    expect(isObject(obj)).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject([])).toBe(false);
  });

  it('Should return false for a null value', () => {
    const obj = null;
    expect(isObject(obj)).toBe(false);
  });

  it('Should return false for an array', () => {
    expect(isObject([])).toBe(false);
  });

  it('Should return false for a primitive', () => {
    expect(isObject('test')).toBe(false);
  });
});

describe('Authenticated Client isNumber', () => {
  it('Should return true if the value is a number', () => {
    expect(isNumber(1)).toBe(true);
  });

  it('Should return false if the value is a not a number', () => {
    expect(isNumber('a')).toBe(false);
  });

  it('Should return false if the value is a not a number', () => {
    expect(isNumber([])).toBe(false);
  });

  it('Should return false if the value is a string of a number', () => {
    expect(isNumber('1')).toBe(false);
  });
});

describe('Authenticated Client isNonEmptyString', () => {
  it('Should return true if the value is a non-empty string', () => {
    expect(isNonEmptyString('test')).toBe(true);
  });

  it('Should return false if the value is an empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('Should return false if the value is not a string', () => {
    expect(isNonEmptyString(1)).toBe(false);
  });
});

describe('Authenticated Client validateAuthenticatedClient', () => {
  const client = {
    exp: 1,
    jti: 'test',
    iat: 1,
    general_test: 'test',
  };

  it('Should throw an error if the client is null', () => {
    expect(() => validateAuthenticatedClient(null)).toThrow('Invalid token');
  });

  it('Should throw an error if the client is not an object', () => {
    expect(() => validateAuthenticatedClient('test')).toThrow('Invalid token');
  });

  it('Should throw an error if the client is an array', () => {
    expect(() => validateAuthenticatedClient([])).toThrow('Invalid token');
  });

  it('Should throw an error if the expiration value is empty', () => {
    expect(() => validateAuthenticatedClient({ ...client, exp: null })).toThrow(
      'Expiration value is invalid',
    );
  });

  it('Should throw an error if the expiration value is not a number', () => {
    expect(() => validateAuthenticatedClient({ ...client, exp: 'a test' })).toThrow(
      'Expiration value is invalid',
    );
  });

  it('Should throw an error if the jti value is empty', () => {
    expect(() => validateAuthenticatedClient({ ...client, jti: '' })).toThrow(
      'Jti value is invalid',
    );
  });

  it('Should throw an error if the jti value is not a string', () => {
    expect(() => validateAuthenticatedClient({ ...client, jti: 14 })).toThrow(
      'Jti value is invalid',
    );
  });

  it('Should throw an error if the issued at value is empty', () => {
    expect(() => validateAuthenticatedClient({ ...client, iat: null })).toThrow(
      'Issued at value is invalid',
    );
  });

  it('Should throw an error if the issued at value is not a number', () => {
    expect(() => validateAuthenticatedClient({ ...client, iat: 'a test' })).toThrow(
      'Issued at value is invalid',
    );
  });

  it('Should return the client if it is valid', () => {
    const result = validateAuthenticatedClient(client);
    expect(result).toMatchObject({
      exp: 1,
      jti: 'test',
      iat: 1,
    });
  });
});
