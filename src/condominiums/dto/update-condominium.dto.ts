import { PartialType } from '@nestjs/swagger';
import { CreateCondominiumDto } from './create-condominium.dto';

export class UpdateCondominiumDto extends PartialType(CreateCondominiumDto) {}
