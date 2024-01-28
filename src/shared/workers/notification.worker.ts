import { config } from '@/root/config';
import { notificationService } from '@/service/db/notification.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
const log: Logger = config.createLogger('NotificationWorker');
class NotificationWorker {
  async updateNotification(job: Job, done: DoneCallback) {
    try {
      const { key } = job.data;
      await notificationService.updateRead(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deleteNotification(job: Job, done: DoneCallback) {
    try {
      const { key } = job.data;
      await notificationService.delete(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
