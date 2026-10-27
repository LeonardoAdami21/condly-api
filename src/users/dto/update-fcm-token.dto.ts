import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({ description: 'Token do Firebase Cloud Messaging do app' })
  @IsString()
  @MaxLength(512)
  fcmToken: string;
}
