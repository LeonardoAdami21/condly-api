import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateApartmentDto } from './create-apartment.dto';

export class UpdateApartmentDto extends PartialType(
  OmitType(CreateApartmentDto, ['condominiumId'] as const),
) {}
