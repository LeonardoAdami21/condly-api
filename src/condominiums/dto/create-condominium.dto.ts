import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

const onlyDigits = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

export class CreateCondominiumDto {
  @ApiProperty({ example: 'Residencial Jardim das Flores' })
  @IsString()
  @Length(2, 191)
  name: string;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @Transform(onlyDigits)
  @Matches(/^\d{14}$/, { message: 'cnpj deve conter 14 dígitos' })
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
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @Matches(/^[A-Z]{2}$/, { message: 'state deve ser a sigla da UF' })
  state: string;

  @ApiProperty({ example: '01001-000' })
  @Transform(onlyDigits)
  @Matches(/^\d{8}$/, { message: 'zipCode deve conter 8 dígitos' })
  zipCode: string;

  @ApiPropertyOptional({
    description: 'Identificador do condomínio no sistema de portaria Condly',
  })
  @IsOptional()
  @IsString()
  condlyPortariaId?: string;
}
