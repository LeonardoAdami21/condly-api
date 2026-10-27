import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CondominiumModule } from './modules/condominium/condominium.module';
import { IdentityModule } from './modules/identity/identity.module';
import { PortariaModule } from './modules/portaria/portaria.module';
import { PrismaModule } from './shared/infrastructure/database/prisma.module';
import { FirebaseModule } from './shared/infrastructure/firebase/firebase.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'condly-api',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FirebaseModule,
    IdentityModule,
    CondominiumModule,
    PortariaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
