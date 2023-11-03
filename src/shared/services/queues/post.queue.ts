import { BaseQueue } from '@/service/queues/base.queue';
import { IPostJob } from '@/post/interfaces/post.interface';
import { postWorker } from '@/worker/post.worker';

export const ADD_POST_TO_DB: string = 'ADD_POST_TO_DB';
export const DELETE_POST_FROM_DB: string = 'DELETE_POST_FROM_DB';
export class PostQueue extends BaseQueue {
  constructor() {
    super('posts');

    this.processJob(ADD_POST_TO_DB, 5, postWorker.addPostToDB);
    this.processJob(DELETE_POST_FROM_DB, 5, postWorker.deletePostFromDB);
  }

  public addPostJob(name: string, data: IPostJob) {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
