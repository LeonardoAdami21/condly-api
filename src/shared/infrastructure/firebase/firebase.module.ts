import { Global, Module } from '@nestjs/common';
import { FirebaseMessagingService } from './firebase-messaging.service';

@Global()
@Module({
  providers: [FirebaseMessagingService],
  exports: [FirebaseMessagingService],
})
export class FirebaseModule {}
