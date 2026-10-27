import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../../shared/infrastructure/http/pagination.dto';

export class ListApartmentsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  condominiumId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  block?: string;
}
