import { config } from '@/root/config';
import { postService } from '@/service/db/post.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postWorker');

class PostWorker {
  async addPostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;

      // add method to send data to database
      await postService.addPost(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await postService.deletePost(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
