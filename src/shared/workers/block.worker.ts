import { blockUserService } from '@/service/db/block-user.service';
import { DoneCallback, Job } from 'bull';

class BlockUserWorker {
  async addBlockedUserDB(job: Job, done: DoneCallback): Promise<void> {
    const { blockedUserId, blockingUserId, type } = job.data;
    try {
      if (type === 'block') {
        await blockUserService.blockUser(blockingUserId, blockedUserId);
      } else if (type === 'unblock') {
        await blockUserService.unblockUser(blockingUserId, blockedUserId);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error as Error);
    }
  }
}

export const blockUserWorker: BlockUserWorker = new BlockUserWorker();
