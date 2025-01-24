import { Controller, Get } from '@nestjs/common';

@Controller()
export class FakeController {
  constructor() {}

  @Get('cats')
  getMany() {
    throw new Error('FakeController');
  }
}
