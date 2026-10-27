import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../../shared/infrastructure/http/pagination.dto';
import { PortariaEventStatus } from '../../domain/enums/portaria-event-status';
import { PortariaEventType } from '../../domain/enums/portaria-event-type';

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
