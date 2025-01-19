import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { API_KEY_MODULE_STRATEGY } from '../../../src/constants';

// A simple guard that uses the API_KEY_MODULE_STRATEGY
@Injectable()
export class AuthGuard extends PassportAuthGuard([API_KEY_MODULE_STRATEGY]) {
  canActivate(context: ExecutionContext) {
    console.log('context', context);
    return super.canActivate(context);
  }
}
