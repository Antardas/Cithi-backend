import { IMessageData, IMessageJobData } from '@/chat/interfaces/message.interface';
import { config } from '@/root/config';
import { chatService } from '@/service/db/chat.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('ChatWorker');

class ChatWorker {
  async addMessageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      await chatService.addMessageToDB(job.data as IMessageData);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();