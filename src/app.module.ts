import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { ApartmentsModule } from './apartments/apartments.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CondominiumsModule } from './condominiums/condominiums.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PortariaModule } from './portaria/portaria.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

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
    AuthModule,
    UsersModule,
    CondominiumsModule,
    ApartmentsModule,
    PortariaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
