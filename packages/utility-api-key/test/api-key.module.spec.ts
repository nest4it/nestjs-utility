import { ApiKeyModule } from '../src/api-key.module';
import { Test } from '@nestjs/testing';
import { ApiKeyService } from '../src';

describe('ApiKeyModule', () => {
  let apiKeyService: ApiKeyService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ApiKeyModule.register({
          apiKeyHeader: 'x-api-key',
          apiKeyHeaderPrefix: 'v1',
          secret: 'foobar',
        }),
      ],
    }).compile();

    apiKeyService = moduleRef.get<ApiKeyService>(ApiKeyService);
  });

  describe('verifyApiKey', () => {
    it('should verify api key', async () => {
      const encrypted = await apiKeyService.createApiKey({ foo: 'bar' });
      const decrypted = await apiKeyService.verifyApiKey(encrypted);
      expect(decrypted).toEqual(
        expect.objectContaining({ jti: expect.any(String), foo: 'bar' }),
      );
    });
  });
});
