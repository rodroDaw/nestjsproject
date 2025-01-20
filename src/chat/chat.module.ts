import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { Message, MessageSchema } from './entities/message.entity';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema
      }
    ]),
  ]
})
export class ChatModule {}
