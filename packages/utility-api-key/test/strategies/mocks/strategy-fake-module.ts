import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './fake-authguard';

@Controller()
export class FakeController {
  @Get('cats')
  @UseGuards(AuthGuard)
  getMany(): { message: string } {
    return { message: 'You have access!' };
  }
}
