export interface ResidentNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/** Envia notificações aos moradores de um apartamento. */
export abstract class ResidentNotifier {
  abstract notifyApartment(
    apartmentId: string,
    notification: ResidentNotification,
  ): Promise<void>;
}
