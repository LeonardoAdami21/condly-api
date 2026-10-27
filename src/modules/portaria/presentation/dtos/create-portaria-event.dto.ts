import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { PortariaEventType } from '../../domain/enums/portaria-event-type';

export class CreatePortariaEventDto {
  @ApiPropertyOptional({
    description: 'ID do evento na portaria Condly (garante idempotência)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  externalId?: string;

  @ApiProperty({ description: 'condlyPortariaId do condomínio' })
  @IsString()
  condlyPortariaId: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  block?: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @Length(1, 20)
  apartmentNumber: string;

  @ApiProperty({ enum: PortariaEventType })
  @IsEnum(PortariaEventType)
  type: PortariaEventType;

  @ApiPropertyOptional({ example: 'João Souza' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  personName?: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  personDocument?: string;

  @ApiPropertyOptional({ example: 'Entrega Mercado Livre' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
