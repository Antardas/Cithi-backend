import { config } from '@/root/config';
import { authService } from '@/service/db/auth.service';
import { mailTransport } from '@/service/emails/mail.transport';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('emailWorker');

class EmailWorker {
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, recieverEmail, subject } = job.data;
      await mailTransport.sendEmail(recieverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
