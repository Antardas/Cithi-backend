import { IEmailJob } from '@/user/interfaces/user.interface';
import { BaseQueue } from './base.queue';
import { emailWorker } from '@/worker/email.worker';
export const COMMENT_EMAIL: string = 'COMMENT_EMAIL';
class EmailQueue extends BaseQueue {
  constructor() {
    super('emails');
    this.processJob('forgetPasswordEmail', 5, emailWorker.addNotificationEmail);
    this.processJob(COMMENT_EMAIL, 5, emailWorker.addNotificationEmail);
  }

  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
