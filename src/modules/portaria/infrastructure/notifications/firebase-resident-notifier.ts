import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { FirebaseMessagingService } from '../../../../shared/infrastructure/firebase/firebase-messaging.service';
import {
  ResidentNotification,
  ResidentNotifier,
} from '../../application/ports/resident-notifier';

/** Notifica os moradores via push (Firebase Cloud Messaging). */
@Injectable()
export class FirebaseResidentNotifier implements ResidentNotifier {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging: FirebaseMessagingService,
  ) {}

  async notifyApartment(
    apartmentId: string,
    notification: ResidentNotification,
  ) {
    if (!this.messaging.enabled) return;

    const residents = await this.prisma.user.findMany({
      where: { apartmentId, fcmToken: { not: null } },
      select: { fcmToken: true },
    });
    await this.messaging.sendToTokens(
      residents.map((resident) => resident.fcmToken!),
      notification,
    );
  }
}
