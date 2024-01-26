import { IFollowerJobData } from '@/follower/interfaces/follower.interface';
import { BaseQueue } from '@/service/queues/base.queue';
import { followerWorker } from '@/worker/follower.worker';
export const ADD_FOLLOWER_TO_DB: string = 'ADD_FOLLOWER_TO_DB';
export const REMOVE_FOLLOWER_FROM_DB: string = 'REMOVE_FOLLOWER_FROM_DB';

class FollowerQueue extends BaseQueue {
  constructor() {
    super('followers');
    this.processJob(ADD_FOLLOWER_TO_DB, 5, followerWorker.addFollowerToDB);
    this.processJob(REMOVE_FOLLOWER_FROM_DB, 5, followerWorker.removeFollowerFromDB);
  }

  public addFollowerJob(name: string, data: IFollowerJobData) {
    this.addJob(name, data);
  }
}

export const followerQueue: FollowerQueue = new FollowerQueue();
