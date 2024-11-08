import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  getHome(@Res() res: Response) {
    // Sirve el archivo HTML estático
    res.sendFile(join(__dirname, '..', 'publicHtml', 'index.html'));
  }
}
