import { createProviders } from '../../src/utils';

describe('createProviders', () => {
  it('should create providers', () => {
    const secret = 'secret';
    const providers = createProviders(secret);
    expect(providers).toBeDefined();
    expect(providers.verifyJwtToken).toBeDefined();
    expect(providers.createJwtToken).toBeDefined();
  });
});
