import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Token do Firebase Cloud Messaging do app' })
  @IsString()
  @MaxLength(512)
  fcmToken: string;
}
