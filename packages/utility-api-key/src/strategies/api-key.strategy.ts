import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import type { Function } from 'ts-toolbelt';
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
      // @ts-expect-error we need to override the default verify function
      async (apiKey: string, done: ValidateFn) => this.validate(apiKey, done),
    );
  }

  public async validate(apiKey: string, done: Function.Function) {
    // nest ^11 support
    if (typeof done !== 'function') {
      return this.tokenService.verifyApiKey(apiKey).catch((err) => {
        throw new UnauthorizedException({
          cause: err,
        });
      });
    }

    return this.tokenService
      .verifyApiKey(apiKey)
      .then((user) => done(null, user))
      .catch((err) => {
        done(
          new UnauthorizedException({
            cause: err,
          }),
          null,
        );
      });
  }
}
