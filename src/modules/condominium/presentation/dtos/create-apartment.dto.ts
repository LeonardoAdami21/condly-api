import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateApartmentDto {
  @ApiProperty()
  @IsUUID()
  condominiumId: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @Length(1, 20)
  number: string;

  @ApiPropertyOptional({ example: 'A', description: 'Bloco/torre' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  block?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  floor?: number;
}
