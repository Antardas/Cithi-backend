import { config } from '@/root/config';
import { followerService } from '@/service/db/follower.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('FollowerWorker');
class FollowerWorker {
  async addFollowerToDB(job: Job, done: DoneCallback) {
    try {
      const { followeeId, followerId, username, followerDocumentId } = job.data;

      await followerService.addFollowerToDB({ followeeId, followerId, username, followerDocumentId });
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
  async removeFollowerFromDB(job: Job, done: DoneCallback) {
    try {
      const { followerId, followeeId } = job.data;

      await followerService.removeFollowerToDB(followeeId, followerId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const followerWorker: FollowerWorker = new FollowerWorker();
