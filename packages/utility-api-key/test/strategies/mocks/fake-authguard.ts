import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { API_KEY_MODULE_STRATEGY } from '../../../src/constants';

@Injectable()
export class AuthGuard extends PassportAuthGuard([API_KEY_MODULE_STRATEGY]) {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
