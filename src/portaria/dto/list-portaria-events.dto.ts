import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  PortariaEventStatus,
  PortariaEventType,
} from '../../generated/prisma/enums';

export class ListPortariaEventsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  condominiumId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  apartmentId?: string;

  @ApiPropertyOptional({ enum: PortariaEventStatus })
  @IsOptional()
  @IsEnum(PortariaEventStatus)
  status?: PortariaEventStatus;

  @ApiPropertyOptional({ enum: PortariaEventType })
  @IsOptional()
  @IsEnum(PortariaEventType)
  type?: PortariaEventType;
}
