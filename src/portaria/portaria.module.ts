import { Module } from '@nestjs/common';
import { CondlyIntegrationController } from './condly-integration.controller';
import { PortariaController } from './portaria.controller';
import { PortariaService } from './portaria.service';

@Module({
  controllers: [PortariaController, CondlyIntegrationController],
  providers: [PortariaService],
})
export class PortariaModule {}
