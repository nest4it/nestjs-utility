import { Controller, Get, UseGuards } from '@nestjs/common';
import { MockAuthGuard } from './fake-authguard';

@Controller()
export class FakeController {
  @Get('cats')
  @UseGuards(MockAuthGuard)
  getMany(): { message: string } {
    return { message: 'You have access!' };
  }
}
