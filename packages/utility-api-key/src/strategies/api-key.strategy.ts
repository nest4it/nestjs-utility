import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import { API_KEY_MODULE_STRATEGY } from '../constants';
import { ApiKeyService } from '../api-key.service';
import type { ApiKeyModuleConfig } from '../models/config';
import { MODULE_OPTIONS_TOKEN } from '../api-key.configure-module';
import { DEFAULTS } from '../constants/defaults';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, API_KEY_MODULE_STRATEGY) {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) options: ApiKeyModuleConfig,
    private tokenService: ApiKeyService,
  ) {
    super(
      {
        header: options.apiKeyHeader ?? DEFAULTS.apiKeyHeader,
        prefix: options.apiKeyHeaderPrefix ?? DEFAULTS.apiKeyHeaderPrefix,
      },
      true,
    );
  }

  public async validate(apiKey: string) {
    return this.tokenService.verifyApiKey(apiKey).catch((err) => {
      new UnauthorizedException({
        cause: err,
      });
    });
  }
}
