import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyClient } from '../../../src/decorators/index';
import { AuthenticatedClient } from '../../../src/models/authenticated-client';
import { MockAuthGuard } from '..//mocks/fake-authguard';

@Controller()
export class FakeUserController {
  @Get('profile')
  @UseGuards(MockAuthGuard)
  getUserProfile(@ApiKeyClient() client: AuthenticatedClient) {
    return {
      userId: client?.userId ?? null,
      role: client?.role ?? null,
      policies: client?.policies ?? [],
    };
  }
}
