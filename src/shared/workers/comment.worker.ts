import { config } from '@/root/config';
import { commentService } from '@/service/db/comment.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('commentWorker');

class CommentWorker {
  public async addCommentToDB(job: Job, done: DoneCallback) {
    try {
      const { data } = job;
      console.log(data);
      await commentService.addCommentToDB(data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const commentWorker: CommentWorker = new CommentWorker();
//
