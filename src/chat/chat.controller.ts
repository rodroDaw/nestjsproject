import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res, Req } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Response, Request as ReqExpress } from 'express';

import { ChatService } from './services/chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: ReqExpress, ) {


    await this.chatService.createMessage(createMessageDto);
  }

  @Post('/generalchat')
  async goChatGeneral(@Request() req: ReqExpress, @Res() res: Response){
    console.log('Usuario logueado: ' + req.session.emailUsuario + ' ha entrado en el chat general');
    let html = readFileSync(join(__dirname, '../../publicHtml', 'generalChat', 'generalChat.html'), 'utf8');

    html = html.replace('<!--USER_NAME-->', `<span class="nombreUsuario">${req.session.nombreUsuario}</span>`);
    res.send(html);
    //res.redirect('/chat/generalchat');
  }

  /*
  @Get('generalchat')
  async getPageProfile(@Res() res: Response, @Request() req: ReqExpress) {
    let html = readFileSync(join(__dirname, '../../publicHtml', 'generalChat', 'generalChat.html'), 'utf8');
   
    const nombreUsuario = req.session.nombreUsuario;
    html = html.replace('<!--USER_NAME-->', `<span class="nombreUsuario">${nombreUsuario}</span>`);

    res.send(html);
  }
    */

  /*
  @Get('history')
  async getChatHistory() {
    return this.chatService.getChatHistory();
  }
    */

  /*
  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
  */
}
