import { BaseQueue } from '@/service/queues/base.queue';
import { IUserJob } from '@/user/interfaces/user.interface';
import { userWorker } from '@/worker/user.worker';
export const ADD_USER_TO_DB = 'ADD_USER_TO_DB';
class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob(ADD_USER_TO_DB, 5, userWorker.addUserToDB);
  }
  public addUserJob(name: string, data: IUserJob) {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
