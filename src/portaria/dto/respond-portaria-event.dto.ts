import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { PortariaEventStatus } from '../../generated/prisma/enums';

export const RESPONSE_STATUSES = [
  PortariaEventStatus.AUTORIZADO,
  PortariaEventStatus.NEGADO,
] as const;

export class RespondPortariaEventDto {
  @ApiProperty({ enum: RESPONSE_STATUSES })
  @IsIn(RESPONSE_STATUSES)
  status: (typeof RESPONSE_STATUSES)[number];
}
