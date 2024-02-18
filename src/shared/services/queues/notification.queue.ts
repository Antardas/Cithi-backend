import { INotificationJobData } from '@/notification/interfaces/notification.interface';
import { BaseQueue } from '@/service/queues/base.queue';
import { notificationWorker } from '@/worker/notification.worker';

export const DELETE_NOTIFICATION_FROM_DB: string = 'DELETE_NOTIFICATION_FROM_DB';
export const UPDATE_NOTIFICATION_FROM_DB: string = 'UPDATE_NOTIFICATION_FROM_DB';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('Notification');
    this.processJob(UPDATE_NOTIFICATION_FROM_DB, 5, notificationWorker.updateNotification);
    this.processJob(DELETE_NOTIFICATION_FROM_DB, 5, notificationWorker.deleteNotification);
  }

  addNotificationJob(name: string, data: INotificationJobData): void {
    this.addJob(name, data);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
