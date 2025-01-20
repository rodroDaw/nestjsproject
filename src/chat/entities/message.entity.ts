import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Message{

  _id?: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  timeSend: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

