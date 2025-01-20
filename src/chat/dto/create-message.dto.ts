import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateMessageDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional() // Es opcional, ya que puede generarse automáticamente si no se envía
  @IsDateString() // Valida que sea una fecha en formato ISO 8601
  timeSend?: string; // Este campo es opcional
}