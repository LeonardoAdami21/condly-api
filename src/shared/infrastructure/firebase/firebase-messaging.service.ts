import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseMessagingService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseMessagingService.name);
  private app?: App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const credentialsPath = resolve(
      this.config.get<string>(
        'FIREBASE_SERVICE_ACCOUNT_PATH',
        'credentials/firebase-service-account.json',
      ),
    );

    if (!existsSync(credentialsPath)) {
      this.logger.warn(
        `Service account do Firebase não encontrada em ${credentialsPath}: notificações push desativadas`,
      );
      return;
    }

    this.app =
      getApps()[0] ?? initializeApp({ credential: cert(credentialsPath) });
    this.logger.log(`Firebase inicializado com ${credentialsPath}`);
  }

  get enabled(): boolean {
    return !!this.app;
  }

  /** Envia push para os tokens informados; falhas não interrompem o fluxo. */
  async sendToTokens(tokens: string[], notification: PushNotification) {
    if (!this.app || tokens.length === 0) return;

    try {
      const response = await getMessaging(this.app).sendEachForMulticast({
        tokens,
        notification: { title: notification.title, body: notification.body },
        data: notification.data,
      });
      if (response.failureCount > 0) {
        this.logger.warn(
          `${response.failureCount}/${tokens.length} as notificações falharam`,
        );
      }
    } catch (error) {
      this.logger.error('Erro ao enviar notificação push', error as Error);
    }
  }
}
