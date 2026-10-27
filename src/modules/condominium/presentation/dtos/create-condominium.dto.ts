import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateCondominiumDto {
  @ApiProperty({ example: 'Residencial Jardim das Flores' })
  @IsString()
  @Length(2, 191)
  name: string;

  @ApiProperty({ example: '11.222.333/0001-81' })
  @IsString()
  cnpj: string;

  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  street: string;

  @ApiProperty({ example: '100' })
  @IsString()
  number: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @Length(2, 2)
  state: string;

  @ApiProperty({ example: '01001-000' })
  @IsString()
  zipCode: string;

  @ApiPropertyOptional({
    description: 'Identificador do condomínio no sistema de portaria Condly',
  })
  @IsOptional()
  @IsString()
  condlyPortariaId?: string;
}
