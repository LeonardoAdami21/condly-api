import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ResidentDecision } from '../../domain/enums/portaria-event-status';

export class RespondPortariaEventDto {
  @ApiProperty({ enum: ResidentDecision })
  @IsEnum(ResidentDecision)
  status: ResidentDecision;
}
