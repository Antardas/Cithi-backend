import { IBlockedUserJobData } from '@/follower/interfaces/follower.interface';
import { BaseQueue } from '@/service/queues/base.queue';
import { blockUserWorker } from '@/worker/block.worker';
export const ADD_BLOCK_USER_TO_DB: string = 'ADD_BLOCK_USER_TO_DB';
export const REMOVE_BLOCK_USER_FROM_DB: string = 'REMOVE_BLOCK_USER_FROM_DB';
class BlockUserQueue extends BaseQueue {
  constructor() {
    super('BlockQueue');
    this.processJob(ADD_BLOCK_USER_TO_DB, 5, blockUserWorker.addBlockedUserDB);
    this.processJob(REMOVE_BLOCK_USER_FROM_DB, 5, blockUserWorker.addBlockedUserDB);
  }

  public addBlockUserJob(name: string, data: IBlockedUserJobData) {
    this.addJob(name, data);
  }
}

export const blockQueue: BlockUserQueue = new BlockUserQueue();
