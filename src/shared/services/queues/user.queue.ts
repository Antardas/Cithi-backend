import { BaseQueue } from '@/service/queues/base.queue';
import { IUserJob } from '@/user/interfaces/user.interface';
import { userWorker } from '@/worker/user.worker';
export const ADD_USER_TO_DB = 'ADD_USER_TO_DB';
export const UPDATE_BASIC_INFO_TO_DB = 'UPDATE_BASIC_INFO_TO_DB';
export const UPDATE_SOCIAL_LINKS_TO_DB = 'UPDATE_SOCIAL_LINKS_TO_DB';
export const UPDATE_NOTIFICATIONS_SETTINGS_TO_DB = 'UPDATE_NOTIFICATIONS_SERVICE_TO_DB';
class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob(ADD_USER_TO_DB, 5, userWorker.addUserToDB);
    this.processJob(UPDATE_BASIC_INFO_TO_DB, 5, userWorker.updateBasicInfo);
    this.processJob(UPDATE_SOCIAL_LINKS_TO_DB, 5, userWorker.updateSocialLink);
    this.processJob(UPDATE_NOTIFICATIONS_SETTINGS_TO_DB, 5, userWorker.updateNotificationSettings);
  }
  public addUserJob(name: string, data: IUserJob) {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
